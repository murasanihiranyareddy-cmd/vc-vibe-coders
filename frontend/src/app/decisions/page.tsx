"use client";

import React, { useState, useEffect } from "react";
import {
  GitCommit,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { DecisionItem, DecisionStatus } from "../../lib/types";

export default function DecisionTimelinePage() {
  const { workspace, currentUser, addNotification } = useWorkspace();
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalRationale, setModalRationale] = useState("");
  const [modalAlternatives, setModalAlternatives] = useState("");
  const [modalStatus, setModalStatus] = useState<DecisionStatus>("accepted");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDecisions = async () => {
    try {
      setLoading(true);
      const statusParam = selectedStatus !== "ALL" ? (selectedStatus as DecisionStatus) : undefined;
      const data = await api.getDecisions("ws-demo-hackathon-2026", statusParam);
      setDecisions(data);
    } catch (err: any) {
      console.warn("Failed to load decisions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, [selectedStatus]);

  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalRationale.trim()) {
      addNotification("warning", "Missing fields", "Title and rationale are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createDecision("ws-demo-hackathon-2026", {
        title: modalTitle,
        rationale: modalRationale,
        alternatives: modalAlternatives || undefined,
        status: modalStatus
      });

      addNotification("success", "Decision Logged", `Recorded decision: "${created.title}"`);
      setShowAddModal(false);
      setModalTitle("");
      setModalRationale("");
      setModalAlternatives("");
      loadDecisions();
    } catch (err: any) {
      addNotification("error", "Error creating decision", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (decId: string, newStatus: DecisionStatus) => {
    try {
      await api.updateDecision("ws-demo-hackathon-2026", decId, { status: newStatus });
      addNotification("info", "Status Updated", `Decision status set to ${newStatus}`);
      loadDecisions();
    } catch (err: any) {
      addNotification("error", "Failed to update status", err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-purple-400" />
              Decision Timeline
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {decisions.length} decision(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every architectural and product choice preserved with clear rationales and evaluated alternatives.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-violet transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Decision</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "accepted", "proposed", "superseded", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
              selectedStatus === s
                ? "bg-purple-600 text-white font-semibold shadow-glow-violet"
                : "bg-[#0f172a] hover:bg-[#18233a] text-slate-300 border border-[#1e293b]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading decision timeline...
        </div>
      ) : decisions.length === 0 ? (
        <div className="vc-card p-12 text-center text-slate-400">
          <GitCommit className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-200">No decisions found</div>
          <p className="text-xs text-slate-500 mt-1">Log the first key decision for your project.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-purple-500/30 ml-4 sm:ml-6 pl-6 space-y-6">
          {decisions.map((dec, idx) => {
            const isAccepted = dec.status === "accepted";
            const isSuperseded = dec.status === "superseded";

            return (
              <div key={dec.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    isAccepted
                      ? "bg-purple-950 border-purple-500 text-purple-300 shadow-glow-violet"
                      : isSuperseded
                      ? "bg-slate-900 border-slate-600 text-slate-400"
                      : "bg-indigo-950 border-indigo-500 text-indigo-300"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Card Container */}
                <div className="vc-card p-5 bg-[#0f1729] hover:border-purple-500/40 transition-colors">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{dec.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{dec.decision_date}</span>
                      <select
                        value={dec.status}
                        onChange={(e) => handleStatusChange(dec.id, e.target.value as DecisionStatus)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border bg-transparent cursor-pointer ${
                          isAccepted
                            ? "bg-purple-950 text-purple-300 border-purple-700"
                            : isSuperseded
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-indigo-950 text-indigo-300 border-indigo-700"
                        }`}
                      >
                        <option value="accepted" className="bg-slate-900 text-slate-200">Accepted</option>
                        <option value="proposed" className="bg-slate-900 text-slate-200">Proposed</option>
                        <option value="superseded" className="bg-slate-900 text-slate-200">Superseded</option>
                        <option value="rejected" className="bg-slate-900 text-slate-200">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Rationale Body */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Rationale:</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                        {dec.rationale}
                      </p>
                    </div>

                    {dec.alternatives && (
                      <div className="pt-1">
                        <span className="text-slate-400 font-semibold block mb-0.5">
                          Alternatives Considered:
                        </span>
                        <p className="text-slate-400 italic bg-slate-900/30 p-2 rounded-lg border border-slate-800/50 text-[11px]">
                          {dec.alternatives}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Decided by <strong className="text-slate-300">{dec.contributor}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400 font-medium">
                      <LinkIcon className="w-3 h-3" /> Linked to Memory Bank
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Decision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="vc-card bg-[#0e1628] border-purple-500/40 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-purple-400" />
                Log Architectural Decision
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDecision} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Decision Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Use Supabase PostgreSQL for Metadata"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rationale & Why *
                </label>
                <textarea
                  rows={3}
                  placeholder="Why did the team make this choice? What problem does it solve?"
                  value={modalRationale}
                  onChange={(e) => setModalRationale(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alternatives Considered (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., MongoDB (rejected due to lack of rigid foreign keys)"
                  value={modalAlternatives}
                  onChange={(e) => setModalAlternatives(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-violet disabled:opacity-50"
                >
                  {isSubmitting ? "Logging..." : "Save Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
