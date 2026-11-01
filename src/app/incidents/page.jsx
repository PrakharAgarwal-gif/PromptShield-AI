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
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import api from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { INCIDENT_SEVERITY_OPTIONS, INCIDENT_STATUS_OPTIONS } from '@/utils/constants';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const items = res.data?.items || [];
      setIncidents(items);
      setTotalPages(res.data?.total_pages || 1);
      setTotalCount(res.data?.total || 0);
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
    <AppShell
      title="Incident Management"
      subtitle="Track anomalies, mitigate outages, and review automated root-cause records."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
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
      }
    >
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Incidents</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{totalCount}</div>
        </div>

        <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Active Unresolved</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-300">{activeCount}</div>
        </div>

        <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-300">{totalCount - activeCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-sm">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, description, or service..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {INCIDENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Severities</option>
            {INCIDENT_SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Incidents List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Querying incident repository..." size="lg" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents detected"
          description={
            statusFilter || severityFilter || search
              ? 'No incidents matched your query. Clear your filters to see more results.'
              : 'All managed application workloads are operating normally without recorded anomalies.'
          }
          action={
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setIsReportModalOpen(true)}
            >
              Declare Incident
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const isResolved = incident.status === 'resolved';

            return (
              <div
                key={incident.id}
                className={`rounded-xl border p-5 transition-colors ${
                  isResolved
                    ? 'border-slate-800/70 bg-slate-900/30'
                    : 'border-rose-900/40 bg-slate-900/60 shadow-lg shadow-rose-950/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={incident.severity} size="md">
                        {incident.severity?.toUpperCase()}
                      </Badge>
                      <Badge variant={incident.status} size="md">
                        {incident.status?.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">
                        App: <strong className="text-slate-200">{incident.application?.name || incident.application_id}</strong>
                      </span>
                      {incident.application?.environment && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {incident.application.environment}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-100">
                      {incident.title}
                    </h3>

                    {incident.description && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                        {incident.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Triggered {formatRelativeTime(incident.created_at)} ({formatDate(incident.created_at)})
                      </span>
                      {incident.resolved_at && (
                        <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Resolved at {formatDate(incident.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <Link href={`/recovery?incident_id=${incident.id}`}>
                      <Button variant="secondary" size="sm" icon={ArrowRight}>
                        Recovery Actions
                      </Button>
                    </Link>

                    {!isResolved && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        loading={resolvingId === incident.id}
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
            totalItems={totalCount}
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
    </AppShell>
  );
}
