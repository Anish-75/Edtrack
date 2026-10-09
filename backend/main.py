"""
main.py – FastAPI backend for the Student Marksheet Parser.

Fixes vs original Flask app:
  - Renamed parser → marksheet_parser (no stdlib shadowing).
  - Path-traversal guard on /download/{filename}.
  - Individual .xlsx files deleted after zipping (no stale file build-up).
  - Cleanup runs in a BackgroundTask, avoiding the race with concurrent downloads.
  - Optional API-key auth via X-API-Key header (set API_KEY env var to enable).
  - Rate limiting on /upload (10 req / min per IP) via slowapi.
  - debug / host / port controlled via env vars.
  - 413 / oversized file handled by FastAPI's built-in size limit.
"""

from __future__ import annotations

import os
import shutil
import traceback
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile

import uvicorn
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import APIKeyHeader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import (
    ALLOWED_EXTENSIONS,
    API_KEY,
    DEBUG,
    FILE_TTL_SECONDS,
    HOST,
    MAX_FILE_SIZE_MB,
    OUTPUT_FOLDER,
    PORT,
    UPLOAD_FOLDER,
)
from marksheet_parser import (
    create_individual_report,
    parse_marksheet,
    validate_marksheet_structure,
)
from models import HealthResponse, StudentSummary, UploadResponse

# ── rate limiter ──────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

# ── app setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Student Marksheet Parser API",
    description="Upload a university marksheet (.xlsx) and receive individual student grade reports.",
    version="2.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ── auth ──────────────────────────────────────────────────────────────────────

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(key: str | None = Depends(_api_key_header)) -> None:
    """Dependency that enforces API-key auth only when API_KEY env var is set."""
    if API_KEY and key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key. Pass it in the X-API-Key header.",
        )


# ── utilities ─────────────────────────────────────────────────────────────────

def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _safe_output_path(filename: str) -> Path:
    """
    Return an absolute path inside OUTPUT_FOLDER for *filename*.

    Raises HTTPException 400 if the resolved path escapes OUTPUT_FOLDER
    (path-traversal guard).
    """
    base = Path(OUTPUT_FOLDER).resolve()
    # Strip any directory components the caller may have injected
    safe_name = Path(filename).name
    resolved = (base / safe_name).resolve()
    if not str(resolved).startswith(str(base)):
        raise HTTPException(status_code=400, detail="Invalid filename.")
    return resolved


def _cleanup_old_files() -> None:
    """Delete files older than FILE_TTL_SECONDS from uploads and outputs."""
    cutoff = datetime.now().timestamp() - FILE_TTL_SECONDS
    for folder in (UPLOAD_FOLDER, OUTPUT_FOLDER):
        for entry in os.scandir(folder):
            if entry.is_file() and entry.stat().st_mtime < cutoff:
                try:
                    os.remove(entry.path)
                except OSError as exc:
                    print(f"[cleanup] Could not delete {entry.path}: {exc}")


# ── routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Info"])
async def root():
    return {
        "name": "Student Marksheet Parser API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "health":   "GET  /health",
            "upload":   "POST /upload",
            "download": "GET  /download/{filename}",
        },
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health():
    return HealthResponse(
        status="healthy",
        message="API is running",
        timestamp=datetime.now().isoformat(),
    )


@app.post(
    "/upload",
    response_model=UploadResponse,
    tags=["Marksheet"],
    dependencies=[Depends(verify_api_key)],
)
@limiter.limit("10/minute")
async def upload_marksheet(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile,
):
    """
    Upload a marksheet Excel file and receive individual student grade reports
    bundled in a ZIP archive.
    """
    # ── basic validation ──────────────────────────────────────────────────
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    if not _allowed(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .xlsx and .xls files are accepted.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {MAX_FILE_SIZE_MB} MB limit.",
        )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # ── save upload ───────────────────────────────────────────────────────
    safe_name = Path(file.filename).name   # strip any path components
    input_path = Path(UPLOAD_FOLDER) / f"{timestamp}_{safe_name}"
    input_path.write_bytes(content)

    try:
        # ── validate structure ────────────────────────────────────────────
        try:
            validate_marksheet_structure(str(input_path))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Validation failed: {exc}")

        # ── parse ─────────────────────────────────────────────────────────
        students = parse_marksheet(str(input_path))
        if not students:
            raise HTTPException(status_code=400, detail="No student data found in file.")

        # ── generate individual reports ───────────────────────────────────
        individual_files: list[Path] = []
        student_summaries: list[StudentSummary] = []

        for student in students:
            safe_pr = student["pr_number"].replace("/", "_").replace("\\", "_")
            report_path = Path(OUTPUT_FOLDER) / f"Grade_Report_{safe_pr}.xlsx"
            create_individual_report(student, str(report_path))
            individual_files.append(report_path)

            student_summaries.append(
                StudentSummary(
                    pr_number=student["pr_number"],
                    name=student["name"],
                    seat_number=student["seat_number"],
                    overall_grade = f"SGPA {student.get('sgpa', '—')}",
                )
            )

        # ── zip everything ────────────────────────────────────────────────
        zip_name = f"All_Grade_Reports_{timestamp}.zip"
        zip_path = Path(OUTPUT_FOLDER) / zip_name

        with ZipFile(zip_path, "w") as zf:
            for report in individual_files:
                zf.write(report, report.name)

        # ── clean up individual xlsx files now that they are in the zip ───
        for report in individual_files:
            try:
                report.unlink(missing_ok=True)
            except OSError:
                pass

        # ── schedule old-file cleanup as a background task ────────────────
        background_tasks.add_task(_cleanup_old_files)

        return UploadResponse(
            success=True,
            message=f"Successfully processed {len(students)} student(s).",
            students_count=len(students),
            students=student_summaries,
            download_url=f"/download/{zip_name}",
            timestamp=timestamp,
        )

    except HTTPException:
        raise
    except Exception as exc:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process marksheet: {exc}",
        ) from exc
    finally:
        # Always remove the uploaded input file
        input_path.unlink(missing_ok=True)


@app.get("/download/{filename}", tags=["Marksheet"], dependencies=[Depends(verify_api_key)])
async def download_file(filename: str):
    """Download a previously generated reports ZIP file."""
    file_path = _safe_output_path(filename)   # path-traversal guard

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or has expired.")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/zip",
    )


# ── entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
    )