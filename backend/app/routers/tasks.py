import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import (
    TaskItem, TaskCreate, TaskUpdate, TaskEvent, TaskStatus, TaskPriority,
    UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/tasks", tags=["Tasks & Ownership"])

@router.get("", response_model=List[TaskItem])
async def list_tasks(
    workspace_id: str = Depends(verify_workspace_access),
    status: Optional[TaskStatus] = None,
    assignee: Optional[str] = None,
    priority: Optional[TaskPriority] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    """List tasks with optional filtering by status, assignee, and priority."""
    tasks = demo_store.tasks
    if status:
        tasks = [t for t in tasks if t.status == status]
    if assignee:
        tasks = [t for t in tasks if t.assignee and assignee.lower() in t.assignee.lower()]
    if priority:
        tasks = [t for t in tasks if t.priority == priority]
    return tasks

@router.post("", response_model=TaskItem, status_code=status.HTTP_201_CREATED)
async def create_task(
    data: TaskCreate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Create a new task and record initial ownership event."""
    task_id = f"task-{str(uuid.uuid4())[:8]}"
    
    new_task = TaskItem(
        id=task_id,
        workspace_id=workspace_id,
        project_id=data.project_id or demo_store.project_id,
        title=data.title,
        description=data.description,
        assignee=data.assignee,
        status=data.status,
        priority=data.priority,
        due_date=data.due_date,
        created_by=current_user.display_name,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_demo=not settings.is_hindsight_configured
    )

    # Retain significant task assignment in Hindsight if configured
    if settings.is_hindsight_configured and data.assignee:
        await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=f"Task assigned: '{data.title}' assigned to {data.assignee} with priority {data.priority.value.upper()}.",
            title=f"Task: {data.title}",
            tags=["task", "assignment"],
            source="tasks"
        )

    demo_store.add_task(new_task)
    return new_task

@router.patch("/{task_id}", response_model=TaskItem)
async def update_task(
    task_id: str,
    data: TaskUpdate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Update task status, priority, description, or reassign ownership with audit history."""
    updates = data.dict(exclude_unset=True)
    task = demo_store.update_task(task_id, updates, actor=current_user.display_name)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # Retain status change in Hindsight if configured
    if settings.is_hindsight_configured and ("assignee" in updates or "status" in updates):
        await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=f"Task update: '{task.title}' updated by {current_user.display_name}. Status: {task.status.value}, Assignee: {task.assignee or 'Unassigned'}.",
            title=f"Task Update: {task.title}",
            tags=["task", "update"],
            source="tasks"
        )

    return task

@router.get("/{task_id}/history", response_model=List[TaskEvent])
async def get_task_history(
    task_id: str,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Retrieve full audit history timeline of task ownership and status transitions."""
    events = [e for e in demo_store.task_events if e.task_id == task_id]
    return events
