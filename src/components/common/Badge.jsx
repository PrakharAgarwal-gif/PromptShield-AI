'use client';

import React from 'react';
import { getStatusBadgeConfig } from '@/utils/formatters';

export default function Badge({ status, variant, label, children, size = 'sm', className = '' }) {
  const badgeStatus = status || variant;
  const config = getStatusBadgeConfig(badgeStatus);
  const displayText = children || label || config?.label || badgeStatus || '';

  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border tracking-wide uppercase ${sizeClasses} ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayText}</span>
    </span>
  );
}
