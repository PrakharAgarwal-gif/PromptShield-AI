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
  Shield,
  ExternalLink,
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
      className={`w-64 bg-surface border-r border-surface-border flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-surface-border gap-3 bg-canvas/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sentinel-500 to-indigo-600 flex items-center justify-center shadow-glow text-white">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight block">
              CloudOps Sentinel
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mt-0.5">
              Autonomous Cloud Ops
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sentinel-600 text-white shadow-subtle'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-muted'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & API Link */}
      <div className="p-4 border-t border-surface-border bg-canvas/20">
        <div className="p-3 rounded-lg bg-surface-muted/60 border border-surface-border text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-mono text-[11px]">API Contract</span>
            <span className="text-[10px] text-emerald-400 font-medium">v{APP_CONFIG.version}</span>
          </div>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sentinel-400 hover:text-sentinel-300 transition-colors font-medium text-xs mt-1"
          >
            <span>Swagger OpenAPI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}

