from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Application, Deployment, Incident, MetricLog
from app.schemas import DashboardKPIs, HexNode

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    total_apps = db.query(Application).count()
    healthy_apps = db.query(Application).filter(Application.status == "healthy").count()
    active_incidents = db.query(Incident).filter(Incident.status.in_(["OPEN", "INVESTIGATING"])).count()
    running_deployments = db.query(Deployment).filter(Deployment.status == "RUNNING").count()

    # Calculate average recent metrics or defaults
    recent_metrics = db.query(MetricLog).order_by(MetricLog.id.desc()).limit(10).all()
    if recent_metrics:
        avg_cpu = sum(m.cpu_percent for m in recent_metrics) / len(recent_metrics)
        avg_ram = sum(m.memory_percent for m in recent_metrics) / len(recent_metrics)
    else:
        avg_cpu = 34.2
        avg_ram = 56.8

    # 12 Dynatrace/Davis inspired cluster hex nodes
    nodes = [
        HexNode(id="node-1", name="k8s-worker-us-east-1a", region="us-east-1", status="healthy", cpu_load=28.4, ram_load=48.2, pods_running=14, uptime="42d 18h"),
        HexNode(id="node-2", name="k8s-worker-us-east-1b", region="us-east-1", status="healthy", cpu_load=35.1, ram_load=52.0, pods_running=16, uptime="42d 18h"),
        HexNode(id="node-3", name="k8s-worker-us-east-1c", region="us-east-1", status="healthy", cpu_load=41.2, ram_load=61.4, pods_running=18, uptime="19d 04h"),
        HexNode(id="node-4", name="k8s-ingress-gateway-01", region="us-east-1", status="healthy", cpu_load=22.0, ram_load=38.5, pods_running=8, uptime="91d 12h"),
        HexNode(id="node-5", name="k8s-worker-us-west-2a", region="us-west-2", status="warning" if active_incidents > 0 else "healthy", cpu_load=78.9 if active_incidents > 0 else 36.4, ram_load=82.1, pods_running=22, uptime="14d 02h"),
        HexNode(id="node-6", name="k8s-worker-us-west-2b", region="us-west-2", status="healthy", cpu_load=44.0, ram_load=58.2, pods_running=15, uptime="14d 02h"),
        HexNode(id="node-7", name="k8s-worker-eu-cent-1a", region="eu-central-1", status="healthy", cpu_load=31.5, ram_load=46.0, pods_running=12, uptime="68d 22h"),
        HexNode(id="node-8", name="k8s-worker-eu-cent-1b", region="eu-central-1", status="healthy", cpu_load=29.2, ram_load=44.7, pods_running=11, uptime="68d 22h"),
        HexNode(id="node-9", name="redis-cluster-cache-01", region="us-east-1", status="healthy", cpu_load=18.5, ram_load=71.2, pods_running=6, uptime="112d 06h"),
        HexNode(id="node-10", name="kafka-broker-node-01", region="us-west-2", status="warning" if active_incidents > 0 else "healthy", cpu_load=74.3 if active_incidents > 0 else 32.1, ram_load=79.4, pods_running=8, uptime="28d 14h"),
        HexNode(id="node-11", name="db-replica-readonly-01", region="us-east-1", status="healthy", cpu_load=38.6, ram_load=64.0, pods_running=4, uptime="140d 01h"),
        HexNode(id="node-12", name="elastic-indexer-pool-01", region="us-east-1", status="healthy", cpu_load=42.8, ram_load=68.3, pods_running=10, uptime="55d 09h"),
    ]

    return DashboardKPIs(
        total_applications=total_apps,
        healthy_services=healthy_apps,
        active_incidents=active_incidents,
        running_deployments=running_deployments,
        avg_cpu_utilization=round(avg_cpu, 1),
        avg_memory_utilization=round(avg_ram, 1),
        resource_allocation_percent=78.4,
        global_system_health="DEGRADED" if active_incidents > 0 else "NOMINAL (99.98% Healthy)",
        cluster_nodes=nodes
    )
