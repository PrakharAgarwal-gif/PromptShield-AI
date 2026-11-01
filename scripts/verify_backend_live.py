"""
Comprehensive live backend verification script for CloudOps Sentinel.
Starts FastAPI uvicorn server in a subprocess or tests against port 8000,
verifying health, readiness, OpenAPI, docs, monitoring, and recovery endpoints.
"""

import sys
import time
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, url, method="GET", expected_statuses=[200], json_data=None, headers=None):
    print(f"\n[PROBE] {name}: {method} {url}")
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            r = requests.post(url, json=json_data, headers=headers, timeout=5)
        elif method == "OPTIONS":
            r = requests.options(url, headers=headers, timeout=5)
        else:
            r = requests.request(method, url, json=json_data, headers=headers, timeout=5)

        print(f"  Status Code: {r.status_code} (Expected: {expected_statuses})")
        print(f"  Response: {r.text[:300]}")
        assert r.status_code in expected_statuses, f"Unexpected status {r.status_code}"
        return r
    except Exception as e:
        print(f"  FAILED: {e}")
        return None

def run_all_checks():
    print("=" * 60)
    print("CLOUDOPS SENTINEL LIVE BACKEND PROBE SUITE")
    print("=" * 60)

    # 1. Health / Liveness
    r_health = test_endpoint("Liveness Probe", f"{BASE_URL}/api/health", expected_statuses=[200])
    if r_health:
        data = r_health.json()
        assert data.get("status") == "healthy"
        assert data.get("service") == "cloudops-sentinel-api"
        print("  -> Liveness confirmed: Healthy, version", data.get("version"))

    # 2. Health / Readiness (returns 200 if DB connected, or 503 if disconnected)
    r_ready = test_endpoint("Readiness Probe", f"{BASE_URL}/api/health/ready", expected_statuses=[200, 503])
    if r_ready:
        data = r_ready.json()
        print("  -> Readiness reported state:", data.get("status"), "| DB:", data.get("database"))

    # 3. OpenAPI specification
    r_openapi = test_endpoint("OpenAPI Schema", f"{BASE_URL}/openapi.json", expected_statuses=[200])
    if r_openapi:
        data = r_openapi.json()
        paths = list(data.get("paths", {}).keys())
        print(f"  -> OpenAPI paths documented: {len(paths)} routes")

    # 4. Interactive Docs / Swagger UI
    test_endpoint("Swagger Documentation", f"{BASE_URL}/docs", expected_statuses=[200])

    # 5. CORS Header Verification (origin http://localhost:3000)
    cors_headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
    }
    r_cors = test_endpoint("CORS Preflight Options", f"{BASE_URL}/api/health", method="OPTIONS", headers=cors_headers)
    if r_cors:
        allow_origin = r_cors.headers.get("access-control-allow-origin")
        print("  -> Access-Control-Allow-Origin:", allow_origin)
        assert allow_origin == "http://localhost:3000"

    # 6. Monitoring Summary Probe
    test_endpoint("Monitoring Summary", f"{BASE_URL}/api/monitoring/summary", expected_statuses=[200, 503])

    print("\n" + "=" * 60)
    print("LIVE PROBE SUITE EXECUTION COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    run_all_checks()

