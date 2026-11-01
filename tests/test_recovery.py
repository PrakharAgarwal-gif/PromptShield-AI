"""
Unit and integration tests for Automated Recovery and Self-Healing endpoints.
"""

from fastapi.testclient import TestClient


def test_trigger_recovery_action_safe_simulation(client: TestClient):
    """Verify recovery action validation and staged dry-run execution."""
    app_res = client.post("/api/applications", json={"name": "cache-service"})
    app_id = app_res.json()["id"]

    inc_res = client.post(
        "/api/incidents",
        json={"application_id": app_id, "title": "Cache stale saturation"},
    )
    inc_id = inc_res.json()["id"]

    recovery_payload = {
        "application_id": app_id,
        "incident_id": inc_id,
        "action_type": "restart_service",
    }
    rec_res = client.post("/api/recovery", json=recovery_payload)
    assert rec_res.status_code == 201
    data = rec_res.json()
    assert data["action_type"] == "restart_service"
    assert data["execution_status"] == "simulated"
    assert "DRY-RUN SIMULATION" in data["execution_details"]
    assert "No live AWS or Docker infrastructure changes" in data["execution_details"]

    # Verify retrieval
    rec_id = data["id"]
    get_res = client.get(f"/api/recovery/{rec_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == rec_id


def test_recovery_unsupported_action_type(client: TestClient):
    """Verify that an unsupported recovery action is rejected with 400 Bad Request."""
    app_res = client.post("/api/applications", json={"name": "test-service"})
    app_id = app_res.json()["id"]

    recovery_payload = {
        "application_id": app_id,
        "action_type": "format_disk_destroy_all",
    }
    response = client.post("/api/recovery", json=recovery_payload)
    assert response.status_code == 400
    assert "Unsupported action type" in response.json()["message"]


def test_recovery_incident_application_mismatch(client: TestClient):
    """Verify that specifying an incident belonging to another app is rejected with 400."""
    app1 = client.post("/api/applications", json={"name": "service-alpha"}).json()["id"]
    app2 = client.post("/api/applications", json={"name": "service-beta"}).json()["id"]

    inc_app1 = client.post(
        "/api/incidents",
        json={"application_id": app1, "title": "Service Alpha Error"},
    ).json()["id"]

    # Attempt to trigger recovery for service-beta using service-alpha's incident
    response = client.post(
        "/api/recovery",
        json={
            "application_id": app2,
            "incident_id": inc_app1,
            "action_type": "restart_service",
        },
    )
    assert response.status_code == 400
    assert "belongs to application" in response.json()["message"]

