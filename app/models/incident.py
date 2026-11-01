"""
Incident SQLAlchemy database model.
Tracks detected infrastructure anomalies, severity levels, remediation status, and resolution timestamps.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Incident(Base):
    __tablename__ = "incidents"

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
        doc="Foreign key reference to impacted application",
    )
    title = Column(
        String(255),
        nullable=False,
        doc="Incident brief summary title",
    )
    description = Column(
        Text,
        nullable=True,
        doc="Detailed failure context, stack traces, or incident symptoms",
    )
    severity = Column(
        String(50),
        nullable=False,
        default="medium",
        index=True,
        doc="Incident severity: critical, high, medium, low",
    )
    status = Column(
        String(50),
        nullable=False,
        default="open",
        index=True,
        doc="Remediation status: open, investigating, mitigated, resolved, closed",
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        doc="Incident detection timestamp",
    )
    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Incident resolution timestamp",
    )

    # Relationships
    application = relationship(
        "Application",
        back_populates="incidents",
    )
    recovery_actions = relationship(
        "RecoveryAction",
        back_populates="incident",
    )

    def __repr__(self) -> str:
        return f"<Incident(id='{self.id}', app_id='{self.application_id}', severity='{self.severity}', status='{self.status}')>"

