import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import (
    Workspace, WorkspaceCreate, WorkspaceMember, DashboardResponse,
    UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store, DEMO_WORKSPACE_ID
from ..services.hindsight_service import hindsight_service
from .integrations import get_integrations_status

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

@router.get("", response_model=List[Workspace])
async def list_workspaces(current_user: UserProfile = Depends(get_current_user)):
    """List all workspaces accessible to the authenticated user."""
    return [demo_store.workspace]

@router.post("", response_model=Workspace, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    data: WorkspaceCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Create a new workspace with authenticated user as owner."""
    new_ws = Workspace(
        id=f"ws-{str(uuid.uuid4())[:8]}",
        name=data.name,
        description=data.description,
        created_by=current_user.uid,
        created_at=datetime.utcnow(),
        members=[
            WorkspaceMember(
                user_id=current_user.uid,
                display_name=current_user.display_name,
                email=current_user.email,
                role="owner",
                avatar_url=current_user.avatar_url
            )
        ],
        is_demo=False
    )
    return new_ws

@router.get("/{workspace_id}/dashboard", response_model=DashboardResponse)
async def get_workspace_dashboard(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Get dashboard metrics, recent activity, decisions, and tasks.
    All metrics are derived directly from verified database/store records.
    """
    stats = demo_store.get_dashboard()
    recent_activity = demo_store.activity_events[:8]
    recent_decisions = demo_store.decisions[:4]
    upcoming_tasks = [t for t in demo_store.tasks if t.status != "done"][:5]
    
    int_overview = await get_integrations_status()

    return DashboardResponse(
        workspace=demo_store.workspace,
        stats=stats,
        recent_activity=recent_activity,
        recent_decisions=recent_decisions,
        upcoming_tasks=upcoming_tasks,
        integration_health=int_overview.integrations,
        is_demo=True
    )
