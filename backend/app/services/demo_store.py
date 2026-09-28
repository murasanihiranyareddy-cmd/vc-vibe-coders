import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.schemas import (
    Workspace, WorkspaceMember, Project, MemoryItem, MemoryType, IngestionStatus,
    DecisionItem, DecisionStatus, TaskItem, TaskStatus, TaskPriority, TaskEvent,
    MeetingItem, StructuredMeetingData, ActionItemExtracted, DocumentItem,
    DocumentUploadStatus, ActivityEvent, IntegrationStatusItem, DashboardStats,
    WorkloadItem, DiscussionSignal, InsightCard
)

DEMO_WORKSPACE_ID = "ws-demo-hackathon-2026"
DEMO_PROJECT_ID = "proj-hack-hyderabad-2026"

class DemoStore:
    """
    In-memory stateful store for Demo Mode.
    Pre-seeded with realistic Hackathon Project records for Hack With Hyderabad 3.0.
    Provides realistic state mutation during demo workflows without requiring third-party API keys.
    """
    def __init__(self):
        self.reset()

    def reset(self):
        self.workspace_id = DEMO_WORKSPACE_ID
        self.project_id = DEMO_PROJECT_ID
        
        # 1. Members
        self.members = [
            WorkspaceMember(
                user_id="user-demo-judge",
                display_name="Demo User (You)",
                email="judge@vibecoders.ai",
                role="owner",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            ),
            WorkspaceMember(
                user_id="user-aisha",
                display_name="Aisha Patel",
                email="aisha@vibecoders.ai",
                role="member",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
            ),
            WorkspaceMember(
                user_id="user-rahul",
                display_name="Rahul Sharma",
                email="rahul@vibecoders.ai",
                role="member",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
            ),
            WorkspaceMember(
                user_id="user-kiran",
                display_name="Kiran Rao",
                email="kiran@vibecoders.ai",
                role="member",
                avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
            ),
        ]

        # 2. Workspace & Project
        self.workspace = Workspace(
            id=self.workspace_id,
            name="Vibe Coders (Hack With Hyderabad)",
            description="AI Team Memory Platform for Hack With Hyderabad 3.0",
            created_by="user-demo-judge",
            created_at=datetime.utcnow() - timedelta(days=5),
            members=self.members,
            is_demo=True
        )

        self.projects = [
            Project(
                id=self.project_id,
                workspace_id=self.workspace_id,
                name="Hackathon Project",
                description="Build an AI-powered persistent collaboration memory platform.",
                status="active",
                created_at=datetime.utcnow() - timedelta(days=5)
            )
        ]

        # 3. Decisions
        self.decisions = [
            DecisionItem(
                id="dec-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Adopt Firebase for Authentication",
                rationale="Selected Firebase Auth for rapid integration, secure Google & Email OAuth, and real-time session management suitable for hackathon velocity.",
                alternatives="Custom JWT server (too slow to build securely in 24h), NextAuth standalone (more backend glue required).",
                status=DecisionStatus.ACCEPTED,
                contributor="Rahul Sharma",
                decision_date="2026-09-24",
                linked_memory_id="mem-001",
                created_at=datetime.utcnow() - timedelta(days=4),
                is_demo=True
            ),
            DecisionItem(
                id="dec-002",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Use Supabase PostgreSQL for Metadata & Outbox Storage",
                rationale="Supabase provides managed relational Postgres, Row Level Security, reliable transaction support, and simple schema migrations for structured project metadata.",
                alternatives="MongoDB (lacks rigid relational foreign keys needed for task audit logs), SQLite (insufficient for multi-tenant production).",
                status=DecisionStatus.ACCEPTED,
                contributor="Aisha Patel",
                decision_date="2026-09-25",
                linked_memory_id="mem-002",
                created_at=datetime.utcnow() - timedelta(days=3),
                is_demo=True
            ),
            DecisionItem(
                id="dec-003",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Use Hindsight Cloud as Authoritative Memory & Reflection Engine",
                rationale="Hindsight Cloud offers bank-isolated long-term semantic retention, context-aware recall, and grounded reflection without hallucinations.",
                alternatives="Basic pgvector similarity search (no reflection or memory decay logic), raw LLM context injection (hits token limits quickly).",
                status=DecisionStatus.ACCEPTED,
                contributor="Demo User",
                decision_date="2026-09-26",
                linked_memory_id="mem-003",
                created_at=datetime.utcnow() - timedelta(days=2),
                is_demo=True
            ),
        ]

        # 4. Tasks & Task Events
        self.tasks = [
            TaskItem(
                id="task-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Build frontend command center & dark SaaS design system",
                description="Implement Next.js App Router, Tailwind tokens, command center dashboard, and responsive shell.",
                assignee="Aisha Patel",
                status=TaskStatus.DONE,
                priority=TaskPriority.HIGH,
                due_date=datetime.utcnow() - timedelta(days=1),
                created_by="Demo User",
                created_at=datetime.utcnow() - timedelta(days=4),
                is_demo=True
            ),
            TaskItem(
                id="task-002",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Implement FastAPI REST API & Hindsight Service Layer",
                description="Build Hindsight Cloud client endpoints (retain, recall, reflect, stats) and workspace tenancy filters.",
                assignee="Rahul Sharma",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                due_date=datetime.utcnow() + timedelta(days=1),
                created_by="Demo User",
                created_at=datetime.utcnow() - timedelta(days=3),
                is_demo=True
            ),
            TaskItem(
                id="task-003",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="End-to-end testing, documentation, and judge demo script",
                description="Prepare 2-minute live demo scenario, API specs, and deployment documentation.",
                assignee="Kiran Rao",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.MEDIUM,
                due_date=datetime.utcnow() + timedelta(hours=12),
                created_by="Aisha Patel",
                created_at=datetime.utcnow() - timedelta(days=2),
                is_demo=True
            ),
            TaskItem(
                id="task-004",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Resolve pending blocker: Hindsight Cloud live bank integration test",
                description="Perform live smoke test against api.hindsight.vectorize.io with verified API key and bank ID.",
                assignee="Rahul Sharma",
                status=TaskStatus.TODO,
                priority=TaskPriority.URGENT,
                due_date=datetime.utcnow() + timedelta(hours=4),
                created_by="Demo User",
                created_at=datetime.utcnow() - timedelta(hours=18),
                is_demo=True
            ),
        ]

        self.task_events = [
            TaskEvent(
                id="te-001",
                task_id="task-001",
                actor="Demo User",
                previous_owner=None,
                new_owner="Aisha Patel",
                previous_status=None,
                new_status="todo",
                timestamp=datetime.utcnow() - timedelta(days=4),
                notes="Task assigned to Aisha Patel for frontend architecture."
            ),
            TaskEvent(
                id="te-002",
                task_id="task-001",
                actor="Aisha Patel",
                previous_owner="Aisha Patel",
                new_owner="Aisha Patel",
                previous_status="in_progress",
                new_status="done",
                timestamp=datetime.utcnow() - timedelta(days=1),
                notes="Completed UI layout, command center cards, and dark theme design tokens."
            ),
            TaskEvent(
                id="te-003",
                task_id="task-002",
                actor="Demo User",
                previous_owner=None,
                new_owner="Rahul Sharma",
                previous_status=None,
                new_status="in_progress",
                timestamp=datetime.utcnow() - timedelta(days=3),
                notes="Task assigned to Rahul Sharma for backend API & Hindsight endpoints."
            ),
        ]

        # 5. Memories
        self.memories = [
            MemoryItem(
                id="mem-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Auth Stack Decision: Firebase Authentication",
                content="On September 24, the team decided to use Firebase Authentication. Rahul Sharma evaluated Firebase vs custom JWT and found Firebase gives secure Google/email login with minimum setup time.",
                type=MemoryType.DECISION,
                tags=["auth", "firebase", "security", "decision"],
                contributor="Rahul Sharma",
                source="decision_timeline",
                created_at=datetime.utcnow() - timedelta(days=4),
                ingestion_status=IngestionStatus.RETAINED,
                external_memory_id="hs-mem-001",
                is_demo=True
            ),
            MemoryItem(
                id="mem-002",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Database Decision: Supabase PostgreSQL for Metadata & Outbox",
                content="The team selected Supabase PostgreSQL for application persistence, task event audit history, and the memory ingestion outbox. RLS policies secure tenant isolation.",
                type=MemoryType.DECISION,
                tags=["database", "supabase", "postgres", "decision"],
                contributor="Aisha Patel",
                source="meeting_notes",
                created_at=datetime.utcnow() - timedelta(days=3),
                ingestion_status=IngestionStatus.RETAINED,
                external_memory_id="hs-mem-002",
                is_demo=True
            ),
            MemoryItem(
                id="mem-003",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Sprint Architecture Sync: Task Ownership & Hindsight Integration",
                content="Meeting notes: Aisha Patel owns the frontend and has completed login and dashboard. Rahul Sharma owns backend API and Hindsight integration. Kiran Rao owns QA and docs. One active blocker remains: final live integration test of Hindsight bank.",
                type=MemoryType.MEETING,
                tags=["meeting", "architecture", "ownership", "blocker"],
                contributor="Demo User",
                source="meeting_notes",
                created_at=datetime.utcnow() - timedelta(days=2),
                ingestion_status=IngestionStatus.RETAINED,
                external_memory_id="hs-mem-003",
                is_demo=True
            ),
            MemoryItem(
                id="mem-004",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Product Spec: RETAIN → RECALL → REFLECT Core Loop",
                content="VC solves information loss across hackathons and remote teams. The core loop consists of RETAIN (auto-capturing decisions, meetings, and documents into Hindsight), RECALL (semantic query retrieval with source citations), and REFLECT (grounded synthesis without hallucinations).",
                type=MemoryType.DOCUMENT,
                tags=["product", "spec", "vision", "loop"],
                contributor="Demo User",
                source="knowledge_hub",
                created_at=datetime.utcnow() - timedelta(days=1),
                ingestion_status=IngestionStatus.RETAINED,
                external_memory_id="hs-mem-004",
                is_demo=True
            ),
        ]

        # 6. Meetings
        self.meetings = [
            MeetingItem(
                id="meet-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                title="Sprint Kickoff & Architecture Alignment",
                transcript="Aisha: I will take the frontend components in Next.js and make sure we have a clean dark SaaS aesthetic. Rahul: I'll handle the FastAPI backend, Supabase schema migrations, and the Hindsight Cloud integration. Kiran: I'll document the API, write automated tests, and prepare the judge walkthrough script. Demo User: Agreed. Blocker: we need to verify the Hindsight live bank connection credentials.",
                summary="Sprint kickoff meeting defining architecture, tech stack (Next.js, FastAPI, Supabase, Hindsight), and task assignments across team members.",
                structured_data=StructuredMeetingData(
                    summary="Agreed on Next.js frontend, FastAPI backend, Supabase DB, and Hindsight Cloud memory. Assigned initial tasks to Aisha, Rahul, and Kiran.",
                    decisions=[
                        "Use Next.js 14 App Router with Tailwind CSS for frontend.",
                        "Use FastAPI with Hindsight Cloud for AI memory services."
                    ],
                    action_items=[
                        ActionItemExtracted(title="Build frontend command center", assignee="Aisha Patel", priority="high"),
                        ActionItemExtracted(title="Implement FastAPI REST API & Hindsight", assignee="Rahul Sharma", priority="high"),
                        ActionItemExtracted(title="Prepare QA & judge demo script", assignee="Kiran Rao", priority="medium")
                    ],
                    unresolved_questions=[
                        "Finalize live Hindsight bank credentials for Hack With Hyderabad demonstration."
                    ],
                    tags=["kickoff", "architecture", "assignments"]
                ),
                participants=["Demo User", "Aisha Patel", "Rahul Sharma", "Kiran Rao"],
                meeting_date=datetime.utcnow() - timedelta(days=2),
                created_by="Demo User",
                created_at=datetime.utcnow() - timedelta(days=2),
                is_demo=True
            )
        ]

        # 7. Documents
        self.documents = [
            DocumentItem(
                id="doc-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                filename="VC_Product_Architecture_v1.pdf",
                storage_path="/documents/VC_Product_Architecture_v1.pdf",
                mime_type="application/pdf",
                file_size=245000,
                uploaded_by="Demo User",
                upload_status=DocumentUploadStatus.EXTRACTED,
                extracted_text_status="extracted",
                chunk_count=6,
                extracted_preview="VC (Vibe Coders) is a persistent shared AI memory for hackathons and startups. Core loop: Retain -> Recall -> Reflect...",
                created_at=datetime.utcnow() - timedelta(days=2),
                is_demo=True
            ),
            DocumentItem(
                id="doc-002",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                filename="Hack_With_Hyderabad_Judge_Criteria.docx",
                storage_path="/documents/Hack_With_Hyderabad_Judge_Criteria.docx",
                mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                file_size=112000,
                uploaded_by="Kiran Rao",
                upload_status=DocumentUploadStatus.EXTRACTED,
                extracted_text_status="extracted",
                chunk_count=3,
                extracted_preview="Hack With Hyderabad 3.0 Judging Criteria: Innovation, Technical Depth, Completeness, Live Execution, and SaaS Polish...",
                created_at=datetime.utcnow() - timedelta(days=1),
                is_demo=True
            )
        ]

        # 8. Activity Stream
        self.activity_events = [
            ActivityEvent(
                id="act-001",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                actor="Aisha Patel",
                event_type="task_completed",
                title="Completed frontend command center",
                description="Finished dashboard cards, responsive navigation, and dark SaaS tokens.",
                created_at=datetime.utcnow() - timedelta(hours=3)
            ),
            ActivityEvent(
                id="act-002",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                actor="Rahul Sharma",
                event_type="memory_retained",
                title="Retained Supabase Database Architecture Decision",
                description="Memory retained in Hindsight bank with tags: database, supabase, postgres.",
                created_at=datetime.utcnow() - timedelta(hours=14)
            ),
            ActivityEvent(
                id="act-003",
                workspace_id=self.workspace_id,
                project_id=self.project_id,
                actor="Demo User",
                event_type="meeting_recorded",
                title="Recorded Sprint Kickoff Meeting",
                description="Extracted 3 action items and 2 key technical decisions.",
                created_at=datetime.utcnow() - timedelta(days=2)
            ),
        ]

    # --- CRUD operations for Demo Store ---
    def get_dashboard(self) -> DashboardStats:
        open_tasks = len([t for t in self.tasks if t.status != TaskStatus.DONE])
        done_tasks = len([t for t in self.tasks if t.status == TaskStatus.DONE])
        unresolved_blockers = len([t for t in self.tasks if "blocker" in t.title.lower() or t.priority == TaskPriority.URGENT])
        return DashboardStats(
            memories_retained=len([m for m in self.memories if m.ingestion_status == IngestionStatus.RETAINED]),
            decisions_count=len(self.decisions),
            open_tasks_count=open_tasks,
            completed_tasks_count=done_tasks,
            unresolved_blockers=unresolved_blockers,
            team_members_count=len(self.members),
            retention_health="optimal"
        )

    def add_memory(self, memory: MemoryItem) -> MemoryItem:
        self.memories.insert(0, memory)
        self.activity_events.insert(0, ActivityEvent(
            id=str(uuid.uuid4()),
            workspace_id=self.workspace_id,
            actor=memory.contributor,
            event_type="memory_retained",
            title=f"Retained Memory: {memory.title}",
            description=memory.content[:120] + ("..." if len(memory.content) > 120 else ""),
            created_at=datetime.utcnow()
        ))
        return memory

    def add_decision(self, decision: DecisionItem) -> DecisionItem:
        self.decisions.insert(0, decision)
        # Also create a linked memory item automatically
        mem = MemoryItem(
            id=str(uuid.uuid4()),
            workspace_id=self.workspace_id,
            project_id=decision.project_id,
            title=f"Decision: {decision.title}",
            content=f"Decision made by {decision.contributor} on {decision.decision_date}: {decision.rationale}. Alternatives considered: {decision.alternatives or 'None'}.",
            type=MemoryType.DECISION,
            tags=["decision", "architecture"],
            contributor=decision.contributor,
            source="decision_timeline",
            ingestion_status=IngestionStatus.RETAINED,
            external_memory_id=f"hs-dec-{str(uuid.uuid4())[:8]}",
            is_demo=True
        )
        decision.linked_memory_id = mem.id
        self.memories.insert(0, mem)
        self.activity_events.insert(0, ActivityEvent(
            id=str(uuid.uuid4()),
            workspace_id=self.workspace_id,
            actor=decision.contributor,
            event_type="decision_created",
            title=f"Recorded Decision: {decision.title}",
            description=decision.rationale[:120],
            created_at=datetime.utcnow()
        ))
        return decision

    def add_task(self, task: TaskItem) -> TaskItem:
        self.tasks.insert(0, task)
        te = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task.id,
            actor=task.created_by,
            previous_owner=None,
            new_owner=task.assignee,
            previous_status=None,
            new_status=task.status.value,
            timestamp=datetime.utcnow(),
            notes="Initial task creation."
        )
        self.task_events.insert(0, te)
        self.activity_events.insert(0, ActivityEvent(
            id=str(uuid.uuid4()),
            workspace_id=self.workspace_id,
            actor=task.created_by,
            event_type="task_created",
            title=f"Created Task: {task.title}",
            description=f"Assigned to {task.assignee or 'Unassigned'} [Priority: {task.priority.value.upper()}]",
            created_at=datetime.utcnow()
        ))
        return task

    def update_task(self, task_id: str, updates: Dict[str, Any], actor: str = "Demo User") -> Optional[TaskItem]:
        task = next((t for t in self.tasks if t.id == task_id), None)
        if not task:
            return None
        
        prev_owner = task.assignee
        prev_status = task.status
        
        if "title" in updates and updates["title"] is not None:
            task.title = updates["title"]
        if "description" in updates and updates["description"] is not None:
            task.description = updates["description"]
        if "assignee" in updates and updates["assignee"] is not None:
            task.assignee = updates["assignee"]
        if "status" in updates and updates["status"] is not None:
            task.status = updates["status"]
        if "priority" in updates and updates["priority"] is not None:
            task.priority = updates["priority"]
        if "due_date" in updates:
            task.due_date = updates["due_date"]
        
        task.updated_at = datetime.utcnow()

        # Record event if owner or status changed
        if prev_owner != task.assignee or prev_status != task.status:
            te = TaskEvent(
                id=str(uuid.uuid4()),
                task_id=task.id,
                actor=actor,
                previous_owner=prev_owner,
                new_owner=task.assignee,
                previous_status=prev_status.value if hasattr(prev_status, 'value') else str(prev_status),
                new_status=task.status.value if hasattr(task.status, 'value') else str(task.status),
                timestamp=datetime.utcnow(),
                notes=f"Updated by {actor}"
            )
            self.task_events.insert(0, te)
            self.activity_events.insert(0, ActivityEvent(
                id=str(uuid.uuid4()),
                workspace_id=self.workspace_id,
                actor=actor,
                event_type="task_updated",
                title=f"Updated Task: {task.title}",
                description=f"Status: {task.status.value} | Assignee: {task.assignee}",
                created_at=datetime.utcnow()
            ))

        return task

demo_store = DemoStore()
