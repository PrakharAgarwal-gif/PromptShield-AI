'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Server,
  Trash2,
  Edit2,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Modal from '@/components/common/Modal';
import ApplicationModal from '@/components/applications/ApplicationModal';
import ApplicationDetailModal from '@/components/applications/ApplicationDetailModal';
import { formatRelativeTime } from '@/utils/formatters';
import { ENVIRONMENTS } from '@/utils/constants';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [environment, setEnvironment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingApp, setDeletingApp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.applications.list({
        search,
        environment: environment || undefined,
        status: statusFilter || undefined,
        page,
        page_size: pageSize,
      });

      setApplications(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch application list');
    } finally {
      setLoading(false);
    }
  }, [search, environment, statusFilter, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle Create or Update
  const handleSaveApp = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingApp) {
        await api.applications.update(editingApp.id, formData);
        setNotice(`Application '${formData.name}' successfully updated.`);
      } else {
        await api.applications.create(formData);
        setNotice(`Application '${formData.name}' successfully registered.`);
      }
      setIsCreateOpen(false);
      setEditingApp(null);
      fetchApplications();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteApp = async () => {
    if (!deletingApp) return;
    try {
      setIsSubmitting(true);
      await api.applications.delete(deletingApp.id);
      setNotice(`Application '${deletingApp.name}' has been deleted.`);
      setDeletingApp(null);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monitored Applications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered microservices, environments, deployment health and upstream Git sources
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingApp(null);
            setIsCreateOpen(true);
          }}
          icon={Plus}
        >
          Register Service
        </Button>
      </div>

      {/* Success Notification Banner */}
      {notice && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-400 hover:text-white font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={fetchApplications} />}

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-subtle">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Filter by service name or notes..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Environment Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500"
            >
              <option value="">All Environments</option>
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500"
          >
            <option value="">All Health States</option>
            <option value="healthy">Healthy</option>
            <option value="degraded">Degraded</option>
            <option value="down">Down</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="rounded-xl border border-surface-border bg-surface shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching applications from PostgreSQL..." />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Applications Found"
            message={
              search || environment || statusFilter
                ? 'No registered applications match your selected filter criteria.'
                : 'Get started by registering your first service to enable automated health monitoring and deployment tracking.'
            }
            icon={Server}
            actionLabel="Register Service"
            onAction={() => {
              setEditingApp(null);
              setIsCreateOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-canvas/40 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Health State</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-surface-muted/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-sentinel-300 transition-colors">
                        {app.name}
                      </div>
                      {app.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {app.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono px-2 py-0.5 rounded bg-surface-elevated text-slate-300">
                        {app.environment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {app.repository_url ? (
                        <a
                          href={app.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sentinel-400 hover:text-sentinel-300 inline-flex items-center gap-1 truncate max-w-[200px]"
                        >
                          <span className="truncate">{app.repository_url.replace('https://github.com/', '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatRelativeTime(app.updated_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApp(app);
                            setIsCreateOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-surface-elevated transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingApp(app)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-surface-elevated transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-surface">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <ApplicationModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleSaveApp}
        application={editingApp}
        isSubmitting={isSubmitting}
      />

      {/* Detail Modal */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
        onEdit={(app) => {
          setSelectedApp(null);
          setEditingApp(app);
          setIsCreateOpen(true);
        }}
        onDelete={(app) => {
          setSelectedApp(null);
          setDeletingApp(app);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        title="Confirm Application Deletion"
        subtitle="This action cascades and irreversibly removes all linked deployments, incidents and metrics."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to permanently delete{' '}
              <strong className="text-white font-mono">
                {deletingApp?.name}
              </strong>
              ? All historical telemetry and remediation records for this application will be removed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="ghost" onClick={() => setDeletingApp(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteApp}
              isLoading={isSubmitting}
              icon={Trash2}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

