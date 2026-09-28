"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  GitCommit,
  UserCheck,
  AlertTriangle,
  RotateCw,
  BookOpen,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { ProjectBriefing } from "../../lib/types";

export default function CatchUpPage() {
  const { workspace, currentUser, isHindsightLive, addNotification } = useWorkspace();
  const [briefing, setBriefing] = useState<ProjectBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBriefing = async () => {
    try {
      setLoading(true);
      const res = await api.getCatchUp("ws-demo-hackathon-2026");
      setBriefing(res.briefing);
    } catch (err: any) {
      console.warn("Failed to generate catch-up:", err);
      addNotification("error", "Briefing error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefing();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Instant Onboarding: Catch Me Up
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              30-Second Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant context briefing grounded in long-term memory for new teammates, returning members, and hackathon judges.
          </p>
        </div>

        <button
          onClick={loadBriefing}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Regenerate Briefing</span>
        </button>
      </div>

      {loading ? (
        <div className="vc-card p-12 text-center text-xs text-slate-400 space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <div className="font-semibold text-sm text-slate-200">
            Synthesizing 30-second onboarding briefing from memory...
          </div>
          <p className="text-slate-500 max-w-sm mx-auto">
            Aggregating latest decisions, task assignments, and blockers across Hindsight Cloud.
          </p>
        </div>
      ) : briefing ? (
        <div className="space-y-6">
          {/* Highlighted 30-Second Summary Card */}
          <div className="vc-card p-6 bg-gradient-to-r from-[#0f172a] via-[#161d33] to-[#0f172a] border-indigo-500/40 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 fill-current" />
              The 30-Second Executive Summary
            </div>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              "{briefing.summary_30s}"
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Engine: <strong className="text-indigo-300">{briefing.is_demo ? "Hindsight Demo Engine" : "Hindsight Cloud Live"}</strong>
              </span>
              <span>Updated: {new Date(briefing.generated_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Deep Dive Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Objective */}
            <div className="vc-card p-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1. Project Objective
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {briefing.project_objective}
              </p>
            </div>

            {/* Active Blockers */}
            <div className="vc-card p-5 space-y-2 border-amber-500/30 bg-amber-950/10">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                2. Current Blockers & Risks
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {briefing.current_blockers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Progress */}
            <div className="vc-card p-5 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3. Recent Progress Milestones
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {briefing.recent_progress.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Decisions */}
            <div className="vc-card p-5 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                4. Key Technical Decisions
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {briefing.key_decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400">§</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Task Ownership by Member */}
          <div className="vc-card p-5 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              5. Task Ownership & Team Distribution
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {briefing.task_ownership.map((owner) => (
                <div key={owner.owner} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{owner.owner}</span>
                    <span className="text-[10px] text-slate-400">{owner.role}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-indigo-300">{owner.active_tasks.length}</strong> active task(s)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-emerald-400">{owner.completed_tasks.length}</strong> completed
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Sources */}
          {briefing.sources && briefing.sources.length > 0 && (
            <div className="vc-card p-5 space-y-3 bg-[#0c1220]">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Underlying Grounded Sources ({briefing.sources.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {briefing.sources.map((src, i) => (
                  <div key={src.id || i} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                    <div className="font-semibold text-slate-200">{src.title}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">"{src.snippet}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
