import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import (
    MeetingItem, MeetingCreate, MeetingProcessRequest, ActionItemExtracted,
    DecisionItem, DecisionStatus, TaskItem, TaskStatus, TaskPriority,
    MemoryItem, MemoryType, IngestionStatus, UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store
from ..services.groq_service import groq_service
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/meetings", tags=["AI Meeting Notes"])

@router.get("", response_model=List[MeetingItem])
async def list_meetings(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """List all recorded meetings in workspace."""
    return demo_store.meetings

@router.post("", response_model=MeetingItem, status_code=status.HTTP_201_CREATED)
async def create_and_structure_meeting(
    data: MeetingCreate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Submit raw meeting transcript or notes.
    Uses Groq LLM (or local rule extractor) to parse summary, decisions, action items, and questions.
    Returns structured results for user review & confirmation.
    """
    meeting_id = f"meet-{str(uuid.uuid4())[:8]}"
    
    # Run structuring via GroqService
    struct_res = await groq_service.structure_meeting(
        title=data.title,
        transcript=data.transcript,
        participants=data.participants
    )
    structured_data = struct_res.get("data")

    new_meeting = MeetingItem(
        id=meeting_id,
        workspace_id=workspace_id,
        project_id=data.project_id or demo_store.project_id,
        title=data.title,
        transcript=data.transcript,
        summary=structured_data.summary if structured_data else None,
        structured_data=structured_data,
        participants=data.participants,
        meeting_date=data.meeting_date or datetime.utcnow(),
        created_by=current_user.display_name,
        created_at=datetime.utcnow(),
        is_demo=not settings.is_groq_configured
    )

    demo_store.meetings.insert(0, new_meeting)
    return new_meeting

@router.post("/{meeting_id}/process", status_code=status.HTTP_200_OK)
async def process_and_confirm_meeting(
    meeting_id: str,
    data: MeetingProcessRequest,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Explicit confirmation step:
    Saves confirmed decisions to Decision Timeline, confirmed tasks to Tasks & Ownership,
    and retains the meeting summary and confirmed items in Hindsight Cloud.
    """
    meeting = next((m for m in demo_store.meetings if m.id == meeting_id), None)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    created_decisions = []
    created_tasks = []

    # 1. Create confirmed decisions
    for dec_title in data.confirmed_decisions:
        dec = DecisionItem(
            id=f"dec-{str(uuid.uuid4())[:8]}",
            workspace_id=workspace_id,
            project_id=meeting.project_id,
            title=dec_title,
            rationale=f"Agreed during meeting '{meeting.title}' by {', '.join(meeting.participants) if meeting.participants else current_user.display_name}.",
            alternatives=None,
            status=DecisionStatus.ACCEPTED,
            contributor=current_user.display_name,
            decision_date=datetime.utcnow().strftime("%Y-%m-%d"),
            created_at=datetime.utcnow(),
            is_demo=meeting.is_demo
        )
        demo_store.add_decision(dec)
        created_decisions.append(dec)

    # 2. Create confirmed tasks
    for task_item in data.confirmed_tasks:
        priority_val = TaskPriority.MEDIUM
        if task_item.priority and task_item.priority.lower() in ("high", "urgent"):
            priority_val = TaskPriority.HIGH
        elif task_item.priority and task_item.priority.lower() == "low":
            priority_val = TaskPriority.LOW

        t = TaskItem(
            id=f"task-{str(uuid.uuid4())[:8]}",
            workspace_id=workspace_id,
            project_id=meeting.project_id,
            title=task_item.title,
            description=f"Action item extracted from meeting: '{meeting.title}'",
            assignee=task_item.assignee,
            status=TaskStatus.TODO,
            priority=priority_val,
            created_by=current_user.display_name,
            created_at=datetime.utcnow(),
            is_demo=meeting.is_demo
        )
        demo_store.add_task(t)
        created_tasks.append(t)

    # 3. Retain meeting summary and confirmed items in Hindsight
    tasks_summary_list = [f"{t.title} -> {t.assignee or 'Unassigned'}" for t in data.confirmed_tasks]
    tasks_summary_str = "; ".join(tasks_summary_list) if tasks_summary_list else "None"
    decisions_summary_str = "; ".join(data.confirmed_decisions) if data.confirmed_decisions else "None"

    meeting_memory_content = (
        f"Meeting '{meeting.title}' on {meeting.meeting_date.strftime('%b %d, %Y')}.\n"
        f"Summary: {meeting.summary or meeting.transcript[:200]}\n"
        f"Confirmed Decisions: {decisions_summary_str}\n"
        f"Assigned Action Items: {tasks_summary_str}"
    )

    if settings.is_hindsight_configured:
        await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=meeting_memory_content,
            title=f"Meeting Notes: {meeting.title}",
            tags=["meeting", "notes", "decisions", "tasks"],
            source="meeting_notes"
        )
    else:
        # Demo mode retention
        demo_store.add_memory(MemoryItem(
            id=f"mem-{str(uuid.uuid4())[:8]}",
            workspace_id=workspace_id,
            project_id=meeting.project_id,
            title=f"Meeting Notes: {meeting.title}",
            content=meeting_memory_content,
            type=MemoryType.MEETING,
            tags=["meeting", "notes"],
            contributor=current_user.display_name,
            source="meeting_notes",
            ingestion_status=IngestionStatus.RETAINED,
            external_memory_id=f"hs-demo-{str(uuid.uuid4())[:8]}",
            is_demo=True
        ))

    return {
        "success": True,
        "meeting_id": meeting_id,
        "decisions_created": len(created_decisions),
        "tasks_created": len(created_tasks),
        "message": f"Successfully processed meeting. Created {len(created_decisions)} decision(s) and {len(created_tasks)} task(s)."
    }
