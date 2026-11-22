# ⚡ CloudOps Sentinel — Automated Deployment, Cloud Monitoring & Self-Healing Platform

**CloudOps Sentinel** is a production-grade, centralized DevOps command center. It unifies JWT authentication, application registry management, CI/CD deployment pipeline tracking, infrastructure health observability, automated incident triage, and self-healing recovery workflows into a single interface.

Includes a **realistic backend telemetry & anomaly simulation engine** so that metrics, health checks, simulated spikes, and automated self-healing triggers work dynamically out of the box without requiring live AWS credentials.

---

## 🎨 UI/UX Visual Design System

Designed strictly around a **Cyber-Teal & Obsidian DevOps Command Center** aesthetic:
- **Primary Canvas:** Deep obsidian-teal gradient (`#060d0e` to `#091315`) with ambient cyan radial glows.
- **Glassmorphic Panels:** Translucent dark slate-teal (`rgba(13, 25, 28, 0.85)`) with `1px solid rgba(45, 212, 191, 0.14)` glowing borders.
- **Navigation Layout:** Persistent Left Sidebar where the **active tab** is highlighted in a **bright glowing cyan/mint rounded pill card** (`#38efda` / `#2dd4bf` fill with dark text/icon).
- **Radial Arc Progress Gauges:** Semi-circular ring gauges with glowing cyan and amber arcs for CPU utilization, RAM allocation, and pod quotas.
- **Glowing Area/Spline Charts:** Smooth Recharts spline area graphs with cyan stroke (`#2dd4bf`) and gradient fills for Uptime and Latency telemetry.
- **Hexagonal Cluster Node Mesh:** Interactive Dynatrace/Davis-inspired honeycomb topology map representing live server nodes colored green (healthy), amber (warning), and red (critical incident), clickable to inspect node CPU/RAM loads.
- **Live Anomaly Simulation:** Header button to inject simulated load spikes, trigger real incident alerts, and run self-healing playbooks.

---

## 🏗️ Directory Structure

```text
cloudops-sentinel/
├── docker-compose.yml            # Multi-container orchestration (Postgres, Backend, Frontend)
├── .env.example                  # Environment configuration template
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_api.py           # 8 Automated pytest tests
│   └── app/
│       ├── main.py               # FastAPI app, CORS, lifespan startup seeding
│       ├── config.py             # Settings, JWT secret, DB URL
│       ├── database.py           # SQLAlchemy 2.x engine & sessionmaker (PostgreSQL / SQLite fallback)
│       ├── models.py             # User, Application, Deployment, MetricLog, Incident, RecoveryAction
│       ├── schemas.py            # Pydantic v2 schemas
│       ├── auth.py               # Password hashing, JWT token creation & verification
│       ├── seed.py               # Auto-seed admin user + 4 microservices + pipelines + metrics
│       └── routers/
│           ├── auth.py           # POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
│           ├── dashboard.py      # Aggregated KPIs, hex nodes, overview stats
│           ├── applications.py   # CRUD for registered applications & environment groups
│           ├── deployments.py    # Trigger & track deployment pipelines & logs
│           ├── monitoring.py     # Time-series CPU, RAM, Latency & live log stream
│           ├── incidents.py      # Incident detection, triage, status updates
│           └── recovery.py       # Automated & manual self-healing playbooks & audit trail
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── context/
        │   └── AuthContext.js    # JWT token state, route protection, login/logout helpers
        ├── lib/
        │   └── api.js            # Fetch wrapper attaching Bearer JWT automatically
        ├── components/
        │   ├── Sidebar.js        # Glowing cyan active-pill navigation rail
        │   ├── Topbar.js         # Header, Simulate Anomaly trigger, User menu
        │   ├── RadialGauge.js    # Glowing cyan/amber radial arc gauge component
        │   ├── GlowingAreaChart.js # Smooth spline chart with cyan gradient glow
        │   └── ClusterHexGrid.js # Interactive honeycomb server node health visualizer
        └── app/
            ├── layout.js         # App shell & font providers
            ├── globals.css       # Obsidian-teal theme & glass styling
            ├── login/page.js     # Glassmorphic Cyber-Teal Login & Register Page
            ├── page.js           # Module 1: Dashboard Overview (Gauges, Spline Charts, Hex Grid)
            ├── applications/page.js # Module 2: Applications & Environment Groups (Dev/Staging/Prod)
            ├── deployments/page.js  # Module 3: Deployment Pipelines (RUNNING/SUCCESS badges + Logs)
            ├── monitoring/page.js   # Module 4: Deep Infrastructure Telemetry & Live Logs
            ├── incidents/page.js    # Module 5: Incident Detection & Triage
            ├── recovery/page.js     # Module 6: Self-Healing Engine & Recovery Logs
            └── settings/page.js     # Module 7: Platform Thresholds & System Health
```

---

## 🚀 Quick Start Guide

### Option A: Launch with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend Command Center: [http://localhost:3000](http://localhost:3000)
- Backend Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Default Operator Credentials: `admin@cloudops.io` / `admin123`

---

### Option B: Local Development

#### 1. Backend Service (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

#### 2. Frontend Command Center (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 3. Run Automated Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```
*(All 8 unit & integration tests pass with 100% success rate)*

---

## 🛡️ Default Seeded Services & Data
The platform automatically seeds:
- **Default Operator:** `admin@cloudops.io` (Password: `admin123`)
- **4 Registered Microservices:**
  1. `Payment Gateway Service` (key: `svc-payment-gw`, Environment: `Production`, 4 Pods)
  2. `Authentication & RBAC Core` (key: `svc-auth-core`, Environment: `Production`, 3 Pods)
  3. `Order Ingestion Pipeline` (key: `svc-order-pipeline`, Environment: `Staging`, 3 Pods)
  4. `Inventory Cache Cluster` (key: `svc-inventory-cache`, Environment: `Dev`, 2 Pods)
- **CI/CD Pipelines:** Includes a live `RUNNING` canary deployment and historical `SUCCESS` executions with realistic logs.
- **Self-Healing Playbooks:** Auto-Restart Pods, Horizontal Pod Autoscaler (HPA +2), Instant Canary Rollback, Flush Cache.
- **Honeycomb Cluster Mesh:** 12 simulated worker & ingress nodes across multiple AWS regions.

---

## 📄 License
MIT License. Built for autonomous cloud operations.
