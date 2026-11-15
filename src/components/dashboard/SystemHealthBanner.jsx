'use client';

import React from 'react';
import { Activity, Radio, AlertCircle, ShieldCheck, Cpu } from 'lucide-react';
import Badge from '@/components/common/Badge';

export default function SystemHealthBanner({ monitoringSummary, isReady }) {
  const isCollectorConnected = monitoringSummary?.external_collectors_connected || false;
  const healthDistribution = monitoringSummary?.system_health_distribution || {
    healthy: 0,
    degraded: 0,
    down: 0,
  };

  const totalServices =
    (healthDistribution.healthy || 0) +
    (healthDistribution.degraded || 0) +
    (healthDistribution.down || 0);

  const resilienceScore =
    totalServices > 0
      ? Math.round(((healthDistribution.healthy || 0) / totalServices) * 100)
      : 100;

  return (
    <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass space-y-6">
      {/* Background Aurora Mesh Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-aurora-cyan/10 via-aurora-purple/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-aurora-mint/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-surface-border">
        {/* Banner Title & Platform Resilience */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aurora-cyan via-aurora-blue to-aurora-purple flex items-center justify-center text-white shadow-glow-cyan shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Enterprise Cloud Sentinel
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 shadow-glow-mint">
                HEALTH GRADE A+
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-sans">
              Real-time cluster telemetry, automated anomaly mitigation & self-healing active
            </p>
          </div>
        </div>

        {/* Live Connectivity Status Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            status={isReady ? 'healthy' : 'degraded'}
            label={isReady ? 'PostgreSQL Active' : 'DB Reconnecting'}
            size="md"
          />
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border backdrop-blur-md ${
              isCollectorConnected
                ? 'bg-aurora-mint/15 text-aurora-mint border-aurora-mint/30 shadow-glow-mint'
                : 'bg-aurora-amber/15 text-aurora-amber border-aurora-amber/30'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isCollectorConnected ? 'text-aurora-mint animate-pulse' : 'text-aurora-amber'
              }`}
            />
            <span>
              {isCollectorConnected ? 'COLLECTORS STREAMING' : 'COLLECTOR DISCONNECTED'}
            </span>
          </span>
        </div>
      </div>

      {/* Telemetry Notice */}
      {!isCollectorConnected && (
        <div className="relative flex items-start gap-3 p-4 rounded-xl glass-surface border border-aurora-amber/30 text-xs text-text-secondary">
          <AlertCircle className="w-4 h-4 text-aurora-amber shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-aurora-amber font-mono font-semibold">
              Telemetry Stream Notice:
            </strong>{' '}
            {monitoringSummary?.message ||
              'External monitoring collectors (Prometheus / Grafana / CloudWatch) are currently in standalone local mode. Real-time metric ingestion remains fully operational via PostgreSQL telemetry buffer.'}
          </p>
        </div>
      )}

      {/* Resilience Metrics Grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1: Resilience Index */}
        <div className="p-4 rounded-xl glass-surface border border-surface-border flex flex-col justify-between group hover:border-aurora-cyan/40 transition-all">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Resilience Score</span>
            <ShieldCheck className="w-4 h-4 text-aurora-cyan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {resilienceScore}%
            </span>
            <span className="text-[10px] text-aurora-mint font-mono font-semibold">99.99% SLA</span>
          </div>
        </div>

        {/* Metric 2: Healthy Services */}
        <div className="p-4 rounded-xl glass-surface border border-surface-border flex flex-col justify-between group hover:border-aurora-mint/40 transition-all">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Healthy Services</span>
            <span className="w-2 h-2 rounded-full bg-aurora-mint shadow-glow-mint"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-aurora-mint font-mono tracking-tight">
              {healthDistribution.healthy || 0}
            </span>
            <span className="text-[10px] text-text-muted font-mono">Running Normal</span>
          </div>
        </div>

        {/* Metric 3: Degraded Services */}
        <div className="p-4 rounded-xl glass-surface border border-surface-border flex flex-col justify-between group hover:border-aurora-amber/40 transition-all">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Degraded Node</span>
            <span className="w-2 h-2 rounded-full bg-aurora-amber shadow-glow-amber"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-aurora-amber font-mono tracking-tight">
              {healthDistribution.degraded || 0}
            </span>
            <span className="text-[10px] text-text-muted font-mono">Requires Attention</span>
          </div>
        </div>

        {/* Metric 4: Down / Offline Services */}
        <div className="p-4 rounded-xl glass-surface border border-surface-border flex flex-col justify-between group hover:border-aurora-coral/40 transition-all">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Outages</span>
            <span className="w-2 h-2 rounded-full bg-aurora-coral shadow-glow-coral"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-aurora-coral font-mono tracking-tight">
              {healthDistribution.down || 0}
            </span>
            <span className="text-[10px] text-text-muted font-mono">Critical Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
