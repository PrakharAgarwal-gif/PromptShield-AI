"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  GitBranch,
  Activity,
  AlertTriangle,
  Zap,
  Settings,
  Shield,
  CloudLightning,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Boxes },
  { href: "/deployments", label: "Deployments", icon: GitBranch },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/recovery", label: "Self-Healing", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-cyber-teal/15 bg-obsidian-900/95 backdrop-blur-xl flex flex-col justify-between p-4 min-h-screen sticky top-0 z-40">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-mint to-cyan-600 flex items-center justify-center shadow-glow-mint">
            <CloudLightning className="w-6 h-6 text-obsidian-950" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              CloudOps <span className="text-cyber-mint font-extrabold">Sentinel</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">
              Autonomous DevOps
            </span>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="space-y-1.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 shadow-glow-mint font-bold"
                    : "text-slate-400 hover:text-cyber-mint hover:bg-obsidian-800/80 hover:border-cyber-teal/20"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-obsidian-950 stroke-[2.5]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cluster Status Footer Pill */}
      <div className="p-3 rounded-2xl bg-obsidian-850 border border-cyber-teal/20 shadow-inner-teal text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Cluster Mesh</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
        </div>
        <div className="text-slate-200 font-mono font-bold text-[11px]">k8s-prod-us-east-1</div>
        <div className="text-[10px] text-cyber-teal font-mono">12 Nodes • 64 Replicas</div>
      </div>
    </aside>
  );
}
