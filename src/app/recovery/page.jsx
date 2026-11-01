'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Plus,
  Terminal,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import TriggerRecoveryModal from '@/components/recovery/TriggerRecoveryModal';
import api from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { RECOVERY_ACTION_TYPES } from '@/utils/constants';

export default function RecoveryPage() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get('incident_id') || '';

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Trigger Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState(null);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        page_size: pageSize,
      };
      if (statusFilter) params.execution_status = statusFilter;
      if (initialIncidentId) params.incident_id = initialIncidentId;

      const res = await api.recovery.list(params);
      const items = res.data?.items || [];
      setActions(items);
      setTotalPages(res.data?.total_pages || 1);
      setTotalCount(res.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch recovery audit history');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, initialIncidentId]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const toggleExpand = (id) => {
    setExpandedActionId(expandedActionId === id ? null : id);
  };

  const filteredActions = actions.filter((act) => {
    if (!typeFilter) return true;
    return act.action_type === typeFilter;
  });

  return (
    <AppShell
      title="Recovery & Self-Healing History"
      subtitle="Auditable record of automated and operator-triggered remediation routines."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={fetchActions}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Stage Recovery Action
          </Button>
        </div>
      }
    >
      {/* Simulation Notice Banner */}
      <div className="mb-6 rounded-xl border border-blue-900/40 bg-gradient-to-r from-blue-950/40 to-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-blue-200">
              Controlled Self-Healing Safety Bounds Active
            </h3>
            <p className="text-xs text-slate-300/90 leading-relaxed max-w-4xl">
              All recovery procedures execute under strict containment rules. In the current configuration, actions validate policy criteria and log detailed execution trajectories without making mutating out-of-band AWS API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Showing <strong>{filteredActions.length}</strong> recorded executions</span>
          {initialIncidentId && (
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px]">
              Filtered by Incident #{initialIncidentId.slice(0, 8)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Action Types</option>
            {RECOVERY_ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Execution Statuses</option>
            <option value="simulated">Simulated / Dry-Run</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Action Records */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Querying recovery history audit trail..." size="lg" />
        </div>
      ) : filteredActions.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No recovery actions recorded"
          description="Trigger an automated remediation routine or simulate a recovery action to establish an audit trail."
          action={
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Stage Recovery Action
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action) => {
            const isExpanded = expandedActionId === action.id;

            return (
              <div
                key={action.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 transition-colors hover:border-slate-700/80"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-300">
                        {action.action_type}
                      </span>
                      <Badge variant={action.execution_status}>
                        {action.execution_status?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        App: <strong className="text-slate-200">{action.application?.name || action.application_id}</strong>
                      </span>
                      {action.incident_id && (
                        <span className="text-xs text-amber-400 font-mono">
                          Linked Inc: #{action.incident_id.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Executed {formatRelativeTime(action.created_at)} ({formatDate(action.created_at)})</span>
                    </div>

                    {action.execution_details && (
                      <p className="text-xs text-slate-300/90 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 mt-2">
                        {action.execution_details}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Terminal}
                      onClick={() => toggleExpand(action.id)}
                    >
                      {isExpanded ? 'Hide Raw Details' : 'View Raw Payload'}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {JSON.stringify(action, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal */}
      <TriggerRecoveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchActions}
        initialIncidentId={initialIncidentId}
      />
    </AppShell>
  );
}
