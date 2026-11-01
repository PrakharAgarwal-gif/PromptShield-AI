"""
Monitoring Metric SQLAlchemy database model.
Stores infrastructure performance timeseries data, system resource utilization, and health indicators.
"""

import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship
from app.models.base import Base


class MonitoringMetric(Base):
    __tablename__ = "monitoring_metrics"

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
        doc="Foreign key reference to measured application",
    )
    metric_name = Column(
        String(100),
        nullable=False,
        index=True,
        doc="Metric key (e.g. cpu_usage_percent, memory_usage_bytes, request_latency_ms, error_rate)",
    )
    metric_value = Column(
        Float,
        nullable=False,
        doc="Numerical metric value recorded",
    )
    recorded_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        doc="UTC timestamp when metric was captured",
    )
    source = Column(
        String(100),
        nullable=False,
        default="cloudops-agent",
        doc="Origin sensor or source (e.g. prometheus_exporter, cloudwatch, agent, manual)",
    )

    # Relationships
    application = relationship(
        "Application",
        back_populates="metrics",
    )

    __table_args__ = (
        Index("ix_metrics_app_name_time", "application_id", "metric_name", "recorded_at"),
    )

    def __repr__(self) -> str:
        return f"<MonitoringMetric(id='{self.id}', name='{self.metric_name}', val={self.metric_value}, src='{self.source}')>"

