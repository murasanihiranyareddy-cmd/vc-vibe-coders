import {
  Workspace, DashboardResponse, MemoryItem, DecisionItem,
  TaskItem, TaskEvent, MeetingItem, DocumentItem,
  ChatResponse, CatchUpResponse, InsightsResponse,
  ActivityEvent, IntegrationStatusItem, MemoryType, DecisionStatus,
  TaskStatus, TaskPriority, ActionItemExtracted
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string = "demo-token-judge";

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.token}`,
      ...(options.headers as Record<string, string> || {})
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const url = `${API_BASE_URL}${path}`;
    try {
      const resp = await fetch(url, { ...options, headers });
      if (!resp.ok) {
        let errorMsg = `HTTP ${resp.status} ${resp.statusText}`;
        try {
          const errData = await resp.json();
          errorMsg = errData.detail || errData.message || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }
      if (resp.status === 204) {
        return {} as T;
      }
      return await resp.json();
    } catch (err: any) {
      console.warn(`API call to ${path} failed:`, err.message);
      throw err;
    }
  }

  // Health & Integrations
  async getHealth() {
    return this.request<{ status: string; app: string; demo_mode: boolean }>("/health");
  }

  async getIntegrationsStatus() {
    return this.request<{
      integrations: IntegrationStatusItem[];
      overall_status: string;
      demo_mode_active: boolean;
    }>("/api/integrations/status");
  }

  async testHindsightConnection() {
    return this.request<{
      success: boolean;
      status_code?: number;
      message: string;
      bank_id?: string;
      memory_count?: number;
      latency_ms?: number;
      is_live: boolean;
    }>("/api/integrations/hindsight/test", { method: "POST" });
  }

  // Workspaces & Dashboard
  async getWorkspaces(): Promise<Workspace[]> {
    return this.request<Workspace[]>("/api/workspaces");
  }

  async getDashboard(workspaceId: string): Promise<DashboardResponse> {
    return this.request<DashboardResponse>(`/api/workspaces/${workspaceId}/dashboard`);
  }

  // Team Memory
  async getMemories(
    workspaceId: string,
    params?: { type?: MemoryType; tag?: string; contributor?: string; search?: string }
  ): Promise<MemoryItem[]> {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.tag) query.append("tag", params.tag);
    if (params?.contributor) query.append("contributor", params.contributor);
    if (params?.search) query.append("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<MemoryItem[]>(`/api/workspaces/${workspaceId}/memories${qs}`);
  }

  async createMemory(
    workspaceId: string,
    payload: { title: string; content: string; type?: MemoryType; tags?: string[]; source?: string }
  ): Promise<MemoryItem> {
    return this.request<MemoryItem>(`/api/workspaces/${workspaceId}/memories`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async updateMemory(
    workspaceId: string,
    memoryId: string,
    payload: { title?: string; content?: string; type?: MemoryType; tags?: string[] }
  ): Promise<MemoryItem> {
    return this.request<MemoryItem>(`/api/workspaces/${workspaceId}/memories/${memoryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }

  async deleteMemory(workspaceId: string, memoryId: string): Promise<void> {
    return this.request<void>(`/api/workspaces/${workspaceId}/memories/${memoryId}`, {
      method: "DELETE"
    });
  }

  async retryMemory(workspaceId: string, memoryId: string) {
    return this.request<{ memory_id: string; status: string; message: string }>(
      `/api/workspaces/${workspaceId}/memories/${memoryId}/retry`,
      { method: "POST" }
    );
  }

  // Ask VC (Chat)
  async askChat(
    workspaceId: string,
    payload: { query: string; project_id?: string; conversation_history?: any[] }
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/api/workspaces/${workspaceId}/chat`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  // Instant Catch-up Briefing
  async getCatchUp(workspaceId: string, projectId?: string): Promise<CatchUpResponse> {
    return this.request<CatchUpResponse>(`/api/workspaces/${workspaceId}/catch-up`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId })
    });
  }

  // Decisions
  async getDecisions(workspaceId: string, status?: DecisionStatus): Promise<DecisionItem[]> {
    const qs = status ? `?status=${status}` : "";
    return this.request<DecisionItem[]>(`/api/workspaces/${workspaceId}/decisions${qs}`);
  }

  async createDecision(
    workspaceId: string,
    payload: { title: string; rationale: string; alternatives?: string; status?: DecisionStatus; decision_date?: string }
  ): Promise<DecisionItem> {
    return this.request<DecisionItem>(`/api/workspaces/${workspaceId}/decisions`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async updateDecision(
    workspaceId: string,
    decisionId: string,
    payload: { title?: string; rationale?: string; alternatives?: string; status?: DecisionStatus }
  ): Promise<DecisionItem> {
    return this.request<DecisionItem>(`/api/workspaces/${workspaceId}/decisions/${decisionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }

  // Tasks & Ownership
  async getTasks(
    workspaceId: string,
    params?: { status?: TaskStatus; assignee?: string; priority?: TaskPriority }
  ): Promise<TaskItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.assignee) query.append("assignee", params.assignee);
    if (params?.priority) query.append("priority", params.priority);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<TaskItem[]>(`/api/workspaces/${workspaceId}/tasks${qs}`);
  }

  async createTask(
    workspaceId: string,
    payload: { title: string; description?: string; assignee?: string; status?: TaskStatus; priority?: TaskPriority; due_date?: string }
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/workspaces/${workspaceId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async updateTask(
    workspaceId: string,
    taskId: string,
    payload: { title?: string; description?: string; assignee?: string; status?: TaskStatus; priority?: TaskPriority; due_date?: string }
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }

  async getTaskHistory(workspaceId: string, taskId: string): Promise<TaskEvent[]> {
    return this.request<TaskEvent[]>(`/api/workspaces/${workspaceId}/tasks/${taskId}/history`);
  }

  // AI Meeting Notes
  async getMeetings(workspaceId: string): Promise<MeetingItem[]> {
    return this.request<MeetingItem[]>(`/api/workspaces/${workspaceId}/meetings`);
  }

  async createMeeting(
    workspaceId: string,
    payload: { title: string; transcript: string; participants?: string[]; meeting_date?: string }
  ): Promise<MeetingItem> {
    return this.request<MeetingItem>(`/api/workspaces/${workspaceId}/meetings`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async processMeeting(
    workspaceId: string,
    meetingId: string,
    payload: { confirmed_decisions: string[]; confirmed_tasks: ActionItemExtracted[] }
  ): Promise<{ success: boolean; decisions_created: number; tasks_created: number; message: string }> {
    return this.request<{ success: boolean; decisions_created: number; tasks_created: number; message: string }>(
      `/api/workspaces/${workspaceId}/meetings/${meetingId}/process`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  }

  // Knowledge Hub (Documents)
  async getDocuments(workspaceId: string): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>(`/api/workspaces/${workspaceId}/documents`);
  }

  async uploadDocument(workspaceId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>(`/api/workspaces/${workspaceId}/documents/upload`, {
      method: "POST",
      body: formData
    });
  }

  // Reflect & Insights
  async getInsights(workspaceId: string): Promise<InsightsResponse> {
    return this.request<InsightsResponse>(`/api/workspaces/${workspaceId}/insights`);
  }

  async refreshInsights(workspaceId: string): Promise<InsightsResponse> {
    return this.request<InsightsResponse>(`/api/workspaces/${workspaceId}/insights/refresh`, {
      method: "POST"
    });
  }

  // Activity Stream
  async getActivity(workspaceId: string): Promise<ActivityEvent[]> {
    return this.request<ActivityEvent[]>(`/api/workspaces/${workspaceId}/activity`);
  }
}

export const api = new ApiClient();
