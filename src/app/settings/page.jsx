'use client';

import { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Layers,
  Shield,
  ExternalLink,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import api from '@/lib/api';
import { API_BASE_URL } from '@/utils/constants';

export default function SettingsPage() {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  const runConnectionTest = async () => {
    try {
      setTestingConnection(true);
      const start = performance.now();

      const [livenessRes, readinessRes] = await Promise.allSettled([
        api.health.getLiveness(),
        api.health.getReadiness(),
      ]);

      const durationMs = Math.round(performance.now() - start);

      const livenessSuccess =
        livenessRes.status === 'fulfilled' &&
        (livenessRes.value?.status === 'healthy' || livenessRes.value?.status === 200);
      const readinessSuccess =
        readinessRes.status === 'fulfilled' &&
        (readinessRes.value?.status === 'ready' || readinessRes.value?.database === 'connected');

      setConnectionResult({
        timestamp: new Date().toLocaleTimeString(),
        durationMs,
        liveness: {
          success: livenessSuccess,
          data: livenessRes.status === 'fulfilled' ? (livenessRes.value?.data || livenessRes.value) : null,
          error: livenessRes.status === 'rejected' ? livenessRes.reason.message : null,
        },
        readiness: {
          success: readinessSuccess,
          data: readinessRes.status === 'fulfilled' ? (readinessRes.value?.data || readinessRes.value) : null,
          error: readinessRes.status === 'rejected' ? readinessRes.reason.message : null,
        },
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const API_DIRECTORY = [
    { method: 'GET', path: '/api/health', desc: 'Service liveness probe and build version' },
    { method: 'GET', path: '/api/health/ready', desc: 'Deep PostgreSQL connection ping and status' },
    { method: 'GET', path: '/api/applications', desc: 'List registered microservices with pagination' },
    { method: 'POST', path: '/api/applications', desc: 'Register a new cloud service or microservice' },
    { method: 'GET', path: '/api/applications/{id}', desc: 'Fetch application detail and relationships' },
    { method: 'PATCH', path: '/api/applications/{id}', desc: 'Update application metadata or status' },
    { method: 'DELETE', path: '/api/applications/{id}', desc: 'Deregister an application' },
    { method: 'GET', path: '/api/deployments', desc: 'Fetch deployment records with environment filters' },
    { method: 'POST', path: '/api/deployments', desc: 'Record a deployment release event' },
    { method: 'GET', path: '/api/incidents', desc: 'List service incidents with severity filters' },
    { method: 'POST', path: '/api/incidents', desc: 'Declare a prioritized incident event' },
    { method: 'PATCH', path: '/api/incidents/{id}', desc: 'Update incident status or mark resolved' },
    { method: 'GET', path: '/api/monitoring/summary', desc: 'Telemetry summary and collector status' },
    { method: 'GET', path: '/api/monitoring/metrics', desc: 'Query time-series infrastructure metrics' },
    { method: 'POST', path: '/api/monitoring/metrics', desc: 'Ingest infrastructure telemetry data' },
    { method: 'GET', path: '/api/recovery', desc: 'Audit log of automated remediation actions' },
    { method: 'POST', path: '/api/recovery', desc: 'Stage safe simulated self-healing routine' },
  ];

  return (
    <AppShell
      title="Platform Settings & Connectivity"
      subtitle="Diagnostics, API contract verification, and environment orchestration parameters."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Backend Connectivity Test */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                Backend Gateway Connectivity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Target Gateway: <code className="font-mono text-blue-300">{API_BASE_URL}</code>
              </p>
            </div>

            <Button
              variant="primary"
              icon={RefreshCw}
              loading={testingConnection}
              onClick={runConnectionTest}
            >
              Run Diagnostic Ping
            </Button>
          </div>

          {connectionResult ? (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-medium">Roundtrip Latency</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {connectionResult.durationMs} ms
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tested at {connectionResult.timestamp}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-medium">Liveness Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {connectionResult.liveness.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-semibold text-sm text-slate-200">
                      {connectionResult.liveness.success ? 'Operational (200 OK)' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {connectionResult.liveness.data?.service || 'CloudOps Sentinel API'}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-medium">PostgreSQL Readiness</div>
                  <div className="flex items-center gap-2 mt-1">
                    {connectionResult.readiness.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="font-semibold text-sm text-slate-200">
                      {connectionResult.readiness.success ? 'Connected' : 'Database Offline'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {connectionResult.readiness.data?.details || connectionResult.readiness.error || 'Awaiting connection'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-400">
              Click &quot;Run Diagnostic Ping&quot; to measure live round-trip latency and verify endpoint responsiveness.
            </div>
          )}
        </div>

        {/* Runtime Environment Info */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Environment & Runtime Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">Frontend Architecture</span>
              <span className="font-semibold text-slate-200 mt-1 block">Next.js 14.2 App Router (ES6+ JSX)</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">Backend Engine</span>
              <span className="font-semibold text-slate-200 mt-1 block">FastAPI 0.162 + Python 3.12</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">Database Layer</span>
              <span className="font-semibold text-slate-200 mt-1 block">PostgreSQL / SQLAlchemy 2.0 / Alembic</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">Telemetry Collectors</span>
              <span className="font-semibold text-amber-300 mt-1 block">Simulated / Disconnected by Default</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">Self-Healing Engine</span>
              <span className="font-semibold text-blue-300 mt-1 block">Dry-Run Simulation Guardrails Active</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 font-medium block">API Documentation</span>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1"
              >
                Swagger UI <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* API Contract Directory */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Registered API Contract Endpoints
            </h3>
            <span className="text-xs text-slate-400">{API_DIRECTORY.length} REST Routes</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Method</th>
                  <th className="py-2.5 px-3.5">Endpoint Path</th>
                  <th className="py-2.5 px-3.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {API_DIRECTORY.map((route, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 font-mono text-[11px]">
                    <td className="py-2 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          route.method === 'GET'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : route.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : route.method === 'PATCH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {route.method}
                      </span>
                    </td>
                    <td className="py-2 px-3.5 text-slate-200">{route.path}</td>
                    <td className="py-2 px-3.5 font-sans text-slate-400">{route.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

