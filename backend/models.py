"""
Pydantic models for API request and response validation.
"""

from pydantic import BaseModel
from typing import Optional


class CourseGrade(BaseModel):
    course_code: str
    course_name: str
    credits_assigned: float
    credits_earned: float
    grade_point: float
    letter_grade: str


class StudentData(BaseModel):
    pr_number: str
    name: str
    seat_number: str
    courses: list[CourseGrade]
    total_credits_assigned: float
    total_credits_earned: float
    overall_letter_grade: str


class StudentSummary(BaseModel):
    pr_number: str
    name: str
    seat_number: str
    overall_grade: str
    sgpa: float | None = None
    tce: int | None = None
    result: str | None = None
    pf: str | None = None


class UploadResponse(BaseModel):
    success: bool
    message: str
    students_count: int
    students: list[StudentSummary]
    download_url: str
    timestamp: str


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str