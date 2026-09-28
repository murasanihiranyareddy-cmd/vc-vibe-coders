"use client";

import React, { useState, useEffect } from "react";
import {
  FolderLock,
  UploadCloud,
  FileText,
  FileCode,
  File,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Search,
  BookOpen,
  Sparkles
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { DocumentItem } from "../../lib/types";

export default function DocumentsPage() {
  const { workspace, currentUser, addNotification } = useWorkspace();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments("ws-demo-hackathon-2026");
      setDocuments(data);
    } catch (err: any) {
      console.warn("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      addNotification("error", "File too large", "Maximum file size is 15MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadDocument("ws-demo-hackathon-2026", file);
      addNotification("success", "Document Ingested", res.message || "Document processed and retained into Hindsight.");
      loadDocuments();
    } catch (err: any) {
      addNotification("error", "Upload failed", err.message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2336]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-indigo-400" />
            Knowledge Hub
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            PDF • DOCX • PPTX • TXT
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload specifications, research papers, and slide decks. Text is automatically chunked and retained in long-term memory.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="vc-card p-6 border-dashed border-2 border-indigo-500/30 bg-[#0d1424] text-center hover:border-indigo-500 transition-colors">
        <label className="cursor-pointer flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-glow">
            {isUploading ? (
              <RotateCw className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {isUploading ? "Extracting Text & Retaining in Hindsight..." : "Click to Upload Document or Drag & Drop"}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports PDF, DOCX, PPTX, TXT, and Markdown (up to 15MB)
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.pptx,.txt,.md"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search documents by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Ingested Documents ({filteredDocs.length})
        </h2>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="vc-card p-8 text-center text-slate-400 text-xs">
            No documents uploaded yet. Upload a project PDF or design doc above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => {
              const isPdf = doc.filename.endsWith(".pdf");
              const isDocx = doc.filename.endsWith(".docx");

              return (
                <div key={doc.id} className="vc-card p-4 bg-[#0f1729] flex flex-col justify-between text-xs space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                          {isPdf ? <FileText className="w-4 h-4 text-rose-400" /> : isDocx ? <File className="w-4 h-4 text-blue-400" /> : <FileCode className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-100 truncate">{doc.filename}</div>
                          <div className="text-[10px] text-slate-500">
                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "120 KB"} • Uploaded by {doc.uploaded_by}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Extracted
                      </span>
                    </div>

                    {doc.extracted_preview && (
                      <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        "{doc.extracted_preview}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-indigo-300 font-medium">
                      {doc.chunk_count} semantic chunk(s) retained in Hindsight
                    </span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
