'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No telemetry records located',
  message = 'There are no active records matching your criteria or currently available in the database.',
  icon: Icon = Layers,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl glass-surface border border-surface-border">
      {/* Aurora Ambient Circle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-aurora-cyan/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-aurora-cyan/15 via-aurora-lavender/10 to-transparent flex items-center justify-center mb-4 border border-aurora-cyan/20 shadow-glow-cyan">
        <Icon className="w-7 h-7 text-aurora-cyan" />
      </div>

      <h4 className="relative text-base sm:text-lg font-bold text-white tracking-tight">{title}</h4>
      <p className="relative mt-2 text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      {actionLabel && onAction && (
        <div className="relative mt-6">
          <Button onClick={onAction} icon={actionIcon} size="md">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
