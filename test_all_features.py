import sys
import httpx
import json

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://127.0.0.1:8000"

results = []

def record(test_name, success, details=""):
    status = "PASS" if success else "FAIL"
    results.append({"name": test_name, "status": status, "details": details})
    symbol = "✓" if success else "✗"
    print(f"[{symbol}] {test_name}: {details}")

def run_tests():
    print("=" * 60)
    print("CloudOps Sentinel — Comprehensive End-to-End Feature Test")
    print("=" * 60)

    with httpx.Client(timeout=10.0) as client:
        # 1. Health Checks
        try:
            r = client.get(f"{BACKEND_URL}/api/health")
            record("Backend Health Probe", r.status_code == 200, f"Status {r.status_code}, Service: {r.json().get('service')}")
        except Exception as e:
            record("Backend Health Probe", False, str(e))

        try:
            r = client.get(FRONTEND_URL)
            record("Frontend App Route (/)", r.status_code == 200, f"Status {r.status_code}, Served HTML size: {len(r.text)} bytes")
        except Exception as e:
            record("Frontend App Route (/)", False, str(e))

        # 2. Authentication & JWT
        token = ""
        try:
            login_payload = {"email": "admin@cloudops.io", "password": "admin123"}
            r = client.post(f"{BACKEND_URL}/api/auth/login", json=login_payload)
            success = r.status_code == 200 and "access_token" in r.json()
            token = r.json().get("access_token", "")
            record("Authentication Login (JWT)", success, f"Logged in as {r.json().get('user', {}).get('full_name')}")
        except Exception as e:
            record("Authentication Login (JWT)", False, str(e))

        headers = {"Authorization": f"Bearer {token}"} if token else {}

        # 3. Frontend Pages Availability (All 7 modules + Login)
        pages = [
            ("/login", "Login & Register Page"),
            ("/", "Dashboard Overview"),
            ("/applications", "Applications & Environment Groups"),
            ("/deployments", "CI/CD Deployment Pipelines"),
            ("/monitoring", "Infrastructure Telemetry & Logs"),
            ("/incidents", "Incident Triage Command Center"),
            ("/recovery", "Autonomous Self-Healing Engine"),
            ("/settings", "Platform Guardrails & Thresholds")
        ]
        for path, name in pages:
            try:
                r = client.get(f"{FRONTEND_URL}{path}")
                record(f"Frontend Route: {name} ({path})", r.status_code == 200, f"Status {r.status_code}")
            except Exception as e:
                record(f"Frontend Route: {name} ({path})", False, str(e))

        # 4. Module 1: Dashboard KPIs & Hex Nodes
        try:
            r = client.get(f"{BACKEND_URL}/api/dashboard/kpis", headers=headers)
            data = r.json()
            nodes_count = len(data.get("cluster_nodes", []))
            apps_count = data.get("total_applications", 0)
            record("Dashboard KPIs & Hex Nodes API", r.status_code == 200 and nodes_count == 12, f"Apps: {apps_count}, Dynatrace Hex Nodes: {nodes_count}")
        except Exception as e:
            record("Dashboard KPIs & Hex Nodes API", False, str(e))

        # 5. Module 2: Applications Registry & Environment Filtering
        try:
            r = client.get(f"{BACKEND_URL}/api/applications", headers=headers)
            apps = r.json()
            record("List Applications API", r.status_code == 200 and len(apps) >= 4, f"Found {len(apps)} registered services")

            # Test Environment filter
            r_prod = client.get(f"{BACKEND_URL}/api/applications?environment=Production", headers=headers)
            prod_apps = r_prod.json()
            record("Filter Applications by Environment (Production)", len(prod_apps) >= 2, f"Found {len(prod_apps)} production services")

            # Create & Delete Application
            new_app = {
                "name": "Telemetry Dispatcher",
                "key": "svc-telemetry-test",
                "description": "E2E Automated test service",
                "environment": "Dev",
                "cluster_region": "us-east-1",
                "replica_count": 2
            }
            r_create = client.post(f"{BACKEND_URL}/api/applications", json=new_app, headers=headers)
            created_id = r_create.json().get("id")
            record("Register New Microservice", r_create.status_code == 201, f"Registered ID: {created_id}")

            if created_id:
                r_del = client.delete(f"{BACKEND_URL}/api/applications/{created_id}", headers=headers)
                record("Deregister Microservice", r_del.status_code == 204, "Service removed cleanly")
        except Exception as e:
            record("Applications CRUD Test", False, str(e))

        # 6. Module 3: Deployment Pipelines & Canary Triggers
        try:
            r = client.get(f"{BACKEND_URL}/api/deployments", headers=headers)
            deps = r.json()
            record("List Deployment Pipelines", r.status_code == 200 and len(deps) >= 1, f"Found {len(deps)} pipelines")

            # Trigger a new deployment
            if deps:
                target_app_id = deps[0]["application_id"]
                trig_payload = {
                    "application_id": target_app_id,
                    "version": "v2.6.0-rc1",
                    "branch": "canary/test-run"
                }
                r_trig = client.post(f"{BACKEND_URL}/api/deployments", json=trig_payload, headers=headers)
                trig_data = r_trig.json()
                record("Trigger Canary Deployment Pipeline", r_trig.status_code == 201 and trig_data.get("status") == "RUNNING", f"Version: {trig_data.get('version')}, Commit: {trig_data.get('commit_hash')}")
        except Exception as e:
            record("Deployment Pipelines Test", False, str(e))

        # 7. Module 4: Monitoring Telemetry & Live Event Logs
        try:
            r = client.get(f"{BACKEND_URL}/api/monitoring/telemetry", headers=headers)
            telem = r.json()
            points = len(telem.get("time_series", []))
            record("Monitoring Telemetry Spline Series", r.status_code == 200 and points == 16, f"Received {points} time-series points, Latency p95: {telem.get('latency_p95')}ms")

            r_logs = client.get(f"{BACKEND_URL}/api/monitoring/logs?limit=10", headers=headers)
            logs = r_logs.json()
            record("Live CloudWatch Log Stream", r_logs.status_code == 200 and len(logs) > 0, f"Retrieved {len(logs)} log entries")
        except Exception as e:
            record("Monitoring Telemetry Test", False, str(e))

        # 8. Module 5 & 6: Incidents, Anomaly Simulation & Self-Healing
        try:
            # Check Playbooks
            r_pb = client.get(f"{BACKEND_URL}/api/recovery/playbooks", headers=headers)
            playbooks = r_pb.json()
            record("Autonomous Self-Healing Playbooks Catalog", r_pb.status_code == 200 and len(playbooks) == 4, f"Found {len(playbooks)} playbooks")

            # Simulate Anomaly Spike
            r_sim = client.post(f"{BACKEND_URL}/api/monitoring/simulate-spike", headers=headers)
            sim_data = r_sim.json()
            sim_incident_id = sim_data.get("incident_id")
            record("Simulate Anomaly Trigger", r_sim.status_code == 200 and sim_data.get("cpu_spike") == 94.8, f"CPU Spiked to 94.8%! Incident #{sim_incident_id} opened")

            # Verify Incident in Incidents List
            r_inc = client.get(f"{BACKEND_URL}/api/incidents?status_filter=OPEN", headers=headers)
            open_incidents = r_inc.json()
            record("Incident Detection & Triage", any(inc.get("id") == sim_incident_id for inc in open_incidents), f"Verified Incident #{sim_incident_id} is OPEN")

            # Execute Self-Healing Playbook to resolve it
            heal_payload = {
                "incident_id": sim_incident_id,
                "playbook_name": "Horizontal Pod Autoscaler (HPA +2)",
                "trigger_type": "AUTOMATED"
            }
            r_heal = client.post(f"{BACKEND_URL}/api/recovery/execute", json=heal_payload, headers=headers)
            heal_data = r_heal.json()
            record("Self-Healing Execution", r_heal.status_code == 200 and heal_data.get("status") == "COMPLETED", f"Executed: {heal_data.get('playbook_name')}")

            # Check Recovery Audit History
            r_hist = client.get(f"{BACKEND_URL}/api/recovery/history", headers=headers)
            history = r_hist.json()
            record("Self-Healing Audit Trail", r_hist.status_code == 200 and len(history) > 0, f"{len(history)} total recovery actions audited")
        except Exception as e:
            record("Incidents & Self-Healing Engine Test", False, str(e))

    print("=" * 60)
    passed = sum(1 for r in results if r["status"] == "PASS")
    total = len(results)
    print(f"Summary: {passed}/{total} tests PASSED ({round(passed/total * 100, 1)}% success rate)")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
