"""
Common shared Pydantic schemas: pagination, health, readiness, and structured errors.
"""

from typing import Generic, TypeVar, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

T = TypeVar("T")


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["healthy"])
    service: str = Field(..., examples=["cloudops-sentinel-api"])
    version: str = Field(..., examples=["0.1.0"])


class ReadinessResponse(BaseModel):
    status: str = Field(..., examples=["ready"])
    database: str = Field(..., examples=["connected"])
    details: Optional[str] = Field(default=None, examples=["Database ping succeeded in 1.4ms"])
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        examples=["2026-11-01T12:00:00Z"],
    )


class ErrorDetail(BaseModel):
    message: str
    field: Optional[str] = None


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    errors: Optional[List[ErrorDetail]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int = Field(..., ge=0, description="Total number of items matching filter criteria")
    page: int = Field(..., ge=1, description="Current page index (1-based)")
    page_size: int = Field(..., ge=1, description="Number of items per page")
    total_pages: int = Field(..., ge=0, description="Total number of available pages")
