'use client';

import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  className = '',
}) {
  const colorMap = {
    blue: 'text-sentinel-400 bg-sentinel-500/10 border-sentinel-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div
      className={`p-5 rounded-xl bg-surface border border-surface-border shadow-subtle hover:border-surface-borderHover transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              colorMap[color] || colorMap.blue
            }`}
          >
            <Icon className="w-5 h-5 text-current" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {(subtitle || trendLabel) && (
        <p className="mt-1 text-xs text-slate-400 leading-relaxed truncate">
          {trendLabel || subtitle}
        </p>
      )}
    </div>
  );
}

