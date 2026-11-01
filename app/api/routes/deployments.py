"""
Deployment endpoints for CloudOps Sentinel.
Supports tracking deployment versions, commit hashes, execution status, and filtering.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.deployment import DeploymentCreate, DeploymentRead
from app.schemas.common import PaginatedResponse
from app.services.deployment_service import DeploymentService

router = APIRouter(prefix="/deployments", tags=["Deployments"])


@router.get(
    "",
    response_model=PaginatedResponse[DeploymentRead],
    summary="List deployments",
    description="Retrieve paginated deployments with filtering by application, status, and environment.",
)
def list_deployments(
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by deployment status"),
    environment: Optional[str] = Query(default=None, description="Filter by deployment environment"),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[DeploymentRead]:
    skip = (page - 1) * page_size
    items, total = DeploymentService.list(
        db=db,
        application_id=application_id,
        status=status_filter,
        deployment_environment=environment,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse(
        items=[DeploymentRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{deployment_id}",
    response_model=DeploymentRead,
    summary="Get deployment by ID",
    description="Retrieve details for a specific deployment.",
)
def get_deployment(
    deployment_id: str = Path(..., description="Deployment unique ID"),
    db: Session = Depends(get_db),
) -> DeploymentRead:
    deployment = DeploymentService.get_by_id(db, deployment_id)
    return DeploymentRead.model_validate(deployment)


@router.post(
    "",
    response_model=DeploymentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Record deployment",
    description="Record a new deployment for an application.",
)
def create_deployment(
    deployment_in: DeploymentCreate,
    db: Session = Depends(get_db),
) -> DeploymentRead:
    deployment = DeploymentService.create(db, deployment_in)
    return DeploymentRead.model_validate(deployment)

