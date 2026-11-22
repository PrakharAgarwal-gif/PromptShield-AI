import random
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MetricLog, Application, Incident, RecoveryAction
from app.schemas import TelemetrySummary, MetricLogResponse

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Telemetry"])


@router.get("/telemetry", response_model=TelemetrySummary)
def get_telemetry(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    # Generate 16 smooth time-series data points for the glowing spline chart
    time_series = []
    base_cpu = 28.0
    base_ram = 45.0
    base_lat = 18.0

    for i in range(16):
        t = now - timedelta(minutes=(15 - i) * 15)
        # Add realistic wave variation
        wave = (i % 5) * 3.5
        time_series.append({
            "time": t.strftime("%H:%M"),
            "cpu": round(base_cpu + wave + random.uniform(-2, 3), 1),
            "memory": round(base_ram + (i * 0.8) + random.uniform(-1, 2), 1),
            "latency": round(base_lat + wave * 0.5 + random.uniform(-1.5, 2.5), 1),
            "uptime": 99.98
        })

    return TelemetrySummary(
        cpu_average=34.8,
        memory_average=52.4,
        latency_p95=24.2,
        error_rate=0.012,
        uptime_percentage=99.98,
        time_series=time_series
    )


@router.get("/logs", response_model=List[MetricLogResponse])
def get_live_logs(
    level: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(MetricLog)
    if level and level != "ALL":
        query = query.filter(MetricLog.log_level == level.upper())
    return query.order_by(MetricLog.id.desc()).limit(limit).all()


@router.post("/simulate-spike")
def trigger_anomaly_simulation(db: Session = Depends(get_db)):
    """
    Simulation Engine: Injects an artificial high-load anomaly spike.
    Creates high CPU/RAM logs, raises an active incident, and prepares self-healing!
    """
    now = datetime.now(timezone.utc)
    target_app = db.query(Application).filter(Application.key == "svc-order-pipeline").first()
    if not target_app:
        target_app = db.query(Application).first()

    # 1. Update target application status to warning or critical
    if target_app:
        target_app.status = "critical"

    # 2. Add spiked MetricLog
    spike_log = MetricLog(
        application_id=target_app.id if target_app else None,
        timestamp=now,
        cpu_percent=94.8,
        memory_percent=88.4,
        latency_ms=482.0,
        error_rate=0.18,
        active_connections=4890,
        log_level="CRITICAL",
        message="[ANOMALY TRIGGERED] CPU spike detected: 94.8%. p99 latency exceeded 400ms SLO threshold."
    )
    db.add(spike_log)

    # 3. Create real Incident
    incident = Incident(
        application_id=target_app.id if target_app else None,
        title=f"Critical Load Anomaly on {target_app.name if target_app else 'Cluster'}",
        description="Automated telemetry engine detected a severe traffic surge triggering >90% CPU and socket pool saturation.",
        severity="P1-Critical",
        status="OPEN",
        root_cause="Synthetic Anomaly Simulation: Traffic spike overload across consumer pods.",
        detected_at=now
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    return {
        "status": "ANOMALY_TRIGGERED",
        "message": "High-severity anomaly simulated successfully. Incident opened and self-healing engine alerted.",
        "incident_id": incident.id,
        "cpu_spike": 94.8,
        "affected_service": target_app.name if target_app else "Core Cluster"
    }
