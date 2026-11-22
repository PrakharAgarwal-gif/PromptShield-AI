"use client";
import React, { useState, useEffect, useCallback } from "react";
import { fetchIncidents, updateIncidentStatus, executeRecovery } from "../../lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchIncidents(filter === "ALL" ? null : filter);
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleStatus = async (id, newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      loadIncidents();
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleSelfHeal = async (inc) => {
    setActionInProgress(inc.id);
    try {
      await executeRecovery({
        incident_id: inc.id,
        application_id: inc.application_id,
        playbook_name: "Horizontal Pod Autoscaler (HPA +2)",
        trigger_type: "MANUAL",
      });
      loadIncidents();
    } catch (err) {
      alert(err.message || "Recovery trigger failed");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Incident Detection & Triage Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated anomaly threshold breaches, root-cause diagnostics, and targeted self-healing playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-obsidian-900 p-1 rounded-xl border border-cyber-teal/20 text-xs font-mono">
          {["ALL", "OPEN", "INVESTIGATING", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filter === st
                  ? "bg-amber-400 text-obsidian-950 font-bold shadow-glow-amber"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 font-mono text-xs rounded-3xl">
            No incidents found in this category. System healthy.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              className={`glass-card p-5 rounded-3xl space-y-4 border ${
                inc.status === "OPEN"
                  ? "border-rose-500/40 shadow-glow-red"
                  : inc.status === "INVESTIGATING"
                  ? "border-amber-500/30 shadow-glow-amber"
                  : "border-cyber-teal/15"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      inc.severity === "P1-Critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{inc.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {inc.severity}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Detected: {new Date(inc.detected_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      inc.status === "RESOLVED"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : inc.status === "INVESTIGATING"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-obsidian-900/90 p-3 rounded-2xl border border-cyber-teal/10">
                {inc.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-cyber-teal/10 text-xs font-mono">
                <div className="text-slate-400 text-[11px]">
                  <span className="text-slate-500">Root Cause:</span> {inc.root_cause || "Telemetry diagnosis running"}
                </div>

                <div className="flex items-center gap-2">
                  {inc.status !== "RESOLVED" && (
                    <>
                      <button
                        onClick={() => handleSelfHeal(inc)}
                        disabled={actionInProgress === inc.id}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint flex items-center gap-1.5 hover:opacity-95 transition disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 fill-obsidian-950" />
                        <span>{actionInProgress === inc.id ? "Healing..." : "Run Self-Healing"}</span>
                      </button>

                      <button
                        onClick={() => handleStatus(inc.id, "RESOLVED")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition text-xs font-semibold"
                      >
                        Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
