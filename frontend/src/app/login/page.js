"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { loginUser, registerUser } from "../../lib/api";
import { CloudLightning, Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("admin@cloudops.io");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("Alex Vance");
  const [role, setRole] = useState("Lead SRE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerUser(email, password, fullName, role);
      } else {
        data = await loginUser(email, password);
      }
      login(data.user, data.access_token);
      router.push("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-obsidian-950">
      {/* Background radial cyber glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 shadow-glow-teal border border-cyber-teal/20">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-mint to-cyan-600 flex items-center justify-center shadow-glow-mint mb-4">
            <CloudLightning className="w-8 h-8 text-obsidian-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            CloudOps <span className="text-cyber-mint font-extrabold">Sentinel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? "Create DevOps Operator Account" : "Access DevOps Autonomous Command Center"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-mint font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cloudops.io"
                className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-mint font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-obsidian-900 border border-cyber-teal/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyber-mint font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyber-mint to-cyber-teal text-obsidian-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-mint hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? "Register Account" : "Authenticate Session"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials hint */}
        <div className="mt-6 pt-4 border-t border-cyber-teal/15 text-center">
          <div className="p-2.5 rounded-xl bg-obsidian-900/90 border border-cyber-teal/10 text-[11px] text-slate-400">
            <span className="text-cyber-mint font-bold block mb-0.5">Demo Credentials Available:</span>
            <span>admin@cloudops.io / admin123</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 text-xs text-cyber-teal hover:text-cyber-mint transition font-medium"
          >
            {isRegister ? "Already registered? Sign In" : "Need an account? Register as Operator"}
          </button>
        </div>
      </div>
    </div>
  );
}
