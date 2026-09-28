from fastapi import APIRouter
from datetime import datetime
from ..config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "hindsight_configured": settings.is_hindsight_configured,
        "groq_configured": settings.is_groq_configured,
        "supabase_configured": settings.is_supabase_configured,
        "firebase_configured": settings.is_firebase_configured,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
