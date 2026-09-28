from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from ..models.schemas import (
    ChatRequest, ChatResponse, SourceCitation, UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.hindsight_service import hindsight_service
from ..services.demo_hindsight_service import demo_hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/chat", tags=["Ask VC"])

@router.post("", response_model=ChatResponse)
async def ask_vc_chat(
    data: ChatRequest,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Ask VC AI query endpoint grounded in long-term memory.
    Uses Hindsight Cloud reflect & recall when configured, or Demo Memory Engine in demo mode.
    """
    query = data.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if settings.is_hindsight_configured:
        # Live Hindsight Cloud
        reflect_res = await hindsight_service.reflect_memory(
            query=query,
            workspace_id=workspace_id
        )
        recall_res = await hindsight_service.recall_memory(
            query=query,
            workspace_id=workspace_id,
            limit=4
        )

        sources = []
        for idx, item in enumerate(recall_res):
            sources.append(SourceCitation(
                id=item.get("id", f"hs-src-{idx}"),
                title=item.get("context", {}).get("title") or f"Memory Item #{idx + 1}",
                type=item.get("context", {}).get("type", "Memory"),
                contributor=item.get("context", {}).get("contributor"),
                date=item.get("context", {}).get("retained_at"),
                snippet=item.get("content", "")[:200],
                confidence=item.get("score", 0.9)
            ))

        return ChatResponse(
            answer=reflect_res.get("answer", "No answer could be formed from saved memory."),
            sources=sources,
            confidence=reflect_res.get("confidence", 1.0),
            evidence_count=len(sources),
            is_demo=False,
            engine="Hindsight Cloud (Live Bank)",
            timestamp=datetime.utcnow()
        )
    else:
        # Offline Demo Memory Engine
        return demo_hindsight_service.reflect(query=query, workspace_id=workspace_id)
