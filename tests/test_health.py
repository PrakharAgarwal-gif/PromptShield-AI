"""
Unit and integration tests for Health and Readiness probes.
"""

from unittest.mock import patch
from fastapi.testclient import TestClient


def test_health_liveness_endpoint(client: TestClient):
    """Verify that GET /api/health returns liveness confirmation and version."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "cloudops-sentinel-api"
    assert data["version"] == "0.1.0"


def test_health_readiness_connected(client: TestClient):
    """Verify that GET /api/health/ready returns 200 when database is healthy."""
    with patch("app.api.routes.health.check_database_connection", return_value=(True, "connected")):
        response = client.get("/api/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["database"] == "connected"
        assert "timestamp" in data


def test_health_readiness_disconnected_failure(client: TestClient):
    """Verify that GET /api/health/ready returns 503 when database is unreachable."""
    with patch(
        "app.api.routes.health.check_database_connection",
        return_value=(False, "Connection refused: port 5432"),
    ):
        response = client.get("/api/health/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"
        assert "Connection refused" in data["details"]

