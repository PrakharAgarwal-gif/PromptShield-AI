'use client';

import React from 'react';
import { getStatusBadgeConfig } from '@/utils/formatters';

export default function Badge({ status, variant, label, children, size = 'sm', className = '' }) {
  const badgeStatus = status || variant;
  const config = getStatusBadgeConfig(badgeStatus);
  const displayText = children || label || config?.label || badgeStatus || '';

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-semibold'
      : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border backdrop-blur-md transition-all ${sizeClasses} ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="tracking-wide">{displayText}</span>
    </span>
  );
}
