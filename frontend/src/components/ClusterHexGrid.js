"use client";
import React, { useState } from "react";
import { Server, Activity, X, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export default function ClusterHexGrid({ nodes = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return {
          fill: "fill-emerald-500/20",
          stroke: "stroke-emerald-400",
          glow: "drop-shadow(0 0 8px rgba(16,185,129,0.4))",
          badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      case "warning":
        return {
          fill: "fill-amber-500/25",
          stroke: "stroke-amber-400",
          glow: "drop-shadow(0 0 8px rgba(245,158,11,0.5))",
          badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
      case "critical":
        return {
          fill: "fill-rose-500/30",
          stroke: "stroke-rose-500",
          glow: "drop-shadow(0 0 10px rgba(239,68,68,0.7))",
          badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        };
      default:
        return {
          fill: "fill-slate-800/40",
          stroke: "stroke-slate-700",
          glow: "none",
          badge: "bg-slate-800 text-slate-400 border-slate-700",
        };
    }
  };

  return (
    <div className="relative">
      {/* Honeycomb Hexagonal Map Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-2">
        {nodes.map((node) => {
          const style = getStatusColor(node.status);
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`group cursor-pointer relative p-3 rounded-2xl border transition-all duration-300 bg-obsidian-850/80 backdrop-blur-md flex flex-col items-center justify-center text-center ${
                isSelected
                  ? "border-cyber-mint shadow-glow-mint bg-obsidian-800"
                  : "border-cyber-teal/15 hover:border-cyber-teal/40 hover:bg-obsidian-800/90"
              }`}
            >
              {/* Hexagon SVG Icon */}
              <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-300 group-hover:scale-105" style={{ filter: style.glow }}>
                  <polygon
                    points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25"
                    className={`${style.fill} ${style.stroke} transition-colors`}
                    strokeWidth="4"
                  />
                </svg>
                <Server className="w-5 h-5 text-slate-200 absolute" />
              </div>

              {/* Node Label */}
              <span className="text-[11px] font-mono font-semibold text-slate-200 truncate w-full px-1">
                {node.name.replace("k8s-", "")}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">{node.region}</span>

              {/* Mini metric bar */}
              <div className="w-full bg-slate-900/80 h-1 rounded-full mt-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${
                    node.status === "critical"
                      ? "bg-rose-500"
                      : node.status === "warning"
                      ? "bg-amber-400"
                      : "bg-cyber-teal"
                  }`}
                  style={{ width: `${node.cpu_load}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-2xl bg-obsidian-800/95 border border-cyber-teal/30 shadow-glow-teal backdrop-blur-xl relative">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-cyber-mint transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-teal/15 border border-cyber-teal/30 flex items-center justify-center">
                <Server className="w-5 h-5 text-cyber-mint" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-mono">{selectedNode.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(selectedNode.status).badge}`}>
                    {selectedNode.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Region: {selectedNode.region} • Node Uptime: {selectedNode.uptime}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="bg-obsidian-900/90 p-2 rounded-xl border border-cyber-teal/15">
                <span className="text-slate-400 block text-[10px]">CPU Load</span>
                <span className="text-cyber-mint font-bold">{selectedNode.cpu_load}%</span>
              </div>
              <div className="bg-obsidian-900/90 p-2 rounded-xl border border-cyber-teal/15">
                <span className="text-slate-400 block text-[10px]">RAM Load</span>
                <span className="text-amber-400 font-bold">{selectedNode.ram_load}%</span>
              </div>
              <div className="bg-obsidian-900/90 p-2 rounded-xl border border-cyber-teal/15">
                <span className="text-slate-400 block text-[10px]">Running Pods</span>
                <span className="text-emerald-400 font-bold">{selectedNode.pods_running}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
