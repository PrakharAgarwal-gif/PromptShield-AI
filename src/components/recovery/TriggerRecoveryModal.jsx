'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Info } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ErrorAlert from '@/components/common/ErrorAlert';
import { api } from '@/lib/api';
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
      setApplications(appsRes?.items || appsRes?.data?.items || []);
      setIncidents(incsRes?.items || incsRes?.data?.items || []);
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
      await api.recovery.trigger(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to trigger recovery routine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Self-Healing Recovery Routine"
      subtitle="Execute an isolated dry-run automated recovery action to mitigate service anomalies"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

        {/* Safety Dry-run Notice */}
        <div className="p-3.5 rounded-xl glass-surface border border-aurora-cyan/30 text-xs text-text-secondary flex items-start gap-3">
          <Info className="w-4 h-4 text-aurora-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Containment Policy:</strong> Recovery procedures run in{' '}
            <span className="text-aurora-cyan font-mono font-bold">DRY-RUN SIMULATION</span> mode. The Sentinel engine evaluates pre-flight conditions and generates audit logs without mutating production hardware.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Target Microservice <span className="text-aurora-coral">*</span>
          </label>
          <select
            {...register('application_id', { required: 'Please select an application' })}
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

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Recovery Action Routine <span className="text-aurora-coral">*</span>
          </label>
          <select
            {...register('action_type', { required: 'Action type is required' })}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          >
            {RECOVERY_ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value} className="bg-space-midnight text-white">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-text-secondary uppercase mb-1.5">
            Associate Open Incident (Optional)
          </label>
          <select
            {...register('incident_id')}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm glass-surface border border-surface-border rounded-xl text-white focus:outline-none focus:border-aurora-cyan font-mono"
          >
            <option value="" className="bg-space-midnight text-white">None (Standalone maintenance routine)</option>
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id} className="bg-space-midnight text-white">
                [{inc.severity?.toUpperCase()}] {inc.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Stage Recovery Execution
          </Button>
        </div>
      </form>
    </Modal>
  );
}
