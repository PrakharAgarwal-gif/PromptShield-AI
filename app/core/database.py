"""
Database engine, session management, and connectivity diagnostics.
Uses SQLAlchemy 2.x with session dependency injection for FastAPI.
"""

from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging import logger

# Create SQLAlchemy engine
# Configure connection arguments and fail-fast timeouts per database driver
connect_args = {}
if settings.sqlalchemy_database_uri.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    connect_args["timeout"] = 5
elif "postgresql" in settings.sqlalchemy_database_uri:
    # 3-second connection timeout prevents health/readiness checks from hanging when DB is down
    connect_args["connect_timeout"] = 3

engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures rollback on unexpected exceptions and clean session closure.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        db.rollback()
        logger.error(f"Database session exception encountered, rolled back: {exc}")
        raise
    finally:
        db.close()


def check_database_connection() -> tuple[bool, str]:
    """
    Check active database connectivity by executing a lightweight query.
    Returns:
        (True, "connected") if healthy,
        (False, error_message) if connection fails.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected"
    except SQLAlchemyError as err:
        logger.error(f"Database connectivity check failed: {str(err)}")
        return False, str(err)
    except Exception as err:
        logger.error(f"Unexpected error during database check: {str(err)}")
        return False, str(err)

