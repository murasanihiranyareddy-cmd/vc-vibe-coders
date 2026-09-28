import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..models.schemas import (
    MemoryItem, MemoryCreate, MemoryUpdate, MemoryIngestResponse,
    MemoryType, IngestionStatus, UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/memories", tags=["Team Memory"])

@router.get("", response_model=List[MemoryItem])
async def list_memories(
    workspace_id: str = Depends(verify_workspace_access),
    type: Optional[MemoryType] = None,
    tag: Optional[str] = None,
    contributor: Optional[str] = None,
    search: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    """List and filter memories within the workspace."""
    results = demo_store.memories

    if type:
        results = [m for m in results if m.type == type]
    if tag:
        results = [m for m in results if tag.lower() in [t.lower() for t in m.tags]]
    if contributor:
        results = [m for m in results if contributor.lower() in m.contributor.lower()]
    if search:
        s = search.lower()
        results = [m for m in results if s in m.title.lower() or s in m.content.lower()]

    return results

@router.post("", response_model=MemoryItem, status_code=status.HTTP_201_CREATED)
async def create_memory(
    data: MemoryCreate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retain a new memory item.
    Persists metadata to database and retains content in Hindsight Cloud.
    """
    mem_id = str(uuid.uuid4())
    ingestion_status = IngestionStatus.PENDING
    external_id = None

    # 1. If Hindsight Cloud configured, retain live
    if settings.is_hindsight_configured:
        res = await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=data.content,
            title=data.title,
            tags=data.tags,
            source=data.source or "manual",
            metadata=data.metadata
        )
        if res.get("success"):
            ingestion_status = IngestionStatus.RETAINED
            external_id = res.get("external_id")
        else:
            ingestion_status = IngestionStatus.FAILED
    else:
        # Demo mode retention
        ingestion_status = IngestionStatus.RETAINED
        external_id = f"hs-demo-{str(uuid.uuid4())[:8]}"

    new_memory = MemoryItem(
        id=mem_id,
        workspace_id=workspace_id,
        project_id=data.project_id or demo_store.project_id,
        title=data.title,
        content=data.content,
        type=data.type,
        tags=data.tags,
        contributor=current_user.display_name,
        source=data.source or "manual",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        ingestion_status=ingestion_status,
        external_memory_id=external_id,
        metadata=data.metadata or {},
        is_demo=not settings.is_hindsight_configured
    )

    demo_store.add_memory(new_memory)
    return new_memory

@router.get("/{memory_id}", response_model=MemoryItem)
async def get_memory(
    memory_id: str,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Retrieve details for a specific memory item."""
    mem = next((m for m in demo_store.memories if m.id == memory_id), None)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    return mem

@router.patch("/{memory_id}", response_model=MemoryItem)
async def update_memory(
    memory_id: str,
    data: MemoryUpdate,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Update memory metadata."""
    mem = next((m for m in demo_store.memories if m.id == memory_id), None)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory item not found.")

    if data.title is not None:
        mem.title = data.title
    if data.content is not None:
        mem.content = data.content
    if data.type is not None:
        mem.type = data.type
    if data.tags is not None:
        mem.tags = data.tags
    mem.updated_at = datetime.utcnow()

    return mem

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Delete a memory item."""
    idx = next((i for i, m in enumerate(demo_store.memories) if m.id == memory_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    demo_store.memories.pop(idx)
    return None

@router.post("/{memory_id}/retry", response_model=MemoryIngestResponse)
async def retry_memory_ingestion(
    memory_id: str,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Retry failed Hindsight memory ingestion."""
    mem = next((m for m in demo_store.memories if m.id == memory_id), None)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory item not found.")

    if settings.is_hindsight_configured:
        res = await hindsight_service.retain_memory(
            workspace_id=workspace_id,
            content=mem.content,
            title=mem.title,
            tags=mem.tags,
            source=mem.source
        )
        if res.get("success"):
            mem.ingestion_status = IngestionStatus.RETAINED
            mem.external_memory_id = res.get("external_id")
            return MemoryIngestResponse(
                memory_id=mem.id,
                status=IngestionStatus.RETAINED,
                external_id=mem.external_memory_id,
                message="Successfully retained in Hindsight Cloud."
            )
        else:
            return MemoryIngestResponse(
                memory_id=mem.id,
                status=IngestionStatus.FAILED,
                external_id=None,
                message=f"Hindsight retention failed: {res.get('error')}"
            )
    else:
        mem.ingestion_status = IngestionStatus.RETAINED
        mem.external_memory_id = f"hs-demo-{str(uuid.uuid4())[:8]}"
        return MemoryIngestResponse(
            memory_id=mem.id,
            status=IngestionStatus.RETAINED,
            external_id=mem.external_memory_id,
            message="Retained in Demo Memory Engine."
        )
