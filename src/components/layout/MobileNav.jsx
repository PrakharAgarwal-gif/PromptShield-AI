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
} from 'lucide-react';

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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-surface border-r border-surface-border shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border bg-canvas">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-500 to-indigo-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">CloudOps Sentinel</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sentinel-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-surface-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-surface-border text-xs text-slate-500">
          CloudOps Sentinel v0.1.0 • Enterprise Edition
        </div>
      </div>
    </div>
  );
}

