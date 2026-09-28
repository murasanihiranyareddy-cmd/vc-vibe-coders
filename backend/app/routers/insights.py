from fastapi import APIRouter, Depends
from ..models.schemas import InsightsResponse, UserProfile
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_hindsight_service import demo_hindsight_service

router = APIRouter(prefix="/api/workspaces/{workspace_id}/insights", tags=["Reflect & Insights"])

@router.get("", response_model=InsightsResponse)
async def get_workspace_insights(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retrieve analytics, progress metrics, team workload, and evidence-backed insight cards.
    """
    return demo_hindsight_service.generate_insights(workspace_id)

@router.post("/refresh", response_model=InsightsResponse)
async def refresh_workspace_insights(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Re-analyze workspace tasks, decisions, and memory records to generate fresh insights.
    """
    return demo_hindsight_service.generate_insights(workspace_id)
