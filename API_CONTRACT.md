# CloudOps Sentinel — API Contract for Next.js Frontend

This document details the exact JSON schemas, query parameters, HTTP status codes, and response structures for the frontend integration.

Base URL: `http://localhost:8000/api`
CORS: Configured to accept `http://localhost:3000`

---

## 1. Response Envelope Conventions

### Standard Paginated Response
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "total_pages": 0
}
```

### Standard Error Response (HTTP 4xx / 5xx)
```json
{
  "status": "error",
  "message": "Human-readable summary of the error",
  "errors": [
    {
      "field": "body.name",
      "message": "String should have at least 2 characters"
    }
  ],
  "path": "/api/applications"
}
```

---

## 2. Endpoints Specification

### 2.1 Health & Readiness Probes

#### `GET /api/health`
Liveness check.
```json
{
  "status": "healthy",
  "service": "cloudops-sentinel-api",
  "version": "0.1.0"
}
```

#### `GET /api/health/ready`
Database readiness check.
- **200 OK**:
  ```json
  {
    "status": "ready",
    "database": "connected",
    "details": "Database ping succeeded",
    "timestamp": "2026-11-01T12:00:00Z"
  }
  ```
- **503 Service Unavailable**:
  ```json
  {
    "status": "unhealthy",
    "database": "disconnected",
    "details": "Database unreachable: ...",
    "timestamp": "2026-11-01T12:00:00Z"
  }
  ```

---

### 2.2 Applications

#### `GET /api/applications`
Query Parameters:
- `environment` (string, optional) — Filter by environment (e.g. `production`, `staging`)
- `status` (string, optional) — Filter by status (e.g. `healthy`, `degraded`, `down`)
- `search` (string, optional) — Search keyword in name or description
- `page` (int, default: 1)
- `page_size` (int, default: 20, max: 100)

Response (200 OK):
```json
{
  "items": [
    {
      "id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
      "name": "payment-service",
      "description": "Core payment gateway and settlement engine",
      "repository_url": "https://github.com/cloudops/payment-service",
      "environment": "production",
      "status": "healthy",
      "created_at": "2026-11-01T08:00:00Z",
      "updated_at": "2026-11-01T08:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

#### `GET /api/applications/{application_id}`
Response (200 OK): Single Application Object.
Response (404 Not Found): Standard error response.

#### `POST /api/applications`
Request Body:
```json
{
  "name": "payment-service",
  "description": "Core payment gateway",
  "repository_url": "https://github.com/cloudops/payment-service",
  "environment": "production",
  "status": "healthy"
}
```
Response (201 Created): Application Object.

#### `PATCH /api/applications/{application_id}`
Request Body (all fields optional):
```json
{
  "status": "degraded",
  "description": "Updated notes"
}
```
Response (200 OK): Updated Application Object.

#### `DELETE /api/applications/{application_id}`
Response (204 No Content).

---

### 2.3 Deployments

#### `GET /api/deployments`
Query Parameters:
- `application_id` (string, optional)
- `status` (string, optional: `pending`, `in_progress`, `successful`, `failed`, `rolled_back`)
- `environment` (string, optional)
- `page` (int, default: 1)
- `page_size` (int, default: 20)

Response (200 OK):
```json
{
  "items": [
    {
      "id": "9d36a982-f8b1-4fca-89a1-0f735d4fa321",
      "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
      "version": "v1.4.2",
      "commit_hash": "a1b2c3d4e5f67890123456789abcdef012345678",
      "status": "successful",
      "deployment_environment": "production",
      "started_at": "2026-11-01T08:30:00Z",
      "completed_at": "2026-11-01T08:35:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

#### `POST /api/deployments`
Request Body:
```json
{
  "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
  "version": "v1.4.2",
  "commit_hash": "a1b2c3d4e5f67890123456789abcdef012345678",
  "status": "pending",
  "deployment_environment": "production"
}
```
Response (201 Created): Deployment Object.

---

### 2.4 Incidents

#### `GET /api/incidents`
Query Parameters:
- `application_id` (string, optional)
- `status` (string, optional: `open`, `investigating`, `mitigated`, `resolved`, `closed`)
- `severity` (string, optional: `critical`, `high`, `medium`, `low`)
- `page` (int, default: 1)
- `page_size` (int, default: 20)

Response (200 OK):
```json
{
  "items": [
    {
      "id": "e4b52c08-0112-4c28-9122-6b3a2f8ef991",
      "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
      "title": "High HTTP 500 error rate detected",
      "description": "503 rate spike on payment gateway endpoint",
      "severity": "critical",
      "status": "open",
      "created_at": "2026-11-01T09:00:00Z",
      "resolved_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

#### `POST /api/incidents`
Request Body:
```json
{
  "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
  "title": "Service unresponsive",
  "description": "Heartbeat failure on container healthcheck",
  "severity": "high",
  "status": "open"
}
```
Response (201 Created): Incident Object.

#### `PATCH /api/incidents/{incident_id}`
Request Body:
```json
{
  "status": "resolved"
}
```
*Note: Setting status to `"resolved"` or `"closed"` automatically populates `resolved_at` with the current UTC timestamp if omitted.*

---

### 2.5 Monitoring & Telemetry

#### `GET /api/monitoring/summary`
Response (200 OK):
```json
{
  "monitoring_status": "active",
  "external_collectors_connected": false,
  "message": "No live external telemetry collectors (Prometheus/Grafana/CloudWatch) are connected. Telemetry summary reflects local database state.",
  "monitored_applications_count": 4,
  "total_metrics_recorded": 120,
  "active_incidents_count": 1,
  "system_health_distribution": {
    "healthy": 3,
    "degraded": 1,
    "down": 0
  },
  "latest_metrics": []
}
```

#### `GET /api/monitoring/metrics`
Query Parameters:
- `application_id` (string, optional)
- `metric_name` (string, optional)
- `start_time` (ISO 8601 string, optional)
- `end_time` (ISO 8601 string, optional)
- `page` (int, default: 1)
- `page_size` (int, default: 50)

Response (200 OK): Paginated list of Metric objects.

#### `POST /api/monitoring/metrics`
Request Body:
```json
{
  "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
  "metric_name": "cpu_usage_percent",
  "metric_value": 45.2,
  "source": "cloudops-agent"
}
```
Response (201 Created): Metric Object.

---

### 2.6 Self-Healing Recovery

#### `GET /api/recovery`
Query Parameters:
- `application_id` (string, optional)
- `incident_id` (string, optional)
- `execution_status` (string, optional: `simulated`, `pending`, `in_progress`, `completed`, `failed`)
- `page` (int, default: 1)
- `page_size` (int, default: 20)

Response (200 OK): Paginated list of RecoveryAction objects.

#### `POST /api/recovery`
Request Body:
```json
{
  "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
  "incident_id": "e4b52c08-0112-4c28-9122-6b3a2f8ef991",
  "action_type": "restart_service"
}
```
Valid `action_type` values:
- `restart_service`
- `rollback_deployment`
- `scale_replicas`
- `restart_container`
- `purge_cache`

Response (201 Created):
```json
{
  "id": "7fa123bc-11aa-4bb2-8012-d9f2e3a1b021",
  "application_id": "c1f7a28e-5b1b-4f7b-9447-e17f7b3df601",
  "incident_id": "e4b52c08-0112-4c28-9122-6b3a2f8ef991",
  "action_type": "restart_service",
  "execution_status": "simulated",
  "execution_details": "[DRY-RUN SIMULATION] Action 'restart_service' for application 'payment-service' validated and staged successfully. Real cloud infrastructure execution is disabled (RECOVERY_DRY_RUN_MODE=True). No live AWS or Docker infrastructure changes were performed.",
  "created_at": "2026-11-01T09:15:00Z"
}
```

