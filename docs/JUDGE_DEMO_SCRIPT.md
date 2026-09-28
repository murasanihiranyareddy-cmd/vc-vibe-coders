# 🎬 VC (Vibe Coders) - 2-Minute Judge Walkthrough Script
**Hack With Hyderabad 3.0**

> **Tagline:** *Because great teams shouldn't lose great ideas.*  
> **Core Loop:** **RETAIN → RECALL → REFLECT**

---

## ⚡ 1. Scenario Overview
You are testing **VC (Vibe Coders)** on a real hackathon team project context:
- **Project:** "Hackathon Project" (Hack With Hyderabad 3.0)
- **Objective:** Build an AI-powered persistent collaboration memory platform.
- **Team:** Aisha (Frontend Lead), Rahul (Backend Lead), Kiran (QA & Docs), Demo User (Lead Architect).

---

## 🚀 2. Step-by-Step Live Demo Execution

### **Step 1: Open Command Center Dashboard (`/`)**
- **Action:** Open `http://localhost:3000`.
- **What Judges Will See:**
  - Rich, dark SaaS interface with high information density.
  - KPI Cards showing **Memories Retained (100% Synced)**, **Decisions Logged**, **Active Tasks & Completion Rate**, and **Active Blockers**.
  - RETAIN → RECALL → REFLECT loop status.
  - Real database activity timeline and upcoming tasks.

### **Step 2: Add an AI Meeting Note (`/meetings`)**
- **Action:** Click **"Record Meeting"** or navigate to `/meetings`.
- **Action:** Enter Title: `Hackathon Final Push & Deployment Strategy`
- **Action:** Paste transcript:
  ```
  Aisha: I tested the responsive mobile layout and dark theme contrast.
  Rahul: I verified the Hindsight Cloud live memory endpoints.
  Kiran: I will prepare the final judge demo video.
  We agreed to deploy the Next.js frontend to Vercel and FastAPI backend to Render.
  ```
- **Action:** Click **"Structure Meeting"**.
- **What Judges Will See:**
  - Groq AI automatically extracts **Executive Summary**, **Decisions**, and **Action Items** with owners.
  - **Explicit Confirmation Step (Step 2 of 2):** Notice the user can review and edit decisions and tasks before committing.
  - Click **"Confirm & Retain in Memory"**.

### **Step 3: Verify Decision Timeline (`/decisions`) & Tasks (`/tasks`)**
- **Action:** Go to **Decision Timeline** (`/decisions`).
  - The new decision (`Deploy frontend on Vercel and backend on Render`) immediately appears chronologically with rationale and linked memory ID.
- **Action:** Go to **Tasks & Ownership** (`/tasks`).
  - Switch between **Kanban Board** and **Table View**.
  - Reassign a task or move it to "In Progress".
  - Click the **Audit Events** icon (`History`) to see the immutable ownership transfer log.

### **Step 4: Ask VC with Memory-Grounded Reflection (`/ask-vc`)**
- **Action:** Navigate to `/ask-vc`.
- **Action:** Click the prompt pill: **"Who owns the frontend?"**
  - **Result:** *"Aisha Patel owns the frontend architecture. She has completed the Next.js App Router layout, command center dashboard, and dark SaaS design system."*
  - **Source Card:** Shows exact citation from project memory with confidence score.
- **Action:** Click prompt pill: **"Why did we choose Firebase?"**
  - **Result:** Grounds on the Sept 24 decision: *"Selected Firebase Auth for rapid integration, secure Google & Email OAuth, and real-time session management."*
- **Action:** Click prompt pill: **"What are our current blockers?"**
  - **Result:** Accurately states: *"1 active blocker: final live integration test of Hindsight memory bank on api.hindsight.vectorize.io."*

### **Step 5: Instant Onboarding ("Catch Me Up in 30 Seconds") (`/catch-up`)**
- **Action:** Navigate to `/catch-up`.
- **What Judges Will See:**
  - **"The 30-Second Executive Summary"** highlighting exact objective, stack, progress, and remaining blocker.
  - Deep-dive breakdown of project milestones, architectural choices, and member workload distribution.

### **Step 6: Reflect & Insights Analytics (`/insights`)**
- **Action:** Navigate to `/insights`.
- **What Judges Will See:**
  - Task completion rate progress bar.
  - Evidence-backed AI Insight cards with actionable recommendations and citations.
  - Workload distribution breakdown per member (Completed vs In Progress vs Overdue).
  - Repeated discussion signals.
  - Click **"Refresh Insights"** to trigger live memory re-analysis.

### **Step 7: Live System Diagnostics & Hindsight Test (`/settings`)**
- **Action:** Navigate to `/settings`.
- **What Judges Will See:**
  - Diagnostic cards for **Hindsight Cloud**, **Groq LLM**, **Supabase PostgreSQL**, and **Firebase Auth**.
  - Click **"Test Connection"** on Hindsight Cloud to run an active health check against `https://api.hindsight.vectorize.io`.
  - Honest status reporting: Never fabricates fake green badges if credentials are not configured.

---

## 🏆 Summary of Hackathon Evaluation Strengths
1. **Genuine AI Memory:** Authoritative Hindsight Cloud REST integration for Retain, Recall, and Reflect.
2. **Zero Hallucination Guarantee:** Queries ground exclusively on saved project records and return citations.
3. **Multi-Tenancy & Security:** Server-side workspace isolation and token validation.
4. **Resilient Demo Mode:** Seamlessly runnable offline for judges while ready for live cloud credentials in `.env`.
5. **Production Polish:** Modern dark-first design system inspired by Linear and Notion.
