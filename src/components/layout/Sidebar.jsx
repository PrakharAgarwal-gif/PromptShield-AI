'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  GitBranch,
  Activity,
  AlertOctagon,
  ShieldCheck,
  Settings as SettingsIcon,
  ExternalLink,
  Radio,
  Zap,
} from 'lucide-react';
import { APP_CONFIG } from '@/utils/constants';

const NAV_ITEMS = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: Server },
  { name: 'Deployments', href: '/deployments', icon: GitBranch },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Incidents', href: '/incidents', icon: AlertOctagon },
  { name: 'Recovery History', href: '/recovery', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar({ className = '' }) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-64 bg-space-midnight/95 backdrop-blur-xl border-r border-surface-border flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      <div>
        {/* Brand Header with Aurora Logo */}
        <div className="h-20 flex items-center px-6 border-b border-surface-border gap-3.5 bg-space/60">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-purple flex items-center justify-center shadow-glow-cyan">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aurora-mint"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans">
                CloudOps<span className="text-aurora-cyan font-semibold">.AI</span>
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-aurora-lavender/90 font-medium mt-0.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-aurora-cyan" />
              Autonomous Sentinel
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pt-6 pb-2">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold block mb-2">
            Platform Navigation
          </span>
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-aurora-cyan/20 via-aurora-purple/10 to-transparent text-white border-l-[3px] border-aurora-cyan shadow-glow-cyan'
                      : 'text-text-secondary hover:text-white hover:bg-surface-elevated/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-aurora-cyan' : 'text-text-muted group-hover:text-aurora-cyan'
                    }`}
                  />
                  <span className="tracking-tight">{item.name}</span>

                  {item.name === 'Incidents' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-aurora-coral shadow-glow-coral"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Gateway Telemetry & API Shortcut Footer */}
      <div className="p-4 border-t border-surface-border bg-space/80">
        <div className="p-3.5 rounded-xl glass-surface border border-surface-border text-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-aurora-cyan/5 rounded-full blur-xl pointer-events-none group-hover:bg-aurora-cyan/10 transition-all duration-300"></div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-mint"></span>
              </span>
              <span className="text-[11px] font-semibold text-text-primary tracking-tight">
                Gateway Engine
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated text-aurora-lavender border border-surface-border">
              v{APP_CONFIG.version}
            </span>
          </div>

          <p className="text-[11px] text-text-secondary mb-2.5 font-mono">
            Direct REST & Telemetry
          </p>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-aurora-cyan hover:text-white transition-colors text-[11px] font-medium pt-2 border-t border-surface-border/50"
          >
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-aurora-mint" />
              Swagger API Spec
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
