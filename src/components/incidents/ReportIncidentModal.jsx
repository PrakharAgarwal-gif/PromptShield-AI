'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';
import { api } from '@/lib/api';
import { INCIDENT_SEVERITY_OPTIONS, INCIDENT_STATUS_OPTIONS } from '@/utils/constants';

export default function ReportIncidentModal({ isOpen, onClose, onSuccess, initialAppId = '' }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      application_id: initialAppId,
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        application_id: initialAppId || '',
        title: '',
        description: '',
        severity: 'medium',
        status: 'open',
      });
      setSubmitError(null);
      loadApplications();
    }
  }, [isOpen, initialAppId, reset]);

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await api.applications.list({ page_size: 100 });
      setApplications(res?.items || res?.data?.items || []);
    } catch {
      // Non-blocking fallback
    } finally {
      setLoadingApps(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await api.incidents.create(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to declare incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Declare Incident & Anomaly"
      subtitle="Publish an outage event or operational degradation to the Sentinel response team"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Target Microservice <span className="text-aurora-coral">*</span>
          </label>
          <select
            {...register('application_id', { required: 'Please select an application' })}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-coral font-mono"
          >
            <option value="" className="bg-space-midnight text-white">Select a registered service...</option>
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

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Incident Headline <span className="text-aurora-coral">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Ingress Gateway 502 Bad Gateway Spike"
            {...register('title', { required: 'Incident title is required' })}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-coral font-sans"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-aurora-coral font-mono">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Severity Level
            </label>
            <select
              {...register('severity')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-coral font-mono"
            >
              {INCIDENT_SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-space-midnight text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
              Initial Triage State
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-coral font-mono"
            >
              {INCIDENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-space-midnight text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Root Cause & Diagnostic Context
          </label>
          <textarea
            rows={3}
            placeholder="Observed error logs, pod crash loops, or degraded database response times..."
            {...register('description')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-coral font-sans"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={submitting}>
            Publish Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
}
