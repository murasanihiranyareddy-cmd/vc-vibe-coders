export type MemoryType = "Meeting" | "Decision" | "Task" | "Update" | "Document" | "General";
export type IngestionStatus = "pending" | "retained" | "failed";
export type DecisionStatus = "proposed" | "accepted" | "superseded" | "rejected";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type DocumentUploadStatus = "uploaded" | "processing" | "extracted" | "failed";

export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  is_demo_user: boolean;
}

export interface WorkspaceMember {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  joined_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  members: WorkspaceMember[];
  is_demo: boolean;
}

export interface MemoryItem {
  id: string;
  workspace_id: string;
  project_id?: string;
  title: string;
  content: string;
  type: MemoryType;
  tags: string[];
  contributor: string;
  source: string;
  created_at: string;
  updated_at: string;
  ingestion_status: IngestionStatus;
  external_memory_id?: string;
  metadata?: Record<string, any>;
  is_demo: boolean;
}

export interface DecisionItem {
  id: string;
  workspace_id: string;
  project_id?: string;
  title: string;
  rationale: string;
  alternatives?: string;
  status: DecisionStatus;
  contributor: string;
  decision_date: string;
  linked_memory_id?: string;
  created_at: string;
  updated_at: string;
  is_demo: boolean;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  actor: string;
  previous_owner?: string;
  new_owner?: string;
  previous_status?: string;
  new_status?: string;
  timestamp: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  workspace_id: string;
  project_id?: string;
  title: string;
  description?: string;
  assignee?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_demo: boolean;
}

export interface ActionItemExtracted {
  title: string;
  assignee?: string;
  due_date?: string;
  priority?: "high" | "medium" | "low";
}

export interface StructuredMeetingData {
  summary: string;
  decisions: string[];
  action_items: ActionItemExtracted[];
  unresolved_questions: string[];
  tags: string[];
}

export interface MeetingItem {
  id: string;
  workspace_id: string;
  project_id?: string;
  title: string;
  transcript: string;
  summary?: string;
  structured_data?: StructuredMeetingData;
  participants: string[];
  meeting_date: string;
  created_by: string;
  created_at: string;
  is_demo: boolean;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  project_id?: string;
  filename: string;
  storage_path?: string;
  mime_type?: string;
  file_size?: number;
  uploaded_by: string;
  upload_status: DocumentUploadStatus;
  extracted_text_status: string;
  chunk_count: number;
  extracted_preview?: string;
  created_at: string;
  is_demo: boolean;
}

export interface SourceCitation {
  id: string;
  title: string;
  type: string;
  contributor?: string;
  date?: string;
  snippet: string;
  confidence: number;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: SourceCitation[];
  confidence?: number;
  engine?: string;
  is_demo?: boolean;
}

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
  confidence: number;
  evidence_count: number;
  is_demo: boolean;
  engine: string;
  timestamp: string;
}

export interface CatchUpResponse {
  briefing: ProjectBriefing;
}

export interface ProjectBriefing {
  summary_30s: string;
  project_objective: string;
  recent_progress: string[];
  key_decisions: string[];
  task_ownership: {
    owner: string;
    role: string;
    active_tasks: string[];
    completed_tasks: string[];
  }[];
  current_blockers: string[];
  sources: SourceCitation[];
  is_demo: boolean;
  generated_at: string;
}

export interface WorkloadItem {
  member_name: string;
  task_count: number;
  completed_count: number;
  in_progress_count: number;
  overdue_count: number;
}

export interface DiscussionSignal {
  topic: string;
  frequency: number;
  last_mentioned: string;
  status: string;
  context: string;
}

export interface InsightCard {
  id: string;
  category: "momentum" | "risk" | "alignment" | "velocity";
  title: string;
  description: string;
  impact: "positive" | "warning" | "critical" | "neutral";
  actionable_recommendation?: string;
  evidence_sources: string[];
}

export interface InsightsResponse {
  workspace_id: string;
  task_completion_rate: number;
  open_blockers_count: number;
  unresolved_decisions_count: number;
  workload: WorkloadItem[];
  discussion_signals: DiscussionSignal[];
  insights: InsightCard[];
  is_demo: boolean;
  last_refreshed: string;
}

export interface ActivityEvent {
  id: string;
  workspace_id: string;
  project_id?: string;
  actor: string;
  event_type: string;
  title: string;
  description?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface IntegrationStatusItem {
  name: string;
  label: string;
  status: "connected" | "disconnected" | "error" | "demo_mode";
  last_checked?: string;
  error_description?: string;
  is_configured: boolean;
  details?: Record<string, any>;
}

export interface DashboardStats {
  memories_retained: number;
  decisions_count: number;
  open_tasks_count: number;
  completed_tasks_count: number;
  unresolved_blockers: number;
  team_members_count: number;
  retention_health: "optimal" | "degraded" | "demo";
}

export interface DashboardResponse {
  workspace: Workspace;
  stats: DashboardStats;
  recent_activity: ActivityEvent[];
  recent_decisions: DecisionItem[];
  upcoming_tasks: TaskItem[];
  integration_health: IntegrationStatusItem[];
  is_demo: boolean;
}
