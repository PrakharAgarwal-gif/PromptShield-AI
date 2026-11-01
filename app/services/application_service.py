"""
Application domain business logic service.
Manages CRUD operations, validation, filtering, and pagination for applications.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.utils.exceptions import EntityNotFoundError, DuplicateEntityError


class ApplicationService:
    @staticmethod
    def get_by_id(db: Session, app_id: str) -> Application:
        """Fetch a single application by ID or raise EntityNotFoundError."""
        app = db.get(Application, app_id)
        if not app:
            raise EntityNotFoundError("Application", app_id)
        return app

    @staticmethod
    def list(
        db: Session,
        environment: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Application], int]:
        """List applications with optional filters and pagination."""
        query = select(Application)

        if environment:
            query = query.where(Application.environment == environment)
        if status:
            query = query.where(Application.status == status)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Application.name.ilike(search_pattern),
                    Application.description.ilike(search_pattern),
                )
            )

        # Count total matching records
        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        # Apply ordering and pagination
        items = db.scalars(
            query.order_by(Application.created_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    @staticmethod
    def create(db: Session, app_in: ApplicationCreate) -> Application:
        """Create a new application record after verifying uniqueness."""
        existing = db.scalar(select(Application).where(Application.name == app_in.name))
        if existing:
            raise DuplicateEntityError(f"Application with name '{app_in.name}' already exists.")

        app = Application(
            name=app_in.name,
            description=app_in.description,
            repository_url=str(app_in.repository_url) if app_in.repository_url else None,
            environment=app_in.environment,
            status=app_in.status,
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def update(db: Session, app_id: str, app_in: ApplicationUpdate) -> Application:
        """Update existing application fields."""
        app = ApplicationService.get_by_id(db, app_id)

        update_data = app_in.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] != app.name:
            existing = db.scalar(
                select(Application).where(Application.name == update_data["name"])
            )
            if existing:
                raise DuplicateEntityError(
                    f"Application with name '{update_data['name']}' already exists."
                )

        if "repository_url" in update_data and update_data["repository_url"] is not None:
            update_data["repository_url"] = str(update_data["repository_url"])

        for key, value in update_data.items():
            setattr(app, key, value)

        db.commit()
        db.refresh(app)
        return app

    @staticmethod
    def delete(db: Session, app_id: str) -> None:
        """Delete an application and its cascaded child entities."""
        app = ApplicationService.get_by_id(db, app_id)
        db.delete(app)
        db.commit()

