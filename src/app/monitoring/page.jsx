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
      setNotice(`Recorded data point for '${formData.metric_name}' (${formData.metric_value}).`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Infrastructure Telemetry & Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Timeseries telemetry queries, system load records and sensor collector health
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Ingest Data Point
        </Button>
      </div>

      {notice && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-400 hover:text-white font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && <ErrorAlert message={error} onRetry={fetchMonitoringData} />}

      {/* Collector Status Transparency Card */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Collector Pipeline Status:{' '}
                <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                  {isConnected ? 'LIVE CONNECTED' : 'DISCONNECTED'}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                {summary?.message ||
                  'No live external telemetry collectors (Prometheus / Grafana / AWS CloudWatch) are currently configured.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              Total Points Stored:{' '}
              <strong className="text-white">{summary?.total_metrics_recorded || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-subtle">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Application Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500 max-w-xs truncate"
            >
              <option value="">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Name Filter */}
          <select
            value={metricName}
            onChange={(e) => {
              setMetricName(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sentinel-500 font-mono"
          >
            {COMMON_METRIC_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart */}
      <MetricChart
        metrics={metrics}
        metricName={metricName}
        title={`Timeseries Telemetry: ${metricName}`}
      />

      {/* Recorded Data Points Table */}
      <div className="rounded-xl border border-surface-border bg-surface shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
            Raw Telemetry Stream Logs
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {total} records found
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading telemetry points..." />
        ) : metrics.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No telemetry records found for the selected filter combination.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-canvas/40 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Metric Identifier</th>
                  <th className="py-3 px-4">Recorded Value</th>
                  <th className="py-3 px-4">Source Sensor</th>
                  <th className="py-3 px-4">Captured At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {m.metric_name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sentinel-400">
                      {m.metric_value}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      <span className="bg-canvas px-2 py-0.5 rounded border border-surface-border">
                        {m.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDateTime(m.recorded_at)}</span>
                        <span className="text-slate-500">
                          ({formatRelativeTime(m.recorded_at)})
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-surface">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Ingest Modal */}
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

