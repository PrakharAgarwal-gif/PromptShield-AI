'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorAlert({
  title = 'Sentinel API Connection Notice',
  message,
  errors,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`p-5 rounded-2xl border border-aurora-coral/30 bg-aurora-coral/10 text-white text-xs sm:text-sm backdrop-blur-md shadow-glow-coral ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-aurora-coral/20 flex items-center justify-center shrink-0 border border-aurora-coral/40">
          <AlertTriangle className="w-5 h-5 text-aurora-coral" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">{title}</h4>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {message || 'An unexpected condition occurred while communicating with the Sentinel backend.'}
          </p>

          {errors && Array.isArray(errors) && errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs bg-space-midnight/80 p-3 rounded-xl border border-aurora-coral/20 font-mono">
              {errors.map((err, idx) => (
                <li key={idx} className="text-[11px] text-aurora-coral">
                  <span className="text-text-muted">{err.field}:</span> {err.message}
                </li>
              ))}
            </ul>
          )}

          {onRetry && (
            <div className="mt-4">
              <Button
                variant="danger"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
              >
                Retry Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
