"""
Automated Recovery and Self-Healing Service.
Validates remediation requests safely without executing unverified cloud changes.
Enforces safety boundaries, audit trail logging, and dry-run execution records.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.recovery import RecoveryAction
from app.models.application import Application
from app.models.incident import Incident
from app.schemas.recovery import RecoveryActionCreate
from app.utils.exceptions import EntityNotFoundError, InvalidOperationError
from app.core.config import settings
from app.core.logging import logger

VALID_ACTION_TYPES = {
    "restart_service",
    "rollback_deployment",
    "scale_replicas",
    "restart_container",
    "purge_cache",
}


class RecoveryService:
    @staticmethod
    def get_by_id(db: Session, recovery_id: str) -> RecoveryAction:
        """Fetch a single recovery action record by ID."""
        action = db.get(RecoveryAction, recovery_id)
        if not action:
            raise EntityNotFoundError("RecoveryAction", recovery_id)
        return action

    @staticmethod
    def list(
        db: Session,
        application_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        execution_status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[RecoveryAction], int]:
        """List recorded recovery actions with optional filters and pagination."""
        query = select(RecoveryAction)

        if application_id:
            query = query.where(RecoveryAction.application_id == application_id)
        if incident_id:
            query = query.where(RecoveryAction.incident_id == incident_id)
        if execution_status:
            query = query.where(RecoveryAction.execution_status == execution_status)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        items = db.scalars(
            query.order_by(RecoveryAction.created_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    @staticmethod
    def create(db: Session, recovery_in: RecoveryActionCreate) -> RecoveryAction:
        """
        Validate and record a recovery action.
        Executes strictly in safe simulated mode to prevent unverified changes
        to live infrastructure until cloud integrations (AWS, Docker) are configured.
        """
        # 1. Validate application exists
        app = db.get(Application, recovery_in.application_id)
        if not app:
            raise EntityNotFoundError("Application", recovery_in.application_id)

        # 2. Validate incident exists and matches application (if incident_id provided)
        if recovery_in.incident_id:
            incident = db.get(Incident, recovery_in.incident_id)
            if not incident:
                raise EntityNotFoundError("Incident", recovery_in.incident_id)
            if incident.application_id != app.id:
                raise InvalidOperationError(
                    f"Incident '{recovery_in.incident_id}' belongs to application '{incident.application_id}', "
                    f"not '{recovery_in.application_id}'."
                )

        # 3. Validate action type
        if recovery_in.action_type not in VALID_ACTION_TYPES:
            valid_str = ", ".join(sorted(VALID_ACTION_TYPES))
            raise InvalidOperationError(
                f"Unsupported action type '{recovery_in.action_type}'. Valid options: {valid_str}"
            )

        # 4. Safe dry-run execution
        execution_status = "simulated"
        execution_details = (
            f"[DRY-RUN SIMULATION] Action '{recovery_in.action_type}' for application '{app.name}' ({app.id}) "
            f"validated and staged successfully. Real cloud infrastructure execution is disabled "
            f"(RECOVERY_DRY_RUN_MODE={settings.RECOVERY_DRY_RUN_MODE}). "
            f"No live AWS or Docker infrastructure changes were performed."
        )

        logger.info(
            f"Recorded safe recovery action '{recovery_in.action_type}' for application '{app.id}' "
            f"with status '{execution_status}'."
        )

        action = RecoveryAction(
            application_id=recovery_in.application_id,
            incident_id=recovery_in.incident_id,
            action_type=recovery_in.action_type,
            execution_status=execution_status,
            execution_details=execution_details,
        )
        db.add(action)
        db.commit()
        db.refresh(action)
        return action

