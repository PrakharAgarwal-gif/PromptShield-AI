"use client";
import React, { useState } from "react";
import { Settings, Shield, Bell, Cpu, Database, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [memoryThreshold, setMemoryThreshold] = useState(80);
  const [latencyThreshold, setLatencyThreshold] = useState(300);
  const [autoHeal, setAutoHeal] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyber-mint" />
          Platform Thresholds & Autonomous Guardrails
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure SLO violation metrics, automatic self-healing trigger limits, and notification destinations.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-6">
        {/* Trigger Sensitivity */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-4 pb-2 border-b border-cyber-teal/15 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyber-mint" />
            Anomaly Detection Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-obsidian-900 p-3 rounded-2xl border border-cyber-teal/15">
              <label className="text-[11px] text-slate-400 block mb-1">CPU High Alert Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={99}
                  value={cpuThreshold}
                  onChange={(e) => setCpuThreshold(e.target.value)}
                  className="bg-obsidian-950 border border-cyber-teal/30 rounded-xl px-3 py-1.5 text-xs text-cyber-mint font-bold font-mono w-20"
                />
                <span className="text-xs text-slate-400 font-mono">% utilization</span>
              </div>
            </div>

            <div className="bg-obsidian-900 p-3 rounded-2xl border border-cyber-teal/15">
              <label className="text-[11px] text-slate-400 block mb-1">RAM Alert Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={99}
                  value={memoryThreshold}
                  onChange={(e) => setMemoryThreshold(e.target.value)}
                  className="bg-obsidian-950 border border-cyber-teal/30 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold font-mono w-20"
                />
                <span className="text-xs text-slate-400 font-mono">% allocated</span>
              </div>
            </div>

            <div className="bg-obsidian-900 p-3 rounded-2xl border border-cyber-teal/15">
              <label className="text-[11px] text-slate-400 block mb-1">p99 Latency SLO</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={2000}
                  value={latencyThreshold}
                  onChange={(e) => setLatencyThreshold(e.target.value)}
                  className="bg-obsidian-950 border border-cyber-teal/30 rounded-xl px-3 py-1.5 text-xs text-cyber-mint font-bold font-mono w-24"
                />
                <span className="text-xs text-slate-400 font-mono">ms max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Autonomous Self-Healing Toggle */}
        <div className="pt-4 border-t border-cyber-teal/15">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Autonomous Self-Healing Dispatcher</span>
              <span className="text-[11px] text-slate-400 block">
                Automatically execute recovery playbooks when P1/P2 incidents trigger without requiring manual sign-off.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoHeal(!autoHeal)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                autoHeal ? "bg-cyber-mint shadow-glow-mint" : "bg-slate-800"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-obsidian-950 absolute top-1 transition-transform ${
                  autoHeal ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-cyber-teal/15">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint hover:opacity-95 transition flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Guardrails Saved" : "Save Thresholds"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
