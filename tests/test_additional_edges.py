"""
Additional edge-case and boundary verification tests for CloudOps Sentinel API.
Tests root redirection, OpenAPI specification, missing entity 404s, pagination boundaries, and CORS headers.
"""

from fastapi.testclient import TestClient


def test_root_redirect_to_docs(client: TestClient):
    """Verify that root / redirects to /docs without authentication."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code in [302, 307]
    assert response.headers["location"] == "/docs"


def test_openapi_schema_endpoint(client: TestClient):
    """Verify that GET /openapi.json returns valid OpenAPI 3.1 structure."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert data["info"]["title"] == "CloudOps Sentinel API"
    assert "/api/health" in data["paths"]
    assert "/api/applications" in data["paths"]
    assert "/api/deployments" in data["paths"]
    assert "/api/incidents" in data["paths"]
    assert "/api/monitoring/summary" in data["paths"]
    assert "/api/recovery" in data["paths"]


def test_cors_headers_allowed_origin(client: TestClient):
    """Verify that CORS middleware injects the allowed Next.js origin header."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/api/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_missing_deployment_and_incident_not_found(client: TestClient):
    """Verify 404 responses for nonexistent deployment and incident IDs."""
    dep_res = client.get("/api/deployments/nonexistent-dep-uuid")
    assert dep_res.status_code == 404
    assert "not found" in dep_res.json()["message"]

    inc_res = client.get("/api/incidents/nonexistent-inc-uuid")
    assert inc_res.status_code == 404
    assert "not found" in inc_res.json()["message"]

    rec_res = client.get("/api/recovery/nonexistent-rec-uuid")
    assert rec_res.status_code == 404
    assert "not found" in rec_res.json()["message"]


def test_patch_and_delete_nonexistent_application(client: TestClient):
    """Verify 404 responses when updating or deleting a missing application."""
    patch_res = client.patch(
        "/api/applications/nonexistent-app-uuid",
        json={"status": "degraded"},
    )
    assert patch_res.status_code == 404

    del_res = client.delete("/api/applications/nonexistent-app-uuid")
    assert del_res.status_code == 404


def test_pagination_boundary_calculations(client: TestClient):
    """Verify that pagination math calculates total_pages correctly."""
    # Create 5 applications
    for i in range(5):
        client.post("/api/applications", json={"name": f"scale-app-{i}"})

    # Page size 2 -> 5 items total = 3 pages
    res = client.get("/api/applications?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["total_pages"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2

    # Fetch page 3 -> should have 1 item
    res_p3 = client.get("/api/applications?page=3&page_size=2")
    assert res_p3.status_code == 200
    data_p3 = res_p3.json()
    assert len(data_p3["items"]) == 1

