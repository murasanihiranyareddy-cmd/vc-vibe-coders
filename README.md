# 🧠 VC (Vibe Coders)

**Because great teams shouldn't lose great ideas.**  
*A persistent shared AI memory platform for hackathon teams, student projects, startups, and research teams.*  
**Built for Hack With Hyderabad 3.0**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Hindsight Cloud](https://img.shields.io/badge/Hindsight-Cloud_AI_Memory-6366f1.svg)](https://api.hindsight.vectorize.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-Fast_LLM-f55036.svg)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 The Problem
Hackathons and fast-moving teams lose critical context across Slack/Discord chats, scratchpad notes, meeting recordings, and scattered Google Docs.
- *"Why did we choose this database architecture?"*
- *"Who owns the frontend API integration?"*
- *"What were our blockers from yesterday's sync?"*
- *"How do we onboard a returning teammate or judge in 30 seconds?"*

**VC (Vibe Coders)** is an authoritative, persistent long-term collaboration memory engine. It implements the **RETAIN → RECALL → REFLECT** loop to guarantee zero context loss without hallucinations.

---

## 🔁 The Core Loop

```mermaid
graph LR
    A[📝 RETAIN] --> B[🔍 RECALL]
    B --> C[💡 REFLECT]
    C --> A
    
    subgraph "1. RETAIN"
        A1[Meeting Notes]
        A2[Decisions & Rationale]
        A3[Task Ownership]
        A4[Documents & Specs]
    end
    
    subgraph "2. RECALL"
        B1[Semantic Vector Search]
        B2[Time & Contributor Filters]
        B3[Source Citations]
    end
    
    subgraph "3. REFLECT"
        C1[Grounded AI Synthesis]
        C2[30s Catch-Up Briefing]
        C3[Evidence-Backed Insights]
    end
```

1. **RETAIN:** Ingests decisions, structured meeting summaries, task assignments, and documents directly into **Hindsight Cloud** long-term semantic banks.
2. **RECALL:** Retrieves exact, relevant memories with contributor attribution and confidence metrics.
3. **REFLECT:** Synthesizes high-level project status, blockers, and workload analytics grounded strictly in recorded truth.

---

## 🏛️ System Architecture

```
vc/
├── frontend/                 # Next.js 14 App Router (React, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/              # Command Center, Ask VC, Memory, Decisions, Tasks, Meetings, Catch-Up, Insights, Documents, Settings
│   │   ├── components/       # AppShell, WorkspaceContext, Badges, Navigation
│   │   └── lib/              # Type-safe API Client, Firebase SDK, Types
│   ├── tailwind.config.ts    # Dark SaaS design system tokens
│   └── package.json
├── backend/                  # Python FastAPI REST API
│   ├── app/
│   │   ├── main.py           # Application entrypoint & CORS
│   │   ├── config.py         # Pydantic Settings & environment validation
│   │   ├── dependencies.py   # Auth & Workspace multi-tenant isolation
│   │   ├── models/           # Pydantic schemas for all entities
│   │   ├── routers/          # 12 REST API routers (memories, chat, tasks, decisions, etc.)
│   │   └── services/         # Hindsight Cloud, Groq, Supabase, Document Parser, Demo Store
│   ├── migrations/           # 001_initial_schema.sql (Supabase PostgreSQL)
│   ├── tests/                # Pytest unit & integration test suite (11 passing tests)
│   └── requirements.txt
├── docs/                     # API specs, 2-Minute Judge Walkthrough, Deployment Guides
└── README.md
```

---

## ⚡ Quickstart Setup

### **Prerequisites**
- Node.js `v18+` or `v20+` (Tested on `v24.14.0`)
- Python `3.10+` (Tested on `3.14.2`)

### **1. Clone & Set Up Backend**

```powershell
# In Windows PowerShell:
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create environment file:
Copy-Item .env.example .env
```

Start the FastAPI backend:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API runs at `http://127.0.0.1:8000` (Interactive docs at `http://127.0.0.1:8000/docs`).

### **2. Set Up Frontend**

```powershell
# Open a new terminal:
cd frontend
npm install

# Create environment file:
Copy-Item .env.example .env.local
```

Start the Next.js dev server:
```powershell
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🎬 2-Minute Judge Walkthrough

VC comes pre-seeded with a realistic Hack With Hyderabad 3.0 project context (**"Hackathon Project"**) and works out of the box in **Demo Mode** with zero external API keys required!

| Step | Action | Page | What to Observe |
|---|---|---|---|
| **1** | Explore Dashboard | `/` | Command Center with live KPI metrics, task progress, and RETAIN/RECALL/REFLECT loop. |
| **2** | Add Meeting Note | `/meetings` | Paste transcript -> Groq auto-structures summary, decisions & tasks -> Explicit confirmation step before saving. |
| **3** | Decision Timeline | `/decisions` | Newly confirmed decisions appear chronologically with rationales and linked memory IDs. |
| **4** | Tasks & Ownership | `/tasks` | Interactive Kanban & Table views. Reassign tasks and inspect the **Audit Log Timeline**. |
| **5** | Ask VC AI Chat | `/ask-vc` | Click *"Who owns frontend?"* or *"Why did we choose Firebase?"*. Grounded answer with source citations. |
| **6** | 30s Instant Catch-Up | `/catch-up` | 30-second onboarding briefing with objective, recent milestones, and blockers. |
| **7** | Reflect & Insights | `/insights` | Evidence-backed analytics, workload distribution, and discussion recurrence signals. |
| **8** | Diagnostics & Hindsight | `/settings` | Real integration diagnostic cards. Click **"Test Connection"** to ping Hindsight Cloud. |

*(See [`docs/JUDGE_DEMO_SCRIPT.md`](docs/JUDGE_DEMO_SCRIPT.md) for full script)*

---

## ⚙️ Environment Configuration

### **Backend (`backend/.env`)**
```env
# Hindsight Cloud Configuration
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BANK_ID=your_hindsight_bank_id

# Groq LLM Configuration
GROQ_API_KEY=your_groq_api_key

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Authentication
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Environment
CORS_ORIGINS=http://localhost:3000
APP_ENV=development
DEMO_MODE=true
```

### **Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 🧪 Testing

Run backend unit and integration tests:
```powershell
.\venv\Scripts\python.exe -m pytest backend\tests -o pythonpath=backend -W ignore -v
```

**Results:**
- `test_health_endpoint`: ✅ PASSED
- `test_integrations_status_endpoint`: ✅ PASSED
- `test_dashboard_endpoint`: ✅ PASSED
- `test_memories_crud`: ✅ PASSED
- `test_tasks_crud_and_history`: ✅ PASSED
- `test_auth_isolation`: ✅ PASSED
- `test_demo_flow (Judge Scenario)`: ✅ PASSED
- `test_hindsight_health_check`: ✅ PASSED
- **11 / 11 tests passing (100% pass rate)**

---

## 🚀 Deployment

- **Frontend:** Ready for one-click deployment on **Vercel** with Next.js 14 App Router.
- **Backend:** Ready for deployment on **Render** or **Railway** with `uvicorn app.main:app`.
- **Database:** Supabase PostgreSQL with schema in `backend/migrations/001_initial_schema.sql`.

*(Detailed deployment guide in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md))*

---

## 👥 The Team (Vibe Coders)
- **Aisha Patel** — Frontend Lead
- **Rahul Sharma** — Backend & Hindsight Cloud Lead
- **Kiran Rao** — QA & Documentation
- **Demo User** — Product Architect & Lead
