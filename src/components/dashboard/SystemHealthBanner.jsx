'use client';

import React from 'react';
import { Activity, Radio, AlertCircle } from 'lucide-react';
import Badge from '@/components/common/Badge';

export default function SystemHealthBanner({ monitoringSummary, isReady }) {
  const isCollectorConnected = monitoringSummary?.external_collectors_connected || false;
  const healthDistribution = monitoringSummary?.system_health_distribution || {
    healthy: 0,
    degraded: 0,
    down: 0,
  };

  return (
    <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-subtle space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-sentinel-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Cloud Infrastructure Sentinel Status
            </h3>
            <p className="text-xs text-slate-400">
              Real-time cluster telemetry & automated health tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            status={isReady ? 'healthy' : 'degraded'}
            label={isReady ? 'Database Ready' : 'Database Offline'}
          />
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              isCollectorConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${isCollectorConnected ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <span>
              {isCollectorConnected ? 'Collectors Active' : 'External Collectors Disconnected'}
            </span>
          </span>
        </div>
      </div>

      {/* Collector status transparency alert */}
      {!isCollectorConnected && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold">Telemetry Collector Notice:</span>{' '}
            {monitoringSummary?.message ||
              'External collectors (Prometheus / Grafana / AWS CloudWatch) are currently not streaming live metrics. Telemetry charts display recorded historical metrics from PostgreSQL.'}
          </p>
        </div>
      )}

      {/* Health Distribution Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-surface-muted/60 border border-surface-border flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Healthy Services</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {healthDistribution.healthy || 0}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-surface-muted/60 border border-surface-border flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Degraded Services</span>
          <span className="text-sm font-bold text-amber-400 font-mono">
            {healthDistribution.degraded || 0}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-surface-muted/60 border border-surface-border flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Down / Offline</span>
          <span className="text-sm font-bold text-rose-400 font-mono">
            {healthDistribution.down || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

