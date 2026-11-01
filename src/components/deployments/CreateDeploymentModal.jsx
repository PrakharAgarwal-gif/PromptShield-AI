'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { ENVIRONMENTS, DEPLOYMENT_STATUS } from '@/utils/constants';

const deploymentSchema = z.object({
  application_id: z.string().min(1, 'Please select an application'),
  version: z.string().min(1, 'Version is required (e.g. v1.2.0)').max(50),
  commit_hash: z
    .string()
    .max(40)
    .optional()
    .or(z.literal('')),
  deployment_environment: z.string().min(1, 'Please select target environment'),
  status: z.string().min(1, 'Please select initial status'),
});

export default function CreateDeploymentModal({
  isOpen,
  onClose,
  onSubmit,
  applications = [],
  isSubmitting = false,
  preselectedAppId = '',
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deploymentSchema),
    defaultValues: {
      application_id: preselectedAppId || '',
      version: 'v1.0.0',
      commit_hash: '',
      deployment_environment: 'production',
      status: 'successful',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        application_id: preselectedAppId || applications[0]?.id || '',
        version: 'v1.0.0',
        commit_hash: '',
        deployment_environment: 'production',
        status: 'successful',
      });
    }
  }, [isOpen, preselectedAppId, applications, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Release Deployment"
      subtitle="Log a new deployment release, commit hash audit, and execution status"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Application Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Target Application <span className="text-rose-400">*</span>
          </label>
          <select
            {...register('application_id')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
          >
            <option value="">Select target application...</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.environment})
              </option>
            ))}
          </select>
          {errors.application_id && (
            <p className="mt-1 text-xs text-rose-400">{errors.application_id.message}</p>
          )}
        </div>

        {/* Version & Environment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Release Version <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. v2.4.1 or build-892"
              {...register('version')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
            />
            {errors.version && (
              <p className="mt-1 text-xs text-rose-400">{errors.version.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Environment <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('deployment_environment')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
            {errors.deployment_environment && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.deployment_environment.message}
              </p>
            )}
          </div>
        </div>

        {/* Commit Hash & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Git Commit Hash (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 7f3a9bc..."
              {...register('commit_hash')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
            />
            {errors.commit_hash && (
              <p className="mt-1 text-xs text-rose-400">{errors.commit_hash.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Execution Status <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
            >
              <option value={DEPLOYMENT_STATUS.SUCCESSFUL}>Successful</option>
              <option value={DEPLOYMENT_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={DEPLOYMENT_STATUS.PENDING}>Pending</option>
              <option value={DEPLOYMENT_STATUS.FAILED}>Failed</option>
              <option value={DEPLOYMENT_STATUS.ROLLED_BACK}>Rolled Back</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-400">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Deployment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

