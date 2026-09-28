import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_store import DEMO_WORKSPACE_ID

client = TestClient(app)
auth_headers = {"Authorization": "Bearer demo-token-judge"}

def test_full_judge_demo_scenario():
    """
    Test the complete 2-minute Hack With Hyderabad 3.0 Judge Workflow:
    1. Add a meeting note with a new decision and task assignment.
    2. Confirm extracted items.
    3. Verify they appear in Decisions and Tasks.
    4. Ask VC grounded queries ('Who owns the frontend?', 'Why did we choose Firebase?').
    5. Test 30-second catch-up onboarding briefing.
    6. Verify Reflect & Insights analytics.
    """
    # Step 1: Create a meeting note
    meeting_payload = {
        "title": "Hackathon Checkpoint: Live Demo Preparation",
        "transcript": (
            "Kiran Rao: I will prepare the final judge demo walkthrough slides and video. "
            "Aisha Patel: I will test the responsive mobile navigation and dark theme contrast. "
            "Rahul Sharma: I will run the end-to-end API test suite. "
            "We decided to deploy the frontend to Vercel and backend to Render."
        ),
        "participants": ["Aisha Patel", "Rahul Sharma", "Kiran Rao", "Demo User"]
    }
    meet_resp = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/meetings",
        json=meeting_payload,
        headers=auth_headers
    )
    assert meet_resp.status_code == 201
    meet_data = meet_resp.json()
    assert meet_data["title"] == "Hackathon Checkpoint: Live Demo Preparation"
    assert meet_data["structured_data"] is not None

    meeting_id = meet_data["id"]

    # Step 2: Confirm extracted decisions and tasks
    confirm_payload = {
        "confirmed_decisions": ["Deploy frontend on Vercel and FastAPI backend on Render"],
        "confirmed_tasks": [
            {"title": "Prepare final judge demo walkthrough slides", "assignee": "Kiran Rao", "priority": "high"},
            {"title": "Test responsive mobile navigation", "assignee": "Aisha Patel", "priority": "medium"}
        ]
    }
    process_resp = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/meetings/{meeting_id}/process",
        json=confirm_payload,
        headers=auth_headers
    )
    assert process_resp.status_code == 200
    assert process_resp.json()["decisions_created"] == 1
    assert process_resp.json()["tasks_created"] == 2

    # Step 3: Verify Decision Timeline has the new decision
    dec_resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/decisions",
        headers=auth_headers
    )
    assert dec_resp.status_code == 200
    decisions = dec_resp.json()
    assert any("Vercel" in d["title"] for d in decisions)

    # Step 4: Verify Tasks & Ownership has the new tasks
    tasks_resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/tasks",
        headers=auth_headers
    )
    assert tasks_resp.status_code == 200
    tasks = tasks_resp.json()
    assert any("judge demo" in t["title"].lower() for t in tasks)

    # Step 5: Ask VC grounded questions
    chat_resp1 = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/chat",
        json={"query": "Who owns the frontend?"},
        headers=auth_headers
    )
    assert chat_resp1.status_code == 200
    chat_data1 = chat_resp1.json()
    assert "Aisha" in chat_data1["answer"]
    assert len(chat_data1["sources"]) > 0

    chat_resp2 = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/chat",
        json={"query": "Why did we choose Firebase?"},
        headers=auth_headers
    )
    assert chat_resp2.status_code == 200
    chat_data2 = chat_resp2.json()
    assert "Firebase" in chat_data2["answer"]

    # Step 6: 30-Second Catch Up Briefing
    catch_up_resp = client.post(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/catch-up",
        json={},
        headers=auth_headers
    )
    assert catch_up_resp.status_code == 200
    briefing = catch_up_resp.json()["briefing"]
    assert len(briefing["summary_30s"]) > 20
    assert len(briefing["recent_progress"]) >= 2
    assert len(briefing["task_ownership"]) >= 1

    # Step 7: Reflect & Insights
    insights_resp = client.get(
        f"/api/workspaces/{DEMO_WORKSPACE_ID}/insights",
        headers=auth_headers
    )
    assert insights_resp.status_code == 200
    insights_data = insights_resp.json()
    assert len(insights_data["workload"]) >= 4
    assert len(insights_data["insights"]) >= 2
