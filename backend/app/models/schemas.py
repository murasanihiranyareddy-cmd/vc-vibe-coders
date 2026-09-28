from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class MemoryType(str, Enum):
    MEETING = "Meeting"
    DECISION = "Decision"
    TASK = "Task"
    UPDATE = "Update"
    DOCUMENT = "Document"
    GENERAL = "General"

class IngestionStatus(str, Enum):
    PENDING = "pending"
    RETAINED = "retained"
    FAILED = "failed"

class DecisionStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    SUPERSEDED = "superseded"
    REJECTED = "rejected"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class DocumentUploadStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    EXTRACTED = "extracted"
    FAILED = "failed"

# --- User & Auth Schemas ---
class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    role: str = "member"
    is_demo_user: bool = False

# --- Workspace Schemas ---
class WorkspaceMember(BaseModel):
    user_id: str
    display_name: str
    email: str
    role: str = "member"
    avatar_url: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class Workspace(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    members: List[WorkspaceMember] = []
    is_demo: bool = False

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

# --- Project Schemas ---
class Project(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

# --- Memory Schemas ---
class MemoryItem(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    title: str
    content: str
    type: MemoryType = MemoryType.GENERAL
    tags: List[str] = []
    contributor: str
    source: str = "manual"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    ingestion_status: IngestionStatus = IngestionStatus.PENDING
    external_memory_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    is_demo: bool = False

class MemoryCreate(BaseModel):
    title: str
    content: str
    type: MemoryType = MemoryType.GENERAL
    tags: List[str] = []
    project_id: Optional[str] = None
    source: Optional[str] = "manual"
    metadata: Optional[Dict[str, Any]] = None

class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[MemoryType] = None
    tags: Optional[List[str]] = None

class MemoryIngestResponse(BaseModel):
    memory_id: str
    status: IngestionStatus
    external_id: Optional[str] = None
    message: str

# --- Decision Schemas ---
class DecisionItem(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    title: str
    rationale: str
    alternatives: Optional[str] = None
    status: DecisionStatus = DecisionStatus.ACCEPTED
    contributor: str
    decision_date: str
    linked_memory_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_demo: bool = False

class DecisionCreate(BaseModel):
    title: str
    rationale: str
    alternatives: Optional[str] = None
    status: DecisionStatus = DecisionStatus.ACCEPTED
    decision_date: Optional[str] = None
    project_id: Optional[str] = None

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    rationale: Optional[str] = None
    alternatives: Optional[str] = None
    status: Optional[DecisionStatus] = None

# --- Task Schemas ---
class TaskEvent(BaseModel):
    id: str
    task_id: str
    actor: str
    previous_owner: Optional[str] = None
    new_owner: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None

class TaskItem(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_demo: bool = False

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

# --- Meeting Schemas ---
class ActionItemExtracted(BaseModel):
    title: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "medium"

class StructuredMeetingData(BaseModel):
    summary: str
    decisions: List[str] = []
    action_items: List[ActionItemExtracted] = []
    unresolved_questions: List[str] = []
    tags: List[str] = []

class MeetingItem(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    title: str
    transcript: str
    summary: Optional[str] = None
    structured_data: Optional[StructuredMeetingData] = None
    participants: List[str] = []
    meeting_date: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_demo: bool = False

class MeetingCreate(BaseModel):
    title: str
    transcript: str
    participants: List[str] = []
    meeting_date: Optional[datetime] = None
    project_id: Optional[str] = None

class MeetingProcessRequest(BaseModel):
    confirmed_decisions: List[str] = []
    confirmed_tasks: List[ActionItemExtracted] = []

# --- Document Schemas ---
class DocumentItem(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    filename: str
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_by: str
    upload_status: DocumentUploadStatus = DocumentUploadStatus.UPLOADED
    extracted_text_status: str = "pending"
    chunk_count: int = 0
    extracted_preview: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_demo: bool = False

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_size: int
    upload_status: DocumentUploadStatus
    message: str

class DocumentProcessResponse(BaseModel):
    document_id: str
    chunks_created: int
    retained_in_hindsight: bool
    status: str

# --- Chat & Reflection Schemas ---
class SourceCitation(BaseModel):
    id: str
    title: str
    type: str
    contributor: Optional[str] = None
    date: Optional[str] = None
    snippet: str
    confidence: float = 1.0
    url: Optional[str] = None

class ChatRequest(BaseModel):
    query: str
    project_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation] = []
    confidence: float = 1.0
    evidence_count: int = 0
    is_demo: bool = False
    engine: str = "Hindsight Cloud"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Instant Onboarding / Catch Up Schemas ---
class CatchUpRequest(BaseModel):
    project_id: Optional[str] = None

class ProjectBriefing(BaseModel):
    summary_30s: str
    project_objective: str
    recent_progress: List[str] = []
    key_decisions: List[str] = []
    task_ownership: List[Dict[str, Any]] = []
    current_blockers: List[str] = []
    sources: List[SourceCitation] = []
    is_demo: bool = False
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class CatchUpResponse(BaseModel):
    briefing: ProjectBriefing

# --- Reflect & Insights Schemas ---
class WorkloadItem(BaseModel):
    member_name: str
    task_count: int
    completed_count: int
    in_progress_count: int
    overdue_count: int

class DiscussionSignal(BaseModel):
    topic: str
    frequency: int
    last_mentioned: str
    status: str
    context: str

class InsightCard(BaseModel):
    id: str
    category: str  # "momentum", "risk", "alignment", "velocity"
    title: str
    description: str
    impact: str    # "positive", "warning", "critical", "neutral"
    actionable_recommendation: Optional[str] = None
    evidence_sources: List[str] = []

class InsightsResponse(BaseModel):
    workspace_id: str
    task_completion_rate: float
    open_blockers_count: int
    unresolved_decisions_count: int
    workload: List[WorkloadItem] = []
    discussion_signals: List[DiscussionSignal] = []
    insights: List[InsightCard] = []
    is_demo: bool = False
    last_refreshed: datetime = Field(default_factory=datetime.utcnow)

# --- Activity Schemas ---
class ActivityEvent(BaseModel):
    id: str
    workspace_id: str
    project_id: Optional[str] = None
    actor: str
    event_type: str
    title: str
    description: Optional[str] = None
    entity_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Integration Status Schemas ---
class IntegrationStatusItem(BaseModel):
    name: str
    label: str
    status: str  # "connected", "disconnected", "error", "demo_mode"
    last_checked: Optional[datetime] = None
    error_description: Optional[str] = None
    is_configured: bool = False
    details: Dict[str, Any] = {}

class IntegrationsOverviewResponse(BaseModel):
    integrations: List[IntegrationStatusItem]
    overall_status: str
    demo_mode_active: bool

class HindsightTestResponse(BaseModel):
    success: bool
    status_code: Optional[int] = None
    message: str
    bank_id: Optional[str] = None
    memory_count: Optional[int] = None
    latency_ms: Optional[float] = None
    is_live: bool = False

# --- Dashboard Schemas ---
class DashboardStats(BaseModel):
    memories_retained: int
    decisions_count: int
    open_tasks_count: int
    completed_tasks_count: int
    unresolved_blockers: int
    team_members_count: int
    retention_health: str  # "optimal", "degraded", "demo"

class DashboardResponse(BaseModel):
    workspace: Workspace
    stats: DashboardStats
    recent_activity: List[ActivityEvent]
    recent_decisions: List[DecisionItem]
    upcoming_tasks: List[TaskItem]
    integration_health: List[IntegrationStatusItem]
    is_demo: bool = False
