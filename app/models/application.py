"""
Application SQLAlchemy database model.
Tracks managed applications, environments, repository URLs, and runtime status.
"""

import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        doc="Unique UUID primary key",
    )
    name = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        doc="Unique human-readable application name",
    )
    description = Column(
        Text,
        nullable=True,
        doc="Application architectural description or notes",
    )
    repository_url = Column(
        String(255),
        nullable=True,
        doc="Git repository URL for source code",
    )
    environment = Column(
        String(50),
        nullable=False,
        default="production",
        index=True,
        doc="Target deployment environment (e.g. production, staging, development)",
    )
    status = Column(
        String(50),
        nullable=False,
        default="healthy",
        index=True,
        doc="Current application status (e.g. healthy, degraded, down, maintenance)",
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        doc="Timestamp when the application record was created",
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        doc="Timestamp when the application record was last modified",
    )

    # Relationships
    deployments = relationship(
        "Deployment",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    incidents = relationship(
        "Incident",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    recovery_actions = relationship(
        "RecoveryAction",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    metrics = relationship(
        "MonitoringMetric",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Application(id='{self.id}', name='{self.name}', status='{self.status}')>"

