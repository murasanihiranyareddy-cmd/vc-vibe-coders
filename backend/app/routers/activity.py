from typing import List
from fastapi import APIRouter, Depends
from ..models.schemas import ActivityEvent, UserProfile
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store

router = APIRouter(prefix="/api/workspaces/{workspace_id}/activity", tags=["Activity"])

@router.get("", response_model=List[ActivityEvent])
async def list_activity(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Retrieve workspace activity event stream."""
    return demo_store.activity_events
