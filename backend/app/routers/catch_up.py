from fastapi import APIRouter, Depends
from ..models.schemas import (
    CatchUpRequest, CatchUpResponse, UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_hindsight_service import demo_hindsight_service
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/catch-up", tags=["Instant Onboarding"])

@router.post("", response_model=CatchUpResponse)
async def get_catch_up_briefing(
    data: CatchUpRequest,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Generate an instant 30-second project onboarding briefing from team memory.
    """
    if settings.is_hindsight_configured:
        # Live reflect query
        query = "Generate a concise 30-second onboarding summary of this workspace including objective, recent progress, key decisions, task ownership, and active blockers."
        reflect_res = await hindsight_service.reflect_memory(query, workspace_id)
        # Fall back to demo structure if live reflect is empty
        res = demo_hindsight_service.generate_catch_up(workspace_id)
        if reflect_res.get("success") and reflect_res.get("answer"):
            res.briefing.summary_30s = reflect_res["answer"]
            res.briefing.is_demo = False
        return res
    else:
        return demo_hindsight_service.generate_catch_up(workspace_id)
