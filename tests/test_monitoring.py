"""
Unit and integration tests for Monitoring and Telemetry endpoints.
"""

from fastapi.testclient import TestClient


def test_monitoring_summary_and_collector_status(client: TestClient):
    """Verify monitoring summary accurately reflects disconnected collector status and counts."""
    # Seed an application
    app_res = client.post("/api/applications", json={"name": "payment-api", "status": "healthy"})
    app_id = app_res.json()["id"]

    res = client.get("/api/monitoring/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["external_collectors_connected"] is False
    assert "No live external telemetry collectors" in data["message"]
    assert data["monitored_applications_count"] >= 1
    assert "system_health_distribution" in data


def test_ingest_and_query_metrics(client: TestClient):
    """Test metrics ingestion and timeseries filtering."""
    app_res = client.post("/api/applications", json={"name": "search-worker"})
    app_id = app_res.json()["id"]

    # Ingest metric
    metric_payload = {
        "application_id": app_id,
        "metric_name": "cpu_usage_percent",
        "metric_value": 78.4,
        "source": "host-agent",
    }
    ingest_res = client.post("/api/monitoring/metrics", json=metric_payload)
    assert ingest_res.status_code == 201
    m_data = ingest_res.json()
    assert m_data["metric_name"] == "cpu_usage_percent"
    assert m_data["metric_value"] == 78.4

    # Query metrics
    query_res = client.get(f"/api/monitoring/metrics?application_id={app_id}&metric_name=cpu_usage_percent")
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert q_data["total"] == 1
    assert q_data["items"][0]["metric_value"] == 78.4

    # Query non-existent metric name returns empty dataset
    empty_res = client.get(f"/api/monitoring/metrics?application_id={app_id}&metric_name=non_existent_metric")
    assert empty_res.status_code == 200
    assert empty_res.json()["total"] == 0
    assert len(empty_res.json()["items"]) == 0

