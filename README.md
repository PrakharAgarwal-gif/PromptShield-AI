# CloudOps Sentinel — Backend API

CloudOps Sentinel is an Automated Deployment, Cloud Monitoring, and Self-Healing Platform.
This repository contains the backend service built with Python 3.12, FastAPI, SQLAlchemy 2.x, PostgreSQL, and Alembic. It provides a secure, modular, documented, and testable REST API designed to integrate with the independently developed Next.js frontend.

---

## 1. Architecture Overview

The backend is structured into modular layers adhering to separation of concerns:

```
app/
├── main.py                  # FastAPI application entry point, middleware & exception handlers
├── api/
│   └── routes/              # REST API controllers
│       ├── health.py        # /api/health and /api/health/ready probes
│       ├── applications.py  # /api/applications CRUD endpoints
│       ├── deployments.py   # /api/deployments audit and tracking
│       ├── monitoring.py    # /api/monitoring/summary and /metrics telemetry
│       ├── incidents.py     # /api/incidents lifecycle management
│       └── recovery.py      # /api/recovery safe self-healing actions
├── core/
│   ├── config.py            # Pydantic Settings and environment configuration
│   ├── database.py          # SQLAlchemy 2.x engine, session factory, connection diagnostics
│   └── logging.py           # Structured logging configuration
├── models/                  # SQLAlchemy ORM database models
│   ├── base.py
│   ├── application.py
│   ├── deployment.py
│   ├── incident.py
│   ├── recovery.py
│   └── metric.py
├── schemas/                 # Pydantic validation request/response models
│   ├── common.py            # Pagination, health, readiness, and error models
│   ├── application.py
│   ├── deployment.py
│   ├── incident.py
│   ├── recovery.py
│   └── metric.py
├── services/                # Business logic services
│   ├── application_service.py
│   ├── deployment_service.py
│   ├── incident_service.py
│   ├── monitoring_service.py
│   └── recovery_service.py
└── utils/
    └── exceptions.py        # Centralized domain exceptions and HTTP error handlers

tests/                       # Comprehensive Pytest test suite
alembic/                     # Database migrations
requirements.txt             # Pinned dependency definitions
Dockerfile                   # Production multi-stage Docker build
docker-compose.yml           # Local multi-container development environment
.env.example                 # Example configuration template
```

---

## 2. Database Models & Schema Design

| Model | Table | Key Fields | Relationships |
| :--- | :--- | :--- | :--- |
| **Application** | `applications` | `id` (UUID), `name`, `description`, `repository_url`, `environment`, `status`, `created_at`, `updated_at` | One-to-Many: `deployments`, `incidents`, `recovery_actions`, `metrics` |
| **Deployment** | `deployments` | `id` (UUID), `application_id` (FK), `version`, `commit_hash`, `status`, `started_at`, `completed_at`, `deployment_environment` | Belongs-to: `application` |
| **Incident** | `incidents` | `id` (UUID), `application_id` (FK), `title`, `description`, `severity`, `status`, `created_at`, `resolved_at` | Belongs-to: `application`, One-to-Many: `recovery_actions` |
| **RecoveryAction** | `recovery_actions` | `id` (UUID), `application_id` (FK), `incident_id` (FK nullable), `action_type`, `execution_status`, `execution_details`, `created_at` | Belongs-to: `application`, `incident` |
| **MonitoringMetric** | `monitoring_metrics`| `id` (UUID), `application_id` (FK), `metric_name`, `metric_value`, `recorded_at`, `source` | Belongs-to: `application` |

---

## 3. REST API Contract

Interactive Swagger documentation is available at `/docs` (and ReDoc at `/redoc`).

### Health & Readiness
- `GET /api/health` — Returns basic service liveness status (`{"status": "healthy", "service": "cloudops-sentinel-api", "version": "0.1.0"}`).
- `GET /api/health/ready` — Actively queries the database (`SELECT 1`). Returns HTTP `200` if connected, or HTTP `503` if disconnected.

### Applications
- `GET /api/applications` — Paginated list with `environment`, `status`, and `search` query parameters.
- `GET /api/applications/{application_id}` — Single application details.
- `POST /api/applications` — Register a new application (HTTP `201`).
- `PATCH /api/applications/{application_id}` — Partial metadata updates.
- `DELETE /api/applications/{application_id}` — Remove application and cascade delete child entities (HTTP `204`).

### Deployments
- `GET /api/deployments` — Paginated list with `application_id`, `status`, and `environment` filters.
- `GET /api/deployments/{deployment_id}` — Single deployment audit details.
- `POST /api/deployments` — Record a deployment (HTTP `201`).

### Incidents
- `GET /api/incidents` — Paginated list with `application_id`, `status`, and `severity` filters.
- `GET /api/incidents/{incident_id}` — Single incident details.
- `POST /api/incidents` — File a new incident (HTTP `201`).
- `PATCH /api/incidents/{incident_id}` — Update incident or mark resolved (automatically sets `resolved_at`).

### Monitoring & Telemetry
- `GET /api/monitoring/summary` — Aggregate health summary, incident count, and explicit collector availability status (`external_collectors_connected: false` when live collectors are unconfigured; no fabricated live telemetry).
- `GET /api/monitoring/metrics` — Query recorded timeseries metrics with `application_id`, `metric_name`, `start_time`, `end_time` filters.
- `POST /api/monitoring/metrics` — Ingest metric data points from external agents (HTTP `201`).

### Self-Healing & Recovery
- `GET /api/recovery` — List recovery actions with `application_id`, `incident_id`, and `execution_status` filters.
- `GET /api/recovery/{recovery_id}` — Single recovery audit log.
- `POST /api/recovery` — Safely record and stage self-healing actions (`restart_service`, `rollback_deployment`, `scale_replicas`, etc.). Enforces `simulated` dry-run mode unless real infrastructure adapters are configured.

---

## 4. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Runtime environment name (`development`, `staging`, `production`) |
| `DEBUG` | `true` | Debug mode flag |
| `APP_NAME` | `cloudops-sentinel-api` | Service identifier |
| `APP_VERSION` | `0.1.0` | API semantic version |
| `HOST` | `0.0.0.0` | Host interface to bind |
| `PORT` | `8000` | Port to listen on |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed origins for Next.js frontend |
| `POSTGRES_SERVER` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `cloudops_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `cloudops_secure_password` | PostgreSQL password |
| `POSTGRES_DB` | `cloudops_sentinel` | PostgreSQL database name |
| `DATABASE_URL` | *(constructed from POSTGRES_*)* | Complete SQLAlchemy connection string |
| `LOG_LEVEL` | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `RECOVERY_DRY_RUN_MODE` | `true` | Restricts automated remediation to safe dry-run simulations |

---

## 5. Local Setup & Startup Commands

### Prerequisites
- Python 3.12+
- PostgreSQL or Docker Desktop

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
copy .env.example .env
```

### Step 3: Run Database Migrations
```bash
alembic upgrade head
```

### Step 4: Start Development Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

---

## 6. Docker Instructions

### Start PostgreSQL & Backend API via Docker Compose
```bash
docker compose up -d --build
```

### Run Migrations inside Container
```bash
docker compose exec api alembic upgrade head
```

### View Logs
```bash
docker compose logs -f api
```

### Stop Services
```bash
docker compose down
```

---

## 7. Running the Automated Test Suite

The test suite runs against an isolated in-memory SQLite database, guaranteeing that existing development or production data is never altered:

```bash
python -m pytest -v
```

---

## 8. Status of External Integrations

In adherence to architectural integrity:
- **AWS Integration**: Foundation laid. Currently inactive until AWS credentials and SDK clients are configured.
- **Docker Engine Recovery**: Staged. Recovery actions run in safe `simulated` mode (`RECOVERY_DRY_RUN_MODE=true`).
- **Prometheus / Grafana**: Collector hooks defined. `/api/monitoring/summary` explicitly reports `external_collectors_connected: false` until live exporters are connected.

