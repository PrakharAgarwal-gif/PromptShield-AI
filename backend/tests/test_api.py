import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "CloudOps" in data["service"]


def test_auth_login(client: TestClient):
    payload = {
        "email": "admin@cloudops.io",
        "password": "admin123"
    }
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@cloudops.io"


def test_dashboard_kpis(client: TestClient):
    res = client.get("/api/dashboard/kpis")
    assert res.status_code == 200
    data = res.json()
    assert data["total_applications"] >= 4
    assert len(data["cluster_nodes"]) == 12


def test_applications_crud(client: TestClient):
    # List apps
    res = client.get("/api/applications")
    assert res.status_code == 200
    apps = res.json()
    assert len(apps) >= 4

    # Create app
    new_app = {
        "name": "Audit Logging Microservice",
        "key": "svc-audit-log-test",
        "description": "Compliance log streamer",
        "environment": "Dev",
        "cluster_region": "us-east-1",
        "replica_count": 2
    }
    create_res = client.post("/api/applications", json=new_app)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["key"] == "svc-audit-log-test"

    # Delete app
    del_res = client.delete(f"/api/applications/{created['id']}")
    assert del_res.status_code == 204


def test_deployments_list_and_trigger(client: TestClient):
    # List deployments
    res = client.get("/api/deployments")
    assert res.status_code == 200
    deps = res.json()
    assert len(deps) >= 4

    # Trigger deployment on first app
    first_app_id = deps[0]["application_id"]
    trigger_payload = {
        "application_id": first_app_id,
        "version": "v3.0.0-rc1",
        "branch": "feature/canary-test"
    }
    trig_res = client.post("/api/deployments", json=trigger_payload)
    assert trig_res.status_code == 201
    trig_data = trig_res.json()
    assert trig_data["status"] == "RUNNING"
    assert "Canary" in trig_data["logs"] or "Initializing" in trig_data["logs"]


def test_monitoring_telemetry_and_anomaly_simulation(client: TestClient):
    # Telemetry
    res = client.get("/api/monitoring/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert len(data["time_series"]) == 16
    assert data["cpu_average"] > 0

    # Simulate Anomaly Spike
    sim_res = client.post("/api/monitoring/simulate-spike")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["status"] == "ANOMALY_TRIGGERED"
    assert sim_data["cpu_spike"] == 94.8


def test_incidents_list(client: TestClient):
    res = client.get("/api/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert len(incidents) >= 1


def test_recovery_playbooks_and_execute(client: TestClient):
    # List playbooks
    pb_res = client.get("/api/recovery/playbooks")
    assert pb_res.status_code == 200
    playbooks = pb_res.json()
    assert len(playbooks) == 4

    # Execute playbook
    exec_payload = {
        "playbook_name": "Horizontal Pod Autoscaler (HPA +2)",
        "trigger_type": "MANUAL"
    }
    exec_res = client.post("/api/recovery/execute", json=exec_payload)
    assert exec_res.status_code == 200
    data = exec_res.json()
    assert data["status"] == "COMPLETED"
