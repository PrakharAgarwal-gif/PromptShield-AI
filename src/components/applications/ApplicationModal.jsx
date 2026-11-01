'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { ENVIRONMENTS, APPLICATION_STATUS } from '@/utils/constants';

const applicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must have at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(1000).optional().or(z.literal('')),
  repository_url: z
    .string()
    .max(255)
    .optional()
    .or(z.literal('')),
  environment: z.string().min(1, 'Please select an environment'),
  status: z.string().min(1, 'Please select a status'),
});

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  application = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(application);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      description: '',
      repository_url: '',
      environment: 'production',
      status: 'healthy',
    },
  });

  useEffect(() => {
    if (application) {
      reset({
        name: application.name || '',
        description: application.description || '',
        repository_url: application.repository_url || '',
        environment: application.environment || 'production',
        status: application.status || 'healthy',
      });
    } else {
      reset({
        name: '',
        description: '',
        repository_url: '',
        environment: 'production',
        status: 'healthy',
      });
    }
  }, [application, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Application Service' : 'Register Application Service'}
      subtitle={
        isEdit
          ? `Modify settings for service '${application?.name}'`
          : 'Add a new microservice or cloud target to the CloudOps Sentinel monitoring plane'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Service Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. payment-service"
            {...register('name')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>

        {/* Environment & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Environment <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('environment')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
            {errors.environment && (
              <p className="mt-1 text-xs text-rose-400">{errors.environment.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Initial Status <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
            >
              <option value={APPLICATION_STATUS.HEALTHY}>Healthy</option>
              <option value={APPLICATION_STATUS.DEGRADED}>Degraded</option>
              <option value={APPLICATION_STATUS.DOWN}>Down / Offline</option>
              <option value={APPLICATION_STATUS.MAINTENANCE}>Maintenance</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-400">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Git Repository URL */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Repository URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://github.com/org/repo"
            {...register('repository_url')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
          />
          {errors.repository_url && (
            <p className="mt-1 text-xs text-rose-400">{errors.repository_url.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Architectural Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of service responsibilities, dependencies and SLA expectations..."
            {...register('description')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

