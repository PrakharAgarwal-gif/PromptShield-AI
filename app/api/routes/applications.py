"""
Application endpoints for CloudOps Sentinel.
Supports CRUD operations, environment and status filters, and pagination.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationRead,
)
from app.schemas.common import PaginatedResponse
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get(
    "",
    response_model=PaginatedResponse[ApplicationRead],
    summary="List applications",
    description="Retrieve paginated list of monitored applications with optional filters.",
)
def list_applications(
    environment: Optional[str] = Query(default=None, description="Filter by environment (e.g. production)"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by status (e.g. healthy)"),
    search: Optional[str] = Query(default=None, description="Search keyword in name or description"),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ApplicationRead]:
    skip = (page - 1) * page_size
    items, total = ApplicationService.list(
        db=db,
        environment=environment,
        status=status_filter,
        search=search,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse(
        items=[ApplicationRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{application_id}",
    response_model=ApplicationRead,
    summary="Get application by ID",
    description="Retrieve details for a single application.",
)
def get_application(
    application_id: str = Path(..., description="Application unique ID"),
    db: Session = Depends(get_db),
) -> ApplicationRead:
    app = ApplicationService.get_by_id(db, application_id)
    return ApplicationRead.model_validate(app)


@router.post(
    "",
    response_model=ApplicationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create application",
    description="Register a new application to be monitored.",
)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
) -> ApplicationRead:
    app = ApplicationService.create(db, app_in)
    return ApplicationRead.model_validate(app)


@router.patch(
    "/{application_id}",
    response_model=ApplicationRead,
    summary="Update application",
    description="Modify attributes of an existing application.",
)
def update_application(
    application_id: str = Path(..., description="Application unique ID"),
    app_in: ApplicationUpdate = ...,
    db: Session = Depends(get_db),
) -> ApplicationRead:
    app = ApplicationService.update(db, application_id, app_in)
    return ApplicationRead.model_validate(app)


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete application",
    description="Remove an application and cascade delete all associated deployments, incidents, and metrics.",
)
def delete_application(
    application_id: str = Path(..., description="Application unique ID"),
    db: Session = Depends(get_db),
) -> None:
    ApplicationService.delete(db, application_id)

