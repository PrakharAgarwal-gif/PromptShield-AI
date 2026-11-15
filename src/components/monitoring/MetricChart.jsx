'use client';

import React from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { Activity, Sparkles } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';

export default function MetricChart({
  metrics = [],
  metricName = 'cpu_usage_percent',
  title = 'Recorded Timeseries Values',
  loading = false,
}) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="relative overflow-hidden h-72 flex flex-col items-center justify-center p-8 text-center rounded-2xl glass-surface-elevated border border-surface-border">
        <div className="w-12 h-12 rounded-2xl bg-aurora-cyan/10 border border-aurora-cyan/20 flex items-center justify-center text-aurora-cyan mb-3 shadow-glow-cyan">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white font-mono">
          No Timeseries Telemetry Recorded for <span className="text-aurora-cyan">{metricName}</span>
        </p>
        <p className="text-xs text-text-secondary mt-1.5 max-w-sm">
          Telemetry collectors are in standalone buffer mode. Ingest new test metrics via the top action button to plot live curves.
        </p>
      </div>
    );
  }

  // Format data chronological order for chart
  const chartData = [...metrics]
    .reverse()
    .map((m) => {
      const dateVal = m.collected_at || m.recorded_at || Date.now();
      return {
        time: new Date(dateVal).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        rawTime: dateVal,
        value: Number(Number(m.metric_value).toFixed(2)),
        unit: m.unit || '',
      };
    });

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass space-y-4">
      {/* Background Glow */}
      <div className="absolute top-0 right-10 w-64 h-64 bg-aurora-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title}
            <Sparkles className="w-3.5 h-3.5 text-aurora-lavender" />
          </h4>
          <span className="text-xs font-mono text-aurora-cyan font-semibold">{metricName}</span>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-surface-elevated text-aurora-lavender border border-surface-border font-medium">
          {metrics.length} points plotted
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="auroraMetricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#A78BFA" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0B1020" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#71829F"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.16)' }}
            />
            <YAxis
              stroke="#71829F"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3.5 rounded-xl glass-surface-elevated border border-aurora-cyan/40 shadow-2xl font-mono text-xs">
                      <div className="text-text-muted mb-1 text-[11px]">{label}</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-aurora-cyan shadow-glow-cyan"></span>
                        <span className="text-white font-bold text-sm">
                          {payload[0].value}
                        </span>
                        <span className="text-aurora-lavender text-[11px]">
                          {payload[0].payload.unit || ''}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#38BDF8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#auroraMetricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
