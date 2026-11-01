'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Server,
  GitBranch,
  AlertOctagon,
  ShieldCheck,
  Activity,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import StatCard from '@/components/dashboard/StatCard';
import SystemHealthBanner from '@/components/dashboard/SystemHealthBanner';
import QuickDeploymentsList from '@/components/dashboard/QuickDeploymentsList';
import ActiveIncidentsCard from '@/components/dashboard/ActiveIncidentsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Button from '@/components/common/Button';

export default function OverviewPage() {
  const { isConnected, isReady } = useBackendStatus();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalApps: 0,
    healthyApps: 0,
    degradedApps: 0,
    downApps: 0,
    totalDeployments: 0,
    activeIncidents: 0,
    recoveryActionsCount: 0,
  });

  const [monitoringSummary, setMonitoringSummary] = useState(null);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary, deployments, applications, incidents, recovery in parallel
      const [summaryRes, appsRes, depRes, incRes, recRes] = await Promise.allSettled([
        api.monitoring.getSummary(),
        api.applications.list({ page: 1, page_size: 50 }),
        api.deployments.list({ page: 1, page_size: 5 }),
        api.incidents.list({ page: 1, page_size: 10 }),
        api.recovery.list({ page: 1, page_size: 5 }),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : null;
      const apps = appsRes.status === 'fulfilled' ? appsRes.value : { items: [], total: 0 };
      const deps = depRes.status === 'fulfilled' ? depRes.value : { items: [], total: 0 };
      const incs = incRes.status === 'fulfilled' ? incRes.value : { items: [], total: 0 };
      const recs = recRes.status === 'fulfilled' ? recRes.value : { items: [], total: 0 };

      // Compute statistics
      const totalApps = apps.total || 0;
      const healthyApps = (apps.items || []).filter((a) => a.status === 'healthy').length;
      const degradedApps = (apps.items || []).filter((a) => a.status === 'degraded').length;
      const downApps = (apps.items || []).filter((a) => a.status === 'down').length;

      const activeIncidents = (incs.items || []).filter(
        (i) => i.status === 'open' || i.status === 'investigating'
      ).length;

      setStats({
        totalApps,
        healthyApps,
        degradedApps,
        downApps,
        totalDeployments: deps.total || 0,
        activeIncidents,
        recoveryActionsCount: recs.total || 0,
      });

      setMonitoringSummary(summary);
      setRecentDeployments(deps.items || []);
      setIncidents(incs.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard telemetry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    function handleGlobalRefresh() {
      fetchDashboardData();
    }
    window.addEventListener('cloudops:refresh', handleGlobalRefresh);
    return () => window.removeEventListener('cloudops:refresh', handleGlobalRefresh);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enterprise Cloud Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time deployment audit, service telemetry & self-healing automation state
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/applications">
            <Button size="sm" icon={Plus} variant="primary">
              Register Service
            </Button>
          </Link>
          <Link href="/recovery">
            <Button size="sm" icon={ShieldCheck} variant="secondary">
              Stage Recovery
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend connection warning if offline */}
      {!isConnected && (
        <ErrorAlert
          title="Backend API Offline"
          message="Could not connect to FastAPI at http://localhost:8000. Please ensure the backend is started."
          onRetry={fetchDashboardData}
        />
      )}

      {error && isConnected && (
        <ErrorAlert
          title="Telemetry Fetch Issue"
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Top Health Banner */}
      <SystemHealthBanner
        monitoringSummary={monitoringSummary}
        isReady={isReady}
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Services"
          value={loading ? '...' : stats.totalApps}
          subtitle={`${stats.healthyApps} healthy, ${stats.degradedApps} degraded`}
          icon={Server}
          color="blue"
        />
        <StatCard
          title="Active Incidents"
          value={loading ? '...' : stats.activeIncidents}
          subtitle={stats.activeIncidents === 0 ? 'All clusters healthy' : 'Immediate attention required'}
          icon={AlertOctagon}
          color={stats.activeIncidents > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Deployments Logged"
          value={loading ? '...' : stats.totalDeployments}
          subtitle="Audit releases & builds"
          icon={GitBranch}
          color="purple"
        />
        <StatCard
          title="Self-Healing Actions"
          value={loading ? '...' : stats.recoveryActionsCount}
          subtitle="Simulated safe dry-runs"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Main Grid: Deployments & Incidents */}
      {loading ? (
        <LoadingSpinner label="Fetching cloud metrics and deployment audits..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickDeploymentsList deployments={recentDeployments} />
          <ActiveIncidentsCard incidents={incidents} />
        </div>
      )}

      {/* Telemetry Snapshot Link Footer */}
      <div className="p-4 rounded-xl bg-surface-muted/40 border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sentinel-400" />
          <span>
            Telemetry source:{' '}
            <strong className="text-slate-200 font-mono">
              PostgreSQL timeseries storage
            </strong>
          </span>
        </div>
        <Link
          href="/monitoring"
          className="text-sentinel-400 hover:text-sentinel-300 flex items-center gap-1 font-medium transition-colors"
        >
          <span>Open Telemetry Metrics Center</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

