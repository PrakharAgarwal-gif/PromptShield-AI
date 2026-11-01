"""
Deployment SQLAlchemy database model.
Tracks deployment version, commit hash, execution status, and audit timestamps.
"""

import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Deployment(Base):
    __tablename__ = "deployments"

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
        doc="Foreign key reference to parent application",
    )
    version = Column(
        String(50),
        nullable=False,
        index=True,
        doc="Release semantic version or build tag (e.g. v1.2.0, build-451)",
    )
    commit_hash = Column(
        String(40),
        nullable=True,
        doc="Git commit SHA-1 hash deployed",
    )
    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
        doc="Deployment status: pending, in_progress, successful, failed, rolled_back",
    )
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        doc="Deployment start timestamp",
    )
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Deployment completion or termination timestamp",
    )
    deployment_environment = Column(
        String(50),
        nullable=False,
        index=True,
        doc="Target deployment environment (e.g. production, staging, development)",
    )

    # Relationships
    application = relationship(
        "Application",
        back_populates="deployments",
    )

    def __repr__(self) -> str:
        return f"<Deployment(id='{self.id}', app_id='{self.application_id}', version='{self.version}', status='{self.status}')>"

