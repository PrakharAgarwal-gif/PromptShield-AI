"""
API route modules registration for CloudOps Sentinel.
"""

from app.api.routes.health import router as health_router
from app.api.routes.applications import router as applications_router
from app.api.routes.deployments import router as deployments_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.recovery import router as recovery_router
from app.api.routes.monitoring import router as monitoring_router

__all__ = [
    "health_router",
    "applications_router",
    "deployments_router",
    "incidents_router",
    "recovery_router",
    "monitoring_router",
]

