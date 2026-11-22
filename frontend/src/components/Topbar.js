"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { simulateAnomalySpike } from "../lib/api";
import {
  Flame,
  CheckCircle,
  LogOut,
  User,
  ShieldCheck,
  RefreshCw,
  Bell,
} from "lucide-react";

export default function Topbar({ onAnomalyTriggered }) {
  const { user, logout } = useAuth();
  const [simulating, setSimulating] = useState(false);
  const [anomalyBanner, setAnomalyBanner] = useState(null);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await simulateAnomalySpike();
      setAnomalyBanner(res);
      if (onAnomalyTriggered) onAnomalyTriggered(res);
      setTimeout(() => setAnomalyBanner(null), 8000);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <header className="border-b border-cyber-teal/15 bg-obsidian-900/90 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Title */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-wide">
          CloudOps Sentinel — <span className="text-cyber-mint font-semibold">Cloud Management & Monitoring Services</span>
        </h2>
        <p className="text-[11px] text-slate-400">
          Autonomous Infrastructure Observability, CI/CD Pipeline Telemetry & Self-Healing Engine
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global System Health Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span>99.98% System Nominal</span>
        </div>

        {/* SIMULATE ANOMALY DEMO BUTTON */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-amber-200 transition font-mono text-xs font-bold shadow-glow-amber disabled:opacity-50"
          title="Simulate load anomaly spike across microservices"
        >
          <Flame className={`w-3.5 h-3.5 text-amber-400 ${simulating ? "animate-bounce" : ""}`} />
          <span>{simulating ? "Injecting Spike..." : "Simulate Anomaly"}</span>
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-cyber-teal/15">
          <div className="w-8 h-8 rounded-xl bg-cyber-teal/15 border border-cyber-teal/30 flex items-center justify-center text-cyber-mint font-bold text-xs">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-slate-200 block leading-tight">{user?.full_name || "Alex Vance"}</span>
            <span className="text-[10px] text-slate-500 block leading-tight font-mono">{user?.role || "DevOps SRE"}</span>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
