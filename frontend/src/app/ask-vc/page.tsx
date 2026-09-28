"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  BrainCircuit,
  Info
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { ChatMessage, SourceCitation } from "../../lib/types";

const SUGGESTED_PROMPTS = [
  "Who owns the frontend?",
  "Why did we choose Firebase?",
  "What are our current blockers?",
  "Summarize the last meeting.",
  "Catch me up in 30 seconds.",
  "What database are we using for metadata?"
];

export default function AskVcPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Ask VC...</div>}>
      <AskVcContent />
    </Suspense>
  );
}

function AskVcContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { workspace, currentUser, isHindsightLive, addNotification } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: (
        "Hello! I am **VC AI**, grounded in your team's persistent long-term memory. " +
        "Ask me anything about past decisions, task ownership, meeting notes, or project blockers. " +
        "I will cite the exact records and will never fabricate information."
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: isHindsightLive ? "Hindsight Cloud (Live Bank)" : "Hindsight Demo Memory Engine (Offline Simulated)",
      is_demo: !isHindsightLive
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, []);

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await api.askChat("ws-demo-hackathon-2026", {
        query: q,
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content }))
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: resp.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: resp.sources,
        confidence: resp.confidence,
        engine: resp.engine,
        is_demo: resp.is_demo
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `Error retrieving memory: ${err.message || "Failed to reach memory engine."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        role: "assistant",
        content: "Conversation history cleared. What would you like to recall from project memory?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: isHindsightLive ? "Hindsight Cloud (Live Bank)" : "Hindsight Demo Memory Engine",
        is_demo: !isHindsightLive
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a2336] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquareCode className="w-5 h-5 text-indigo-400" />
              Ask VC
            </h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                isHindsightLive
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {isHindsightLive ? "Hindsight Cloud Live" : "Demo Memory Engine"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query your project's decisions, meetings, and task ownership without hallucinations.
          </p>
        </div>

        <button
          onClick={clearChat}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
        <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Quick Ask:
        </span>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1 rounded-full bg-[#0e1626] hover:bg-indigo-950/80 border border-[#1d2a42] hover:border-indigo-500/40 text-xs text-slate-300 hover:text-indigo-200 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-[#162035] border border-indigo-500/40 text-indigo-300"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-glow"
                  : "vc-card bg-[#0f1729] text-slate-100 rounded-tl-none border-indigo-500/20"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800/60">
                <span className="font-semibold text-slate-300">
                  {msg.role === "user" ? currentUser.display_name : "VC Memory"}
                </span>
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-white p-0.5"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Text */}
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Engine Badge */}
              {msg.engine && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" /> Engine: {msg.engine}
                  </span>
                  {msg.confidence !== undefined && (
                    <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                  )}
                </div>
              )}

              {/* Grounded Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Grounded Memory Sources ({msg.sources.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, idx) => (
                      <div
                        key={src.id || idx}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-200 truncate">{src.title}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                            {src.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          "{src.snippet}"
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
                          <span>{src.contributor || "Team Member"}</span>
                          <span>{src.date || "Recent"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#162035] border border-indigo-500/40 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="vc-card p-4 rounded-2xl rounded-tl-none bg-[#0f1729] border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Querying long-term memory bank and synthesizing grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-[#1a2336] mt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything about team memory (e.g., 'Why did we choose Firebase?', 'Who owns the frontend?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#0e1626] border border-[#1e2a42] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
