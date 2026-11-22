// Frontend API Client with seamless fallback for live Netlify deployment & offline demo
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cloudops_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

// -------------------------------------------------------------
// Realistic Mock Fallback Store (Used when backend is offline)
// -------------------------------------------------------------
let mockAnomalyActive = false;

const MOCK_NODES = [
  { id: "node-1", name: "k8s-worker-us-east-1a", region: "us-east-1", status: "healthy", cpu_load: 28.4, ram_load: 48.2, pods_running: 14, uptime: "42d 18h" },
  { id: "node-2", name: "k8s-worker-us-east-1b", region: "us-east-1", status: "healthy", cpu_load: 35.1, ram_load: 52.0, pods_running: 16, uptime: "42d 18h" },
  { id: "node-3", name: "k8s-worker-us-east-1c", region: "us-east-1", status: "healthy", cpu_load: 41.2, ram_load: 61.4, pods_running: 18, uptime: "19d 04h" },
  { id: "node-4", name: "k8s-ingress-gateway-01", region: "us-east-1", status: "healthy", cpu_load: 22.0, ram_load: 38.5, pods_running: 8, uptime: "91d 12h" },
  { id: "node-5", name: "k8s-worker-us-west-2a", region: "us-west-2", status: "healthy", cpu_load: 36.4, ram_load: 82.1, pods_running: 22, uptime: "14d 02h" },
  { id: "node-6", name: "k8s-worker-us-west-2b", region: "us-west-2", status: "healthy", cpu_load: 44.0, ram_load: 58.2, pods_running: 15, uptime: "14d 02h" },
  { id: "node-7", name: "k8s-worker-eu-cent-1a", region: "eu-central-1", status: "healthy", cpu_load: 31.5, ram_load: 46.0, pods_running: 12, uptime: "68d 22h" },
  { id: "node-8", name: "k8s-worker-eu-cent-1b", region: "eu-central-1", status: "healthy", cpu_load: 29.2, ram_load: 44.7, pods_running: 11, uptime: "68d 22h" },
  { id: "node-9", name: "redis-cluster-cache-01", region: "us-east-1", status: "healthy", cpu_load: 18.5, ram_load: 71.2, pods_running: 6, uptime: "112d 06h" },
  { id: "node-10", name: "kafka-broker-node-01", region: "us-west-2", status: "healthy", cpu_load: 32.1, ram_load: 79.4, pods_running: 8, uptime: "28d 14h" },
  { id: "node-11", name: "db-replica-readonly-01", region: "us-east-1", status: "healthy", cpu_load: 38.6, ram_load: 64.0, pods_running: 4, uptime: "140d 01h" },
  { id: "node-12", name: "elastic-indexer-pool-01", region: "us-east-1", status: "healthy", cpu_load: 42.8, ram_load: 68.3, pods_running: 10, uptime: "55d 09h" },
];

let mockApps = [
  {
    id: 1,
    name: "Payment Gateway Service",
    key: "svc-payment-gw",
    description: "High-throughput Stripe and PayPal payment orchestrator with HSM integration.",
    environment: "Production",
    cluster_region: "us-east-1 (N. Virginia)",
    status: "healthy",
    replica_count: 4,
    cpu_limit: "2000m",
    memory_limit: "4096Mi"
  },
  {
    id: 2,
    name: "Authentication & RBAC Core",
    key: "svc-auth-core",
    description: "Zero-trust identity verification, OAuth2 tokens, and fine-grained permissions.",
    environment: "Production",
    cluster_region: "us-east-1 (N. Virginia)",
    status: "healthy",
    replica_count: 3,
    cpu_limit: "1500m",
    memory_limit: "2048Mi"
  },
  {
    id: 3,
    name: "Order Ingestion Pipeline",
    key: "svc-order-pipeline",
    description: "Distributed Kafka event-driven order processing and inventory lock service.",
    environment: "Staging",
    cluster_region: "us-west-2 (Oregon)",
    status: "warning",
    replica_count: 3,
    cpu_limit: "3000m",
    memory_limit: "8192Mi"
  },
  {
    id: 4,
    name: "Inventory Cache Cluster",
    key: "svc-inventory-cache",
    description: "Low-latency Redis multi-region active cache for real-time stock lookup.",
    environment: "Dev",
    cluster_region: "eu-central-1 (Frankfurt)",
    status: "healthy",
    replica_count: 2,
    cpu_limit: "1000m",
    memory_limit: "2048Mi"
  }
];

let mockDeployments = [
  {
    id: 1,
    application_id: 1,
    application_name: "Payment Gateway Service",
    version: "v2.4.12",
    branch: "main",
    commit_hash: "f78a2e1",
    status: "RUNNING",
    triggered_by: "Alex Vance (Lead SRE)",
    execution_time_seconds: 68,
    logs: "[00:01] Pulling commit f78a2e1\n[00:08] Running integration test suite: 124 passed\n[00:24] Building container image: cloudops/payment:v2.4.12\n[00:45] Rolling canary deployment to us-east-1 (25%)\n[00:60] Canary healthy. Promoting to 100%...",
    started_at: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: 2,
    application_id: 2,
    application_name: "Authentication & RBAC Core",
    version: "v1.9.0",
    branch: "main",
    commit_hash: "c3d4e5f",
    status: "SUCCESS",
    triggered_by: "Elena Rostova (DevSecOps)",
    execution_time_seconds: 142,
    logs: "[00:01] Pulling commit c3d4e5f\n[00:15] Dependency vulnerability audit passed\n[00:40] Unit tests passed (98.6% coverage)\n[01:10] Container image deployed to AWS EKS cluster\n[02:22] Production health checks green.",
    started_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 3,
    application_id: 3,
    application_name: "Order Ingestion Pipeline",
    version: "v3.1.0-rc2",
    branch: "staging",
    commit_hash: "a9b8c7d",
    status: "SUCCESS",
    triggered_by: "Alex Vance (Lead SRE)",
    execution_time_seconds: 98,
    logs: "[00:01] CI job initiated on staging branch\n[00:20] Kafka producer/consumer benchmark validated\n[01:38] Deployment successful to staging EKS.",
    started_at: new Date(Date.now() - 120 * 60000).toISOString()
  }
];

let mockIncidents = [
  {
    id: 1,
    application_id: 3,
    application_name: "Order Ingestion Pipeline",
    title: "Kafka consumer lag spike exceeding 14,000 uncommitted offsets",
    severity: "P1-Critical",
    status: "INVESTIGATING",
    root_cause: "Sudden flash-sale transaction burst saturating 3 worker pods.",
    detected_at: new Date(Date.now() - 15 * 60000).toISOString(),
    resolved_at: null
  },
  {
    id: 2,
    application_id: 1,
    application_name: "Payment Gateway Service",
    title: "Transient HTTP 504 gateway timeout on Visa settlement route",
    severity: "P2-High",
    status: "RESOLVED",
    root_cause: "Upstream bank partner API latency fluctuation.",
    detected_at: new Date(Date.now() - 180 * 60000).toISOString(),
    resolved_at: new Date(Date.now() - 150 * 60000).toISOString()
  }
];

let mockRecoveryHistory = [
  {
    id: 1,
    incident_id: 1,
    action_type: "horizontal_pod_autoscaling",
    target_service: "Order Ingestion Pipeline",
    status: "SUCCESS",
    details: "Scale order-ingestion-pipeline pods from 3 to 6 replicas",
    executed_at: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 2,
    incident_id: 2,
    action_type: "cache_eviction_flush",
    target_service: "Payment Gateway Service",
    status: "SUCCESS",
    details: "Flushed stale upstream connection pool cache",
    executed_at: new Date(Date.now() - 155 * 60000).toISOString()
  }
];

// -------------------------------------------------------------
// Auth APIs with Auto-Fallback
// -------------------------------------------------------------
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(res);
  } catch (err) {
    // If backend is unreachable or on Netlify standalone demo, fall back to demo operator
    return {
      access_token: "demo-cloudops-jwt-token",
      token_type: "bearer",
      user: {
        id: 1,
        email: email || "admin@cloudops.io",
        full_name: "Alex Vance (Lead SRE)",
        role: "Lead SRE & Platform Architect",
        is_active: true
      }
    };
  }
}

export async function registerUser(email, password, full_name, role) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name, role }),
    });
    return await handleResponse(res);
  } catch (err) {
    return {
      access_token: "demo-cloudops-jwt-token",
      token_type: "bearer",
      user: {
        id: Date.now(),
        email: email,
        full_name: full_name || "DevOps Engineer",
        role: role || "Platform Engineer",
        is_active: true
      }
    };
  }
}

// -------------------------------------------------------------
// Dashboard KPIs & Cluster Nodes
// -------------------------------------------------------------
export async function fetchDashboardKPIs() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/kpis`, { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    const nodes = MOCK_NODES.map(n => {
      if (mockAnomalyActive && (n.id === "node-5" || n.id === "node-10")) {
        return { ...n, status: "incident", cpu_load: 94.6, ram_load: 89.2 };
      }
      return n;
    });

    return {
      total_applications: mockApps.length,
      healthy_services: mockApps.filter(a => a.status === "healthy").length,
      active_incidents: mockAnomalyActive ? 2 : 1,
      running_deployments: 1,
      avg_cpu_utilization: mockAnomalyActive ? 84.5 : 34.2,
      avg_memory_utilization: mockAnomalyActive ? 81.3 : 56.8,
      resource_allocation_percent: 78.4,
      global_system_health: mockAnomalyActive ? "CRITICAL (Anomaly Detected)" : "NOMINAL (99.98% Healthy)",
      cluster_nodes: nodes
    };
  }
}

// -------------------------------------------------------------
// Applications
// -------------------------------------------------------------
export async function fetchApplications(environment = null) {
  try {
    const url = new URL(`${API_BASE}/applications`);
    if (environment && environment !== "All") {
      url.searchParams.set("environment", environment);
    }
    const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    if (environment && environment !== "All") {
      return mockApps.filter(a => a.environment.toLowerCase() === environment.toLowerCase());
    }
    return mockApps;
  }
}

export async function createApplication(data) {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    const newApp = {
      id: Date.now(),
      status: "healthy",
      ...data
    };
    mockApps.push(newApp);
    return newApp;
  }
}

export async function deleteApplication(appId) {
  try {
    const res = await fetch(`${API_BASE}/applications/${appId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok && res.status !== 204) throw new Error("Delete failed");
    return true;
  } catch (err) {
    mockApps = mockApps.filter(a => a.id !== Number(appId));
    return true;
  }
}

// -------------------------------------------------------------
// Deployments
// -------------------------------------------------------------
export async function fetchDeployments(appId = null) {
  try {
    const url = new URL(`${API_BASE}/deployments`);
    if (appId) url.searchParams.set("application_id", appId.toString());
    const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    if (appId) {
      return mockDeployments.filter(d => d.application_id === Number(appId));
    }
    return mockDeployments;
  }
}

export async function triggerDeployment(data) {
  try {
    const res = await fetch(`${API_BASE}/deployments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    const targetApp = mockApps.find(a => a.id === Number(data.application_id)) || { name: "Microservice" };
    const newDep = {
      id: Date.now(),
      application_id: Number(data.application_id),
      application_name: targetApp.name,
      version: data.version || "v1.0.0",
      branch: data.branch || "main",
      commit_hash: (Math.random().toString(16) + "0000000").substring(2, 9),
      status: "RUNNING",
      triggered_by: "Alex Vance (Lead SRE)",
      execution_time_seconds: 12,
      logs: `[00:01] Triggered deployment for ${targetApp.name} (${data.version})\n[00:04] Fetching git branch ${data.branch}\n[00:08] Running automated integration checks: PASSED\n[00:12] Spinning up container pods in cluster...`,
      started_at: new Date().toISOString()
    };
    mockDeployments.unshift(newDep);
    return newDep;
  }
}

// -------------------------------------------------------------
// Monitoring & Telemetry
// -------------------------------------------------------------
export async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/monitoring/telemetry`, { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    const history = [];
    const baseCpu = mockAnomalyActive ? 85 : 32;
    const baseRam = mockAnomalyActive ? 82 : 54;
    const baseLatency = mockAnomalyActive ? 180 : 28;

    for (let i = 12; i >= 0; i--) {
      const time = new Date(Date.now() - i * 5000);
      history.push({
        timestamp: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        cpu_percent: Math.min(99, Math.max(10, Math.round(baseCpu + (Math.random() * 8 - 4)))),
        memory_percent: Math.min(98, Math.max(20, Math.round(baseRam + (Math.random() * 4 - 2)))),
        latency_ms: Math.round(baseLatency + (Math.random() * 12 - 6)),
        network_io_mbps: Math.round(140 + Math.random() * 30),
        error_rate_percent: mockAnomalyActive ? 4.2 : 0.02
      });
    }

    return {
      current_cpu: history[history.length - 1].cpu_percent,
      current_memory: history[history.length - 1].memory_percent,
      current_latency: history[history.length - 1].latency_ms,
      current_error_rate: history[history.length - 1].error_rate_percent,
      history: history
    };
  }
}

export async function fetchLiveLogs(level = null) {
  try {
    const url = new URL(`${API_BASE}/monitoring/logs`);
    if (level && level !== "ALL") url.searchParams.set("level", level);
    const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    const allLogs = [
      { id: 1, timestamp: new Date(Date.now() - 1000).toISOString(), level: "INFO", service: "svc-payment-gw", message: "Stripe webhook callback processed successfully in 28ms [trace_id=9f8a-23b]" },
      { id: 2, timestamp: new Date(Date.now() - 3000).toISOString(), level: "WARN", service: "svc-order-pipeline", message: "High partition lag detected on topic 'orders.checkout' (consumer=consumer-grp-2)" },
      { id: 3, timestamp: new Date(Date.now() - 6000).toISOString(), level: "ERROR", service: "svc-order-pipeline", message: "Worker thread pool starvation: 32 tasks queued, latency spike to 450ms" },
      { id: 4, timestamp: new Date(Date.now() - 9000).toISOString(), level: "INFO", service: "svc-auth-core", message: "Token introspection request verified for user_id=1492 (200 OK)" },
      { id: 5, timestamp: new Date(Date.now() - 12000).toISOString(), level: "INFO", service: "svc-inventory-cache", message: "Redis cluster cache hit ratio: 98.4% across 4 shards" }
    ];
    if (level && level !== "ALL") {
      return allLogs.filter(l => l.level.toUpperCase() === level.toUpperCase());
    }
    return allLogs;
  }
}

export async function simulateAnomalySpike() {
  try {
    const res = await fetch(`${API_BASE}/monitoring/simulate-spike`, {
      method: "POST",
      headers: getHeaders(),
    });
    return await handleResponse(res);
  } catch (err) {
    mockAnomalyActive = !mockAnomalyActive;
    return {
      status: "simulated_anomaly_triggered",
      anomaly_active: mockAnomalyActive,
      cpu_spike_target: mockAnomalyActive ? 92.5 : 34.0,
      memory_spike_target: mockAnomalyActive ? 88.0 : 56.0,
      incident_created: mockAnomalyActive,
      message: mockAnomalyActive 
        ? "Simulated traffic burst & CPU saturation injected into cluster nodes 5 and 10." 
        : "Anomaly cleared. Cluster returning to nominal levels."
    };
  }
}

// -------------------------------------------------------------
// Incidents
// -------------------------------------------------------------
export async function fetchIncidents(statusFilter = null) {
  try {
    const url = new URL(`${API_BASE}/incidents`);
    if (statusFilter && statusFilter !== "ALL") url.searchParams.set("status_filter", statusFilter);
    const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    if (statusFilter && statusFilter !== "ALL") {
      return mockIncidents.filter(i => i.status.toUpperCase() === statusFilter.toUpperCase());
    }
    return mockIncidents;
  }
}

export async function updateIncidentStatus(incidentId, status, rootCause = null) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, root_cause: rootCause }),
    });
    return await handleResponse(res);
  } catch (err) {
    const inc = mockIncidents.find(i => i.id === Number(incidentId));
    if (inc) {
      inc.status = status;
      if (rootCause) inc.root_cause = rootCause;
      if (status === "RESOLVED") inc.resolved_at = new Date().toISOString();
    }
    return inc;
  }
}

// -------------------------------------------------------------
// Self-Healing Recovery Playbooks
// -------------------------------------------------------------
export async function fetchPlaybooks() {
  try {
    const res = await fetch(`${API_BASE}/recovery/playbooks`, { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    return [
      {
        action_type: "horizontal_pod_autoscaling",
        name: "Horizontal Pod Auto-Scale (HPA)",
        description: "Dynamically scale target pod replicas by +100% to dissipate traffic surges and queue congestion.",
        recommended_for: "Kafka consumer lag & CPU spikes > 80%",
        risk_level: "LOW"
      },
      {
        action_type: "restart_unhealthy_pods",
        name: "Restart Unhealthy Pods (Rolling Recycle)",
        description: "Perform graceful rolling termination and pod recreation to clear memory leaks and zombie threads.",
        recommended_for: "Memory saturation & OOMKill warnings",
        risk_level: "LOW"
      },
      {
        action_type: "rollback_deployment",
        name: "Automated Canary Rollback",
        description: "Revert cluster deployment immediately to the last known green commit with zero downtime.",
        recommended_for: "HTTP 5xx error rate spikes post-deployment",
        risk_level: "MEDIUM"
      },
      {
        action_type: "cache_eviction_flush",
        name: "Cache Eviction & Connection Pool Flush",
        description: "Purge stale keys and reconnect upstream database and Redis connection pool sockets.",
        recommended_for: "Connection timeouts and stale cache states",
        risk_level: "LOW"
      }
    ];
  }
}

export async function fetchRecoveryHistory() {
  try {
    const res = await fetch(`${API_BASE}/recovery/history`, { headers: getHeaders(), cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    return mockRecoveryHistory;
  }
}

export async function executeRecovery(data) {
  try {
    const res = await fetch(`${API_BASE}/recovery/execute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    mockAnomalyActive = false;
    const newAction = {
      id: Date.now(),
      incident_id: data.incident_id || 1,
      action_type: data.action_type,
      target_service: data.target_service || "Target Service",
      status: "SUCCESS",
      details: data.details || `Successfully executed ${data.action_type} automated playbook. Service metrics stabilized.`,
      executed_at: new Date().toISOString()
    };
    mockRecoveryHistory.unshift(newAction);

    // Resolve active incident if related
    if (mockIncidents.length > 0) {
      mockIncidents[0].status = "RESOLVED";
      mockIncidents[0].resolved_at = new Date().toISOString();
    }

    return newAction;
  }
}
