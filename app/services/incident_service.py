"""
Incident management business logic service.
Manages incident triage, status updates, resolution timestamps, and entity links.
"""

from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.incident import Incident
from app.models.application import Application
from app.schemas.incident import IncidentCreate, IncidentUpdate
from app.utils.exceptions import EntityNotFoundError


class IncidentService:
    @staticmethod
    def get_by_id(db: Session, incident_id: str) -> Incident:
        """Fetch a single incident by ID or raise EntityNotFoundError."""
        incident = db.get(Incident, incident_id)
        if not incident:
            raise EntityNotFoundError("Incident", incident_id)
        return incident

    @staticmethod
    def list(
        db: Session,
        application_id: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Incident], int]:
        """List incidents with filtering and pagination."""
        query = select(Incident)

        if application_id:
            query = query.where(Incident.application_id == application_id)
        if status:
            query = query.where(Incident.status == status)
        if severity:
            query = query.where(Incident.severity == severity)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        items = db.scalars(
            query.order_by(Incident.created_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    @staticmethod
    def create(db: Session, incident_in: IncidentCreate) -> Incident:
        """Create a new incident record associated with an application."""
        app = db.get(Application, incident_in.application_id)
        if not app:
            raise EntityNotFoundError("Application", incident_in.application_id)

        incident = Incident(
            application_id=incident_in.application_id,
            title=incident_in.title,
            description=incident_in.description,
            severity=incident_in.severity,
            status=incident_in.status,
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def update(db: Session, incident_id: str, incident_in: IncidentUpdate) -> Incident:
        """Update incident details or resolve the incident."""
        incident = IncidentService.get_by_id(db, incident_id)

        update_data = incident_in.model_dump(exclude_unset=True)

        # Automatically record resolution time if status becomes resolved/closed
        if "status" in update_data:
            if update_data["status"] in ["resolved", "closed"] and not incident.resolved_at:
                if "resolved_at" not in update_data or update_data["resolved_at"] is None:
                    update_data["resolved_at"] = datetime.now(timezone.utc)
            elif update_data["status"] in ["open", "investigating"]:
                update_data["resolved_at"] = None

        for key, value in update_data.items():
            setattr(incident, key, value)

        db.commit()
        db.refresh(incident)
        return incident

