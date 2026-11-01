"""
Deployment domain business logic service.
Manages deployment audit history, status transitions, and application references.
"""

from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.deployment import Deployment
from app.models.application import Application
from app.schemas.deployment import DeploymentCreate
from app.utils.exceptions import EntityNotFoundError


class DeploymentService:
    @staticmethod
    def get_by_id(db: Session, deployment_id: str) -> Deployment:
        """Fetch a single deployment by ID or raise EntityNotFoundError."""
        deployment = db.get(Deployment, deployment_id)
        if not deployment:
            raise EntityNotFoundError("Deployment", deployment_id)
        return deployment

    @staticmethod
    def list(
        db: Session,
        application_id: Optional[str] = None,
        status: Optional[str] = None,
        deployment_environment: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Deployment], int]:
        """List deployments with filtering and pagination."""
        query = select(Deployment)

        if application_id:
            query = query.where(Deployment.application_id == application_id)
        if status:
            query = query.where(Deployment.status == status)
        if deployment_environment:
            query = query.where(Deployment.deployment_environment == deployment_environment)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        items = db.scalars(
            query.order_by(Deployment.started_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    @staticmethod
    def create(db: Session, deployment_in: DeploymentCreate) -> Deployment:
        """Create a new deployment record linked to a verified application."""
        # Verify parent application exists
        app = db.get(Application, deployment_in.application_id)
        if not app:
            raise EntityNotFoundError("Application", deployment_in.application_id)

        completed_at = None
        if deployment_in.status in ["successful", "failed", "rolled_back"]:
            completed_at = datetime.now(timezone.utc)

        deployment = Deployment(
            application_id=deployment_in.application_id,
            version=deployment_in.version,
            commit_hash=deployment_in.commit_hash,
            status=deployment_in.status,
            deployment_environment=deployment_in.deployment_environment,
            completed_at=completed_at,
        )
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        return deployment

