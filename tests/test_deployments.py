"""
Unit and integration tests for Deployment endpoints.
"""

from fastapi.testclient import TestClient


def test_create_and_get_deployment(client: TestClient):
    """Test deployment record creation and retrieval."""
    # Seed application
    app_res = client.post("/api/applications", json={"name": "frontend-web"})
    app_id = app_res.json()["id"]

    dep_payload = {
        "application_id": app_id,
        "version": "v2.0.1",
        "commit_hash": "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
        "status": "successful",
        "deployment_environment": "production",
    }
    create_res = client.post("/api/deployments", json=dep_payload)
    assert create_res.status_code == 201
    dep_data = create_res.json()
    assert dep_data["version"] == "v2.0.1"
    assert dep_data["status"] == "successful"
    assert dep_data["completed_at"] is not None
    dep_id = dep_data["id"]

    get_res = client.get(f"/api/deployments/{dep_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == dep_id


def test_create_deployment_invalid_application(client: TestClient):
    """Test that creating a deployment for a nonexistent application fails with 404."""
    dep_payload = {
        "application_id": "nonexistent-app-id",
        "version": "v1.0.0",
        "status": "pending",
        "deployment_environment": "production",
    }
    response = client.post("/api/deployments", json=dep_payload)
    assert response.status_code == 404
    assert "not found" in response.json()["message"]


def test_list_deployments_filters(client: TestClient):
    """Test deployment listing and status filtering."""
    app_res = client.post("/api/applications", json={"name": "analytics-api"})
    app_id = app_res.json()["id"]

    client.post(
        "/api/deployments",
        json={
            "application_id": app_id,
            "version": "v1.0.0",
            "status": "successful",
            "deployment_environment": "production",
        },
    )
    client.post(
        "/api/deployments",
        json={
            "application_id": app_id,
            "version": "v1.1.0",
            "status": "failed",
            "deployment_environment": "staging",
        },
    )

    # Filter by application and successful status
    res = client.get(f"/api/deployments?application_id={app_id}&status=successful")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "successful"
    assert data["items"][0]["version"] == "v1.0.0"

