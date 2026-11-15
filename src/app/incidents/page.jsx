'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
  AlertOctagon,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import { api } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { INCIDENT_SEVERITY_OPTIONS, INCIDENT_STATUS_OPTIONS } from '@/utils/constants';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        page_size: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await api.incidents.list(params);
      const items = res?.items || res?.data?.items || [];
      setIncidents(items);
      setTotalPages(res?.total_pages || res?.data?.total_pages || 1);
      setTotalCount(res?.total || res?.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch incidents from Sentinel API');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, severityFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleResolveIncident = async (incidentId) => {
    try {
      setResolvingId(incidentId);
      await api.incidents.update(incidentId, { status: 'resolved' });
      setNotice('Incident status transitioned to RESOLVED successfully.');
      await fetchIncidents();
    } catch (err) {
      setError(err.message || 'Failed to resolve incident');
    } finally {
      setResolvingId(null);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.title?.toLowerCase().includes(q) ||
      inc.description?.toLowerCase().includes(q) ||
      inc.application?.name?.toLowerCase().includes(q)
    );
  });

  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Incident Command Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-coral/15 text-aurora-coral border border-aurora-coral/30">
              {activeCount} ACTIVE ANOMALIES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time incident triage, automated failure diagnostics, root-cause audit and service recovery staging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchIncidents}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            icon={Plus}
            onClick={() => setIsReportModalOpen(true)}
          >
            Declare Incident
          </Button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface border border-aurora-mint/40 text-aurora-mint text-xs shadow-glow-mint">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-mint" />
            <span className="font-medium text-white">{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-aurora-mint hover:text-white font-mono font-bold uppercase text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface-elevated border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <div className="flex-1 w-full md:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, description, or microservice..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-aurora-coral" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-coral font-mono"
            >
              <option value="" className="bg-space-midnight text-white">All Statuses</option>
              {INCIDENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-space-midnight text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-coral font-mono"
          >
            <option value="" className="bg-space-midnight text-white">All Severities</option>
            {INCIDENT_SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-space-midnight text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents Feed */}
      {loading ? (
        <LoadingSpinner label="Querying incident repository..." />
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="Zero Incidents Detected"
          message={
            statusFilter || severityFilter || search
              ? 'No incidents matched your query. Clear your filters to see more results.'
              : 'All managed application workloads are operating normally without recorded anomalies.'
          }
          actionLabel="Declare Incident"
          onAction={() => setIsReportModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const isResolved = incident.status === 'resolved';

            return (
              <div
                key={incident.id}
                className={`relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border transition-all duration-200 ${
                  isResolved
                    ? 'border-surface-border bg-space-midnight/50'
                    : 'border-aurora-coral/40 shadow-glow-coral'
                }`}
              >
                {!isResolved && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-aurora-coral via-rose-500 to-aurora-amber"></div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge status={incident.severity} size="md" />
                      <Badge status={incident.status} size="md" />
                      <span className="text-xs font-mono text-text-muted">
                        Target Service:{' '}
                        <strong className="text-white">
                          {incident.application?.name || incident.application_id || 'System-Wide'}
                        </strong>
                      </span>
                      {incident.application?.environment && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated text-aurora-lavender border border-surface-border">
                          {incident.application.environment}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {incident.title}
                    </h3>

                    {incident.description && (
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-4xl font-sans">
                        {incident.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-text-muted font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-aurora-cyan" />
                        Triggered {formatRelativeTime(incident.created_at)} ({formatDate(incident.created_at)})
                      </span>
                      {incident.resolved_at && (
                        <span className="flex items-center gap-1.5 text-aurora-mint font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved at {formatDate(incident.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                    <Link href={`/recovery?incident_id=${incident.id}`}>
                      <Button variant="secondary" size="sm" icon={ArrowRight}>
                        Stage Recovery
                      </Button>
                    </Link>

                    {!isResolved && (
                      <Button
                        variant="mint"
                        size="sm"
                        icon={CheckCircle2}
                        isLoading={resolvingId === incident.id}
                        onClick={() => handleResolveIncident(incident.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
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
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={fetchIncidents}
      />
    </div>
  );
}
