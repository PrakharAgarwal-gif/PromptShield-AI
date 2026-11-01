"""
Unit and integration tests for Application management endpoints.
"""

from fastapi.testclient import TestClient


def test_create_and_get_application(client: TestClient):
    """Test standard application registration and retrieval."""
    payload = {
        "name": "billing-service",
        "description": "Handles recurring stripe invoices",
        "repository_url": "https://github.com/cloudops/billing-service",
        "environment": "production",
        "status": "healthy",
    }
    response = client.post("/api/applications", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["environment"] == "production"
    assert "id" in data
    assert "created_at" in data

    app_id = data["id"]
    get_res = client.get(f"/api/applications/{app_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == app_id


def test_duplicate_application_name_conflict(client: TestClient):
    """Test that creating an application with a duplicate name returns HTTP 409."""
    payload = {
        "name": "auth-service",
        "description": "Authentication and OAuth provider",
        "environment": "staging",
        "status": "healthy",
    }
    res1 = client.post("/api/applications", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/applications", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["message"]


def test_get_nonexistent_application(client: TestClient):
    """Test that requesting a missing application returns HTTP 404."""
    response = client.get("/api/applications/non-existent-uuid")
    assert response.status_code == 404
    assert "not found" in response.json()["message"]


def test_list_applications_pagination_and_filter(client: TestClient):
    """Test application listing with environment filter, search and pagination."""
    # Seed apps
    client.post("/api/applications", json={"name": "core-api", "environment": "production"})
    client.post("/api/applications", json={"name": "core-worker", "environment": "production"})
    client.post("/api/applications", json={"name": "dev-sandbox", "environment": "development"})

    # Filter by production
    res = client.get("/api/applications?environment=production&page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 2
    for item in data["items"]:
        assert item["environment"] == "production"

    # Search keyword
    search_res = client.get("/api/applications?search=worker")
    assert search_res.status_code == 200
    assert search_res.json()["total"] == 1
    assert search_res.json()["items"][0]["name"] == "core-worker"


def test_update_application(client: TestClient):
    """Test partial updates on application metadata."""
    create_res = client.post("/api/applications", json={"name": "gateway", "status": "healthy"})
    app_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/api/applications/{app_id}",
        json={"status": "degraded", "description": "High latency on upstream"},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["status"] == "degraded"
    assert data["description"] == "High latency on upstream"


def test_delete_application(client: TestClient):
    """Test deleting an application returns 204 and subsequent lookup returns 404."""
    create_res = client.post("/api/applications", json={"name": "temp-microservice"})
    app_id = create_res.json()["id"]

    del_res = client.delete(f"/api/applications/{app_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/applications/{app_id}")
    assert get_res.status_code == 404


def test_application_validation_error(client: TestClient):
    """Test that malformed payloads return 422 with structured validation errors."""
    response = client.post("/api/applications", json={"name": "a"})  # min_length=2 required
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert "errors" in data

