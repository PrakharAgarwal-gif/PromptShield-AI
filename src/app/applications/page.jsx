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
  GitBranch,
  Shield,
  Layers,
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
        setNotice(`Microservice '${formData.name}' successfully updated.`);
      } else {
        await api.applications.create(formData);
        setNotice(`Microservice '${formData.name}' successfully registered.`);
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
      setNotice(`Microservice '${deletingApp.name}' has been deregistered.`);
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
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Microservice Fleet
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30">
              {total} ACTIVE SERVICES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Registered microservices, environment topologies, container health and upstream Git repositories.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingApp(null);
            setIsCreateOpen(true);
          }}
          icon={Plus}
          variant="primary"
          size="md"
        >
          Register Service
        </Button>
      </div>

      {/* Success Notification Banner */}
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

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={fetchApplications} />}

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface-elevated border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by microservice name, repo, or description..."
          className="w-full md:w-96"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Environment Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-aurora-lavender" />
            <select
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
            >
              <option value="" className="bg-space-midnight text-white">All Environments</option>
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value} className="bg-space-midnight text-white">
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
            className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">All Health States</option>
            <option value="healthy" className="bg-space-midnight text-aurora-mint">Healthy</option>
            <option value="degraded" className="bg-space-midnight text-aurora-amber">Degraded</option>
            <option value="down" className="bg-space-midnight text-aurora-coral">Down</option>
            <option value="maintenance" className="bg-space-midnight text-aurora-purple">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Applications Data Table in Arctic Glass */}
      <div className="rounded-2xl border border-surface-border glass-surface-elevated shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching registered microservices..." />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Microservices Located"
            message={
              search || environment || statusFilter
                ? 'No registered microservices match your selected filter criteria.'
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
                <tr className="border-b border-surface-border bg-space/60 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-5">Microservice</th>
                  <th className="py-4 px-5">Environment</th>
                  <th className="py-4 px-5">Health State</th>
                  <th className="py-4 px-5">Repository</th>
                  <th className="py-4 px-5">Telemetry Audit</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-surface-elevated/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-aurora-cyan/15 flex items-center justify-center text-aurora-cyan border border-aurora-cyan/30 shadow-sm shrink-0">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-aurora-cyan transition-colors text-sm">
                            {app.name}
                          </div>
                          {app.description && (
                            <div className="text-[11px] text-text-secondary truncate max-w-xs mt-0.5 font-sans">
                              {app.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-surface-elevated text-aurora-lavender border border-surface-border font-medium">
                        {app.environment}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <Badge status={app.status} size="md" />
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px]">
                      {app.repository_url ? (
                        <a
                          href={app.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-aurora-cyan hover:text-white inline-flex items-center gap-1.5 truncate max-w-[220px] transition-colors"
                        >
                          <span className="truncate">
                            {app.repository_url.replace('https://github.com/', '')}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-text-muted font-mono text-[11px]">
                      {formatRelativeTime(app.updated_at)}
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApp(app);
                            setIsCreateOpen(true);
                          }}
                          className="p-2 text-text-secondary hover:text-white rounded-xl hover:bg-surface-elevated transition-colors border border-transparent hover:border-surface-border"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingApp(app)}
                          className="p-2 text-text-secondary hover:text-aurora-coral rounded-xl hover:bg-aurora-coral/10 transition-colors border border-transparent hover:border-aurora-coral/30"
                          title="Deregister Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-surface-border bg-space/40">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create / Edit Microservice Modal */}
      <ApplicationModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
        editingApp={editingApp}
        isSubmitting={isSubmitting}
      />

      {/* Microservice Detail Inspector Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          app={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          onEdit={() => {
            setEditingApp(selectedApp);
            setSelectedApp(null);
            setIsCreateOpen(true);
          }}
          onDelete={() => {
            setDeletingApp(selectedApp);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        title="Deregister Microservice"
        subtitle="This action removes the microservice from Sentinel telemetry tracking."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-aurora-coral/30 bg-aurora-coral/10 text-white text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-aurora-coral shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">
                  Confirm deregistration of microservice: {deletingApp?.name}?
                </p>
                <p className="mt-1 text-text-secondary">
                  Associated metrics and deployment records will remain in the database, but active health checking will cease.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingApp(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteApp}
              isLoading={isSubmitting}
            >
              Confirm Deregistration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
