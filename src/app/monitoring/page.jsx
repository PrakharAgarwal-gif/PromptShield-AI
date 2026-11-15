'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Radio,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Info,
  Database,
  Cpu,
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import MetricChart from '@/components/monitoring/MetricChart';
import IngestMetricModal from '@/components/monitoring/IngestMetricModal';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const COMMON_METRIC_KEYS = [
  'cpu_usage_percent',
  'memory_usage_bytes',
  'request_latency_ms',
  'http_5xx_rate',
  'network_io_bytes',
];

export default function MonitoringPage() {
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [applicationId, setApplicationId] = useState('');
  const [metricName, setMetricName] = useState('cpu_usage_percent');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await api.applications.list({ page: 1, page_size: 100 });
        setApplications(res.items || []);
      } catch (err) {
        console.error('Error fetching applications for monitoring dropdown:', err);
      }
    }
    loadApplications();
  }, []);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, metricsRes] = await Promise.all([
        api.monitoring.getSummary(),
        api.monitoring.getMetrics({
          application_id: applicationId || undefined,
          metric_name: metricName || undefined,
          page,
          page_size: pageSize,
        }),
      ]);

      setSummary(summaryRes);
      setMetrics(metricsRes.items || []);
      setTotal(metricsRes.total || 0);
      setTotalPages(metricsRes.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch monitoring telemetry');
    } finally {
      setLoading(false);
    }
  }, [applicationId, metricName, page]);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  const handleIngestMetric = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.monitoring.ingest(formData);
      setNotice(`Recorded telemetry point for '${formData.metric_name}' (${formData.metric_value}).`);
      setIsModalOpen(false);
      fetchMonitoringData();
    } catch (err) {
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConnected = summary?.external_collectors_connected || false;

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Infrastructure Telemetry & Observability
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/30">
              TIMESERIES BUFFER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Timeseries resource saturation, query velocity, container metrics and hardware telemetry.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary">
          Ingest Telemetry Point
        </Button>
      </div>

      {notice && (
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface border border-aurora-mint/40 text-aurora-mint text-xs shadow-glow-mint">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-mint" />
            <span className="font-medium text-white">{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-aurora-mint hover:text-white font-mono font-bold uppercase text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && <ErrorAlert message={error} onRetry={fetchMonitoringData} />}

      {/* Collector Pipeline Transparency Card in Arctic Glass */}
      <div className="relative overflow-hidden p-6 rounded-2xl glass-surface-elevated border border-surface-border shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                isConnected
                  ? 'bg-aurora-mint/15 text-aurora-mint border-aurora-mint/30 shadow-glow-mint'
                  : 'bg-aurora-amber/15 text-aurora-amber border-aurora-amber/30'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                External Telemetry Pipeline:{' '}
                <span className={isConnected ? 'text-aurora-mint font-mono' : 'text-aurora-amber font-mono'}>
                  {isConnected ? 'LIVE CONNECTED' : 'STANDALONE MODE'}
                </span>
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                {summary?.message ||
                  'No external streaming collectors (Prometheus / Grafana / AWS CloudWatch) connected. Telemetry is served directly from the PostgreSQL timeseries store.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono px-3.5 py-1.5 rounded-xl bg-space-secondary border border-surface-border">
            <Database className="w-3.5 h-3.5 text-aurora-cyan" />
            <span className="text-text-muted">Stored Points:</span>
            <strong className="text-white text-sm">{summary?.total_metrics_recorded || total || 0}</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-surface-elevated border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Application Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-aurora-cyan" />
            <select
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono max-w-xs truncate"
            >
              <option value="" className="bg-space-midnight text-white">All Microservices</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id} className="bg-space-midnight text-white">
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Name Preset Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Cpu className="w-3.5 h-3.5 text-aurora-lavender" />
            <select
              value={metricName}
              onChange={(e) => {
                setMetricName(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl glass-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-aurora-cyan font-mono"
            >
              {COMMON_METRIC_KEYS.map((k) => (
                <option key={k} value={k} className="bg-space-midnight text-white">
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeseries Visual Chart */}
      <MetricChart
        metrics={metrics}
        metricName={metricName}
        loading={loading}
      />

      {/* Recent Points Table in Arctic Glass */}
      <div className="rounded-2xl border border-surface-border glass-surface-elevated shadow-glass overflow-hidden">
        <div className="p-5 border-b border-surface-border bg-space/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Raw Telemetry Point Ingest Log
          </h3>
          <span className="text-[11px] font-mono text-text-muted">
            Viewing {metrics.length} ingested points
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Fetching raw metric telemetry..." />
        ) : metrics.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-secondary">
            No telemetry data points matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-space/40 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-5">Metric Key</th>
                  <th className="py-4 px-5">Value</th>
                  <th className="py-4 px-5">Unit</th>
                  <th className="py-4 px-5">Service Target</th>
                  <th className="py-4 px-5">Ingestion Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {metrics.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-surface-elevated/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-aurora-cyan font-semibold">
                      {m.metric_name}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-white text-sm">
                      {m.metric_value}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-aurora-lavender text-[11px]">
                      {m.unit || 'scalar'}
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono text-xs">
                      {m.application_id || 'System-Wide'}
                    </td>
                    <td className="py-3.5 px-5 text-text-muted font-mono text-[11px]">
                      {formatDateTime(m.collected_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border bg-space/40">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Ingest Metric Modal */}
      <IngestMetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleIngestMetric}
        applications={applications}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
