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
      subtitle="Manually send a sensor measurement to PostgreSQL timeseries storage"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Metric Name / Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. cpu_usage_percent"
              {...register('metric_name')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
            />
            {errors.metric_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.metric_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Measurement Value <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 78.4"
              {...register('metric_value')}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
            />
            {errors.metric_value && (
              <p className="mt-1 text-xs text-rose-400">{errors.metric_value.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Data Source Identifier <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. prometheus-exporter or cloudwatch-agent"
            {...register('source')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-muted border border-surface-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
          />
          {errors.source && (
            <p className="mt-1 text-xs text-rose-400">{errors.source.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Record Data Point
          </Button>
        </div>
      </form>
    </Modal>
  );
}

