'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, Sparkles } from 'lucide-react';

const SAMPLE_TIMELINE = [
  { time: '12:00', cpu: 28, memory: 54, network: 120 },
  { time: '13:00', cpu: 32, memory: 56, network: 145 },
  { time: '14:00', cpu: 45, memory: 58, network: 190 },
  { time: '15:00', cpu: 38, memory: 57, network: 160 },
  { time: '16:00', cpu: 52, memory: 61, network: 240 },
  { time: '17:00', cpu: 34, memory: 59, network: 175 },
  { time: '18:00', cpu: 29, memory: 55, network: 130 },
];

export default function OverviewTelemetryChart({ metrics = [] }) {
  const [activeMetric, setActiveMetric] = useState('cpu');
  const [timeRange, setTimeRange] = useState('24h');

  // Format real telemetry if provided, otherwise provide baseline telemetry
  const chartData =
    metrics.length > 0
      ? metrics.slice(0, 15).map((m, i) => ({
          time: new Date(m.collected_at || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          value: m.metric_value,
        }))
      : SAMPLE_TIMELINE.map((item) => ({
          time: item.time,
          value: item[activeMetric] || item.cpu,
        }));

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass space-y-5">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-aurora-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with Title and Metric Selectors */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-aurora-cyan/15 flex items-center justify-center text-aurora-cyan border border-aurora-cyan/30 shadow-glow-cyan">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Infrastructure Telemetry & Load Dynamics
              <Sparkles className="w-3.5 h-3.5 text-aurora-lavender" />
            </h3>
            <p className="text-xs text-text-secondary font-sans">
              Cluster load velocity, CPU saturation & container resource profiling
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          {/* Metric Selector Buttons */}
          <div className="flex p-1 rounded-xl bg-space-secondary border border-surface-border">
            {[
              { id: 'cpu', label: 'CPU %', icon: Cpu },
              { id: 'memory', label: 'Memory %', icon: HardDrive },
              { id: 'network', label: 'I/O Rate', icon: Wifi },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeMetric === m.id
                      ? 'bg-gradient-to-r from-aurora-cyan to-aurora-blue text-white shadow-glow-cyan font-bold'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time range selector */}
          <div className="hidden md:flex p-1 rounded-xl bg-space-secondary border border-surface-border text-xs font-mono">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-surface-elevated text-aurora-lavender font-bold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="auroraAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#A78BFA" stopOpacity={0.2} />
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
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl glass-surface-elevated border border-aurora-cyan/40 shadow-2xl font-mono text-xs">
                      <div className="text-text-muted mb-1">{label}</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-aurora-cyan shadow-glow-cyan"></span>
                        <span className="text-white font-bold text-sm">
                          {payload[0].value}%
                        </span>
                        <span className="text-aurora-lavender text-[11px] uppercase">
                          {activeMetric}
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
              fill="url(#auroraAreaGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

