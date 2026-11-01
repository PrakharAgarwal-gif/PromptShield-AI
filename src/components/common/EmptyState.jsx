'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No items found',
  message = 'There are no records matching your criteria or currently available in the database.',
  icon: Icon = Layers,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-surface-border bg-canvas/30">
      <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-slate-400 mb-4 border border-surface-border">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h4 className="text-base font-semibold text-slate-200 tracking-tight">{title}</h4>
      <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} icon={actionIcon} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

