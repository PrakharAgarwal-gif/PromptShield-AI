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
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-tight';

  const variants = {
    primary:
      'bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-purple text-white shadow-glow-cyan hover:shadow-lg hover:shadow-aurora-cyan/25 focus:ring-aurora-cyan active:scale-[0.98] border border-white/10 font-semibold',
    secondary:
      'glass-surface hover:bg-surface-elevated text-text-primary border border-surface-border hover:border-aurora-cyan/40 focus:ring-aurora-lavender active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-aurora-coral to-rose-600 text-white shadow-glow-coral hover:shadow-lg hover:shadow-aurora-coral/25 focus:ring-aurora-coral active:scale-[0.98] font-semibold border border-white/10',
    ghost:
      'bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-white focus:ring-aurora-cyan/50',
    outline:
      'bg-transparent border border-surface-border hover:border-aurora-cyan/50 text-text-secondary hover:text-white focus:ring-aurora-cyan',
    mint:
      'bg-gradient-to-r from-aurora-mint to-emerald-600 text-space-midnight font-bold shadow-glow-mint hover:shadow-lg focus:ring-aurora-mint active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-xl',
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
