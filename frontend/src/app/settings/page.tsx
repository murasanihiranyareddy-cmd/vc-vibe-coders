"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  RotateCw,
  Users,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Database,
  Lock,
  Github,
  BrainCircuit,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { IntegrationStatusItem } from "../../lib/types";

export default function SettingsPage() {
  const { workspace, currentUser, addNotification, refreshWorkspaceData } = useWorkspace();
  const [integrations, setIntegrations] = useState<IntegrationStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingHindsight, setTestingHindsight] = useState(false);
  const [hindsightTestResult, setHindsightTestResult] = useState<any>(null);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrationsStatus();
      setIntegrations(res.integrations);
    } catch (err: any) {
      console.warn("Failed to load integrations status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTestHindsight = async () => {
    setTestingHindsight(true);
    try {
      const res = await api.testHindsightConnection();
      setHindsightTestResult(res);
      if (res.success) {
        addNotification("success", "Hindsight Connected", `Latency: ${res.latency_ms}ms, Bank ID: ${res.bank_id}`);
      } else {
        addNotification("warning", "Hindsight Test Result", res.message);
      }
      refreshWorkspaceData();
      loadIntegrations();
    } catch (err: any) {
      addNotification("error", "Test Failed", err.message);
    } finally {
      setTestingHindsight(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Team & Integration Settings
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Live System Diagnostics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure workspace details, manage team roles, and verify live third-party service connections.
          </p>
        </div>

        <button
          onClick={loadIntegrations}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#18233a] border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Workspace Details */}
      <div className="vc-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          Workspace Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 font-medium">Workspace Name:</span>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold">
              {workspace?.name || "Vibe Coders (Hack With Hyderabad)"}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-medium">Workspace ID:</span>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px]">
              {workspace?.id || "ws-demo-hackathon-2026"}
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="vc-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Active Team Members (4)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(workspace?.members || []).map((m) => (
            <div key={m.user_id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <img
                src={m.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"}
                alt={m.display_name}
                className="w-9 h-9 rounded-full object-cover border border-indigo-500/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-100 truncate">{m.display_name}</div>
                <div className="text-[11px] text-slate-400 truncate">{m.email}</div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase mt-0.5">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Diagnostics Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Integration Connectivity & Health
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {/* 1. Hindsight Cloud Card */}
          <div className="vc-card p-5 border-indigo-500/30 bg-[#0c1222] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Hindsight Cloud</h3>
                  <div className="text-[11px] text-slate-400">Authoritative Long-Term Semantic AI Memory Engine</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  POST /v1/default/banks/memories
                </span>
                <button
                  onClick={handleTestHindsight}
                  disabled={testingHindsight}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${testingHindsight ? "animate-spin" : ""}`} />
                  <span>{testingHindsight ? "Testing..." : "Test Connection"}</span>
                </button>
              </div>
            </div>

            {/* Test Result Display */}
            {hindsightTestResult && (
              <div className={`p-3 rounded-xl text-xs border ${
                hindsightTestResult.success
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                  : "bg-slate-900/90 border-slate-700 text-slate-300"
              }`}>
                <div className="font-semibold">{hindsightTestResult.message}</div>
                {hindsightTestResult.latency_ms && (
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Latency: {hindsightTestResult.latency_ms}ms • Status Code: {hindsightTestResult.status_code || 200}
                  </div>
                )}
              </div>
            )}

            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span>Official Base URL:</span>
                <span className="font-mono text-indigo-300">https://api.hindsight.vectorize.io</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Configuration:</span>
                <span className="text-slate-300">Configured via HINDSIGHT_BANK_ID in backend/.env</span>
              </div>
            </div>
          </div>

          {/* 2. Groq LLM Card */}
          <div className="vc-card p-4 bg-[#0f1729] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Groq LLM Acceleration</div>
                <div className="text-[11px] text-slate-400">Meeting structuring, task extraction & reflection assist</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              llama-3.3-70b-versatile
            </span>
          </div>

          {/* 3. Supabase Database Card */}
          <div className="vc-card p-4 bg-[#0f1729] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Supabase PostgreSQL</div>
                <div className="text-[11px] text-slate-400">Metadata persistence, task audit history, and memory outbox</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Store
            </span>
          </div>

          {/* 4. Firebase Auth Card */}
          <div className="vc-card p-4 bg-[#0f1729] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Firebase Authentication</div>
                <div className="text-[11px] text-slate-400">Google & Email OAuth token verification</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              RBAC Enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
