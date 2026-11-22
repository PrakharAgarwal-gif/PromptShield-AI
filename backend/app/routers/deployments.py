import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Deployment, Application
from app.schemas import DeploymentCreate, DeploymentResponse

router = APIRouter(prefix="/deployments", tags=["Deployments"])


@router.get("", response_model=List[DeploymentResponse])
def list_deployments(
    application_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Deployment)
    if application_id:
        query = query.filter(Deployment.application_id == application_id)
    return query.order_by(Deployment.id.desc()).all()


@router.post("", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
def trigger_deployment(payload: DeploymentCreate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Target application not found")

    commit = uuid.uuid4().hex[:7]
    simulated_logs = (
        f"[00:01] Initializing CI/CD runner for {app.name} ({payload.version})\n"
        f"[00:09] Checkout branch '{payload.branch}' @ commit {commit}\n"
        f"[00:22] Running lint and automated vulnerability audit: PASSED\n"
        f"[00:41] Container image built and pushed to AWS ECR: {app.key}:{payload.version}\n"
        f"[00:58] Rolling deployment to {app.cluster_region} in progress...\n"
        f"[01:14] Zero-downtime health probes 200 OK across {app.replica_count} pods.\n"
        f"[01:20] Deployment completed successfully."
    )

    deployment = Deployment(
        application_id=app.id,
        version=payload.version,
        branch=payload.branch or "main",
        commit_hash=commit,
        status="RUNNING",
        triggered_by=payload.triggered_by or "Alex Vance (Lead SRE)",
        execution_time_seconds=74,
        logs=simulated_logs,
        started_at=datetime.now(timezone.utc)
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return deployment


@router.get("/{dep_id}", response_model=DeploymentResponse)
def get_deployment(dep_id: int, db: Session = Depends(get_db)):
    dep = db.query(Deployment).filter(Deployment.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return dep
