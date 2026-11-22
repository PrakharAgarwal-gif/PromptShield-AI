"use client";
import React, { useState, useEffect } from "react";
import RadialGauge from "../components/RadialGauge";
import GlowingAreaChart from "../components/GlowingAreaChart";
import ClusterHexGrid from "../components/ClusterHexGrid";
import { fetchDashboardKPIs, fetchTelemetry, fetchDeployments, fetchIncidents } from "../lib/api";
import {
  Boxes,
  Activity,
  GitBranch,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [kpisData, telemetryData, depsData, incsData] = await Promise.all([
        fetchDashboardKPIs(),
        fetchTelemetry(),
        fetchDeployments(),
        fetchIncidents(),
      ]);
      setKpis(kpisData);
      setTelemetry(telemetryData);
      setDeployments(depsData.slice(0, 3));
      setIncidents(incsData.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Metric Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Registered Services</span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">{kpis?.total_applications ?? 4}</span>
            <span className="text-[10px] text-cyber-mint font-mono mt-1 block">100% Monitored</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyber-teal/15 border border-cyber-teal/25 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-cyber-mint" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Active Pipelines</span>
            <span className="text-2xl font-bold font-mono text-cyber-mint mt-0.5 block">{kpis?.running_deployments ?? 1} RUNNING</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Canary in Progress</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyber-mint/15 border border-cyber-mint/25 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-cyber-mint" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Active Incidents</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-0.5 block">{kpis?.active_incidents ?? 1}</span>
            <span className="text-[10px] text-amber-400/80 font-mono mt-1 block">Triage in Progress</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Network Latency</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">{telemetry?.latency_p95 ?? 18.4} ms</span>
            <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">SLO Within Bounds</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Row 2: Radial Arc Gauges & Spline Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radial Progress Gauges (CPU, Memory, Allocation) */}
        <div className="lg:col-span-4 glass-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cluster Resource Utilization</h3>
            <span className="text-[10px] text-cyber-mint font-mono font-semibold">12 Core Nodes</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <RadialGauge
              value={kpis?.avg_cpu_utilization ?? 34.8}
              label="CPU Load"
              sublabel="Cluster"
              color={kpis?.avg_cpu_utilization > 75 ? "red" : "cyan"}
              size={105}
            />
            <RadialGauge
              value={kpis?.avg_memory_utilization ?? 52.4}
              label="RAM Usage"
              sublabel="Allocated"
              color="amber"
              size={105}
            />
            <RadialGauge
              value={kpis?.resource_allocation_percent ?? 78.4}
              label="Quota Max"
              sublabel="Mesh Pods"
              color="green"
              size={105}
            />
          </div>

          <div className="pt-2 border-t border-cyber-teal/10 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Uptime SLO Target: 99.95%</span>
            <span className="text-emerald-400 font-bold">Current: 99.98%</span>
          </div>
        </div>

        {/* Glowing Spline Chart (Uptime & Server Latency) */}
        <div className="lg:col-span-8 glass-card p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Time-Series Telemetry & Latency</h3>
              <span className="text-[10px] text-slate-400 font-mono">Real-time p95 response time (milliseconds) across all ingress routes</span>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-obsidian-900 border border-cyber-teal/20 text-slate-400 hover:text-cyber-mint transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyber-mint" : ""}`} />
            </button>
          </div>

          {telemetry?.time_series ? (
            <GlowingAreaChart
              data={telemetry.time_series}
              dataKey="latency"
              unit="ms"
              color="#2dd4bf"
              gradientId="cyanGlowTelemetry"
              height={190}
            />
          ) : (
            <div className="h-[190px] flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading telemetry stream...
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Hexagonal Cluster Node Health Grid */}
      <div className="glass-card p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Cluster Honeycomb Node Mesh</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-teal/15 text-cyber-mint border border-cyber-teal/30 font-mono">
                Dynatrace-Style Visualizer
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live server node topology. Green nodes indicate nominal health; amber represents elevated load; red indicates active incidents.
            </p>
          </div>
        </div>

        <ClusterHexGrid nodes={kpis?.cluster_nodes || []} />
      </div>

      {/* Row 4: Environment Pipelines & Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent CI/CD Pipelines */}
        <div className="lg:col-span-6 glass-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyber-mint" />
              Recent Pipeline Deployments
            </h3>
            <Link href="/deployments" className="text-xs text-cyber-teal hover:text-cyber-mint flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {deployments.map((dep) => (
              <div key={dep.id} className="p-3 rounded-2xl bg-obsidian-850/80 border border-cyber-teal/15 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{dep.version}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({dep.branch})</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        dep.status === "RUNNING"
                          ? "bg-cyber-teal/15 text-cyber-mint border border-cyber-teal/30 animate-pulse"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Commit: {dep.commit_hash} • {dep.triggered_by}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{dep.execution_time_seconds}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents & Triage */}
        <div className="lg:col-span-6 glass-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Incidents & Automated Self-Healing
            </h3>
            <Link href="/incidents" className="text-xs text-cyber-teal hover:text-cyber-mint flex items-center gap-1">
              <span>Triage Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-3 rounded-2xl bg-obsidian-850/80 border border-cyber-teal/15 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 truncate max-w-sm">{inc.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                      inc.status === "RESOLVED"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span>Severity: {inc.severity}</span>
                  <span>•</span>
                  <span>Root Cause: {inc.root_cause || "Analyzing telemetry"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
