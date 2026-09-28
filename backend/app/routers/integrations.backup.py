from fastapi import APIRouter
from datetime import datetime
from typing import List
from ..config import settings
from ..services.hindsight_service import hindsight_service
from ..services.supabase_service import supabase_service
from ..models.schemas import (
    IntegrationsOverviewResponse, IntegrationStatusItem, HindsightTestResponse
)

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

@router.get("/status", response_model=IntegrationsOverviewResponse)
async def get_integrations_status():
    """
    Returns verified status of all system integrations.
    Never fabricates a green connected badge when credentials are missing.
    """
    print("DEBUG HINDSIGHT:", {
        "key_loaded": bool(settings.HINDSIGHT_API_KEY),
        "bank_id": repr(settings.HINDSIGHT_BANK_ID),
        "configured": settings.is_hindsight_configured,
    })
