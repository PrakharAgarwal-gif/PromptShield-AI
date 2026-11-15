'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, ArrowRight, Clock, GitCommit } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatRelativeTime, formatCommitHash } from '@/utils/formatters';

export default function QuickDeploymentsList({ deployments = [] }) {
  return (
    <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass flex flex-col justify-between">
      {/* Background lavender glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-aurora-lavender/5 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="relative flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-aurora-lavender/15 flex items-center justify-center text-aurora-lavender border border-aurora-lavender/30 shadow-glow-purple">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Continuous Deployment Pipeline
              </h3>
              <p className="text-[11px] text-text-muted font-mono">Real-time release stream</p>
            </div>
          </div>
          <Link
            href="/deployments"
            className="text-xs text-aurora-cyan hover:text-white flex items-center gap-1 font-semibold transition-colors group"
          >
            <span>Audit History</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {deployments.length === 0 ? (
          <div className="py-10 text-center text-xs text-text-secondary flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center text-text-muted mb-3">
              <GitBranch className="w-6 h-6" />
            </div>
            <span className="text-white font-bold text-sm block mb-1">
              No Deployments Triggered
            </span>
            <p className="text-[11px] text-text-muted max-w-xs">
              No recent container or microservice deployments recorded in PostgreSQL.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.slice(0, 4).map((dep) => (
              <div
                key={dep.id}
                className="p-3.5 rounded-xl glass-surface border border-surface-border flex items-center justify-between text-xs hover:border-aurora-lavender/40 transition-all group shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-xs">
                      v{dep.version}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-elevated text-aurora-lavender font-mono font-medium border border-surface-border">
                      {dep.deployment_environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-[11px]">
                    <span className="font-mono flex items-center gap-1 text-aurora-cyan">
                      <GitCommit className="w-3 h-3 text-text-muted" />
                      {formatCommitHash(dep.commit_hash)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                      <Clock className="w-3 h-3" />
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
