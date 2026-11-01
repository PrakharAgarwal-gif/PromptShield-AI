"""
Pydantic validation schemas for Application resources.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ApplicationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["payment-service"])
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        examples=["Core payment processing gateway and settlement engine"],
    )
    repository_url: Optional[str] = Field(
        default=None,
        max_length=255,
        examples=["https://github.com/cloudops/payment-service"],
    )
    environment: str = Field(
        default="production",
        max_length=50,
        examples=["production"],
        description="Target deployment environment (e.g. production, staging, development)",
    )
    status: str = Field(
        default="healthy",
        max_length=50,
        examples=["healthy"],
        description="Current health status (e.g. healthy, degraded, down, maintenance)",
    )


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    repository_url: Optional[str] = Field(default=None, max_length=255)
    environment: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = Field(default=None, max_length=50)


class ApplicationRead(ApplicationBase):
    id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
