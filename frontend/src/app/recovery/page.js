"use client";
import React, { useState, useEffect } from "react";
import { fetchPlaybooks, fetchRecoveryHistory, executeRecovery } from "../../lib/api";
import {
  Zap,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Layers,
  Flame,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function RecoveryPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [executing, setExecuting] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pbData, histData] = await Promise.all([
        fetchPlaybooks(),
        fetchRecoveryHistory(),
      ]);
      setPlaybooks(pbData);
      setHistory(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecute = async (playbookName) => {
    setExecuting(playbookName);
    try {
      await executeRecovery({
        playbook_name: playbookName,
        trigger_type: "MANUAL",
      });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to execute playbook");
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyber-mint" />
          Autonomous Self-Healing Engine & Automated Playbooks
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Self-repairing automation workflows that recover pods, scale workloads, and rollback bad deployments without human intervention.
        </p>
      </div>

      {/* Playbook Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {playbooks.map((pb) => (
          <div key={pb.id} className="glass-card p-5 rounded-3xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyber-teal/15 border border-cyber-teal/30 flex items-center justify-center text-cyber-mint mb-3 shadow-glow-teal">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white font-mono">{pb.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{pb.description}</p>
            </div>

            <div className="pt-2 border-t border-cyber-teal/10 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Target: {pb.target}</span>
                <span>~{pb.estimated_duration}</span>
              </div>
              <button
                onClick={() => handleExecute(pb.name)}
                disabled={executing === pb.name}
                className="w-full py-2 rounded-xl bg-obsidian-900 border border-cyber-teal/30 hover:border-cyber-mint hover:text-cyber-mint text-slate-200 transition text-xs font-mono font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{executing === pb.name ? "Executing..." : "Run Playbook"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recovery History Audit Trail */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-teal/15 pb-3">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Self-Healing Execution Audit Trail
          </h3>
          <button
            onClick={loadData}
            className="p-1 rounded-lg text-slate-400 hover:text-cyber-mint transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyber-mint" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-teal/15 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 pl-2">Playbook</th>
                <th className="pb-3">Trigger Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Details</th>
                <th className="pb-3 text-right pr-2">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-teal/10">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-obsidian-850/80 transition">
                  <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-mint" />
                    <span>{h.playbook_name}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        h.trigger_type === "AUTOMATED"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : "bg-cyber-teal/15 text-cyber-mint border-cyber-teal/30"
                      }`}
                    >
                      {h.trigger_type}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 truncate max-w-sm">{h.details}</td>
                  <td className="py-3 text-right pr-2 text-slate-500 text-[11px]">
                    {new Date(h.executed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
