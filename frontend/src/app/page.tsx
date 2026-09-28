"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  GitCommit,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Search,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useWorkspace } from "../components/WorkspaceContext";
import { api } from "../lib/api";
import { DashboardResponse, TaskStatus } from "../lib/types";

export default function CommandCenterPage() {
  const { workspace, currentUser, demoMode, isHindsightLive, addNotification } = useWorkspace();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard("ws-demo-hackathon-2026");
      setData(res);
    } catch (err: any) {
      console.warn("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = data?.stats || {
    memories_retained: 4,
    decisions_count: 3,
    open_tasks_count: 3,
    completed_tasks_count: 1,
    unresolved_blockers: 1,
    team_members_count: 4,
    retention_health: "optimal"
  };

  const totalTasks = stats.open_tasks_count + stats.completed_tasks_count;
  const taskProgressPct = totalTasks > 0 ? Math.round((stats.completed_tasks_count / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Hero Card */}
      <div className="vc-card p-6 relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#131b2e] to-[#0f172a] border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                Hack With Hyderabad 3.0
              </span>
              <span className="text-xs text-slate-400">
                • {currentUser.display_name} ({currentUser.role})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Persistent AI memory for your team. Every decision, task assignment, and meeting note is retained in long-term memory for instant recall.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/meetings"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Meeting</span>
            </Link>
            <Link
              href="/catch-up"
              className="px-4 py-2 rounded-xl bg-[#18233a] hover:bg-[#1f2e4d] border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>30s Catch Me Up</span>
            </Link>
          </div>
        </div>

        {/* Core Loop Indicator: RETAIN -> RECALL -> REFLECT */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-bold text-indigo-400 tracking-wider">STEP 1: RETAIN</div>
            <div className="text-slate-300 font-medium truncate mt-0.5">Auto-capture Decisions & Notes</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-bold text-purple-400 tracking-wider">STEP 2: RECALL</div>
            <div className="text-slate-300 font-medium truncate mt-0.5">Semantic Grounded Retrieval</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-bold text-emerald-400 tracking-wider">STEP 3: REFLECT</div>
            <div className="text-slate-300 font-medium truncate mt-0.5">Synthesis Without Hallucinations</div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Memories Retained */}
        <Link href="/memory" className="vc-card vc-card-interactive p-4 block">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Memories Retained</span>
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
            <span>{stats.memories_retained}</span>
            <span className="text-[11px] font-normal text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Synced
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {isHindsightLive ? "Hindsight Cloud Bank" : "Simulated Demo Bank"}
          </div>
        </Link>

        {/* Metric 2: Decisions */}
        <Link href="/decisions" className="vc-card vc-card-interactive p-4 block">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Decisions Logged</span>
            <GitCommit className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
            <span>{stats.decisions_count}</span>
            <span className="text-[11px] font-normal text-indigo-300">Accepted</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            With documented rationales
          </div>
        </Link>

        {/* Metric 3: Tasks & Completion */}
        <Link href="/tasks" className="vc-card vc-card-interactive p-4 block">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Tasks & Ownership</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
            <span>{stats.open_tasks_count}</span>
            <span className="text-xs font-normal text-slate-400">/ {totalTasks} open</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskProgressPct}%` }}
            />
          </div>
        </Link>

        {/* Metric 4: Active Blockers */}
        <Link href="/tasks?priority=urgent" className="vc-card vc-card-interactive p-4 block">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Active Blockers</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2 flex items-baseline gap-2">
            <span>{stats.unresolved_blockers}</span>
            <span className="text-[11px] font-normal text-amber-400/80">Pending action</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            Hindsight live bank test
          </div>
        </Link>
      </div>

      {/* Prominent Ask VC Search Bar */}
      <div className="vc-card p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border-indigo-500/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (quickQuery.trim()) {
              window.location.href = `/ask-vc?q=${encodeURIComponent(quickQuery)}`;
            }
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Ask VC anything: 'Who owns the frontend?', 'Why did we choose Firebase?'..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Query Memory</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 text-[11px]">Suggested questions:</span>
          {[
            "Who owns the frontend?",
            "Why did we choose Firebase?",
            "What are our current blockers?",
            "Summarize the last meeting."
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                window.location.href = `/ask-vc?q=${encodeURIComponent(q)}`;
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-700/60 transition-colors text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Recent Decisions & Tasks / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Decisions and Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Decisions */}
          <div className="vc-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-purple-400" />
                <h2 className="font-bold text-sm text-white">Recent Decisions</h2>
              </div>
              <Link
                href="/decisions"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                View timeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {(data?.recent_decisions || []).slice(0, 3).map((dec) => (
                <div key={dec.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100">{dec.title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {dec.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {dec.rationale}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-2">
                      <span>By {dec.contributor}</span>
                      <span>•</span>
                      <span>{dec.decision_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="vc-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm text-white">Active Tasks & Ownership</h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Kanban board <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {(data?.upcoming_tasks || []).slice(0, 4).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.priority === "urgent"
                          ? "bg-rose-500"
                          : task.priority === "high"
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate">{task.title}</div>
                      <div className="text-[10px] text-slate-400">
                        Assignee: <span className="text-indigo-300">{task.assignee || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-300 shrink-0">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream & Integration Status */}
        <div className="space-y-6">
          {/* Activity Stream */}
          <div className="vc-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h2 className="font-bold text-sm text-white">Activity Timeline</h2>
              </div>
            </div>

            <div className="space-y-3.5 mt-3">
              {(data?.recent_activity || []).slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-700/40 flex items-center justify-center font-bold text-[10px] text-indigo-300 shrink-0 mt-0.5">
                    {act.actor.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-200 font-semibold truncate">{act.title}</div>
                    {act.description && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{act.description}</div>
                    )}
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{act.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status Box */}
          <div className="vc-card p-5 bg-[#0b101c]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm text-white">System Diagnostics</h2>
              </div>
              <Link
                href="/settings"
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Configure
              </Link>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Hindsight Memory</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isHindsightLive ? "Cloud Live" : "Demo Engine"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Groq LLM</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Meeting Parser Ready
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Supabase DB</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
