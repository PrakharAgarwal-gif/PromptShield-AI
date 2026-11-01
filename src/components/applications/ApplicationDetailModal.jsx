'use client';

import React from 'react';
import { ExternalLink, Calendar, GitBranch, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatDateTime } from '@/utils/formatters';

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
}) {
  if (!application) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application.name}
      subtitle={`Service ID: ${application.id}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Status & Environment Header */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-muted border border-surface-border">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Current State
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Badge status={application.status} />
              <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-slate-300 font-mono">
                {application.environment}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onEdit(application)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(application)}
              className="bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Description</label>
          <p className="text-xs text-slate-400 bg-canvas/40 p-3 rounded-lg border border-surface-border leading-relaxed">
            {application.description || 'No detailed architecture description provided.'}
          </p>
        </div>

        {/* Git Repository */}
        {application.repository_url && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Source Repository</label>
            <a
              href={application.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs font-mono text-sentinel-400 hover:text-sentinel-300 p-2.5 rounded-lg bg-surface-muted/60 border border-surface-border transition-colors truncate"
            >
              <span className="truncate">{application.repository_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
            </a>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="p-2.5 rounded-lg bg-canvas/40 border border-surface-border">
            <span className="text-[10px] uppercase font-mono block text-slate-500 mb-0.5">
              Registered Date
            </span>
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDateTime(application.created_at)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-canvas/40 border border-surface-border">
            <span className="text-[10px] uppercase font-mono block text-slate-500 mb-0.5">
              Last State Modification
            </span>
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDateTime(application.updated_at)}
            </div>
          </div>
        </div>

        {/* Quick Automation Actions */}
        <div className="pt-2 border-t border-surface-border flex items-center justify-between gap-3">
          <Link href={`/deployments?application_id=${application.id}`} className="flex-1">
            <Button variant="secondary" size="sm" icon={GitBranch} className="w-full text-xs">
              View Deployments
            </Button>
          </Link>
          <Link href={`/recovery?application_id=${application.id}`} className="flex-1">
            <Button variant="secondary" size="sm" icon={ShieldCheck} className="w-full text-xs">
              Stage Recovery
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}

