import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_store import DEMO_WORKSPACE_ID

client = TestClient(app)
auth_headers = {"Authorization": "Bearer demo-token-judge"}

def test_health_endpoint():
    """Verify /health returns 200 and valid status structure."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["app"] == "VC (Vibe Coders)"

def test_integrations_status_endpoint():
    """Verify /api/integrations/status returns list of all services with demo indicators."""
    resp = client.get("/api/integrations/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "integrations" in data
    assert len(data["integrations"]) >= 4
    names = [i["name"] for i in data["integrations"]]
    assert "hindsight" in names
    assert "groq" in names
    assert "supabase" in names
    assert "firebase" in names

def test_dashboard_endpoint():
    """Verify /api/workspaces/{workspace_id}/dashboard returns real metrics."""
    resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/dashboard",
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["stats"]["memories_retained"] >= 4
    assert data["stats"]["decisions_count"] >= 3
    assert len(data["recent_activity"]) > 0

def test_memories_crud():
    """Verify creating, listing, and filtering memory items."""
    # Create memory
    new_mem_payload = {
        "title": "API Contract Specification Sync",
        "content": "Backend and frontend agreed on typed Pydantic and TypeScript contract.",
        "type": "Update",
        "tags": ["api", "sync", "typescript"],
        "source": "manual"
    }
    create_resp = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/memories",
        json=new_mem_payload,
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    created_item = create_resp.json()
    assert created_item["title"] == "API Contract Specification Sync"
    assert created_item["ingestion_status"] == "retained"

    # List with search filter
    list_resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/memories?search=Contract",
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

def test_tasks_crud_and_history():
    """Verify task creation, updating status, and audit history tracking."""
    # Create task
    task_payload = {
        "title": "Write Unit Tests for Hindsight Outbox",
        "description": "Ensure outbox retries failed syncs gracefully.",
        "assignee": "Rahul Sharma",
        "status": "todo",
        "priority": "medium"
    }
    create_resp = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/tasks",
        json=task_payload,
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    task = create_resp.json()
    task_id = task["id"]

    # Update task status & assignee
    update_payload = {
        "status": "in_progress",
        "assignee": "Aisha Patel"
    }
    update_resp = client.patch(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/tasks/{task_id}",
        json=update_payload,
        headers=auth_headers
    )
    assert update_resp.status_code == 200
    updated_task = update_resp.json()
    assert updated_task["status"] == "in_progress"
    assert updated_task["assignee"] == "Aisha Patel"

    # Check history
    hist_resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/tasks/{task_id}/history",
        headers=auth_headers
    )
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 2
