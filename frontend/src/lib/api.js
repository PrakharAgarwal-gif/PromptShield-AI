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

// Auth APIs
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerUser(email, password, full_name, role) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, role }),
  });
  return handleResponse(res);
}

// Dashboard KPIs & Cluster Nodes
export async function fetchDashboardKPIs() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`, { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

// Applications
export async function fetchApplications(environment = null) {
  const url = new URL(`${API_BASE}/applications`);
  if (environment && environment !== "All") {
    url.searchParams.set("environment", environment);
  }
  const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function createApplication(data) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteApplication(appId) {
  const res = await fetch(`${API_BASE}/applications/${appId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error("Delete failed");
  return true;
}

// Deployments
export async function fetchDeployments(appId = null) {
  const url = new URL(`${API_BASE}/deployments`);
  if (appId) url.searchParams.set("application_id", appId.toString());
  const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function triggerDeployment(data) {
  const res = await fetch(`${API_BASE}/deployments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Monitoring & Telemetry
export async function fetchTelemetry() {
  const res = await fetch(`${API_BASE}/monitoring/telemetry`, { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function fetchLiveLogs(level = null) {
  const url = new URL(`${API_BASE}/monitoring/logs`);
  if (level && level !== "ALL") url.searchParams.set("level", level);
  const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function simulateAnomalySpike() {
  const res = await fetch(`${API_BASE}/monitoring/simulate-spike`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Incidents
export async function fetchIncidents(statusFilter = null) {
  const url = new URL(`${API_BASE}/incidents`);
  if (statusFilter && statusFilter !== "ALL") url.searchParams.set("status_filter", statusFilter);
  const res = await fetch(url.toString(), { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function updateIncidentStatus(incidentId, status, rootCause = null) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status, root_cause: rootCause }),
  });
  return handleResponse(res);
}

// Self-Healing Recovery
export async function fetchPlaybooks() {
  const res = await fetch(`${API_BASE}/recovery/playbooks`, { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function fetchRecoveryHistory() {
  const res = await fetch(`${API_BASE}/recovery/history`, { headers: getHeaders(), cache: "no-store" });
  return handleResponse(res);
}

export async function executeRecovery(data) {
  const res = await fetch(`${API_BASE}/recovery/execute`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
