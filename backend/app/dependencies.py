from fastapi import Depends, HTTPException, Header, status
from typing import Optional
from .models.schemas import UserProfile
from .services.firebase_auth_service import firebase_auth
from .services.demo_store import demo_store, DEMO_WORKSPACE_ID
from .config import settings

async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> UserProfile:
    """
    Extracts and validates Bearer token from Authorization header.
    In DEMO_MODE or when credentials are absent, provides safe access to verified Demo User.
    """
    if not authorization:
        if settings.DEMO_MODE:
            # Fallback to default Demo User in demo mode
            return UserProfile(
                uid="user-demo-judge",
                email="judge@vibecoders.ai",
                display_name="Demo User (You)",
                role="owner",
                is_demo_user=True,
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required (Bearer <token>).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    user = firebase_auth.verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

async def verify_workspace_access(
    workspace_id: str,
    current_user: UserProfile = Depends(get_current_user)
) -> str:
    """
    Verifies that the authenticated user has access to the requested workspace.
    Enforces multi-tenancy and prevents cross-workspace data access.
    """
    if workspace_id == DEMO_WORKSPACE_ID or workspace_id == "default":
        return DEMO_WORKSPACE_ID

    # In-memory demo store check
    if workspace_id == demo_store.workspace_id:
        member_ids = [m.user_id for m in demo_store.members]
        if current_user.uid in member_ids or current_user.is_demo_user:
            return workspace_id

    # If Supabase is configured, check workspace_members table
    if settings.is_supabase_configured:
        from .services.supabase_service import supabase_service
        if supabase_service.client:
            try:
                res = supabase_service.client.table("workspace_members") \
                    .select("role") \
                    .eq("workspace_id", workspace_id) \
                    .eq("user_id", current_user.uid) \
                    .execute()
                if res.data and len(res.data) > 0:
                    return workspace_id
            except Exception:
                pass

    # If not authorized
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Access denied. User '{current_user.email}' is not a member of workspace '{workspace_id}'."
    )
