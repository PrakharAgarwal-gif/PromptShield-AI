'use client';

import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'cyan',
  className = '',
}) {
  const themeMap = {
    cyan: {
      border: 'hover:border-aurora-cyan/50',
      iconBg: 'bg-aurora-cyan/15 border-aurora-cyan/30 text-aurora-cyan shadow-glow-cyan',
      barBg: 'bg-gradient-to-r from-aurora-cyan to-aurora-blue',
      glow: 'bg-aurora-cyan/5',
    },
    lavender: {
      border: 'hover:border-aurora-lavender/50',
      iconBg: 'bg-aurora-lavender/15 border-aurora-lavender/30 text-aurora-lavender shadow-glow-purple',
      barBg: 'bg-gradient-to-r from-aurora-lavender to-aurora-purple',
      glow: 'bg-aurora-lavender/5',
    },
    coral: {
      border: 'hover:border-aurora-coral/50',
      iconBg: 'bg-aurora-coral/15 border-aurora-coral/30 text-aurora-coral shadow-glow-coral',
      barBg: 'bg-gradient-to-r from-aurora-coral to-rose-600',
      glow: 'bg-aurora-coral/5',
    },
    mint: {
      border: 'hover:border-aurora-mint/50',
      iconBg: 'bg-aurora-mint/15 border-aurora-mint/30 text-aurora-mint shadow-glow-mint',
      barBg: 'bg-gradient-to-r from-aurora-mint to-aurora-cyan',
      glow: 'bg-aurora-mint/5',
    },
  };

  const theme = themeMap[color] || themeMap.cyan;

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl glass-card-interactive border border-surface-border ${theme.border} ${className}`}
    >
      {/* Background ambient radial highlight */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none ${theme.glow}`}
      ></div>

      <div className="relative flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-110 ${theme.iconBg}`}
          >
            <Icon className="w-5 h-5 text-current" />
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-baseline gap-2.5">
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {trend && (
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              trend.startsWith('+')
                ? 'bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30'
                : 'bg-aurora-coral/15 text-aurora-coral border border-aurora-coral/30'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {(subtitle || trendLabel) && (
        <p className="relative mt-2 text-xs text-text-secondary leading-relaxed truncate font-sans">
          {trendLabel || subtitle}
        </p>
      )}

      {/* Radiant accent bar on bottom edge */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-70 ${theme.barBg}`}></div>
    </div>
  );
}
