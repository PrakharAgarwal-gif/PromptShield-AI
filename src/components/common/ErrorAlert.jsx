'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorAlert({
  title = 'Failed to load data',
  message,
  errors,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-200 text-xs sm:text-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-rose-300">{title}</h4>
          <p className="mt-1 text-xs text-rose-300/80 leading-relaxed">
            {message || 'An unexpected error occurred while communicating with the backend.'}
          </p>

          {errors && Array.isArray(errors) && errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs bg-black/30 p-2.5 rounded border border-rose-900/40">
              {errors.map((err, idx) => (
                <li key={idx} className="font-mono text-[11px] text-rose-300">
                  <span className="text-slate-400">{err.field}:</span> {err.message}
                </li>
              ))}
            </ul>
          )}

          {onRetry && (
            <div className="mt-3">
              <Button
                variant="danger"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
                className="bg-rose-700/80 hover:bg-rose-600 text-xs"
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

