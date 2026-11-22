from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Incident, Application
from app.schemas import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status_filter and status_filter != "ALL":
        query = query.filter(Incident.status == status_filter.upper())
    return query.order_by(Incident.id.desc()).all()


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident = Incident(
        application_id=payload.application_id,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        status="OPEN",
        detected_at=datetime.now(timezone.utc)
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: int, payload: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if payload.status:
        incident.status = payload.status
        if payload.status == "RESOLVED":
            incident.resolved_at = datetime.now(timezone.utc)
            # If application status was critical or warning, reset to healthy
            if incident.application:
                incident.application.status = "healthy"

    if payload.root_cause:
        incident.root_cause = payload.root_cause

    db.commit()
    db.refresh(incident)
    return incident
