'use client';

import React from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatRelativeTime } from '@/utils/formatters';

export default function ActiveIncidentsCard({ incidents = [] }) {
  const activeIncidents = incidents.filter(
    (inc) => inc.status === 'open' || inc.status === 'investigating'
  );

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-aurora-coral/5 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="relative flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-aurora-coral/15 flex items-center justify-center text-aurora-coral border border-aurora-coral/30 shadow-glow-coral">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Active Incident Feed
              </h3>
              <p className="text-[11px] text-text-muted font-mono">Live anomaly triage</p>
            </div>
          </div>
          <Link
            href="/incidents"
            className="text-xs text-aurora-cyan hover:text-white flex items-center gap-1 font-semibold transition-colors group"
          >
            <span>Command Center</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {activeIncidents.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-secondary flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-aurora-mint/10 border border-aurora-mint/20 flex items-center justify-center text-aurora-mint mb-3 shadow-glow-mint">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-aurora-mint font-bold text-sm block mb-1">
              Zero Active Incidents
            </span>
            <p className="text-[11px] text-text-muted max-w-xs">
              Autonomous Sentinel has detected no critical anomalies. All cluster nodes healthy.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeIncidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl glass-surface border border-aurora-coral/30 flex items-start justify-between text-xs group hover:border-aurora-coral/60 transition-all shadow-sm"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white line-clamp-1 text-xs">
                      {inc.title}
                    </span>
                  </div>
                  {inc.description && (
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      {inc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                    <Clock className="w-3 h-3 text-aurora-coral" />
                    <span>Triggered {formatRelativeTime(inc.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge status={inc.severity} label={inc.severity} />
                  <span className="text-[10px] text-aurora-amber uppercase font-mono font-bold">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
