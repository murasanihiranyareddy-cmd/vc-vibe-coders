import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("vc.api")

# Initialize FastAPI App
app = FastAPI(
    title="VC (Vibe Coders) API",
    description="Persistent AI Team Memory & Collaboration Backend for Hack With Hyderabad 3.0",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = settings.cors_origin_list
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in origins:
    origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Safe Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing your request. Details have been logged securely."
        }
    )

# Include Routers
from .routers import (
    health, integrations, workspaces, memories, chat,
    catch_up, decisions, tasks, meetings, documents,
    insights, activity
)

app.include_router(health.router)
app.include_router(integrations.router)
app.include_router(workspaces.router)
app.include_router(memories.router)
app.include_router(chat.router)
app.include_router(catch_up.router)
app.include_router(decisions.router)
app.include_router(tasks.router)
app.include_router(meetings.router)
app.include_router(documents.router)
app.include_router(insights.router)
app.include_router(activity.router)

@app.get("/")
async def root():
    return {
        "app": "VC (Vibe Coders)",
        "tagline": "Because great teams shouldn't lose great ideas.",
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0"
    }
