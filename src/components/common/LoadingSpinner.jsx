'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  label = 'Loading telemetry data...',
  className = '',
  size = 'md',
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-400 gap-3 ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-sentinel-500`} />
      {label && <p className="text-xs font-medium text-slate-400 tracking-wide">{label}</p>}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-elevated rounded"
          style={{ width: `${Math.floor(100 / cols)}%` }}
        />
      ))}
    </div>
  );
}

