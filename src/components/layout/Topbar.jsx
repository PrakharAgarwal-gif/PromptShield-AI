'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  RefreshCw,
  Search,
  Database,
  Radio,
  Clock,
  ChevronDown,
  Layers,
  User,
} from 'lucide-react';
import { useBackendStatus } from '@/hooks/useBackendStatus';

const PAGE_TITLES = {
  '/': 'Enterprise Mission Control',
  '/applications': 'Applications & Microservices',
  '/deployments': 'Continuous Deployment Pipeline',
  '/monitoring': 'Live Infrastructure Telemetry',
  '/incidents': 'Incident Command Center',
  '/recovery': 'Self-Healing Automated Recovery',
  '/settings': 'Platform & Gateway Configuration',
};

export default function Topbar({ onToggleMobileNav }) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || 'CloudOps Sentinel';
  const { isConnected, isReady, isLoading, refresh } = useBackendStatus();
  const [environment, setEnvironment] = useState('Production');
  const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refresh();
    window.dispatchEvent(new CustomEvent('cloudops:refresh'));
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="h-20 bg-space-midnight/90 backdrop-blur-xl border-b border-surface-border flex items-center justify-between px-4 sm:px-8 shrink-0 z-20">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors border border-surface-border"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-[11px] text-text-muted font-mono hidden sm:flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-mint inline-block"></span>
            Real-time observability and self-healing active
          </p>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden xl:flex items-center w-80 relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search telemetry, apps, alerts..."
          className="w-full pl-10 pr-12 py-2 rounded-xl bg-space-secondary/80 border border-surface-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-aurora-cyan focus:ring-1 focus:ring-aurora-cyan/30 transition-all font-sans"
        />
        <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface border border-surface-border text-[10px] font-mono text-text-muted">
          ⌘K
        </div>
      </div>

      {/* Right Controls: Env Selector, Telemetry Pills & Profile */}
      <div className="flex items-center gap-3">
        {/* Environment Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEnvMenuOpen(!isEnvMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-secondary/90 border border-surface-border text-xs font-medium text-text-primary hover:border-surface-borderHover transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-aurora-lavender" />
            <span className="hidden md:inline font-mono text-[11px]">{environment}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {isEnvMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl glass-surface-elevated py-1.5 shadow-2xl z-30 font-sans border border-surface-border">
              {['Production', 'Staging', 'Development'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => {
                    setEnvironment(env);
                    setIsEnvMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-elevated flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        env === 'Production'
                          ? 'bg-aurora-cyan'
                          : env === 'Staging'
                          ? 'bg-aurora-lavender'
                          : 'bg-aurora-mint'
                      }`}
                    ></span>
                    {env}
                  </span>
                  {environment === env && (
                    <span className="text-aurora-cyan font-bold text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Status Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-space-secondary/90 border border-surface-border text-xs">
          <Radio className="w-3.5 h-3.5 text-aurora-cyan" />
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {isLoading ? (
              <span className="text-aurora-amber flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-aurora-amber animate-pulse"></span>
                PROBING
              </span>
            ) : isConnected && isReady ? (
              <span className="text-aurora-mint flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-aurora-mint shadow-glow-mint"></span>
                OPERATIONAL
              </span>
            ) : (
              <span className="text-aurora-coral flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-aurora-coral shadow-glow-coral"></span>
                DEGRADED
              </span>
            )}
          </div>
        </div>

        {/* UTC Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-secondary/60 border border-surface-border text-text-muted font-mono text-[11px]">
          <Clock className="w-3 h-3 text-aurora-lavender" />
          <span>{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* Manual Refresh Trigger */}
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2.5 text-text-secondary hover:text-white rounded-xl bg-space-secondary hover:bg-surface-elevated transition-all border border-surface-border text-xs flex items-center gap-1.5 shadow-sm group"
          title="Refresh telemetry & health status"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-aurora-cyan transition-transform duration-700 ${
              isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center pl-2 border-l border-surface-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aurora-cyan via-aurora-blue to-aurora-purple p-[1px] shadow-glow-cyan">
            <div className="w-full h-full rounded-xl bg-space-midnight flex items-center justify-center text-white text-xs font-bold font-mono">
              CP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
