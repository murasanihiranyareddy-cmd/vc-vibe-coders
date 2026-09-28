import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ..models.schemas import (
    DecisionItem, DecisionCreate, DecisionUpdate, DecisionStatus, UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/decisions", tags=["Decision Timeline"])

@router.get("", response_model=List[DecisionItem])
async def list_decisions(
    workspace_id: str = Depends(verify_workspace_access),
    status: Optional[DecisionStatus] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    """Retrieve chronological timeline of decisions."""
    decisions = demo_store.decisions
    if status:
        decisions = [d for d in decisions if d.status == status]
    return decisions

@router.post("", response_model=DecisionItem, status_code=status.HTTP_201_CREATED)
async def create_decision(
    data: DecisionCreate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Record a new architectural or product decision.
    Persists decision metadata and automatically retains memory in Hindsight.
    """
    dec_id = f"dec-{str(uuid.uuid4())[:8]}"
    date_str = data.decision_date or datetime.utcnow().strftime("%Y-%m-%d")

    new_decision = DecisionItem(
        id=dec_id,
        workspace_id=workspace_id,
        project_id=data.project_id or demo_store.project_id,
        title=data.title,
        rationale=data.rationale,
        alternatives=data.alternatives,
        status=data.status,
        contributor=current_user.display_name,
        decision_date=date_str,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_demo=not settings.is_hindsight_configured
    )

    # Retain in Hindsight if configured
    if settings.is_hindsight_configured:
        mem_content = f"Decision: {data.title}. Rationale: {data.rationale}. Alternatives considered: {data.alternatives or 'None'}."
        await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=mem_content,
            title=f"Decision: {data.title}",
            tags=["decision", "architecture"],
            source="decision_timeline"
        )

    demo_store.add_decision(new_decision)
    return new_decision

@router.patch("/{decision_id}", response_model=DecisionItem)
async def update_decision(
    decision_id: str,
    data: DecisionUpdate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Update decision details or change status (proposed, accepted, superseded, rejected)."""
    dec = next((d for d in demo_store.decisions if d.id == decision_id), None)
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found.")

    if data.title is not None:
        dec.title = data.title
    if data.rationale is not None:
        dec.rationale = data.rationale
    if data.alternatives is not None:
        dec.alternatives = data.alternatives
    if data.status is not None:
        dec.status = data.status
    dec.updated_at = datetime.utcnow()

    return dec
