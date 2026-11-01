"""
CloudOps Sentinel - Automated Deployment, Cloud Monitoring and Self-Healing Platform.
Main FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.logging import logger
from app.utils.exceptions import (
    CloudOpsBaseException,
    cloudops_exception_handler,
    validation_exception_handler,
    integrity_error_handler,
    generic_exception_handler,
)
from app.api.routes import (
    health_router,
    applications_router,
    deployments_router,
    incidents_router,
    monitoring_router,
    recovery_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown procedures."""
    logger.info(
        f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in [{settings.ENVIRONMENT}] mode..."
    )
    logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_app() -> FastAPI:
    """Application factory for CloudOps Sentinel API."""
    application = FastAPI(
        title="CloudOps Sentinel API",
        description=(
            "Automated Deployment, Cloud Monitoring and Self-Healing Platform REST API. "
            "Integrates with Next.js frontend to monitor applications, track deployments, "
            "manage incidents, inspect metrics, and stage self-healing recovery actions."
        ),
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # 1. Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Register Global Exception Handlers
    application.add_exception_handler(CloudOpsBaseException, cloudops_exception_handler)
    application.add_exception_handler(RequestValidationError, validation_exception_handler)
    application.add_exception_handler(IntegrityError, integrity_error_handler)
    application.add_exception_handler(Exception, generic_exception_handler)

    # 3. Mount API Routers under /api
    application.include_router(health_router, prefix="/api")
    application.include_router(applications_router, prefix="/api")
    application.include_router(deployments_router, prefix="/api")
    application.include_router(incidents_router, prefix="/api")
    application.include_router(monitoring_router, prefix="/api")
    application.include_router(recovery_router, prefix="/api")

    # 4. Root Redirect to /docs for developer ease
    @application.get("/", include_in_schema=False)
    def root_redirect():
        return RedirectResponse(url="/docs")

    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

