"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareCode,
  BrainCircuit,
  GitCommit,
  CheckSquare,
  FileText,
  Sparkles,
  BarChart3,
  FolderLock,
  Settings,
  ShieldCheck,
  ChevronDown,
  Search,
  Bell,
  ExternalLink,
  Plus,
  Play,
  CheckCircle2,
  X,
  AlertCircle,
  Menu,
  Activity,
  Layers
} from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Command Center", href: "/", icon: LayoutDashboard },
  { label: "Ask VC", href: "/ask-vc", icon: MessageSquareCode, badge: "AI" },
  { label: "Team Memory", href: "/memory", icon: BrainCircuit },
  { label: "Decision Timeline", href: "/decisions", icon: GitCommit },
  { label: "Tasks & Ownership", href: "/tasks", icon: CheckSquare },
  { label: "AI Meeting Notes", href: "/meetings", icon: FileText },
  { label: "Instant Catch-up", href: "/catch-up", icon: Sparkles, badge: "30s" },
  { label: "Reflect & Insights", href: "/insights", icon: BarChart3 },
  { label: "Knowledge Hub", href: "/documents", icon: FolderLock },
  { label: "Team Settings", href: "/settings", icon: Settings },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const {
    workspace,
    currentUser,
    demoMode,
    isHindsightLive,
    activePersona,
    switchPersona,
    notifications,
    removeNotification
  } = useWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showJudgeBanner, setShowJudgeBanner] = useState(true);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${
              n.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                : n.type === "error"
                ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
                : n.type === "warning"
                ? "bg-amber-950/80 border-amber-500/40 text-amber-200"
                : "bg-indigo-950/80 border-indigo-500/40 text-indigo-200"
            }`}
          >
            {n.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : n.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              <div className="font-semibold">{n.title}</div>
              {n.message && <div className="text-xs opacity-80 mt-0.5">{n.message}</div>}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Judge Walkthrough Quick Bar */}
      {showJudgeBanner && (
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-b border-indigo-800/40 px-4 py-2 text-xs flex items-center justify-between z-40">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1.5 shrink-0">
              <Play className="w-3 h-3 fill-current" />
              JUDGE WALKTHROUGH SCENARIO
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <div className="flex items-center gap-2 text-slate-300">
              <Link href="/meetings" className="hover:text-white underline decoration-indigo-400 shrink-0">1. Add Meeting Note</Link>
              <span className="text-slate-600">→</span>
              <Link href="/decisions" className="hover:text-white underline decoration-indigo-400 shrink-0">2. View Decision Timeline</Link>
              <span className="text-slate-600">→</span>
              <Link href="/ask-vc" className="hover:text-white underline decoration-indigo-400 shrink-0">3. Ask VC "Who owns frontend?"</Link>
              <span className="text-slate-600">→</span>
              <Link href="/catch-up" className="hover:text-white underline decoration-indigo-400 shrink-0">4. 30s Catch-Up</Link>
              <span className="text-slate-600">→</span>
              <Link href="/insights" className="hover:text-white underline decoration-indigo-400 shrink-0">5. Reflect & Insights</Link>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <Link
              href="/settings"
              className="text-indigo-300 hover:text-indigo-100 flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Live Health Check</span>
            </Link>
            <button
              onClick={() => setShowJudgeBanner(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0a0f1d] border-r border-[#1a2336] flex flex-col transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-[#1a2336] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-base shadow-glow group-hover:scale-105 transition-transform">
                VC
              </div>
              <div>
                <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                  Vibe Coders
                  <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    v3.0
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                  RETAIN • RECALL • REFLECT
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3 border-b border-[#1a2336]">
            <div className="px-3 py-2 bg-[#0f1627] rounded-lg border border-[#1e293b] flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                  H
                </div>
                <div className="truncate text-xs font-semibold text-slate-200">
                  {workspace?.name || "Hackathon Project"}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-glow"
                      : "text-slate-300 hover:bg-[#121b2f] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Persona / Profile Selector */}
          <div className="p-3 border-t border-[#1a2336] relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="w-full p-2 rounded-lg bg-[#0f1627] hover:bg-[#151f36] border border-[#1e293b] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"}
                  alt={currentUser.display_name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-500/40 shrink-0"
                />
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser.display_name}
                  </div>
                  <div className="text-[10px] text-indigo-300 truncate">
                    {currentUser.role.toUpperCase()} • {activePersona.toUpperCase()}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Persona Switcher Popup */}
            {showPersonaMenu && (
              <div className="absolute bottom-16 left-3 right-3 bg-[#11192e] border border-indigo-500/30 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch Demo Persona:
                </div>
                {[
                  { key: "judge", name: "Demo User (Judge)", role: "Lead Architect" },
                  { key: "aisha", name: "Aisha Patel", role: "Frontend Lead" },
                  { key: "rahul", name: "Rahul Sharma", role: "Backend Lead" },
                  { key: "kiran", name: "Kiran Rao", role: "QA & Documentation" }
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => {
                      switchPersona(p.key as any);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      activePersona === p.key
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-[#1a2542] text-slate-300"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-70">{p.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Header */}
          <header className="h-14 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-[#1a2336] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-[#0f1627] text-slate-300 hover:text-white border border-[#1e293b]"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-200 font-semibold">VC</span>
                <span>/</span>
                <span className="capitalize">{pathname === "/" ? "Command Center" : pathname.replace("/", "").replace("-", " ")}</span>
              </div>
            </div>

            {/* Right Header Status & Actions */}
            <div className="flex items-center gap-3">
              {/* Memory Engine Status Badge */}
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  isHindsightLive
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-indigo-950/60 border-indigo-500/40 text-indigo-300"
                }`}
                title={isHindsightLive ? "Connected to Hindsight Cloud API" : "Running offline Demo Memory Engine"}
              >
                <span className={`w-2 h-2 rounded-full ${isHindsightLive ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
                <span>{isHindsightLive ? "Hindsight Cloud Live" : "Demo Memory Mode"}</span>
              </div>

              {/* Quick Record Action */}
              <Link
                href="/meetings"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Record Meeting</span>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
