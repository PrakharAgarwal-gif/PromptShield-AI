"""
Pydantic validation schemas for Recovery Action resources.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class RecoveryActionBase(BaseModel):
    application_id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    incident_id: Optional[str] = Field(
        default=None,
        examples=["550e8400-e29b-41d4-a716-446655440002"],
        description="Optional incident ID triggering this recovery",
    )
    action_type: str = Field(
        ...,
        min_length=3,
        max_length=100,
        examples=["restart_service"],
        description="Action type: restart_service, rollback_deployment, scale_replicas, purge_cache",
    )


class RecoveryActionCreate(RecoveryActionBase):
    pass


class RecoveryActionRead(RecoveryActionBase):
    id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440003"])
    execution_status: str = Field(
        ...,
        examples=["simulated"],
        description="Execution status: simulated, pending, in_progress, completed, failed",
    )
    execution_details: Optional[str] = Field(
        default=None,
        description="Simulation or execution audit log message explaining safety bounds and results",
    )
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
