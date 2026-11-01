"""
End-to-End CRUD & Pipeline Verification Script for CloudOps Sentinel.
Executes deep integration tests across all API routes:
- Application lifecycle (Create, Read, List, Update, Delete)
- Deployment lifecycle (Create, List, Filter by environment)
- Incident lifecycle (Create, Query, Update to resolved)
- Telemetry & Monitoring (Ingest metric, Query metrics, Collector status)
- Self-Healing Recovery (Trigger safe simulated action, Verify dry-run execution log)
"""

import os
import sys
import uuid

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# Isolated database engine
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def run_e2e_verification():
    print("=" * 70)
    print("CLOUDOPS SENTINEL: END-TO-END CRUD & INTEGRATION VERIFICATION")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. APPLICATION LIFECYCLE
    # -------------------------------------------------------------
    print("\n--- 1. APPLICATION LIFECYCLE ---")
    app_payload = {
        "name": f"sentinel-payment-gateway-{uuid.uuid4().hex[:6]}",
        "description": "Critical checkout and transaction orchestration service",
        "repository_url": "https://github.com/cloudops/payment-service",
        "environment": "production",
        "status": "healthy",
    }
    res_create_app = client.post("/api/applications", json=app_payload)
    print(f"[CREATE] POST /api/applications -> HTTP {res_create_app.status_code}")
    assert res_create_app.status_code == 201
    app_data = res_create_app.json()
    app_id = app_data["id"]
    print(f"  Created App ID: {app_id} | Name: {app_data['name']}")

    # Get by ID
    res_get_app = client.get(f"/api/applications/{app_id}")
    print(f"[READ] GET /api/applications/{app_id} -> HTTP {res_get_app.status_code}")
    assert res_get_app.status_code == 200
    assert res_get_app.json()["name"] == app_payload["name"]

    # List with pagination
    res_list_app = client.get("/api/applications?page=1&page_size=10")
    print(f"[LIST] GET /api/applications -> HTTP {res_list_app.status_code}")
    assert res_list_app.status_code == 200
    assert res_list_app.json()["total"] >= 1

    # Update (Patch)
    res_patch_app = client.patch(f"/api/applications/{app_id}", json={"status": "degraded"})
    print(f"[UPDATE] PATCH /api/applications/{app_id} -> HTTP {res_patch_app.status_code}")
    assert res_patch_app.status_code == 200
    assert res_patch_app.json()["status"] == "degraded"

    # -------------------------------------------------------------
    # 2. DEPLOYMENT LIFECYCLE
    # -------------------------------------------------------------
    print("\n--- 2. DEPLOYMENT LIFECYCLE ---")
    dep_payload = {
        "application_id": app_id,
        "version": "v2.4.1",
        "commit_hash": "a1b2c3d4e5f678901234567890abcdef12345678",
        "status": "successful",
        "deployment_environment": "production",
    }
    res_create_dep = client.post("/api/deployments", json=dep_payload)
    print(f"[CREATE] POST /api/deployments -> HTTP {res_create_dep.status_code}")
    assert res_create_dep.status_code == 201
    dep_data = res_create_dep.json()
    dep_id = dep_data["id"]
    print(f"  Created Deployment ID: {dep_id} | Version: {dep_data['version']}")

    # List deployments with environment filter
    res_list_dep = client.get(f"/api/deployments?application_id={app_id}&deployment_environment=production")
    print(f"[LIST] GET /api/deployments (filtered) -> HTTP {res_list_dep.status_code}")
    assert res_list_dep.status_code == 200
    assert len(res_list_dep.json()["items"]) >= 1

    # -------------------------------------------------------------
    # 3. INCIDENT LIFECYCLE
    # -------------------------------------------------------------
    print("\n--- 3. INCIDENT LIFECYCLE ---")
    inc_payload = {
        "application_id": app_id,
        "title": "Database connection pool exhaustion detected",
        "description": "HTTP 500 error spike exceeding 15% threshold in us-east-1",
        "severity": "high",
        "status": "open",
    }
    res_create_inc = client.post("/api/incidents", json=inc_payload)
    print(f"[CREATE] POST /api/incidents -> HTTP {res_create_inc.status_code}")
    assert res_create_inc.status_code == 201
    inc_data = res_create_inc.json()
    inc_id = inc_data["id"]
    print(f"  Created Incident ID: {inc_id} | Severity: {inc_data['severity']}")

    # List incidents
    res_list_inc = client.get(f"/api/incidents?severity=high&status=open")
    print(f"[LIST] GET /api/incidents (severity=high) -> HTTP {res_list_inc.status_code}")
    assert res_list_inc.status_code == 200
    assert any(i["id"] == inc_id for i in res_list_inc.json()["items"])

    # Resolve incident
    res_resolve_inc = client.patch(f"/api/incidents/{inc_id}", json={"status": "resolved"})
    print(f"[RESOLVE] PATCH /api/incidents/{inc_id} (status=resolved) -> HTTP {res_resolve_inc.status_code}")
    assert res_resolve_inc.status_code == 200
    assert res_resolve_inc.json()["status"] == "resolved"
    assert res_resolve_inc.json()["resolved_at"] is not None
    print(f"  Incident resolved at: {res_resolve_inc.json()['resolved_at']}")

    # -------------------------------------------------------------
    # 4. TELEMETRY & MONITORING LIFECYCLE
    # -------------------------------------------------------------
    print("\n--- 4. TELEMETRY & MONITORING ---")
    # Ingest metric
    metric_payload = {
        "application_id": app_id,
        "metric_name": "cpu_utilization",
        "metric_value": 78.4,
        "source": "host_agent",
    }
    res_metric = client.post("/api/monitoring/metrics", json=metric_payload)
    print(f"[INGEST] POST /api/monitoring/metrics -> HTTP {res_metric.status_code}")
    assert res_metric.status_code == 201
    metric_id = res_metric.json()["id"]

    # Query metrics
    res_get_metrics = client.get(f"/api/monitoring/metrics?application_id={app_id}&metric_name=cpu_utilization")
    print(f"[QUERY] GET /api/monitoring/metrics -> HTTP {res_get_metrics.status_code}")
    assert res_get_metrics.status_code == 200
    assert len(res_get_metrics.json()) >= 1
    print(f"  Queried metrics count: {len(res_get_metrics.json())}")

    # Summary
    res_summary = client.get("/api/monitoring/summary")
    print(f"[SUMMARY] GET /api/monitoring/summary -> HTTP {res_summary.status_code}")
    assert res_summary.status_code == 200
    summary_data = res_summary.json()
    print(f"  Collector Connected: {summary_data['external_collectors_connected']} | Total Apps: {summary_data['monitored_applications_count']}")

    # -------------------------------------------------------------
    # 5. SELF-HEALING RECOVERY (DRY-RUN SAFETY BOUNDS)
    # -------------------------------------------------------------
    print("\n--- 5. SELF-HEALING RECOVERY (DRY-RUN VERIFICATION) ---")
    recovery_payload = {
        "application_id": app_id,
        "incident_id": inc_id,
        "action_type": "restart_service",
    }
    res_recovery = client.post("/api/recovery", json=recovery_payload)
    print(f"[TRIGGER] POST /api/recovery (restart_service) -> HTTP {res_recovery.status_code}")
    assert res_recovery.status_code == 201
    rec_data = res_recovery.json()
    print(f"  Recovery Action ID: {rec_data['id']}")
    print(f"  Execution Status: {rec_data['execution_status']}")
    print(f"  Execution Details: {rec_data['execution_details']}")
    assert rec_data["execution_status"] == "simulated"
    assert "DRY-RUN SIMULATION" in rec_data["execution_details"]
    assert "RECOVERY_DRY_RUN_MODE=True" in rec_data["execution_details"]

    # Test rejection of unsupported action type
    res_bad_action = client.post(
        "/api/recovery",
        json={"application_id": app_id, "action_type": "terminate_all_servers_unrestricted"}
    )
    print(f"[VALIDATION] POST /api/recovery (invalid action) -> HTTP {res_bad_action.status_code}")
    print(f"  Response JSON: {res_bad_action.json()}")
    assert res_bad_action.status_code == 400
    err_body = str(res_bad_action.json())
    assert "Unsupported recovery action_type" in err_body or "unsupported" in err_body.lower()

    # -------------------------------------------------------------
    # 6. APPLICATION DELETION & CLEANUP
    # -------------------------------------------------------------
    print("\n--- 6. APPLICATION DELETION & CLEANUP ---")
    res_del_app = client.delete(f"/api/applications/{app_id}")
    print(f"[DELETE] DELETE /api/applications/{app_id} -> HTTP {res_del_app.status_code}")
    assert res_del_app.status_code in [200, 204]

    # Confirm deletion
    res_recheck = client.get(f"/api/applications/{app_id}")
    print(f"[CONFIRM] GET /api/applications/{app_id} -> HTTP {res_recheck.status_code}")
    assert res_recheck.status_code == 404

    print("\n" + "=" * 70)
    print("ALL CRUD & INTEGRATION PIPELINE CHECKS PASSED WITH 100% SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_verification()
