from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="DevOps Engineer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    key = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    environment = Column(String(20), default="Production")  # Dev, Staging, Production
    cluster_region = Column(String(50), default="us-east-1 (N. Virginia)")
    status = Column(String(20), default="healthy")  # healthy, warning, critical
    replica_count = Column(Integer, default=3)
    cpu_limit = Column(String(20), default="2000m")
    memory_limit = Column(String(20), default="4096Mi")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    deployments = relationship("Deployment", back_populates="application", cascade="all, delete-orphan")
    metrics = relationship("MetricLog", back_populates="application", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="application", cascade="all, delete-orphan")
    recoveries = relationship("RecoveryAction", back_populates="application", cascade="all, delete-orphan")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    version = Column(String(50), nullable=False)
    branch = Column(String(100), default="main")
    commit_hash = Column(String(40), default="a1b2c3d")
    status = Column(String(20), default="RUNNING")  # RUNNING, SUCCESS, FAILED
    triggered_by = Column(String(100), default="Alex Vance (Lead SRE)")
    execution_time_seconds = Column(Integer, default=45)
    logs = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="deployments")


class MetricLog(Base):
    __tablename__ = "metric_logs"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
    cpu_percent = Column(Float, default=24.5)
    memory_percent = Column(Float, default=42.0)
    latency_ms = Column(Float, default=18.4)
    error_rate = Column(Float, default=0.01)
    active_connections = Column(Integer, default=1240)
    log_level = Column(String(20), default="INFO")  # INFO, WARN, ERROR, CRITICAL
    message = Column(Text, nullable=True)

    application = relationship("Application", back_populates="metrics")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="P2-High")  # P1-Critical, P2-High, P3-Medium, P4-Low
    status = Column(String(30), default="OPEN")  # OPEN, INVESTIGATING, MITIGATED, RESOLVED
    root_cause = Column(String(255), nullable=True)
    detected_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="incidents")
    recoveries = relationship("RecoveryAction", back_populates="incident")


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    playbook_name = Column(String(100), nullable=False)  # Pod Restart, Scale Pods, Rollback, Cache Flush
    trigger_type = Column(String(20), default="AUTOMATED")  # AUTOMATED, MANUAL
    status = Column(String(20), default="COMPLETED")  # COMPLETED, IN_PROGRESS, FAILED
    details = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=utc_now)

    incident = relationship("Incident", back_populates="recoveries")
    application = relationship("Application", back_populates="recoveries")
