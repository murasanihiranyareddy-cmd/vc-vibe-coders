"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Columns,
  List as ListIcon,
  Clock,
  AlertTriangle,
  History,
  X,
  UserCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";
import { api } from "../../lib/api";
import { TaskItem, TaskEvent, TaskStatus, TaskPriority } from "../../lib/types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "border-slate-700 text-slate-300" },
  { id: "in_progress", label: "In Progress", color: "border-indigo-500 text-indigo-400" },
  { id: "review", label: "In Review", color: "border-purple-500 text-purple-400" },
  { id: "done", label: "Done", color: "border-emerald-500 text-emerald-400" }
];

export default function TasksOwnershipPage() {
  const { workspace, currentUser, addNotification } = useWorkspace();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // History Modal
  const [selectedTaskHistory, setSelectedTaskHistory] = useState<TaskItem | null>(null);
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAssignee, setModalAssignee] = useState("Aisha Patel");
  const [modalPriority, setModalPriority] = useState<TaskPriority>("medium");
  const [modalStatus, setModalStatus] = useState<TaskStatus>("todo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (assigneeFilter !== "ALL") params.assignee = assigneeFilter;
      if (priorityFilter !== "ALL") params.priority = priorityFilter;

      const data = await api.getTasks("ws-demo-hackathon-2026", params);
      setTasks(data);
    } catch (err: any) {
      console.warn("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [assigneeFilter, priorityFilter]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.updateTask("ws-demo-hackathon-2026", taskId, { status: newStatus });
      addNotification("info", "Task Updated", `Status changed to ${newStatus.replace("_", " ")}`);
      loadTasks();
    } catch (err: any) {
      addNotification("error", "Update failed", err.message);
    }
  };

  const handleReassign = async (taskId: string, newAssignee: string) => {
    try {
      await api.updateTask("ws-demo-hackathon-2026", taskId, { assignee: newAssignee });
      addNotification("success", "Task Reassigned", `Reassigned to ${newAssignee}`);
      loadTasks();
    } catch (err: any) {
      addNotification("error", "Reassignment failed", err.message);
    }
  };

  const handleViewHistory = async (task: TaskItem) => {
    setSelectedTaskHistory(task);
    setHistoryLoading(true);
    try {
      const history = await api.getTaskHistory("ws-demo-hackathon-2026", task.id);
      setTaskEvents(history);
    } catch (err: any) {
      addNotification("error", "History error", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      addNotification("warning", "Missing title", "Task title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createTask("ws-demo-hackathon-2026", {
        title: modalTitle,
        description: modalDesc || undefined,
        assignee: modalAssignee || undefined,
        status: modalStatus,
        priority: modalPriority
      });

      addNotification("success", "Task Created", `Created: "${created.title}"`);
      setShowAddModal(false);
      setModalTitle("");
      setModalDesc("");
      loadTasks();
    } catch (err: any) {
      addNotification("error", "Creation failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    "Aisha Patel",
    "Rahul Sharma",
    "Kiran Rao",
    "Demo User"
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a2336]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              Tasks & Ownership
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {tasks.length} total task(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full accountability and audit timeline for task assignments and ownership transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="p-1 bg-[#0f172a] rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                viewMode === "kanban" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Kanban Board"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-emerald transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Assignee:</span>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Team Members</option>
            {teamMembers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="vc-card bg-[#0b101c]/80 border-slate-800 flex flex-col min-h-[500px] p-3.5"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 border-b border-slate-800 ${col.color}`}>
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 mt-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const isUrgent = task.priority === "urgent";
                    const isHigh = task.priority === "high";

                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-[#101728] border border-[#1e2a42] hover:border-indigo-500/50 transition-all text-xs space-y-2.5 shadow-sm"
                      >
                        {/* Priority Badge & History Trigger */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                              isUrgent
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isHigh
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {task.priority}
                          </span>

                          <button
                            onClick={() => handleViewHistory(task)}
                            className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                            title="View Ownership Audit Timeline"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title */}
                        <div className="font-semibold text-slate-100 leading-snug">
                          {task.title}
                        </div>

                        {task.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-2">
                            {task.description}
                          </div>
                        )}

                        {/* Assignee Selection & Move Column */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          {/* Reassign select */}
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[10px]">Owner:</span>
                            <select
                              value={task.assignee || "Unassigned"}
                              onChange={(e) => handleReassign(task.id, e.target.value)}
                              className="bg-transparent text-indigo-300 font-semibold cursor-pointer focus:outline-none"
                            >
                              <option value="Unassigned" className="bg-slate-900 text-slate-300">Unassigned</option>
                              {teamMembers.map((m) => (
                                <option key={m} value={m} className="bg-slate-900 text-slate-200">{m}</option>
                              ))}
                            </select>
                          </div>

                          {/* Move column quick button */}
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-800 cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="vc-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="p-3.5">Task Title</th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-100 max-w-sm">
                    {task.title}
                  </td>
                  <td className="p-3.5">
                    <span className="text-indigo-300 font-medium">
                      {task.assignee || "Unassigned"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-800 text-slate-300">
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-slate-300 capitalize font-medium">{task.priority}</span>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleViewHistory(task)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Events</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Ownership Audit Timeline Modal */}
      {selectedTaskHistory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="vc-card bg-[#0e1628] border-indigo-500/40 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  Ownership & Status Audit Log
                </h2>
                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                  {selectedTaskHistory.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskHistory(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyLoading ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading audit history...</div>
              ) : taskEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No status changes recorded yet.</div>
              ) : (
                taskEvents.map((evt, i) => (
                  <div key={evt.id || i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                      <span className="font-semibold text-indigo-300">Action by: {evt.actor}</span>
                      <span>{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200">
                      {evt.previous_owner !== evt.new_owner && (
                        <div>
                          Owner changed: <span className="line-through text-slate-500">{evt.previous_owner || "None"}</span> → <strong className="text-emerald-300">{evt.new_owner}</strong>
                        </div>
                      )}
                      {evt.previous_status !== evt.new_status && (
                        <div>
                          Status changed: <span className="text-slate-400">{evt.previous_status}</span> → <strong className="text-indigo-300">{evt.new_status}</strong>
                        </div>
                      )}
                    </div>
                    {evt.notes && <div className="text-[11px] text-slate-400 mt-1 italic">{evt.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="vc-card bg-[#0e1628] border-emerald-500/40 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Create New Task
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Implement Hindsight Memory Outbox"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details and acceptance criteria..."
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={modalAssignee}
                    onChange={(e) => setModalAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent (Blocker)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
