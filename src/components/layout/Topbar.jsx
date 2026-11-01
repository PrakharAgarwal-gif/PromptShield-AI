'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, RefreshCw, Database, Server } from 'lucide-react';
import { useBackendStatus } from '@/hooks/useBackendStatus';

const PAGE_TITLES = {
  '/': 'Platform Overview',
  '/applications': 'Applications Management',
  '/deployments': 'Deployment History & Audits',
  '/monitoring': 'Infrastructure Telemetry',
  '/incidents': 'Incident Response & Triage',
  '/recovery': 'Self-Healing Recovery Logs',
  '/settings': 'Platform & API Settings',
};

export default function Topbar({ onToggleMobileNav }) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || 'CloudOps Sentinel';
  const { isConnected, isReady, isLoading, refresh } = useBackendStatus();

  return (
    <header className="h-16 bg-surface border-b border-surface-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Autonomous Deployment & Cloud Monitoring Platform
          </p>
        </div>
      </div>

      {/* Right Controls & Health Indicators */}
      <div className="flex items-center gap-3">
        {/* Backend API Liveness Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted border border-surface-border text-xs">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-slate-400 font-medium">Backend:</span>
          {isLoading ? (
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Probing...
            </span>
          ) : isConnected ? (
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow" />
              Connected
            </span>
          ) : (
            <span className="text-rose-400 font-mono text-[11px] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Offline
            </span>
          )}
        </div>

        {/* Database Readiness Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted border border-surface-border text-xs">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-slate-400 font-medium">DB:</span>
          {isLoading ? (
            <span className="text-slate-400 font-mono text-[11px]">...</span>
          ) : isReady ? (
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Ready
            </span>
          ) : (
            <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Unreachable
            </span>
          )}
        </div>

        {/* Global Manual Refresh Trigger */}
        <button
          type="button"
          onClick={() => {
            refresh();
            window.dispatchEvent(new CustomEvent('cloudops:refresh'));
          }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-elevated transition-colors border border-surface-border text-xs flex items-center gap-1.5"
          title="Refresh telemetry & health status"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}

