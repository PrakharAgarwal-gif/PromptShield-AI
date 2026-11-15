'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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
  Zap,
  Filter,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import TriggerRecoveryModal from '@/components/recovery/TriggerRecoveryModal';
import { api } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { RECOVERY_ACTION_TYPES } from '@/utils/constants';

function RecoveryContent() {
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
      const items = res?.items || res?.data?.items || [];
      setActions(items);
      setTotalPages(res?.total_pages || res?.data?.total_pages || 1);
      setTotalCount(res?.total || res?.data?.total || 0);
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
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Self-Healing Automated Recovery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-mint/15 text-aurora-mint border border-aurora-mint/30 shadow-glow-mint">
              SIMULATED DRY-RUN ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Auditable trajectory of automated and operator-triggered remediation routines with guaranteed zero unintended mutations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
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
      </div>

      {/* Safety Bounds Notice Banner in Arctic Glass */}
      <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-aurora-cyan/30 shadow-glass">
        <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-xl bg-aurora-cyan/15 border border-aurora-cyan/30 text-aurora-cyan shadow-glow-cyan shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Controlled Self-Healing Safety Bounds Active
              <Badge status="simulated" label="SAFE DRY-RUN" />
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-4xl font-sans">
              All recovery procedures execute under strict containment rules. In the current configuration, actions validate policy criteria and log detailed execution trajectories without making mutating out-of-band cloud API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface-elevated border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <RotateCcw className="w-4 h-4 text-aurora-cyan" />
          <span>Showing <strong className="text-white">{filteredActions.length}</strong> recorded executions</span>
          {initialIncidentId && (
            <span className="ml-2 px-2.5 py-0.5 rounded-md bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/30 text-[11px]">
              Filtered by Incident #{initialIncidentId.slice(0, 8)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-aurora-lavender" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
            >
              <option value="" className="bg-space-midnight text-white">All Action Types</option>
              {RECOVERY_ACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-space-midnight text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">All Execution States</option>
            <option value="simulated" className="bg-space-midnight text-aurora-cyan">Simulated / Dry-Run</option>
            <option value="completed" className="bg-space-midnight text-aurora-mint">Completed</option>
            <option value="failed" className="bg-space-midnight text-aurora-coral">Failed</option>
            <option value="in_progress" className="bg-space-midnight text-aurora-lavender">In Progress</option>
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Action Records */}
      {loading ? (
        <LoadingSpinner label="Querying recovery history audit trail..." />
      ) : filteredActions.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Recovery Actions Recorded"
          message="Trigger an automated remediation routine or simulate a recovery action to establish an auditable execution trajectory."
          actionLabel="Stage Recovery Action"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => {
            const isExpanded = expandedActionId === action.id;

            return (
              <div
                key={action.id}
                className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border hover:border-aurora-mint/40 transition-all duration-200 shadow-glass"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-aurora-mint/15 border border-aurora-mint/30 text-aurora-mint">
                        {action.action_type?.replace('_', ' ').toUpperCase()}
                      </span>
                      <Badge status="simulated" label="SIMULATED (DRY RUN)" />
                      <Badge status={action.execution_status} />
                      <span className="text-xs font-mono text-text-muted">
                        Target Service:{' '}
                        <strong className="text-white">
                          {action.application?.name || action.application_id || 'Cluster Scope'}
                        </strong>
                      </span>
                      {action.incident_id && (
                        <span className="text-xs text-aurora-amber font-mono">
                          Linked Incident: #{action.incident_id.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-text-muted flex items-center gap-2 font-mono">
                      <Clock className="w-3.5 h-3.5 text-aurora-cyan" />
                      <span>Executed {formatRelativeTime(action.created_at)} ({formatDate(action.created_at)})</span>
                    </div>

                    {action.execution_details && (
                      <p className="text-xs text-text-secondary font-mono glass-surface p-3 rounded-xl border border-surface-border mt-2">
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
                      {isExpanded ? 'Hide Payload' : 'View Raw Payload'}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-surface-border">
                    <pre className="p-4 rounded-xl bg-space border border-surface-border text-xs font-mono text-aurora-cyan overflow-x-auto">
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
            total={totalCount}
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
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense
      fallback={
        <LoadingSpinner label="Loading recovery telemetry audit trail..." />
      }
    >
      <RecoveryContent />
    </Suspense>
  );
}
