"""
Centralized domain exceptions and FastAPI exception handlers.
Ensures uniform, predictable error envelopes across all endpoints.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.core.logging import logger


class CloudOpsBaseException(Exception):
    """Base class for all CloudOps Sentinel domain exceptions."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class EntityNotFoundError(CloudOpsBaseException):
    """Raised when a requested resource does not exist in the database."""
    def __init__(self, entity_name: str, entity_id: str):
        message = f"{entity_name} with ID '{entity_id}' was not found."
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class DuplicateEntityError(CloudOpsBaseException):
    """Raised when an entity with unique constraint values already exists."""
    def __init__(self, message: str = "A resource with these details already exists."):
        super().__init__(message=message, status_code=status.HTTP_409_CONFLICT)


class DatabaseConnectionError(CloudOpsBaseException):
    """Raised when the database cannot be reached or fails to execute queries."""
    def __init__(self, message: str = "Database service is unavailable."):
        super().__init__(message=message, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)


class InvalidOperationError(CloudOpsBaseException):
    """Raised when an operation is invalid given the current entity state."""
    def __init__(self, message: str):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


async def cloudops_exception_handler(request: Request, exc: CloudOpsBaseException) -> JSONResponse:
    """Format domain exceptions into structured JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message,
            "path": str(request.url.path),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Format Pydantic request validation errors."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        errors.append({
            "field": field,
            "message": error.get("msg", "Validation error"),
        })

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Request validation failed. Please check the input parameters.",
            "errors": errors,
            "path": str(request.url.path),
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """Format SQLAlchemy database integrity constraint violations safely without leaking internal data."""
    logger.error(f"Database IntegrityError on {request.url.path}: {str(exc.orig)}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "status": "error",
            "message": "Database conflict: duplicate key or invalid foreign key reference.",
            "path": str(request.url.path),
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unhandled exceptions to prevent leaking tracebacks to clients."""
    logger.exception(f"Unhandled exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected internal server error occurred.",
            "path": str(request.url.path),
        },
    )
