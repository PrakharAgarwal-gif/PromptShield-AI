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
      title="Register Container Release"
      subtitle="Log a build artifact or microservice version to the Sentinel release audit trail"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Target Application */}
        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Target Microservice <span className="text-aurora-coral">*</span>
          </label>
          <select
            {...register('application_id')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">Select a registered microservice...</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id} className="bg-space-midnight text-white">
                {app.name} ({app.environment})
              </option>
            ))}
          </select>
          {errors.application_id && (
            <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.application_id.message}</p>
          )}
        </div>

        {/* Version & Commit Hash */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Version Tag <span className="text-aurora-coral">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. v2.4.1"
              {...register('version')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            />
            {errors.version && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.version.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Git Commit SHA
            </label>
            <input
              type="text"
              placeholder="e.g. 7b8f9e1"
              {...register('commit_hash')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            />
            {errors.commit_hash && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.commit_hash.message}</p>
            )}
          </div>
        </div>

        {/* Target Environment & Initial Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Target Environment <span className="text-aurora-coral">*</span>
            </label>
            <select
              {...register('deployment_environment')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value} className="bg-space-midnight text-white">
                  {env.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Execution Status <span className="text-aurora-coral">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            >
              <option value={DEPLOYMENT_STATUS.SUCCESSFUL} className="bg-space-midnight text-aurora-mint">Successful</option>
              <option value={DEPLOYMENT_STATUS.IN_PROGRESS} className="bg-space-midnight text-aurora-cyan">In Progress</option>
              <option value={DEPLOYMENT_STATUS.PENDING} className="bg-space-midnight text-aurora-lavender">Pending</option>
              <option value={DEPLOYMENT_STATUS.FAILED} className="bg-space-midnight text-aurora-coral">Failed</option>
              <option value={DEPLOYMENT_STATUS.ROLLED_BACK} className="bg-space-midnight text-aurora-amber">Rolled Back</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm & Log Release
          </Button>
        </div>
      </form>
    </Modal>
  );
}
