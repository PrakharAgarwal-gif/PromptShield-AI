"""
Centralized structured logging configuration for CloudOps Sentinel.
Provides unified log formatting and filtering across all application modules.
"""

import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configure root and application loggers with structured format."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    log_format = (
        "%(asctime)s | %(levelname)-8s | [%(name)s] [%(filename)s:%(lineno)d] - %(message)s"
    )

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
        force=True,
    )

    # Reduce noisy logs from external packages
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )

    logger = logging.getLogger("cloudops_sentinel")
    logger.setLevel(log_level)
    return logger


logger = setup_logging()

