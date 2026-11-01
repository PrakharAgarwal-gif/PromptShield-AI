"""
Health and readiness probes for CloudOps Sentinel.
Provides basic liveness verification and deep database connectivity checks.
"""

from fastapi import APIRouter, Response, status
from app.core.config import settings
from app.core.database import check_database_connection
from app.schemas.common import HealthResponse, ReadinessResponse

router = APIRouter(prefix="", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service liveness probe",
    description="Returns standard healthy confirmation with service identifier and current version.",
)
def get_health() -> HealthResponse:
    """Liveness probe verifying that the API server is up and responsive."""
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
    )


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    responses={
        200: {"description": "Database is ready and reachable"},
        503: {"description": "Database connection is unhealthy or disconnected"},
    },
    summary="Service and database readiness probe",
    description="Actively queries the database to verify operational connectivity.",
)
def get_readiness(response: Response) -> ReadinessResponse:
    """Readiness probe checking real database connectivity."""
    is_connected, details = check_database_connection()

    if not is_connected:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return ReadinessResponse(
            status="unhealthy",
            database="disconnected",
            details=f"Database unreachable: {details}",
        )

    return ReadinessResponse(
        status="ready",
        database="connected",
        details="Database ping succeeded",
    )

