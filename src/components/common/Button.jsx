'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) {
  const isBusy = isLoading || loading;
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-sentinel-600 hover:bg-sentinel-500 text-white shadow-subtle hover:shadow-glow focus:ring-sentinel-500 active:scale-[0.98]',
    secondary:
      'bg-surface-elevated hover:bg-slate-700 text-slate-200 border border-surface-border hover:border-surface-borderHover focus:ring-slate-400 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-subtle hover:shadow-rose-900/50 focus:ring-rose-500 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-surface-muted text-slate-400 hover:text-slate-100 focus:ring-slate-400',
    outline:
      'bg-transparent border border-surface-border hover:border-slate-600 text-slate-300 hover:text-white focus:ring-sentinel-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isBusy}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isBusy ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

