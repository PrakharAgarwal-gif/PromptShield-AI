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
  onSave,
  application = null,
  editingApp = null,
  isSubmitting = false,
}) {
  const currentApp = editingApp || application;
  const isEdit = Boolean(currentApp);
  const submitHandler = onSave || onSubmit;

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
    if (currentApp) {
      reset({
        name: currentApp.name || '',
        description: currentApp.description || '',
        repository_url: currentApp.repository_url || '',
        environment: currentApp.environment || 'production',
        status: currentApp.status || 'healthy',
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
  }, [currentApp, reset, isOpen]);

  const handleFormSubmit = (data) => {
    if (submitHandler) {
      submitHandler(data);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Microservice' : 'Register Microservice'}
      subtitle={
        isEdit
          ? `Modify settings for service '${currentApp?.name}'`
          : 'Add a new microservice target to the CloudOps Sentinel monitoring plane'
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Service Name <span className="text-aurora-coral">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. auth-gateway-service"
            {...register('name')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.name.message}</p>
          )}
        </div>

        {/* Environment & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Environment <span className="text-aurora-coral">*</span>
            </label>
            <select
              {...register('environment')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value} className="bg-space-midnight text-white">
                  {env.label}
                </option>
              ))}
            </select>
            {errors.environment && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.environment.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Initial Health Status <span className="text-aurora-coral">*</span>
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            >
              <option value={APPLICATION_STATUS.HEALTHY} className="bg-space-midnight text-aurora-mint">Healthy</option>
              <option value={APPLICATION_STATUS.DEGRADED} className="bg-space-midnight text-aurora-amber">Degraded</option>
              <option value={APPLICATION_STATUS.DOWN} className="bg-space-midnight text-aurora-coral">Down / Offline</option>
              <option value={APPLICATION_STATUS.MAINTENANCE} className="bg-space-midnight text-aurora-purple">Maintenance</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Git Repository URL */}
        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Git Repository URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://github.com/organization/microservice-repo"
            {...register('repository_url')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          />
          {errors.repository_url && (
            <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.repository_url.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Architectural Overview
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of service boundaries, dependencies and SLA requirements..."
            {...register('description')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-sans"
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Register Microservice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
