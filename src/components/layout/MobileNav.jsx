'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Shield,
  LayoutDashboard,
  Server,
  GitBranch,
  Activity,
  AlertOctagon,
  ShieldCheck,
  Settings as SettingsIcon,
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

export default function MobileNav({ isOpen, onClose }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-space/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-space-midnight border-r border-surface-border shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-surface-border bg-space/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-purple flex items-center justify-center shadow-glow-cyan text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white">CloudOps<span className="text-aurora-cyan">.AI</span></span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-aurora-lavender">Sentinel SaaS</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-elevated border border-surface-border"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-aurora-cyan/20 to-aurora-purple/10 text-white border-l-[3px] border-aurora-cyan shadow-glow-cyan'
                      : 'text-text-secondary hover:text-white hover:bg-surface-elevated/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-aurora-cyan' : 'text-text-muted'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-surface-border text-xs text-text-muted font-mono">
          CloudOps Sentinel v{APP_CONFIG.version} • Aurora Neon
        </div>
      </div>
    </div>
  );
}
