"use client";
import React, { useState, useEffect, useCallback } from "react";
import GlowingAreaChart from "../../components/GlowingAreaChart";
import { fetchTelemetry, fetchLiveLogs } from "../../lib/api";
import {
  Activity,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Flame,
} from "lucide-react";

export default function MonitoringPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [telemetryData, logsData] = await Promise.all([
        fetchTelemetry(),
        fetchLiveLogs(levelFilter === "ALL" ? null : levelFilter),
      ]);
      setTelemetry(telemetryData);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [levelFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredLogs = logs.filter((log) =>
    searchTerm ? (log.message || "").toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-mint" />
            Infrastructure Telemetry & CloudWatch-Style Event Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Microsecond-precision CPU, RAM, connection queues, and live pod container logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-cyber-teal/20 text-slate-300 hover:text-cyber-mint transition text-xs font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyber-mint" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Dual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-2">
            <h3 className="text-xs font-bold text-white uppercase font-mono">Cluster CPU Load Trend (%)</h3>
            <span className="text-[10px] text-cyber-mint font-mono">Mean: {telemetry?.cpu_average ?? 34.8}%</span>
          </div>
          {telemetry?.time_series && (
            <GlowingAreaChart
              data={telemetry.time_series}
              dataKey="cpu"
              unit="%"
              color="#2dd4bf"
              gradientId="cpuGlow"
            />
          )}
        </div>

        <div className="glass-card p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-2">
            <h3 className="text-xs font-bold text-white uppercase font-mono">Cluster Memory Allocated (RAM %)</h3>
            <span className="text-[10px] text-amber-400 font-mono">Mean: {telemetry?.memory_average ?? 52.4}%</span>
          </div>
          {telemetry?.time_series && (
            <GlowingAreaChart
              data={telemetry.time_series}
              dataKey="memory"
              unit="%"
              color="#f59e0b"
              gradientId="ramGlow"
            />
          )}
        </div>
      </div>

      {/* Live Log Stream Card */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-teal/15 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-mint" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Live Ingestion Logs</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-obsidian-900 border border-cyber-teal/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint w-44"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-obsidian-900 p-1 rounded-xl border border-cyber-teal/20 text-[10px] font-mono">
              {["ALL", "INFO", "WARN", "CRITICAL"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition font-bold ${
                    levelFilter === lvl
                      ? "bg-cyber-mint text-obsidian-950 shadow-glow-mint"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log Viewer Terminal */}
        <div className="p-4 rounded-2xl bg-obsidian-950 border border-cyber-teal/15 font-mono text-xs space-y-2 max-h-[380px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No logs matching criteria.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-slate-900/60 pb-2">
                <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 border ${
                    log.log_level === "CRITICAL"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : log.log_level === "WARN"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-cyber-teal/15 text-cyber-mint border-cyber-teal/30"
                  }`}
                >
                  {log.log_level}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
