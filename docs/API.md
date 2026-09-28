# 📡 VC (Vibe Coders) REST API Specification

FastAPI REST API specification for VC long-term memory, tasks, decisions, and meetings.

Base URL: `http://localhost:8000` (Local) / Custom deployed URL (Render/Railway)  
Interactive OpenAPI Docs: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## 🔒 Authentication & Headers
All `/api/workspaces/*` endpoints require the `Authorization` header:
```http
Authorization: Bearer <token>
```
- In production: Firebase JWT ID token.
- In demo mode: `Bearer demo-token-judge` (or `demo-token-aisha`, `demo-token-rahul`, `demo-token-kiran`).

---

## 📚 Endpoints Overview

### **1. Health & Integrations**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check and integration availability |
| `GET` | `/api/integrations/status` | Real status of Hindsight, Groq, Supabase, Firebase, GitHub |
| `POST` | `/api/integrations/hindsight/test` | Triggers active ping to Hindsight Cloud API and returns latency |

### **2. Workspaces & Dashboard**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces` | Lists accessible workspaces |
| `POST` | `/api/workspaces` | Creates a new workspace |
| `GET` | `/api/workspaces/{workspace_id}/dashboard` | Returns KPI metrics, recent decisions, tasks, and activity |

### **3. Team Memory (Hindsight Cloud)**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/memories` | Filters memories by `type`, `tag`, `contributor`, `search` |
| `POST` | `/api/workspaces/{workspace_id}/memories` | Retains new memory in Hindsight and stores DB metadata |
| `GET` | `/api/workspaces/{workspace_id}/memories/{id}` | Retrieves memory details |
| `PATCH` | `/api/workspaces/{workspace_id}/memories/{id}` | Updates memory metadata |
| `DELETE` | `/api/workspaces/{workspace_id}/memories/{id}` | Deletes memory record |
| `POST` | `/api/workspaces/{workspace_id}/memories/{id}/retry` | Retries failed Hindsight sync |

### **4. Ask VC (AI Chat & Reflection)**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workspaces/{workspace_id}/chat` | Memory-grounded query returning synthesized answer and source citations |
| `POST` | `/api/workspaces/{workspace_id}/catch-up` | Generates 30-second onboarding briefing and deep-dive context |

### **5. Decisions Timeline**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/decisions` | Returns chronological decision records |
| `POST` | `/api/workspaces/{workspace_id}/decisions` | Creates decision with rationale and retains in Hindsight |
| `PATCH` | `/api/workspaces/{workspace_id}/decisions/{id}` | Updates status (`accepted`, `proposed`, `superseded`, `rejected`) |

### **6. Tasks & Ownership**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/tasks` | Lists tasks with `status`, `assignee`, `priority` filters |
| `POST` | `/api/workspaces/{workspace_id}/tasks` | Creates task and records initial ownership event |
| `PATCH` | `/api/workspaces/{workspace_id}/tasks/{id}` | Updates status/assignee and logs audit event |
| `GET` | `/api/workspaces/{workspace_id}/tasks/{id}/history` | Retrieves full audit log of task ownership changes |

### **7. AI Meeting Notes**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/meetings` | Lists recorded meetings |
| `POST` | `/api/workspaces/{workspace_id}/meetings` | Submits transcript to Groq for structuring |
| `POST` | `/api/workspaces/{workspace_id}/meetings/{id}/process` | User confirms extracted items, creating tasks & decisions |

### **8. Knowledge Hub (Documents)**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/documents` | Lists uploaded documents |
| `POST` | `/api/workspaces/{workspace_id}/documents/upload` | Multipart file upload (PDF, DOCX, PPTX, TXT) with chunking |

### **9. Reflect & Insights**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces/{workspace_id}/insights` | Returns completion rate, workload, discussion signals, and insight cards |
| `POST` | `/api/workspaces/{workspace_id}/insights/refresh` | Re-analyzes memory records |
