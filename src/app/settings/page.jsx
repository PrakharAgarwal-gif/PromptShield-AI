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
  Radio,
  Zap,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { api } from '@/lib/api';
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
    <div className="space-y-8 pb-10 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Gateway & Settings
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30">
            CONTROL PLANE
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Diagnostics, OpenAPI contract compliance, cluster topology and system parameters.
        </p>
      </div>

      {/* Backend Gateway Connectivity Test Card */}
      <div className="relative overflow-hidden rounded-2xl glass-surface-elevated border border-surface-border p-6 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <Server className="w-5 h-5 text-aurora-cyan" />
              Backend Gateway Connectivity Diagnostics
            </h3>
            <p className="text-xs text-text-secondary mt-1 font-mono">
              Gateway Target:{' '}
              <span className="text-aurora-cyan font-bold">{API_BASE_URL}</span>
            </p>
          </div>

          <Button
            variant="primary"
            icon={RefreshCw}
            isLoading={testingConnection}
            onClick={runConnectionTest}
          >
            Probe Gateway Health
          </Button>
        </div>

        {connectionResult ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-text-muted font-mono">
              <span>Probe executed at {connectionResult.timestamp}</span>
              <span className="font-semibold text-aurora-mint">
                Round-trip Latency: {connectionResult.durationMs}ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl glass-surface border ${
                  connectionResult.liveness.success
                    ? 'border-aurora-mint/40 shadow-glow-mint'
                    : 'border-aurora-coral/40 shadow-glow-coral'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-text-secondary">GET /api/health</span>
                  <Badge
                    status={connectionResult.liveness.success ? 'healthy' : 'down'}
                    label={connectionResult.liveness.success ? 'HTTP 200 OK' : 'FAILED'}
                  />
                </div>
                <div className="text-xs text-white font-mono">
                  {connectionResult.liveness.success ? (
                    <span className="text-aurora-mint flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Liveness probe healthy
                    </span>
                  ) : (
                    <span className="text-aurora-coral flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4" />
                      {connectionResult.liveness.error}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl glass-surface border ${
                  connectionResult.readiness.success
                    ? 'border-aurora-mint/40 shadow-glow-mint'
                    : 'border-aurora-coral/40 shadow-glow-coral'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-text-secondary">GET /api/health/ready</span>
                  <Badge
                    status={connectionResult.readiness.success ? 'healthy' : 'down'}
                    label={connectionResult.readiness.success ? 'DB CONNECTED' : 'UNREACHABLE'}
                  />
                </div>
                <div className="text-xs text-white font-mono">
                  {connectionResult.readiness.success ? (
                    <span className="text-aurora-mint flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      PostgreSQL pool ready
                    </span>
                  ) : (
                    <span className="text-aurora-coral flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4" />
                      {connectionResult.readiness.error}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-text-secondary font-mono">
            Click &apos;Probe Gateway Health&apos; to test live REST socket round-trip connectivity and PostgreSQL pool readiness.
          </p>
        )}
      </div>

      {/* API Contract Directory */}
      <div className="relative overflow-hidden rounded-2xl glass-surface-elevated border border-surface-border p-6 shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-aurora-lavender" />
              REST API Directory & Endpoints
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified FastAPI REST contract integrated with the Next.js frontend plane.
            </p>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-aurora-cyan hover:text-white transition-colors"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="divide-y divide-surface-border/50 max-h-96 overflow-y-auto pr-2">
          {API_DIRECTORY.map((endpoint, i) => (
            <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 font-mono">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    endpoint.method === 'GET'
                      ? 'bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30'
                      : endpoint.method === 'POST'
                      ? 'bg-aurora-lavender/15 text-aurora-lavender border border-aurora-lavender/30'
                      : endpoint.method === 'PATCH'
                      ? 'bg-aurora-amber/15 text-aurora-amber border border-aurora-amber/30'
                      : 'bg-aurora-coral/15 text-aurora-coral border border-aurora-coral/30'
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="text-white font-semibold">{endpoint.path}</span>
              </div>
              <span className="text-text-muted text-[11px] font-sans">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Platform Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-surface border border-surface-border">
          <span className="text-[10px] font-mono uppercase text-text-muted block mb-1">Architecture</span>
          <span className="text-sm font-bold text-white block">Docker Multi-Container</span>
          <p className="text-[11px] text-text-secondary mt-1 font-mono">PostgreSQL 16 + FastAPI + Next.js</p>
        </div>
        <div className="p-4 rounded-xl glass-surface border border-surface-border">
          <span className="text-[10px] font-mono uppercase text-text-muted block mb-1">Database Layer</span>
          <span className="text-sm font-bold text-white block">SQLAlchemy 2.x + Alembic</span>
          <p className="text-[11px] text-text-secondary mt-1 font-mono">Timeseries buffer active</p>
        </div>
        <div className="p-4 rounded-xl glass-surface border border-surface-border">
          <span className="text-[10px] font-mono uppercase text-text-muted block mb-1">Self-Healing</span>
          <span className="text-sm font-bold text-aurora-mint block">Dry-Run Simulation Active</span>
          <p className="text-[11px] text-text-secondary mt-1 font-mono">Zero destructive mutations</p>
        </div>
      </div>
    </div>
  );
}
