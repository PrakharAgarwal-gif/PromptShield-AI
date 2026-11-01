"""
Incident management endpoints for CloudOps Sentinel.
Supports tracking anomalies, severity levels, remediation progress, and resolution.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentRead
from app.schemas.common import PaginatedResponse
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get(
    "",
    response_model=PaginatedResponse[IncidentRead],
    summary="List incidents",
    description="Retrieve paginated incidents with filtering by application, status, and severity.",
)
def list_incidents(
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by status (e.g. open, resolved)"),
    severity: Optional[str] = Query(default=None, description="Filter by severity (critical, high, medium, low)"),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[IncidentRead]:
    skip = (page - 1) * page_size
    items, total = IncidentService.list(
        db=db,
        application_id=application_id,
        status=status_filter,
        severity=severity,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse(
        items=[IncidentRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{incident_id}",
    response_model=IncidentRead,
    summary="Get incident by ID",
    description="Retrieve details for a specific incident.",
)
def get_incident(
    incident_id: str = Path(..., description="Incident unique ID"),
    db: Session = Depends(get_db),
) -> IncidentRead:
    incident = IncidentService.get_by_id(db, incident_id)
    return IncidentRead.model_validate(incident)


@router.post(
    "",
    response_model=IncidentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Report incident",
    description="File a new incident against an application.",
)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
) -> IncidentRead:
    incident = IncidentService.create(db, incident_in)
    return IncidentRead.model_validate(incident)


@router.patch(
    "/{incident_id}",
    response_model=IncidentRead,
    summary="Update incident",
    description="Update status, title, description, or severity of an incident.",
)
def update_incident(
    incident_id: str = Path(..., description="Incident unique ID"),
    incident_in: IncidentUpdate = ...,
    db: Session = Depends(get_db),
) -> IncidentRead:
    incident = IncidentService.update(db, incident_id, incident_in)
    return IncidentRead.model_validate(incident)

