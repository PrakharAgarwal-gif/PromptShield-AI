'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitBranch, Plus, CheckCircle2, Clock, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import CreateDeploymentModal from '@/components/deployments/CreateDeploymentModal';
import { formatDateTime, formatRelativeTime, formatCommitHash } from '@/utils/formatters';
import { ENVIRONMENTS } from '@/utils/constants';

export default function DeploymentsPage() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get('application_id') || '';

  const [deployments, setDeployments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [applicationId, setApplicationId] = useState(initialAppId);
  const [statusFilter, setStatusFilter] = useState('');
  const [environment, setEnvironment] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch applications for dropdown
  useEffect(() => {
    async function loadApps() {
      try {
        const res = await api.applications.list({ page: 1, page_size: 100 });
        setApplications(res.items || []);
      } catch (e) {
        console.error('Failed to load applications for deployments dropdown:', e);
      }
    }
    loadApps();
  }, []);

  const fetchDeployments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.deployments.list({
        application_id: applicationId || undefined,
        status: statusFilter || undefined,
        environment: environment || undefined,
        page,
        page_size: pageSize,
      });

      setDeployments(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch deployments');
    } finally {
      setLoading(false);
    }
  }, [applicationId, statusFilter, environment, page]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const handleCreateDeployment = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.deployments.create(formData);
      setNotice(`Deployment for version '${formData.version}' logged successfully.`);
      setIsModalOpen(false);
      fetchDeployments();
    } catch (err) {
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to resolve app name by ID
  const getAppName = (appId) => {
    const found = applications.find((a) => a.id === appId);
    return found ? found.name : appId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Deployment History & Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical release versions, commit hashes, target environments and execution status
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Log Release
        </Button>
      </div>

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

      {error && <ErrorAlert message={error} onRetry={fetchDeployments} />}

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-subtle">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Application Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500 max-w-xs truncate"
            >
              <option value="">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Environment Filter */}
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500"
          >
            <option value="">All Deployment Statuses</option>
            <option value="successful">Successful</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="rolled_back">Rolled Back</option>
          </select>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="rounded-xl border border-surface-border bg-surface shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading deployment history from backend..." />
        ) : deployments.length === 0 ? (
          <EmptyState
            title="No Deployments Found"
            message={
              applicationId || statusFilter || environment
                ? 'No deployments match your selected filter parameters.'
                : 'No deployment releases have been recorded yet. Click below to record your first build release.'
            }
            icon={GitBranch}
            actionLabel="Log Release"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-canvas/40 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Release Version</th>
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Commit SHA</th>
                  <th className="py-3 px-4">Execution State</th>
                  <th className="py-3 px-4">Deployed At</th>
                  <th className="py-3 px-4">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {deployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {dep.version}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {getAppName(dep.application_id)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono px-2 py-0.5 rounded bg-surface-elevated text-slate-300">
                        {dep.deployment_environment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {dep.commit_hash ? (
                        <span className="bg-canvas px-2 py-1 rounded border border-surface-border">
                          {formatCommitHash(dep.commit_hash)}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={dep.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatRelativeTime(dep.started_at)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {dep.completed_at ? formatDateTime(dep.completed_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Modal */}
      <CreateDeploymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeployment}
        applications={applications}
        isSubmitting={isSubmitting}
        preselectedAppId={applicationId}
      />
    </div>
  );
}

