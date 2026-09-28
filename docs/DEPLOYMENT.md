# 🚀 VC (Vibe Coders) Deployment & Production Setup Guide

Comprehensive guide for deploying VC to **Vercel** (Frontend) and **Render / Railway** (FastAPI Backend), setting up **Supabase PostgreSQL**, and configuring **Hindsight Cloud**.

---

## 🏗️ Architecture Split
- **Frontend:** Next.js 14 App Router (Deployed to Vercel)
- **Backend:** FastAPI Python REST API (Deployed to Render or Railway)
- **Database:** Supabase PostgreSQL with migrations
- **Authentication:** Firebase Authentication
- **Memory Engine:** Hindsight Cloud (`https://api.hindsight.vectorize.io`)
- **LLM Structuring:** Groq API

---

## 1. 🌐 Deploy Frontend to Vercel

1. Push code to GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Set Environment Variables in Vercel Project Settings:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```
5. Click **Deploy**.

---

## 2. 🐍 Deploy Backend to Render

1. Log in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure service settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables in Render:
   ```env
   HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
   HINDSIGHT_API_KEY=your_actual_hindsight_api_key
   HINDSIGHT_BANK_ID=your_hindsight_bank_id
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   APP_ENV=production
   DEMO_MODE=false
   ```
5. Click **Create Web Service**.

---

## 3. 🐘 Supabase Database Migration

1. Log in to [Supabase](https://supabase.com) and create a project.
2. Go to **SQL Editor**.
3. Copy the contents of [`backend/migrations/001_initial_schema.sql`](file:///c:/Users/muras/Desktop/vc/backend/migrations/001_initial_schema.sql).
4. Run the SQL script. This creates all tables, foreign keys, indexes, and RLS policies.
5. In Supabase Project Settings -> API, retrieve your **Project URL** and **service_role key**. Add them to `backend/.env`.

---

## 4. 🧠 Hindsight Cloud Configuration

1. Log in to [Vectorize / Hindsight Cloud](https://api.hindsight.vectorize.io).
2. Create or select a dedicated bank for your workspace.
3. Retrieve your **Bank ID** and **API Key**.
4. In `backend/.env`, set:
   ```env
   HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
   HINDSIGHT_API_KEY=your_hindsight_api_key
   HINDSIGHT_BANK_ID=your_hindsight_bank_id
   ```
5. Run the health check via backend test or via the **Team Settings** page (`/settings`).

---

## 5. ⚡ Local Development Setup

### **Backend (Terminal 1 - Windows PowerShell):**
```powershell
# In project root:
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

### **Frontend (Terminal 2):**
```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.
