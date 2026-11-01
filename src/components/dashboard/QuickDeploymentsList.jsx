'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, ArrowRight, Clock } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatRelativeTime, formatCommitHash } from '@/utils/formatters';

export default function QuickDeploymentsList({ deployments = [] }) {
  return (
    <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sentinel-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recent Deployments
            </h3>
          </div>
          <Link
            href="/deployments"
            className="text-xs text-sentinel-400 hover:text-sentinel-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {deployments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent deployments recorded.
          </div>
        ) : (
          <div className="space-y-2.5">
            {deployments.slice(0, 5).map((dep) => (
              <div
                key={dep.id}
                className="p-3 rounded-lg bg-surface-muted/60 border border-surface-border flex items-center justify-between text-xs hover:border-surface-borderHover transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white font-mono text-xs">
                      {dep.version}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-slate-300 font-mono">
                      {dep.deployment_environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="font-mono">
                      git:{formatCommitHash(dep.commit_hash)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatRelativeTime(dep.started_at)}
                    </span>
                  </div>
                </div>

                <Badge status={dep.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

