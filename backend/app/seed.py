from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import User, Application, Deployment, MetricLog, Incident, RecoveryAction
from app.auth import hash_password


def seed_database(db: Session):
    # 1. Seed Default Admin User
    existing_user = db.query(User).filter(User.email == "admin@cloudops.io").first()
    if not existing_user:
        admin_user = User(
            email="admin@cloudops.io",
            full_name="Alex Vance (Lead SRE)",
            hashed_password=hash_password("admin123"),
            role="Lead SRE & Platform Architect",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

    # 2. Seed Microservices if not present
    if db.query(Application).count() == 0:
        apps = [
            Application(
                name="Payment Gateway Service",
                key="svc-payment-gw",
                description="High-throughput Stripe and PayPal payment orchestrator with HSM integration.",
                environment="Production",
                cluster_region="us-east-1 (N. Virginia)",
                status="healthy",
                replica_count=4,
                cpu_limit="2000m",
                memory_limit="4096Mi"
            ),
            Application(
                name="Authentication & RBAC Core",
                key="svc-auth-core",
                description="Zero-trust identity verification, OAuth2 tokens, and fine-grained permissions.",
                environment="Production",
                cluster_region="us-east-1 (N. Virginia)",
                status="healthy",
                replica_count=3,
                cpu_limit="1500m",
                memory_limit="2048Mi"
            ),
            Application(
                name="Order Ingestion Pipeline",
                key="svc-order-pipeline",
                description="Distributed Kafka event-driven order processing and inventory lock service.",
                environment="Staging",
                cluster_region="us-west-2 (Oregon)",
                status="warning",
                replica_count=3,
                cpu_limit="3000m",
                memory_limit="8192Mi"
            ),
            Application(
                name="Inventory Cache Cluster",
                key="svc-inventory-cache",
                description="Low-latency Redis multi-region active cache for real-time stock lookup.",
                environment="Dev",
                cluster_region="eu-central-1 (Frankfurt)",
                status="healthy",
                replica_count=2,
                cpu_limit="1000m",
                memory_limit="2048Mi"
            )
        ]
        db.add_all(apps)
        db.commit()

        # Refresh apps to get IDs
        payment_app = db.query(Application).filter(Application.key == "svc-payment-gw").first()
        auth_app = db.query(Application).filter(Application.key == "svc-auth-core").first()
        order_app = db.query(Application).filter(Application.key == "svc-order-pipeline").first()
        cache_app = db.query(Application).filter(Application.key == "svc-inventory-cache").first()

        now = datetime.now(timezone.utc)

        # 3. Seed Deployments
        deployments = [
            Deployment(
                application_id=payment_app.id,
                version="v2.4.12",
                branch="main",
                commit_hash="f78a2e1",
                status="RUNNING",
                triggered_by="Alex Vance (Lead SRE)",
                execution_time_seconds=68,
                logs="[00:01] Pulling commit f78a2e1\n[00:08] Running integration test suite: 124 passed\n[00:24] Building container image: cloudops/payment:v2.4.12\n[00:45] Rolling canary deployment to us-east-1 (25%)\n[00:60] Canary healthy. Promoting to 100%...",
                started_at=now - timedelta(minutes=2)
            ),
            Deployment(
                application_id=auth_app.id,
                version="v1.9.0",
                branch="main",
                commit_hash="c3d4e5f",
                status="SUCCESS",
                triggered_by="Elena Rostova (DevSecOps)",
                execution_time_seconds=142,
                logs="[00:01] Triggered by push to main\n[00:30] Static vulnerability scan passed: 0 CVEs\n[01:10] Helm upgrade completed on k8s-prod-us-east-1\n[02:22] Health checks 200 OK across 3 replicas.",
                started_at=now - timedelta(hours=3),
                completed_at=now - timedelta(hours=3) + timedelta(minutes=2, seconds=22)
            ),
            Deployment(
                application_id=order_app.id,
                version="v3.1.0-rc2",
                branch="release/v3.1",
                commit_hash="8b9c0d1",
                status="SUCCESS",
                triggered_by="CI/CD GitHub Actions",
                execution_time_seconds=95,
                logs="[00:01] Staging build triggered\n[00:45] Kafka consumer group rebalanced\n[01:35] Deployment verified on staging cluster.",
                started_at=now - timedelta(hours=8),
                completed_at=now - timedelta(hours=8) + timedelta(minutes=1, seconds=35)
            ),
            Deployment(
                application_id=cache_app.id,
                version="v1.2.4",
                branch="develop",
                commit_hash="2a3b4c5",
                status="SUCCESS",
                triggered_by="Marcus Chen (Backend Dev)",
                execution_time_seconds=54,
                logs="[00:01] Dev hotfix deployment\n[00:54] Redis sentinel quorum confirmed.",
                started_at=now - timedelta(days=1),
                completed_at=now - timedelta(days=1) + timedelta(seconds=54)
            )
        ]
        db.add_all(deployments)

        # 4. Seed Time-Series Metrics
        metric_logs = []
        for i in range(24):
            ts = now - timedelta(hours=23 - i)
            # Create a realistic curve
            cpu = 28.0 + (i % 6) * 4.5 + (2.5 if i > 14 else 0.0)
            ram = 44.0 + (i % 4) * 3.2
            lat = 16.0 + (i % 5) * 2.1
            err = 0.01 if i != 20 else 0.08
            metric_logs.append(
                MetricLog(
                    application_id=payment_app.id,
                    timestamp=ts,
                    cpu_percent=round(cpu, 1),
                    memory_percent=round(ram, 1),
                    latency_ms=round(lat, 1),
                    error_rate=err,
                    active_connections=1200 + (i * 45),
                    log_level="INFO" if err < 0.05 else "WARN",
                    message=f"Node cluster nominal metrics recorded. Load: {round(cpu, 1)}% CPU."
                )
            )
        db.add_all(metric_logs)

        # 5. Seed Incidents
        incidents = [
            Incident(
                application_id=order_app.id,
                title="Kafka Consumer Lag Exceeded Threshold (p99 > 350ms)",
                description="High burst in event volume caused lag across consumer group order-ingestion-workers. Automated pod scaleup triggered.",
                severity="P2-High",
                status="INVESTIGATING",
                root_cause="Sudden flash-sale order event burst spike in us-west-2.",
                detected_at=now - timedelta(minutes=24)
            ),
            Incident(
                application_id=payment_app.id,
                title="Intermittent TLS Handshake Timeout with Upstream Card Network",
                description="Payment gateway reported 12 dropped connections over 60 seconds due to upstream socket reset.",
                severity="P3-Medium",
                status="RESOLVED",
                root_cause="Transient upstream edge network blip. Circuit breaker triggered successfully.",
                detected_at=now - timedelta(hours=5),
                resolved_at=now - timedelta(hours=4, minutes=45)
            )
        ]
        db.add_all(incidents)
        db.commit()

        # 6. Seed Recovery Actions
        active_incident = db.query(Incident).filter(Incident.title.like("%Kafka%")).first()
        recoveries = [
            RecoveryAction(
                incident_id=active_incident.id if active_incident else None,
                application_id=order_app.id,
                playbook_name="Scale Replica Pods (+2)",
                trigger_type="AUTOMATED",
                status="COMPLETED",
                details="Auto-scaler increased replicas from 2 to 4 to drain partition consumer backlog.",
                executed_at=now - timedelta(minutes=20)
            ),
            RecoveryAction(
                incident_id=None,
                application_id=payment_app.id,
                playbook_name="Reset Circuit Breaker & Connection Pool",
                trigger_type="AUTOMATED",
                status="COMPLETED",
                details="Connection pool recycled. Latency normalized to 18.2ms.",
                executed_at=now - timedelta(hours=4, minutes=50)
            )
        ]
        db.add_all(recoveries)
        db.commit()
