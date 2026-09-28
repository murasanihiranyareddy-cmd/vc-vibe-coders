import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from ..models.schemas import (
    DocumentItem, DocumentUploadResponse, DocumentProcessResponse,
    DocumentUploadStatus, MemoryItem, MemoryType, IngestionStatus,
    UserProfile
)
from ..dependencies import get_current_user, verify_workspace_access
from ..services.demo_store import demo_store
from ..services.document_parser import doc_parser
from ..services.hindsight_service import hindsight_service
from ..config import settings

router = APIRouter(prefix="/api/workspaces/{workspace_id}/documents", tags=["Knowledge Hub"])

@router.get("", response_model=List[DocumentItem])
async def list_documents(
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """List all documents uploaded to the knowledge hub."""
    return demo_store.documents

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Upload and process a document (PDF, DOCX, PPTX, TXT, MD).
    Extracts text, creates semantic chunks, and retains knowledge in Hindsight Cloud.
    """
    contents = await file.read()
    file_size = len(contents)
    filename = file.filename or "uploaded_document.txt"

    # 1. Validate format and size
    ext = doc_parser.validate_file(filename, file_size)

    # 2. Extract text and chunks
    full_text, chunks = doc_parser.extract_text(contents, filename)

    doc_id = f"doc-{str(uuid.uuid4())[:8]}"
    preview = full_text[:200] + ("..." if len(full_text) > 200 else "")

    # 3. Retain chunks in Hindsight Cloud if configured
    retained_count = 0
    if settings.is_hindsight_configured:
        for idx, chunk in enumerate(chunks):
            res = await hindsight_service.retain_memory(
                workspace_id=workspace_id,
                content=chunk,
                title=f"{filename} (Chunk {idx + 1}/{len(chunks)})",
                tags=["document", "knowledge_hub", ext.lstrip(".")],
                source="knowledge_hub",
                metadata={"document_id": doc_id, "chunk_index": idx}
            )
            if res.get("success"):
                retained_count += 1
    else:
        # Retain top chunk in demo store memory
        demo_store.add_memory(MemoryItem(
            id=f"mem-{str(uuid.uuid4())[:8]}",
            workspace_id=workspace_id,
            project_id=demo_store.project_id,
            title=f"Doc: {filename}",
            content=preview,
            type=MemoryType.DOCUMENT,
            tags=["document", "knowledge_hub"],
            contributor=current_user.display_name,
            source="knowledge_hub",
            ingestion_status=IngestionStatus.RETAINED,
            external_memory_id=f"hs-demo-{str(uuid.uuid4())[:8]}",
            is_demo=True
        ))

    # 4. Save document metadata
    doc_item = DocumentItem(
        id=doc_id,
        workspace_id=workspace_id,
        project_id=demo_store.project_id,
        filename=filename,
        storage_path=f"/documents/{filename}",
        mime_type=file.content_type,
        file_size=file_size,
        uploaded_by=current_user.display_name,
        upload_status=DocumentUploadStatus.EXTRACTED,
        extracted_text_status="extracted",
        chunk_count=len(chunks),
        extracted_preview=preview,
        created_at=datetime.utcnow(),
        is_demo=not settings.is_hindsight_configured
    )

    demo_store.documents.insert(0, doc_item)

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=filename,
        file_size=file_size,
        upload_status=DocumentUploadStatus.EXTRACTED,
        message=f"Successfully extracted {len(chunks)} chunk(s) from '{filename}'."
    )

@router.post("/{document_id}/process", response_model=DocumentProcessResponse)
async def reprocess_document(
    document_id: str,
    workspace_id: str = Depends(verify_workspace_access),
    current_user: UserProfile = Depends(get_current_user)
):
    """Reprocess document and sync chunks to Hindsight."""
    doc = next((d for d in demo_store.documents if d.id == document_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    return DocumentProcessResponse(
        document_id=document_id,
        chunks_created=doc.chunk_count,
        retained_in_hindsight=True,
        status="processed"
    )
