"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Search,
  Filter,
  Plus,
  Tag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Trash2,
  X,
  Sparkles,
  Layers,
  FileText,
  GitCommit,
  CheckSquare
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { MemoryItem, MemoryType, IngestionStatus } from "../../lib/types";

export default function TeamMemoryPage() {
  const { workspace, currentUser, isHindsightLive, addNotification } = useWorkspace();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Add Memory Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalType, setModalType] = useState<MemoryType>("General");
  const [modalTags, setModalTags] = useState("hackathon, sync");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedType !== "ALL") params.type = selectedType;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedTag) params.tag = selectedTag;

      const data = await api.getMemories("ws-demo-hackathon-2026", params);
      setMemories(data);
    } catch (err: any) {
      console.warn("Failed to load memories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [selectedType, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMemories();
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalContent.trim()) {
      addNotification("warning", "Missing fields", "Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = modalTags.split(",").map((t) => t.trim()).filter(Boolean);
      const created = await api.createMemory("ws-demo-hackathon-2026", {
        title: modalTitle,
        content: modalContent,
        type: modalType,
        tags: tagsArray,
        source: "manual"
      });

      addNotification("success", "Memory Retained", `Retained: "${created.title}" in long-term memory`);
      setShowAddModal(false);
      setModalTitle("");
      setModalContent("");
      loadMemories();
    } catch (err: any) {
      addNotification("error", "Retention failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryIngestion = async (memId: string) => {
    try {
      const res = await api.retryMemory("ws-demo-hackathon-2026", memId);
      addNotification("success", "Ingestion Synced", res.message);
      loadMemories();
    } catch (err: any) {
      addNotification("error", "Retry failed", err.message);
    }
  };

  const handleDeleteMemory = async (memId: string) => {
    if (!confirm("Are you sure you want to delete this memory record?")) return;
    try {
      await api.deleteMemory("ws-demo-hackathon-2026", memId);
      addNotification("info", "Memory Deleted", "Record removed from project memory.");
      loadMemories();
    } catch (err: any) {
      addNotification("error", "Delete failed", err.message);
    }
  };

  const allTags = Array.from(new Set(memories.flatMap((m) => m.tags)));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Team Memory Bank
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {memories.length} item(s) retained
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable collective knowledge graph with automatic Hindsight Cloud semantic ingestion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search memory records by title, content, or decision..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#1a2540] hover:bg-indigo-600 text-xs text-slate-200 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["ALL", "Meeting", "Decision", "Task", "Update", "Document"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setSelectedTag(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-[#0f172a] hover:bg-[#18233a] text-slate-300 border border-[#1e293b]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> Filter by Tag:
          </span>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] flex items-center gap-1"
            >
              Clear tag filter <X className="w-3 h-3" />
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-colors shrink-0 ${
                selectedTag === tag
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Memories Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          <BrainCircuit className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
          Loading project memory bank...
        </div>
      ) : memories.length === 0 ? (
        <div className="vc-card p-12 text-center text-slate-400">
          <BrainCircuit className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-200">No memory records found</div>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or type filter, or add a new memory record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => {
            const isRetained = mem.ingestion_status === "retained";
            const isFailed = mem.ingestion_status === "failed";

            return (
              <div
                key={mem.id}
                className="vc-card p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          mem.type === "Meeting"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : mem.type === "Decision"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : mem.type === "Task"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {mem.type}
                      </span>

                      {/* Ingestion Status Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
                          isRetained
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : isFailed
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {isRetained ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Retained
                          </>
                        ) : isFailed ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-400" /> Sync Failed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" /> Ingestion Pending
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Content */}
                  <h3 className="font-bold text-sm text-slate-100 mt-3">{mem.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">
                    {mem.content}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {/* Tags */}
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {mem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      By <strong className="text-slate-400">{mem.contributor}</strong> •{" "}
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>

                    {isFailed && (
                      <button
                        onClick={() => handleRetryIngestion(mem.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" /> Retry Sync
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="vc-card bg-[#0e1628] border-indigo-500/40 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                Retain New Team Memory
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Auth Architecture Decision"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Memory Type
                  </label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as MemoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="Decision">Decision</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Task">Task</option>
                    <option value="Update">Update</option>
                    <option value="Document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="auth, firebase, security"
                    value={modalTags}
                    onChange={(e) => setModalTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content / Context *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed notes, rationale, context, or facts to persist in long-term memory..."
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  This memory will be stored in Supabase metadata and retained into Hindsight Cloud for grounded retrieval in "Ask VC".
                </span>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Retaining...</span>
                    </>
                  ) : (
                    <span>Retain Memory</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
