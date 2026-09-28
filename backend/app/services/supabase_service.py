import logging
import time
from typing import Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("vc.supabase")

class SupabaseService:
    """
    Supabase client service for PostgreSQL metadata persistence and outbox management.
    """
    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        if settings.is_supabase_configured:
            try:
                from supabase import create_client, Client
                key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                self.client: Client = create_client(settings.SUPABASE_URL, key)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                self.client = None

    async def health_check(self) -> Dict[str, Any]:
        """Check connection to Supabase instance."""
        if not settings.is_supabase_configured:
            return {
                "status": "not_configured",
                "connected": False,
                "message": "Supabase URL or keys are not configured in backend/.env.",
                "is_live": False
            }

        start_time = time.time()
        try:
            # Query workspaces table count
            res = self.client.table("workspaces").select("id", count="exact").limit(1).execute()
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "connected",
                "connected": True,
                "latency_ms": elapsed_ms,
                "message": f"Successfully connected to Supabase PostgreSQL in {elapsed_ms}ms.",
                "is_live": True
            }
        except Exception as e:
            logger.error(f"Supabase health check failed: {str(e)}")
            return {
                "status": "error",
                "connected": False,
                "message": f"Supabase query failed: {str(e)}",
                "is_live": False
            }

supabase_service = SupabaseService()
