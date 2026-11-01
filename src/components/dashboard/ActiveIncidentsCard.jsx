'use client';

import React from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowRight, Clock } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatRelativeTime } from '@/utils/formatters';

export default function ActiveIncidentsCard({ incidents = [] }) {
  const activeIncidents = incidents.filter(
    (inc) => inc.status === 'open' || inc.status === 'investigating'
  );

  return (
    <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Active Incidents & Alerts
            </h3>
          </div>
          <Link
            href="/incidents"
            className="text-xs text-sentinel-400 hover:text-sentinel-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeIncidents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold block mb-1">
              Zero Active Incidents
            </span>
            All registered infrastructure services are currently operational.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeIncidents.slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-lg bg-rose-950/10 border border-rose-500/20 flex items-start justify-between text-xs"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-200 line-clamp-1">
                      {inc.title}
                    </span>
                  </div>
                  {inc.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {inc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Reported {formatRelativeTime(inc.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge status={inc.severity} label={inc.severity} />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
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

