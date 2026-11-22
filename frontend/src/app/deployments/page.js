"use client";
import React, { useState, useEffect, useCallback } from "react";
import { fetchDeployments, fetchApplications, triggerDeployment } from "../../lib/api";
import {
  GitBranch,
  Play,
  CheckCircle,
  Clock,
  Terminal,
  X,
  RefreshCw,
  User,
  CheckCircle2,
} from "lucide-react";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [version, setVersion] = useState("v2.5.0");
  const [branch, setBranch] = useState("main");
  const [triggering, setTriggering] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [depsData, appsData] = await Promise.all([
        fetchDeployments(),
        fetchApplications(),
      ]);
      setDeployments(depsData);
      setApps(appsData);
      if (appsData.length > 0 && !selectedAppId) {
        setSelectedAppId(appsData[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedAppId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTrigger = async (e) => {
    e.preventDefault();
    setTriggering(true);
    try {
      await triggerDeployment({
        application_id: parseInt(selectedAppId, 10),
        version,
        branch,
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to trigger deployment");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyber-mint" />
            CI/CD Deployment Pipelines & Execution Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated canary releases, container digest verification, and zero-downtime rolling deploys.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint hover:opacity-95 transition"
        >
          <Play className="w-3.5 h-3.5 fill-obsidian-950" />
          <span>Trigger Pipeline</span>
        </button>
      </div>

      {/* Pipelines Table */}
      <div className="glass-card rounded-3xl p-5 border border-cyber-teal/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-teal/15 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Version</th>
                <th className="pb-3">Branch</th>
                <th className="pb-3">Commit Hash</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Triggered By</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-teal/10">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-obsidian-850/80 transition">
                  <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-mint" />
                    <span>{dep.version}</span>
                  </td>
                  <td className="py-3 text-slate-300">{dep.branch}</td>
                  <td className="py-3 text-cyber-teal">{dep.commit_hash}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 border ${
                        dep.status === "RUNNING"
                          ? "bg-cyber-teal/15 text-cyber-mint border-cyber-teal/30 animate-pulse"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{dep.triggered_by}</span>
                  </td>
                  <td className="py-3 text-slate-400">{dep.execution_time_seconds}s</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => setSelectedLogs(dep)}
                      className="px-2.5 py-1 rounded-lg bg-obsidian-900 border border-cyber-teal/20 text-slate-300 hover:text-cyber-mint hover:border-cyber-mint/40 transition flex items-center gap-1 ml-auto"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Logs</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-cyber-teal/30 shadow-glow-teal relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Trigger Pipeline Release</h3>

            <form onSubmit={handleTrigger} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Application Target</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.key})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Release Version Tag</label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Git Branch</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={triggering}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint hover:opacity-95 disabled:opacity-50"
                >
                  {triggering ? "Dispatching..." : "Launch Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Drawer Modal */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl p-6 rounded-3xl border border-cyber-teal/30 shadow-glow-teal relative">
            <button onClick={() => setSelectedLogs(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-cyber-mint" />
              <h3 className="text-sm font-bold text-white font-mono">
                Pipeline Logs: {selectedLogs.version} ({selectedLogs.commit_hash})
              </h3>
            </div>
            <pre className="p-4 rounded-2xl bg-obsidian-950 border border-cyber-teal/20 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {selectedLogs.logs || "No logs captured."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
