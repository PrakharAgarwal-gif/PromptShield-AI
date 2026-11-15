'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const metricSchema = z.object({
  application_id: z.string().min(1, 'Please select target application'),
  metric_name: z.string().min(2, 'Metric key required').max(100),
  metric_value: z.coerce.number().min(0, 'Metric value must be positive'),
  source: z.string().min(2).max(100),
});

export default function IngestMetricModal({
  isOpen,
  onClose,
  onSubmit,
  applications = [],
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      application_id: '',
      metric_name: 'cpu_usage_percent',
      metric_value: 45.5,
      source: 'manual-probe',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        application_id: applications[0]?.id || '',
        metric_name: 'cpu_usage_percent',
        metric_value: 45.5,
        source: 'manual-probe',
      });
    }
  }, [isOpen, applications, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingest Telemetry Data Point"
      subtitle="Record a manual or sensor telemetry observation to the Sentinel timeseries store"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Metric Key <span className="text-aurora-coral">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. cpu_usage_percent"
              {...register('metric_name')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            />
            {errors.metric_name && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.metric_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Metric Value <span className="text-aurora-coral">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 54.2"
              {...register('metric_value')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
            />
            {errors.metric_value && (
              <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.metric_value.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Probe Source / Collector Agent
          </label>
          <input
            type="text"
            placeholder="e.g. node-exporter-v1"
            {...register('source')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm Ingestion
          </Button>
        </div>
      </form>
    </Modal>
  );
}
