"""
Pydantic validation schemas for Incident resources.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class IncidentBase(BaseModel):
    application_id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    title: str = Field(..., min_length=3, max_length=255, examples=["High HTTP 500 error rate detected"])
    description: Optional[str] = Field(
        default=None,
        examples=["Service health check failed with status code 503 during traffic spike"],
    )
    severity: str = Field(
        default="medium",
        max_length=50,
        examples=["critical"],
        description="Severity level: critical, high, medium, low",
    )
    status: str = Field(
        default="open",
        max_length=50,
        examples=["open"],
        description="Remediation status: open, investigating, mitigated, resolved, closed",
    )


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    description: Optional[str] = Field(default=None)
    severity: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = Field(default=None, max_length=50)
    resolved_at: Optional[datetime] = None


class IncidentRead(IncidentBase):
    id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440002"])
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
