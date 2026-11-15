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
  Sparkles,
  Zap,
  Radio,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import StatCard from '@/components/dashboard/StatCard';
import SystemHealthBanner from '@/components/dashboard/SystemHealthBanner';
import QuickDeploymentsList from '@/components/dashboard/QuickDeploymentsList';
import ActiveIncidentsCard from '@/components/dashboard/ActiveIncidentsCard';
import OverviewTelemetryChart from '@/components/dashboard/OverviewTelemetryChart';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

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
  const [recentRecovery, setRecentRecovery] = useState([]);
  const [recentMetrics, setRecentMetrics] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary, applications, deployments, incidents, recovery, metrics in parallel
      const [summaryRes, appsRes, depRes, incRes, recRes, metRes] = await Promise.allSettled([
        api.monitoring.getSummary(),
        api.applications.list({ page: 1, page_size: 50 }),
        api.deployments.list({ page: 1, page_size: 5 }),
        api.incidents.list({ page: 1, page_size: 10 }),
        api.recovery.list({ page: 1, page_size: 5 }),
        api.monitoring.getMetrics({ page: 1, page_size: 20 }),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : null;
      const apps = appsRes.status === 'fulfilled' ? (appsRes.value?.items ? appsRes.value : appsRes.value?.data || { items: [], total: 0 }) : { items: [], total: 0 };
      const deps = depRes.status === 'fulfilled' ? (depRes.value?.items ? depRes.value : depRes.value?.data || { items: [], total: 0 }) : { items: [], total: 0 };
      const incs = incRes.status === 'fulfilled' ? (incRes.value?.items ? incRes.value : incRes.value?.data || { items: [], total: 0 }) : { items: [], total: 0 };
      const recs = recRes.status === 'fulfilled' ? (recRes.value?.items ? recRes.value : recRes.value?.data || { items: [], total: 0 }) : { items: [], total: 0 };
      const mets = metRes.status === 'fulfilled' ? (metRes.value?.items ? metRes.value : metRes.value?.data || { items: [], total: 0 }) : { items: [], total: 0 };

      // Compute statistics
      const totalApps = apps.total || (apps.items || []).length || 0;
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
        totalDeployments: deps.total || (deps.items || []).length || 0,
        activeIncidents,
        recoveryActionsCount: recs.total || (recs.items || []).length || 0,
      });

      setMonitoringSummary(summary);
      setRecentDeployments(deps.items || []);
      setIncidents(incs.items || []);
      setRecentRecovery(recs.items || []);
      setRecentMetrics(mets.items || []);
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
    <div className="space-y-8 pb-10">
      {/* Hero Mission Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Sentinel Mission Control
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-aurora-cyan/20 to-aurora-purple/20 text-aurora-cyan border border-aurora-cyan/40 shadow-glow-cyan">
              <Zap className="w-3.5 h-3.5 text-aurora-cyan" />
              AUTONOMOUS HEALING ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl font-sans">
            Real-time cluster telemetry, automated anomaly mitigation, container releases and incident resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/applications">
            <Button size="md" icon={Plus} variant="primary">
              Register Service
            </Button>
          </Link>
          <Link href="/recovery">
            <Button size="md" icon={ShieldCheck} variant="secondary">
              Stage Healing
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend Disconnection Warning */}
      {!isConnected && (
        <ErrorAlert
          title="FastAPI Telemetry Gateway Offline"
          message="Could not establish connection to FastAPI at http://localhost:8000. Telemetry charts reflect offline mode."
          onRetry={fetchDashboardData}
        />
      )}

      {error && isConnected && (
        <ErrorAlert
          title="Telemetry Fetch Notice"
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* System Health Resilience Banner */}
      <SystemHealthBanner
        monitoringSummary={monitoringSummary}
        isReady={isReady}
      />

      {/* 4 Distinctive Aurora Neon Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Microservices"
          value={loading ? '...' : stats.totalApps}
          subtitle={`${stats.healthyApps} healthy • ${stats.degradedApps} degraded`}
          icon={Server}
          color="cyan"
          trend="+12%"
          trendLabel="Service cluster growth"
        />
        <StatCard
          title="Open Incidents"
          value={loading ? '...' : stats.activeIncidents}
          subtitle={stats.activeIncidents === 0 ? 'Zero critical alerts' : 'Requires triage'}
          icon={AlertOctagon}
          color="coral"
          trend={stats.activeIncidents === 0 ? 'Optimal' : 'Active'}
          trendLabel={stats.activeIncidents === 0 ? 'No downtime detected' : 'Immediate response'}
        />
        <StatCard
          title="Total Releases"
          value={loading ? '...' : stats.totalDeployments}
          subtitle="Continuous delivery audit"
          icon={GitBranch}
          color="lavender"
          trend="+4 today"
          trendLabel="CI/CD automated pipeline"
        />
        <StatCard
          title="Recovery Actions"
          value={loading ? '...' : stats.recoveryActionsCount}
          subtitle="Dry-run safe simulated actions"
          icon={ShieldCheck}
          color="mint"
          trend="100% Safe"
          trendLabel="Safe dry-run executions"
        />
      </div>

      {/* Telemetry Chart Section */}
      <OverviewTelemetryChart metrics={recentMetrics} />

      {/* Main Asymmetric Grid: Quick Deployments & Incidents */}
      {loading ? (
        <LoadingSpinner label="Synchronizing Sentinel cloud state..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickDeploymentsList deployments={recentDeployments} />
          <ActiveIncidentsCard incidents={incidents} />
        </div>
      )}

      {/* Self-Healing Recovery Audit Timeline */}
      <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-aurora-mint/15 flex items-center justify-center text-aurora-mint border border-aurora-mint/30 shadow-glow-mint">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Self-Healing Recovery Logs
              </h3>
              <p className="text-[11px] text-text-muted font-mono">
                Automated failure remediation audit trail
              </p>
            </div>
          </div>
          <Link
            href="/recovery"
            className="text-xs text-aurora-cyan hover:text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View All Recovery Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRecovery.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary">
            No recovery actions have been triggered yet. System operating within optimal thresholds.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecovery.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl glass-surface border border-surface-border flex items-center justify-between text-xs hover:border-aurora-mint/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono uppercase text-xs">
                      {rec.action_type?.replace('_', ' ')}
                    </span>
                    <Badge status="simulated" label="SIMULATED (DRY RUN)" />
                  </div>
                  <p className="text-[11px] text-text-secondary font-mono">
                    Target: {rec.target_identifier || 'Cluster Pod'} • Initiated by {rec.triggered_by || 'Sentinel Agent'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge status={rec.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telemetry Architecture Footnote */}
      <div className="p-4 rounded-xl glass-surface border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-aurora-cyan" />
          <span>
            Telemetry Engine:{' '}
            <strong className="text-white font-semibold">
              PostgreSQL timeseries storage with dynamic FastAPI ingestion
            </strong>
          </span>
        </div>
        <Link
          href="/monitoring"
          className="text-aurora-cyan hover:text-white flex items-center gap-1 font-bold transition-colors"
        >
          <span>Open Telemetry Metrics Center</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
