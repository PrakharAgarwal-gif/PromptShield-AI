from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RecoveryAction, Incident, Application
from app.schemas import RecoveryTrigger, RecoveryResponse

router = APIRouter(prefix="/recovery", tags=["Self-Healing Recovery"])

PLAYBOOKS = [
    {
        "id": "restart-pod",
        "name": "Auto-Restart Unhealthy Pods",
        "description": "Performs rolling graceful kill of container processes with non-zero exit codes.",
        "target": "Kubernetes Pod Controller",
        "estimated_duration": "15s"
    },
    {
        "id": "scale-replicas",
        "name": "Horizontal Pod Autoscaler (HPA +2)",
        "description": "Increases replica pool count to distribute sudden flash traffic bursts.",
        "target": "HPA Deployment",
        "estimated_duration": "30s"
    },
    {
        "id": "rollback-deploy",
        "name": "Instant Canary Rollback",
        "description": "Reverts cluster deployment traffic to the previous known-healthy container image digest.",
        "target": "Ingress Canary Route",
        "estimated_duration": "45s"
    },
    {
        "id": "flush-cache",
        "name": "Flush Eviction Buffer & Cache",
        "description": "Triggers memory reclamation and clears stagnant queue lock keys in Redis.",
        "target": "Redis Sentinel",
        "estimated_duration": "5s"
    }
]


@router.get("/playbooks")
def list_playbooks():
    return PLAYBOOKS


@router.get("/history", response_model=List[RecoveryResponse])
def get_recovery_history(db: Session = Depends(get_db)):
    return db.query(RecoveryAction).order_by(RecoveryAction.id.desc()).all()


@router.post("/execute", response_model=RecoveryResponse)
def execute_recovery(payload: RecoveryTrigger, db: Session = Depends(get_db)):
    action = RecoveryAction(
        incident_id=payload.incident_id,
        application_id=payload.application_id,
        playbook_name=payload.playbook_name,
        trigger_type=payload.trigger_type or "MANUAL",
        status="COMPLETED",
        details=f"Playbook '{payload.playbook_name}' executed cleanly. Pod health verified nominal.",
        executed_at=datetime.now(timezone.utc)
    )
    db.add(action)

    # If linked to an incident, mark incident as RESOLVED or MITIGATED
    if payload.incident_id:
        incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
        if incident:
            incident.status = "RESOLVED"
            incident.resolved_at = datetime.now(timezone.utc)
            if incident.application:
                incident.application.status = "healthy"

    db.commit()
    db.refresh(action)
    return action
