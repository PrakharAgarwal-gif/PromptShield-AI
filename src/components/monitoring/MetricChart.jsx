'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { formatDateTime } from '@/utils/formatters';

export default function MetricChart({
  metrics = [],
  metricName = 'cpu_usage_percent',
  title = 'Recorded Timeseries Values',
}) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-canvas/30 border border-dashed border-surface-border">
        <p className="text-xs text-slate-400">
          No metric data points recorded for{' '}
          <span className="font-mono text-sentinel-400 font-semibold">{metricName}</span>.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Telemetry collectors are currently inactive. Ingest test metric points or connect an agent.
        </p>
      </div>
    );
  }

  // Format data chronological order for chart
  const chartData = [...metrics]
    .reverse()
    .map((m) => ({
      time: new Date(m.recorded_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      rawTime: m.recorded_at,
      value: Number(m.metric_value.toFixed(2)),
      source: m.source,
    }));

  return (
    <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-border">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
          <span className="text-[11px] font-mono text-sentinel-400">{metricName}</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-slate-300">
          {metrics.length} points recorded
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="text-[11px] text-slate-400 font-mono">
                        {formatDateTime(data.rawTime)}
                      </p>
                      <p className="font-semibold text-white font-mono text-sm">
                        Value: <span className="text-sentinel-400">{data.value}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Source: <span className="text-slate-300 font-mono">{data.source}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

