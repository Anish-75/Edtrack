
import os
from dotenv import load_dotenv

load_dotenv()


# ── Auth & server ────────────────────────────────────────────────────────────

API_KEY: str | None = os.getenv("API_KEY")          # None = no auth enforced
DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
ALLOWED_EXTENSIONS = {"xlsx", "xls"}
MAX_FILE_SIZE_MB = 16
FILE_TTL_SECONDS = 3600          # files older than 1 h are deleted on next upload


# ── Column helpers ───────────────────────────────────────────────────────────

def col_to_index(col: str) -> int:
    """Convert an Excel column label (e.g. 'AE') to a 0-based integer index."""
    index = 0
    for char in col.upper():
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


# ── Sheet layout (0-based row indices) ──────────────────────────────────────

COURSE_CODE_ROW = 3          # Excel row 4
COURSE_NAME_ROW = 4          # Excel row 5
STUDENT_DATA_START_ROW = 11  # Excel row 12

STUDENT_COLUMNS = {
    "pr_number":   2,   # col C
    "name":        4,   # col E
    "seat_number": 6,   # col G
}

# Per-course column blocks.
# Each course spans: credits_assigned | credits_earned | grade_point | (skip) | letter_grade
COURSE_COLUMNS = {
    "CMP-100": {
        "credits_assigned": col_to_index("O"),   # 14
        "credits_earned":   col_to_index("P"),   # 15
        "grade_point":      col_to_index("Q"),   # 16
        "letter_grade":     col_to_index("S"),   # 18
    },
    "CMP-101": {
        "credits_assigned": col_to_index("AE"),  # 30
        "credits_earned":   col_to_index("AF"),  # 31
        "grade_point":      col_to_index("AG"),  # 32
        "letter_grade":     col_to_index("AI"),  # 34
    },
    "MCV-111": {
        "credits_assigned": col_to_index("AQ"),  # 42
        "credits_earned":   col_to_index("AR"),  # 43
        "grade_point":      col_to_index("AS"),  # 44
        "letter_grade":     col_to_index("AU"),  # 46
    },
    "MCV-112": {
        "credits_assigned": col_to_index("BG"),  # 58
        "credits_earned":   col_to_index("BH"),  # 59
        "grade_point":      col_to_index("BI"),  # 60
        "letter_grade":     col_to_index("BK"),  # 62
    },
    "SHM-132": {
        "credits_assigned": col_to_index("BS"),  # 70
        "credits_earned":   col_to_index("BT"),  # 71
        "grade_point":      col_to_index("BU"),  # 72
        "letter_grade":     col_to_index("BW"),  # 74
    },
    "SHM-133": {
        "credits_assigned": col_to_index("CI"),  # 86
        "credits_earned":   col_to_index("CJ"),  # 87
        "grade_point":      col_to_index("CK"),  # 88
        "letter_grade":     col_to_index("CM"),  # 90
    },
    "AEC-153": {
        "credits_assigned": col_to_index("CU"),  # 98
        "credits_earned":   col_to_index("CV"),  # 99
        "grade_point":      col_to_index("CW"),  # 100
        "letter_grade":     col_to_index("CY"),  # 102
    },
    "VAC-158": {
        "credits_assigned": col_to_index("DH"),  # 111
        "credits_earned":   col_to_index("DI"),  # 112
        "grade_point":      col_to_index("DJ"),  # 113
        "letter_grade":     col_to_index("DL"),  # 115
    },
    "VAC-159": {
        "credits_assigned": col_to_index("DX"),  # 127
        "credits_earned":   col_to_index("DY"),  # 128
        "grade_point":      col_to_index("DZ"),  # 129
        "letter_grade":     col_to_index("EB"),  # 131
    },
    "SEC-143": {
        "credits_assigned": col_to_index("EM"),  # 142
        "credits_earned":   col_to_index("EN"),  # 143
        "grade_point":      col_to_index("EO"),  # 144
        "letter_grade":     col_to_index("EQ"),  # 146
    },
}

SUMMARY_COLUMNS = {
    "total_credits_assigned": col_to_index("ER"),  # 147
    "total_credits_earned":   col_to_index("ES"),  # 148
    "overall_letter_grade":   col_to_index("EX"),  # 153
}

COURSE_CODES: list[str] = list(COURSE_COLUMNS.keys())