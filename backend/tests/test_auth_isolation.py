import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_store import DEMO_WORKSPACE_ID

client = TestClient(app)

def test_workspace_isolation_unauthorized():
    """Verify that requesting an unauthorized arbitrary workspace returns 403 Forbidden."""
    resp = client.get(
        "/api/workspaces/ws-unauthorized-random-workspace-999/memories",
        headers={"Authorization": "Bearer demo-token-random"}
    )
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]

def test_authorized_demo_workspace():
    """Verify that authorized demo workspace returns 200 OK."""
    resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/memories",
        headers={"Authorization": "Bearer demo-token-judge"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 4
