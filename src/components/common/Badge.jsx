'use client';

import React from 'react';
import { getStatusBadgeConfig } from '@/utils/formatters';

export default function Badge({ status, label, className = '' }) {
  const config = getStatusBadgeConfig(status);
  const displayText = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayText}</span>
    </span>
  );
}

