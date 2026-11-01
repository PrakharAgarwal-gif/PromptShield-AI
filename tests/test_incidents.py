"""
Unit and integration tests for Incident management endpoints.
"""

from fastapi.testclient import TestClient


def test_create_and_resolve_incident(client: TestClient):
    """Test incident reporting and resolution lifecycle."""
    app_res = client.post("/api/applications", json={"name": "order-processor"})
    app_id = app_res.json()["id"]

    inc_payload = {
        "application_id": app_id,
        "title": "High Memory Pressure",
        "description": "Container exceeded 90% cgroup memory limit",
        "severity": "critical",
        "status": "open",
    }
    create_res = client.post("/api/incidents", json=inc_payload)
    assert create_res.status_code == 201
    inc_data = create_res.json()
    assert inc_data["severity"] == "critical"
    assert inc_data["status"] == "open"
    assert inc_data["resolved_at"] is None
    inc_id = inc_data["id"]

    # Resolve incident
    resolve_res = client.patch(f"/api/incidents/{inc_id}", json={"status": "resolved"})
    assert resolve_res.status_code == 200
    res_data = resolve_res.json()
    assert res_data["status"] == "resolved"
    assert res_data["resolved_at"] is not None


def test_create_incident_invalid_application(client: TestClient):
    """Test that filing an incident for an unrecorded application fails with 404."""
    response = client.post(
        "/api/incidents",
        json={
            "application_id": "ghost-app-uuid",
            "title": "Database connection drop",
            "severity": "high",
        },
    )
    assert response.status_code == 404
    assert "not found" in response.json()["message"]


def test_list_incidents_filtering(client: TestClient):
    """Test filtering incidents by severity and status."""
    app_res = client.post("/api/applications", json={"name": "inventory-api"})
    app_id = app_res.json()["id"]

    client.post(
        "/api/incidents",
        json={"application_id": app_id, "title": "Critical Bug", "severity": "critical", "status": "open"},
    )
    client.post(
        "/api/incidents",
        json={"application_id": app_id, "title": "Low Warning", "severity": "low", "status": "investigating"},
    )

    crit_res = client.get("/api/incidents?severity=critical")
    assert crit_res.status_code == 200
    assert crit_res.json()["total"] == 1
    assert crit_res.json()["items"][0]["severity"] == "critical"

