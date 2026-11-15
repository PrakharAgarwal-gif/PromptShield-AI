'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitBranch, Plus, CheckCircle2, Clock, Filter, GitCommit, Layers } from 'lucide-react';
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

function DeploymentsContent() {
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
      setNotice(`Release version 'v${formData.version}' logged to audit stream successfully.`);
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
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deployment Pipeline
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-lavender/15 text-aurora-lavender border border-aurora-lavender/30">
              {total} RELEASES LOGGED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Continuous delivery history, commit provenance, release audits and automated pipeline verifications.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
          Register Release
        </Button>
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

      {error && <ErrorAlert message={error} onRetry={fetchDeployments} />}

      {/* Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface-elevated border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Application Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-aurora-cyan" />
            <select
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono max-w-xs truncate"
            >
              <option value="" className="bg-space-midnight text-white">All Microservices</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id} className="bg-space-midnight text-white">
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
            className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">All Environments</option>
            {ENVIRONMENTS.map((env) => (
              <option key={env.value} value={env.value} className="bg-space-midnight text-white">
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
            className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">All Deployment States</option>
            <option value="successful" className="bg-space-midnight text-aurora-mint">Successful</option>
            <option value="in_progress" className="bg-space-midnight text-aurora-cyan">In Progress</option>
            <option value="pending" className="bg-space-midnight text-aurora-lavender">Pending</option>
            <option value="failed" className="bg-space-midnight text-aurora-coral">Failed</option>
            <option value="rolled_back" className="bg-space-midnight text-aurora-amber">Rolled Back</option>
          </select>
        </div>
      </div>

      {/* Deployments Table in Arctic Glass */}
      <div className="rounded-2xl border border-surface-border glass-surface-elevated shadow-glass overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching release audit stream..." />
        ) : deployments.length === 0 ? (
          <EmptyState
            title="No Deployments Located"
            message={
              applicationId || environment || statusFilter
                ? 'No release records match the active filter criteria.'
                : 'No releases have been deployed yet. Register a new deployment to track build versioning.'
            }
            icon={GitBranch}
            actionLabel="Register Release"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-space/60 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-5">Release Version</th>
                  <th className="py-4 px-5">Target Service</th>
                  <th className="py-4 px-5">Environment</th>
                  <th className="py-4 px-5">Commit Hash</th>
                  <th className="py-4 px-5">Execution State</th>
                  <th className="py-4 px-5">Deployed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {deployments.map((dep) => (
                  <tr
                    key={dep.id}
                    className="hover:bg-surface-elevated/60 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-aurora-lavender/15 flex items-center justify-center text-aurora-lavender border border-aurora-lavender/30 shadow-sm shrink-0">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white font-mono text-xs group-hover:text-aurora-lavender transition-colors">
                          v{dep.version}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-text-primary text-xs">
                      {getAppName(dep.application_id)}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-surface-elevated text-aurora-lavender border border-surface-border font-medium">
                        {dep.deployment_environment}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-space-secondary text-aurora-cyan border border-surface-border">
                        <GitCommit className="w-3 h-3 text-text-muted" />
                        {formatCommitHash(dep.commit_hash)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <Badge status={dep.status} size="md" />
                    </td>
                    <td className="py-4 px-5 text-text-muted font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        <span>{formatRelativeTime(dep.started_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Create Deployment Modal */}
      <CreateDeploymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeployment}
        applications={applications}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function DeploymentsPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Initializing Deployments View..." />}>
      <DeploymentsContent />
    </Suspense>
  );
}
