"""
Pydantic validation schemas for Monitoring Metrics and Summary reports.
"""

from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MetricBase(BaseModel):
    application_id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    metric_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["cpu_usage_percent"],
        description="Standard metric identifier",
    )
    metric_value: float = Field(..., examples=[42.5], description="Numerical metric value")
    source: str = Field(
        default="cloudops-agent",
        max_length=100,
        examples=["cloudops-agent"],
        description="Data collection source or agent",
    )


class MetricCreate(MetricBase):
    recorded_at: Optional[datetime] = None


class MetricRead(MetricBase):
    id: str = Field(..., examples=["550e8400-e29b-41d4-a716-446655440004"])
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MonitoringSummaryResponse(BaseModel):
    monitoring_status: str = Field(
        ...,
        examples=["active"],
        description="Overall telemetry status: active, idle, or sources_disconnected",
    )
    external_collectors_connected: bool = Field(
        ...,
        examples=[False],
        description="Indicates whether live external collectors (Prometheus/Grafana/CloudWatch) are active",
    )
    message: str = Field(
        ...,
        examples=["No live external telemetry collectors configured. Recorded metrics available from database."],
    )
    monitored_applications_count: int = Field(..., ge=0)
    total_metrics_recorded: int = Field(..., ge=0)
    active_incidents_count: int = Field(..., ge=0)
    system_health_distribution: Dict[str, int] = Field(
        ...,
        examples=[{"healthy": 5, "degraded": 1, "down": 0}],
    )
    latest_metrics: List[MetricRead] = Field(default_factory=list)
