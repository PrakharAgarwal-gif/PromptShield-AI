"""
Recovery Action SQLAlchemy database model.
Tracks automated and manual self-healing remediation actions, execution state, and audit logs.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        doc="Unique UUID primary key",
    )
    application_id = Column(
        String(36),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key reference to target application",
    )
    incident_id = Column(
        String(36),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Optional foreign key reference to triggering incident",
    )
    action_type = Column(
        String(100),
        nullable=False,
        index=True,
        doc="Action type: restart_service, rollback_deployment, scale_replicas, restart_container, purge_cache",
    )
    execution_status = Column(
        String(50),
        nullable=False,
        default="simulated",
        index=True,
        doc="Execution status: simulated, pending, in_progress, completed, failed",
    )
    execution_details = Column(
        Text,
        nullable=True,
        doc="Structured JSON or string audit output detailing simulation or execution results",
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        doc="Remediation request creation timestamp",
    )

    # Relationships
    application = relationship(
        "Application",
        back_populates="recovery_actions",
    )
    incident = relationship(
        "Incident",
        back_populates="recovery_actions",
    )

    def __repr__(self) -> str:
        return f"<RecoveryAction(id='{self.id}', type='{self.action_type}', status='{self.execution_status}')>"

