'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  label = 'Streaming Sentinel telemetry...',
  className = '',
  size = 'md',
}) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-14 text-center text-text-secondary gap-3.5 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-aurora-cyan/20 blur-md animate-pulse"></div>
        <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-aurora-cyan relative`} />
      </div>
      {label && (
        <p className="text-xs font-mono font-medium text-text-secondary tracking-wider uppercase">
          {label}
        </p>
      )}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 py-3.5 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-elevated/80 rounded-lg border border-surface-border/50"
          style={{ width: `${Math.floor(100 / cols)}%` }}
        />
      ))}
    </div>
  );
}
