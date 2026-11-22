"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GlowingAreaChart({
  data = [],
  dataKey = "cpu",
  title = "Metrics",
  unit = "%",
  color = "#2dd4bf",
  gradientId = "cyanGlow",
  height = 220,
}) {
  return (
    <div className="w-full">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.08)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(45, 212, 191, 0.12)" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-obsidian-850/95 border border-cyber-teal/30 p-2.5 rounded-xl shadow-glow-teal text-xs font-mono backdrop-blur-md">
                      <div className="text-slate-400 mb-1">{label}</div>
                      <div className="text-cyber-mint font-bold text-sm">
                        {payload[0].value} {unit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: color,
                stroke: "#060d0e",
                strokeWidth: 2,
                filter: "drop-shadow(0 0 6px #2dd4bf)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
