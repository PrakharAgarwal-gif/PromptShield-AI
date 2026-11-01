'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Info } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';
import api from '@/lib/api';
import { RECOVERY_ACTION_TYPES } from '@/utils/constants';

export default function TriggerRecoveryModal({
  isOpen,
  onClose,
  onSuccess,
  initialAppId = '',
  initialIncidentId = '',
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      application_id: initialAppId,
      incident_id: initialIncidentId,
      action_type: 'restart_service',
    },
  });

  const selectedAppId = watch('application_id');

  useEffect(() => {
    if (isOpen) {
      reset({
        application_id: initialAppId || '',
        incident_id: initialIncidentId || '',
        action_type: 'restart_service',
      });
      setSubmitError(null);
      loadContextData();
    }
  }, [isOpen, initialAppId, initialIncidentId, reset]);

  const loadContextData = async () => {
    try {
      setLoadingData(true);
      const [appsRes, incsRes] = await Promise.all([
        api.applications.list({ page_size: 100 }),
        api.incidents.list({ status: 'open', page_size: 50 }),
      ]);
      setApplications(appsRes.data?.items || []);
      setIncidents(incsRes.data?.items || []);
    } catch {
      // Non-blocking fallback
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        application_id: formData.application_id,
        action_type: formData.action_type,
        incident_id: formData.incident_id?.trim() || null,
      };

      await api.recovery.trigger(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to trigger recovery action');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter incidents matching selected application if selected
  const availableIncidents = selectedAppId
    ? incidents.filter((i) => i.application_id === selectedAppId)
    : incidents;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Self-Healing Recovery"
      description="Execute a safe simulated remediation action against target infrastructure."
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
            disabled={loadingData}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">{loadingData ? 'Loading applications...' : 'Select an application...'}</option>
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
            Remediation Action Type <span className="text-rose-400">*</span>
          </label>
          <select
            {...register('action_type', { required: 'Action type is required' })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {RECOVERY_ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} — {type.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Linked Incident (Optional)
          </label>
          <select
            {...register('incident_id')}
            disabled={loadingData}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">No linked incident (standalone manual remediation)</option>
            {availableIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity?.toUpperCase()}] {inc.title}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-200/90 space-y-1">
            <p className="font-semibold text-blue-300">Safe Simulation / Dry-Run Mode Active</p>
            <p className="text-slate-400 leading-relaxed">
              CloudOps Sentinel safeguards production infrastructure by evaluating policies and recording dry-run audit logs. Live infrastructure restart commands require confirmed cloud provider integration tokens.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={submitting} type="button">
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} type="submit" icon={ShieldCheck}>
            Trigger Remediation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
