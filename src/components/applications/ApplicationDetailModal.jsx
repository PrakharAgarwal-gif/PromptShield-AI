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
  app,
  onEdit,
  onDelete,
}) {
  const currentApp = app || application;
  if (!currentApp) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentApp.name}
      subtitle={`Microservice Target ID: ${currentApp.id}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Status & Environment Header */}
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface border border-surface-border">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted block">
              Operational State
            </span>
            <div className="mt-1 flex items-center gap-2">
              <Badge status={currentApp.status} size="md" />
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface-elevated text-aurora-lavender font-mono border border-surface-border">
                {currentApp.environment}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onEdit(currentApp)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(currentApp)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-medium text-text-secondary uppercase">
            Architectural Summary
          </label>
          <p className="text-xs text-text-secondary glass-surface p-3.5 rounded-xl border border-surface-border leading-relaxed font-sans">
            {currentApp.description || 'No detailed architecture description provided.'}
          </p>
        </div>

        {/* Git Repository */}
        {currentApp.repository_url && (
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-text-secondary uppercase">
              Source Repository
            </label>
            <a
              href={currentApp.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs font-mono text-aurora-cyan hover:text-white p-3 rounded-xl glass-surface border border-surface-border transition-colors truncate"
            >
              <span className="truncate">{currentApp.repository_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
            </a>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl glass-surface border border-surface-border">
            <span className="text-[10px] uppercase font-mono block text-text-muted mb-1">
              Registered Date
            </span>
            <div className="flex items-center gap-1.5 text-white font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-aurora-cyan" />
              {formatDateTime(currentApp.created_at)}
            </div>
          </div>

          <div className="p-3 rounded-xl glass-surface border border-surface-border">
            <span className="text-[10px] uppercase font-mono block text-text-muted mb-1">
              Last State Modification
            </span>
            <div className="flex items-center gap-1.5 text-white font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-aurora-lavender" />
              {formatDateTime(currentApp.updated_at)}
            </div>
          </div>
        </div>

        {/* Quick Automation Actions */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
          <Link href={`/deployments?application_id=${currentApp.id}`} className="flex-1">
            <Button variant="secondary" size="sm" icon={GitBranch} className="w-full text-xs">
              View Releases
            </Button>
          </Link>
          <Link href={`/recovery?application_id=${currentApp.id}`} className="flex-1">
            <Button variant="secondary" size="sm" icon={ShieldCheck} className="w-full text-xs">
              Stage Healing
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
