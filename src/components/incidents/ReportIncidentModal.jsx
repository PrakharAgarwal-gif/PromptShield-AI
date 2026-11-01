'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';
import api from '@/lib/api';
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
    setValue,
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

      const payload = {
        application_id: formData.application_id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        severity: formData.severity,
        status: formData.status,
      };

      await api.incidents.create(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Declare Incident"
      description="Create a prioritized incident event linked to a registered service."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Target Application <span className="text-rose-400">*</span>
          </label>
          <select
            {...register('application_id', { required: 'Please select an application' })}
            disabled={loadingApps}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{loadingApps ? 'Loading applications...' : 'Select an application...'}</option>
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Incident Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. High HTTP 504 latency spike on checkout worker"
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' },
            })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Severity Level
            </label>
            <select
              {...register('severity')}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {INCIDENT_SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {INCIDENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Diagnostic Description
          </label>
          <textarea
            rows={3}
            placeholder="Observed symptoms, error logs, and impact..."
            {...register('description')}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Declaring an incident generates a persistent audit record in PostgreSQL and enables automated or simulated recovery triggers.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={submitting} type="button">
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} type="submit">
            Declare Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
}

