"use client";
import React, { useState, useEffect, useCallback } from "react";
import { fetchApplications, createApplication, deleteApplication } from "../../lib/api";
import {
  Boxes,
  Plus,
  Server,
  Cpu,
  Layers,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [envFilter, setEnvFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [clusterRegion, setClusterRegion] = useState("us-east-1 (N. Virginia)");
  const [replicaCount, setReplicaCount] = useState(3);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApplications(envFilter === "All" ? null : envFilter);
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [envFilter]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createApplication({
        name,
        key,
        description,
        environment,
        cluster_region: clusterRegion,
        replica_count: parseInt(replicaCount, 10),
      });
      setShowModal(false);
      setName("");
      setKey("");
      setDescription("");
      loadApps();
    } catch (err) {
      alert(err.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deregister this service?")) {
      await deleteApplication(id);
      loadApps();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Environment Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyber-mint" />
            Registered Applications & Environment Groups
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Microservice registry, cluster region assignments, and real-time pod orchestration status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Environment Filter */}
          <div className="flex items-center gap-1 bg-obsidian-900 p-1 rounded-xl border border-cyber-teal/20 text-xs font-mono">
            {["All", "Production", "Staging", "Dev"].map((env) => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  envFilter === env
                    ? "bg-cyber-mint text-obsidian-950 font-bold shadow-glow-mint"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Service</span>
          </button>
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="glass-card p-5 rounded-3xl space-y-4 relative group transition-all duration-300"
          >
            {/* Header: Name, Environment badge & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-cyber-mint font-bold block">{app.key}</span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">{app.name}</h3>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    app.status === "healthy"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {app.status}
                </span>
                <span
                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    app.environment === "Production"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : app.environment === "Staging"
                      ? "bg-cyber-teal/10 text-cyber-mint"
                      : "bg-purple-500/10 text-purple-400"
                  }`}
                >
                  {app.environment}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
              {app.description || "Microservice workload deployed to cluster."}
            </p>

            {/* Spec details */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-teal/10 text-xs font-mono">
              <div className="bg-obsidian-900/80 p-2 rounded-xl border border-cyber-teal/15">
                <span className="text-[10px] text-slate-500 block">Replicas</span>
                <span className="text-white font-bold">{app.replica_count} Pods Active</span>
              </div>
              <div className="bg-obsidian-900/80 p-2 rounded-xl border border-cyber-teal/15">
                <span className="text-[10px] text-slate-500 block">CPU Quota</span>
                <span className="text-cyber-mint font-bold">{app.cpu_limit}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cyber-teal/10 text-[11px] text-slate-500 font-mono">
              <span>Region: {app.cluster_region.split(" ")[0]}</span>
              <button
                onClick={() => handleDelete(app.id)}
                className="text-slate-500 hover:text-rose-400 transition"
                title="Deregister service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-cyber-teal/30 shadow-glow-teal relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Register New Microservice</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notifications Dispatcher"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Service Key</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. svc-notifications"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Service architectural summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Dev">Dev</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Replica Count</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={replicaCount}
                    onChange={(e) => setReplicaCount(e.target.value)}
                    className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyber-mint"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs shadow-glow-mint hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
