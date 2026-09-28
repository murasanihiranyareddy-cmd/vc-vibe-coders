"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Sparkles,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { InsightsResponse } from "../../lib/types";

export default function InsightsPage() {
  const { workspace, currentUser, isHindsightLive, addNotification } = useWorkspace();
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getInsights("ws-demo-hackathon-2026");
      setData(res);
    } catch (err: any) {
      console.warn("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.refreshInsights("ws-demo-hackathon-2026");
      setData(res);
      addNotification("success", "Insights Refreshed", "Re-analyzed memory graph and generated updated metrics.");
    } catch (err: any) {
      addNotification("error", "Refresh failed", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Reflect & Insights
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Memory Graph Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesis across tasks, discussions, and decisions with explainable evidence citations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Analyzing..." : "Refresh Insights"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          <BarChart3 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
          Analyzing project memory graph and task distribution...
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="vc-card p-4">
              <span className="text-xs text-slate-400 font-medium">Task Completion Rate</span>
              <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
                <span>{data.task_completion_rate}%</span>
                <span className="text-xs text-emerald-400 font-normal">Active Sprint</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${data.task_completion_rate}%` }}
                />
              </div>
            </div>

            <div className="vc-card p-4">
              <span className="text-xs text-slate-400 font-medium">Open Blockers</span>
              <div className="text-2xl font-black text-amber-300 mt-2 flex items-baseline gap-2">
                <span>{data.open_blockers_count}</span>
                <span className="text-xs text-amber-400/80 font-normal">Requires Action</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Hindsight live API bank validation</p>
            </div>

            <div className="vc-card p-4">
              <span className="text-xs text-slate-400 font-medium">Unresolved Decisions</span>
              <div className="text-2xl font-black text-indigo-300 mt-2 flex items-baseline gap-2">
                <span>{data.unresolved_decisions_count}</span>
                <span className="text-xs text-emerald-400 font-normal">All Decisions Settled</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">100% of recorded decisions accepted</p>
            </div>
          </div>

          {/* Evidence-Backed Insight Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Evidence-Backed AI Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.insights.map((ins) => (
                <div
                  key={ins.id}
                  className={`vc-card p-4 rounded-xl border flex flex-col justify-between ${
                    ins.impact === "positive"
                      ? "border-emerald-500/30 bg-[#0d1624]"
                      : ins.impact === "warning"
                      ? "border-amber-500/30 bg-[#161320]"
                      : "border-indigo-500/30 bg-[#0f172a]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {ins.category}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          ins.impact === "positive"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {ins.impact}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-white mb-1.5">{ins.title}</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      {ins.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    {ins.actionable_recommendation && (
                      <div className="text-[11px] text-indigo-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <strong>Action:</strong> {ins.actionable_recommendation}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500">
                      Evidence: {ins.evidence_sources.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Workload Breakdown */}
          <div className="vc-card p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-indigo-400" />
              Team Workload & Task Distribution
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.workload.map((w) => (
                <div key={w.member_name} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-200 truncate">{w.member_name}</div>
                  <div className="text-2xl font-black text-white">{w.task_count} <span className="text-[10px] font-normal text-slate-400">task(s)</span></div>
                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <strong className="text-emerald-400">{w.completed_count}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <strong className="text-indigo-400">{w.in_progress_count}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue:</span>
                      <strong className="text-rose-400">{w.overdue_count}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Signals */}
          <div className="vc-card p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Repeated Discussion Signals
            </h2>

            <div className="space-y-3">
              {data.discussion_signals.map((sig, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{sig.topic}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                        Mentioned {sig.frequency}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{sig.context}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {sig.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{sig.last_mentioned}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
