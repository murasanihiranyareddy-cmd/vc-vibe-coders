"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Plus,
  CheckCircle2,
  ListTodo,
  GitCommit,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCw,
  Users,
  CheckSquare
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { MeetingItem, StructuredMeetingData, ActionItemExtracted } from "../../lib/types";

export default function MeetingsPage() {
  const { workspace, currentUser, addNotification } = useWorkspace();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [participants, setParticipants] = useState("Aisha Patel, Rahul Sharma, Kiran Rao, Demo User");
  const [isProcessing, setIsProcessing] = useState(false);

  // Review & Confirmation Screen State
  const [activeMeetingForReview, setActiveMeetingForReview] = useState<MeetingItem | null>(null);
  const [confirmedDecisions, setConfirmedDecisions] = useState<string[]>([]);
  const [confirmedTasks, setConfirmedTasks] = useState<ActionItemExtracted[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMeetings("ws-demo-hackathon-2026");
      setMeetings(data);
    } catch (err: any) {
      console.warn("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleStructureMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !transcript.trim()) {
      addNotification("warning", "Missing fields", "Title and transcript/notes are required.");
      return;
    }

    setIsProcessing(true);
    try {
      const parts = participants.split(",").map((p) => p.trim()).filter(Boolean);
      const newMeeting = await api.createMeeting("ws-demo-hackathon-2026", {
        title,
        transcript,
        participants: parts
      });

      addNotification("success", "AI Structuring Complete", "Review extracted decisions and tasks before confirming.");
      
      // Open confirmation screen
      setActiveMeetingForReview(newMeeting);
      if (newMeeting.structured_data) {
        setConfirmedDecisions(newMeeting.structured_data.decisions || []);
        setConfirmedTasks(newMeeting.structured_data.action_items || []);
      }
      loadMeetings();
    } catch (err: any) {
      addNotification("error", "Structuring failed", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!activeMeetingForReview) return;

    setIsFinalizing(true);
    try {
      const res = await api.processMeeting("ws-demo-hackathon-2026", activeMeetingForReview.id, {
        confirmed_decisions: confirmedDecisions,
        confirmed_tasks: confirmedTasks
      });

      addNotification("success", "Meeting Processed & Retained", res.message);
      setActiveMeetingForReview(null);
      setTitle("");
      setTranscript("");
      loadMeetings();
    } catch (err: any) {
      addNotification("error", "Confirmation failed", err.message);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2336]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            AI Meeting Notes & Structuring
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Groq LLM Powered
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Paste rough notes or meeting transcripts. Groq structures summary, decisions, and action items with explicit confirmation before retention.
        </p>
      </div>

      {/* Confirmation Step Screen if Active */}
      {activeMeetingForReview ? (
        <div className="vc-card p-6 border-indigo-500/50 bg-gradient-to-b from-[#111a2e] to-[#0d1424] space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-500/30">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Step 2 of 2: Review & Explicit Confirmation
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {activeMeetingForReview.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveMeetingForReview(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Structured Summary */}
          {activeMeetingForReview.structured_data && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="font-bold text-indigo-300 block mb-1">Executive Summary:</span>
                <p className="text-slate-200 leading-relaxed">
                  {activeMeetingForReview.structured_data.summary}
                </p>
              </div>

              {/* Extracted Decisions to Confirm */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-300">
                  <GitCommit className="w-4 h-4" />
                  <span>Decisions to Log in Decision Timeline:</span>
                </div>
                {confirmedDecisions.length === 0 ? (
                  <div className="text-slate-500 italic">No decisions extracted.</div>
                ) : (
                  confirmedDecisions.map((dec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={dec}
                        onChange={(e) => {
                          const updated = [...confirmedDecisions];
                          updated[idx] = e.target.value;
                          setConfirmedDecisions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-800/40 text-xs text-slate-100"
                      />
                      <button
                        onClick={() => setConfirmedDecisions(confirmedDecisions.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Extracted Action Items to Confirm */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks to Create in Tasks & Ownership:</span>
                </div>
                {confirmedTasks.length === 0 ? (
                  <div className="text-slate-500 italic">No action items extracted.</div>
                ) : (
                  confirmedTasks.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) => {
                          const updated = [...confirmedTasks];
                          updated[idx].title = e.target.value;
                          setConfirmedTasks(updated);
                        }}
                        className="sm:col-span-7 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-800/40 text-xs text-slate-100"
                        placeholder="Task title"
                      />
                      <input
                        type="text"
                        value={t.assignee || ""}
                        onChange={(e) => {
                          const updated = [...confirmedTasks];
                          updated[idx].assignee = e.target.value;
                          setConfirmedTasks(updated);
                        }}
                        className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-800/40 text-xs text-slate-100"
                        placeholder="Assignee"
                      />
                      <button
                        onClick={() => setConfirmedTasks(confirmedTasks.filter((_, i) => i !== idx))}
                        className="sm:col-span-2 text-rose-400 hover:text-rose-300 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveMeetingForReview(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAndSave}
              disabled={isFinalizing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold shadow-glow flex items-center gap-2"
            >
              {isFinalizing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Retaining in Memory...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Retain in Memory</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Meeting Input Form */
        <div className="vc-card p-6 bg-[#0f172a] border-indigo-500/20">
          <form onSubmit={handleStructureMeeting} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Sprint Checkpoint: Frontend & Hindsight Live Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Participants
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Notes / Transcript *
              </label>
              <textarea
                rows={6}
                placeholder="Paste raw transcript, bullet notes, or discussion points. Example:&#10;Aisha: I finished the command center UI.&#10;Rahul: I will complete the Hindsight live API verification today.&#10;We agreed to deploy the frontend on Vercel and backend on Render."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                You will review extracted decisions and tasks before saving.
              </span>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold shadow-glow flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Structuring with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Structure Meeting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Past Recorded Meetings Feed */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Recorded Meetings History ({meetings.length})
        </h2>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading meeting history...</div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="vc-card p-4 bg-[#0f1729] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100">{m.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.meeting_date).toLocaleDateString()}
                  </span>
                </div>
                {m.summary && (
                  <p className="text-slate-300 leading-relaxed">{m.summary}</p>
                )}
                <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-800">
                  <span>Recorded by <strong>{m.created_by}</strong></span>
                  <span>•</span>
                  <span>Participants: {m.participants.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
