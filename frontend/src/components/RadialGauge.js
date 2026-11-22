"use client";
import React from "react";

export default function RadialGauge({
  value = 50,
  max = 100,
  label = "Utilization",
  sublabel = "",
  color = "cyan", // cyan, amber, red, green
  size = 140,
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - (normalizedValue / max) * circumference;

  const colorMap = {
    cyan: { stroke: "#2dd4bf", shadow: "rgba(45, 212, 191, 0.4)", text: "text-cyber-teal" },
    mint: { stroke: "#38efda", shadow: "rgba(56, 239, 218, 0.4)", text: "text-cyber-mint" },
    amber: { stroke: "#f59e0b", shadow: "rgba(245, 158, 11, 0.4)", text: "text-amber-400" },
    red: { stroke: "#ef4444", shadow: "rgba(239, 68, 68, 0.4)", text: "text-rose-400" },
    green: { stroke: "#10b981", shadow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400" },
  };

  const selected = colorMap[color] || colorMap.cyan;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(45, 212, 191, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Glowing progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={selected.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 6px ${selected.shadow})`,
              transition: "stroke-dashoffset 0.8s ease-in-out",
            }}
          />
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-xl font-bold font-mono tracking-tight ${selected.text}`}>
            {normalizedValue}%
          </span>
          {sublabel && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {sublabel}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-300 mt-2">{label}</span>
    </div>
  );
}
