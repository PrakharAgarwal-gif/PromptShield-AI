"""
Pydantic validation schemas for Deployment resources.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DeploymentBase(BaseModel):
    application_id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    version: str = Field(..., min_length=1, max_length=50, examples=["v1.4.2"])
    commit_hash: Optional[str] = Field(
        default=None,
        min_length=7,
        max_length=40,
        examples=["a1b2c3d4e5f67890123456789abcdef012345678"],
    )
    status: str = Field(
        default="pending",
        max_length=50,
        examples=["pending"],
        description="Deployment status: pending, in_progress, successful, failed, rolled_back",
    )
    deployment_environment: str = Field(
        ...,
        max_length=50,
        examples=["production"],
        description="Target deployment environment (e.g. production, staging, development)",
    )


class DeploymentCreate(DeploymentBase):
    pass


class DeploymentRead(DeploymentBase):
    id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440001"])
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
