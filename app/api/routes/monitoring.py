"""
Monitoring and Telemetry endpoints for CloudOps Sentinel.
Provides infrastructure summary and timeseries metric data without fabricated values.
"""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.metric import (
    MetricCreate,
    MetricRead,
    MonitoringSummaryResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.monitoring_service import MonitoringService

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get(
    "/summary",
    response_model=MonitoringSummaryResponse,
    summary="Get monitoring summary",
    description="Returns aggregate health metrics and explicit collector availability status.",
)
def get_monitoring_summary(
    db: Session = Depends(get_db),
) -> MonitoringSummaryResponse:
    return MonitoringService.get_summary(db)


@router.get(
    "/metrics",
    response_model=PaginatedResponse[MetricRead],
    summary="Query timeseries metrics",
    description="Query recorded performance metrics with optional filtering by application, metric name, and timestamps.",
)
def get_metrics(
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    metric_name: Optional[str] = Query(default=None, description="Filter by metric key (e.g. cpu_usage_percent)"),
    start_time: Optional[datetime] = Query(default=None, description="ISO 8601 start timestamp"),
    end_time: Optional[datetime] = Query(default=None, description="ISO 8601 end timestamp"),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=50, ge=1, le=200, description="Items per page"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[MetricRead]:
    skip = (page - 1) * page_size
    items, total = MonitoringService.list_metrics(
        db=db,
        application_id=application_id,
        metric_name=metric_name,
        start_time=start_time,
        end_time=end_time,
        skip=skip,
        limit=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse(
        items=[MetricRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "/metrics",
    response_model=MetricRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest metric data point",
    description="Record an infrastructure metric measurement for a monitored application.",
)
def ingest_metric(
    metric_in: MetricCreate,
    db: Session = Depends(get_db),
) -> MetricRead:
    metric = MonitoringService.record_metric(db, metric_in)
    return MetricRead.model_validate(metric)

