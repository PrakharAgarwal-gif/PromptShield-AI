"""
Automated Recovery endpoints for CloudOps Sentinel.
Provides safe validation and staged recording for self-healing actions.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.recovery import RecoveryActionCreate, RecoveryActionRead
from app.schemas.common import PaginatedResponse
from app.services.recovery_service import RecoveryService

router = APIRouter(prefix="/recovery", tags=["Recovery"])


@router.get(
    "",
    response_model=PaginatedResponse[RecoveryActionRead],
    summary="List recovery actions",
    description="Retrieve audit history of triggered or staged recovery actions.",
)
def list_recovery_actions(
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    incident_id: Optional[str] = Query(default=None, description="Filter by triggering incident ID"),
    execution_status: Optional[str] = Query(default=None, description="Filter by status (simulated, pending, etc.)"),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[RecoveryActionRead]:
    skip = (page - 1) * page_size
    items, total = RecoveryService.list(
        db=db,
        application_id=application_id,
        incident_id=incident_id,
        execution_status=execution_status,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse(
        items=[RecoveryActionRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{recovery_id}",
    response_model=RecoveryActionRead,
    summary="Get recovery action by ID",
    description="Retrieve details and audit logs for a specific recovery action.",
)
def get_recovery_action(
    recovery_id: str = Path(..., description="Recovery action unique ID"),
    db: Session = Depends(get_db),
) -> RecoveryActionRead:
    action = RecoveryService.get_by_id(db, recovery_id)
    return RecoveryActionRead.model_validate(action)


@router.post(
    "",
    response_model=RecoveryActionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger recovery action",
    description=(
        "Safely validate and stage a self-healing recovery action. "
        "Operates in simulated dry-run mode unless real infrastructure adapters are explicitly configured."
    ),
)
def trigger_recovery_action(
    recovery_in: RecoveryActionCreate,
    db: Session = Depends(get_db),
) -> RecoveryActionRead:
    action = RecoveryService.create(db, recovery_in)
    return RecoveryActionRead.model_validate(action)

