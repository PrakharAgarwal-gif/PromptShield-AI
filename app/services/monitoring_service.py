"""
Monitoring and Telemetry business logic service.
Queries infrastructure metrics, compiles telemetry summary, and honestly reports collector availability.
"""

from typing import List, Optional, Tuple, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.metric import MonitoringMetric
from app.models.application import Application
from app.models.incident import Incident
from app.schemas.metric import MetricCreate, MonitoringSummaryResponse, MetricRead
from app.utils.exceptions import EntityNotFoundError
from app.core.config import settings


class MonitoringService:
    @staticmethod
    def get_summary(db: Session) -> MonitoringSummaryResponse:
        """
        Produce a real-time summary of application telemetry and system health.
        Reflects actual database state and explicitly reports that external
        monitoring collectors (Prometheus/Grafana) are disconnected.
        """
        # Monitored applications
        total_apps = db.scalar(select(func.count(Application.id))) or 0

        # Health distribution
        apps_by_status = db.execute(
            select(Application.status, func.count(Application.id)).group_by(Application.status)
        ).all()
        health_dist: Dict[str, int] = {row[0]: row[1] for row in apps_by_status}
        if "healthy" not in health_dist:
            health_dist["healthy"] = 0
        if "degraded" not in health_dist:
            health_dist["degraded"] = 0
        if "down" not in health_dist:
            health_dist["down"] = 0

        # Active incidents (open or investigating)
        active_incidents = db.scalar(
            select(func.count(Incident.id)).where(
                Incident.status.in_(["open", "investigating"])
            )
        ) or 0

        # Total metrics recorded
        total_metrics = db.scalar(select(func.count(MonitoringMetric.id))) or 0

        # Latest recorded metrics
        recent_metrics = db.scalars(
            select(MonitoringMetric).order_by(MonitoringMetric.recorded_at.desc()).limit(5)
        ).all()

        external_connected = False
        status_label = "active" if total_metrics > 0 else "sources_disconnected"
        summary_message = (
            "No live external telemetry collectors (Prometheus/Grafana/CloudWatch) are connected. "
            "Telemetry summary reflects local database state."
        )

        return MonitoringSummaryResponse(
            monitoring_status=status_label,
            external_collectors_connected=external_connected,
            message=summary_message,
            monitored_applications_count=total_apps,
            total_metrics_recorded=total_metrics,
            active_incidents_count=active_incidents,
            system_health_distribution=health_dist,
            latest_metrics=[MetricRead.model_validate(m) for m in recent_metrics],
        )

    @staticmethod
    def list_metrics(
        db: Session,
        application_id: Optional[str] = None,
        metric_name: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[MonitoringMetric], int]:
        """
        Query recorded timeseries metrics with filtering by application, metric name,
        and temporal interval.
        """
        query = select(MonitoringMetric)

        if application_id:
            query = query.where(MonitoringMetric.application_id == application_id)
        if metric_name:
            query = query.where(MonitoringMetric.metric_name == metric_name)
        if start_time:
            query = query.where(MonitoringMetric.recorded_at >= start_time)
        if end_time:
            query = query.where(MonitoringMetric.recorded_at <= end_time)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        items = db.scalars(
            query.order_by(MonitoringMetric.recorded_at.desc()).offset(skip).limit(limit)
        ).all()

        return list(items), total

    @staticmethod
    def record_metric(db: Session, metric_in: MetricCreate) -> MonitoringMetric:
        """Record an incoming metric data point."""
        app = db.get(Application, metric_in.application_id)
        if not app:
            raise EntityNotFoundError("Application", metric_in.application_id)

        metric = MonitoringMetric(
            application_id=metric_in.application_id,
            metric_name=metric_in.metric_name,
            metric_value=metric_in.metric_value,
            source=metric_in.source,
        )
        if metric_in.recorded_at:
            metric.recorded_at = metric_in.recorded_at

        db.add(metric)
        db.commit()
        db.refresh(metric)
        return metric

