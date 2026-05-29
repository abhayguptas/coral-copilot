"""Coral Copilot — FastAPI Application."""

import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI

from agent import CoralAgent
from coral_bridge import coral_source_list, coral_source_discover, coral_source_add, coral_sql, coral_source_health
from models import ChatRequest, SourceInfo
from voice import transcribe_audio

load_dotenv()

app = FastAPI(
    title="Coral Copilot",
    description="Voice-operated universal developer co-pilot powered by Coral.",
    version="0.1.0",
)

# CORS — restrict to frontend origin
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared state
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", ""),
    base_url=os.getenv("OPENAI_BASE_URL")
)
agent = CoralAgent(
    openai_api_key=os.getenv("OPENAI_API_KEY", ""),
    base_url=os.getenv("OPENAI_BASE_URL")
)


class SourceConfigInput(BaseModel):
    token: str | None = None

@app.post("/api/voice")
async def voice_transcribe(audio: UploadFile = File(...)):
    """Receive an audio file and return the transcribed text."""
    audio_bytes = await audio.read()
    
    # Mock mode
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "mock":
        import asyncio
        await asyncio.sleep(1)
        return {"text": "What are my open pull requests?"}
        
    text = await transcribe_audio(audio_bytes, openai_client)
    return {"text": text}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Receive a text message, run the agent, and stream the response via SSE."""

    async def event_stream():
        # Mock mode
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "mock":
            import asyncio
            await asyncio.sleep(1)
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Querying GitHub for open PRs...'})}\n\n"
            await asyncio.sleep(1.5)
            sql_query = "SELECT title, url FROM github_pull_requests WHERE state = 'open' AND author = current_user()"
            yield f"data: {json.dumps({'type': 'sql', 'content': sql_query})}\n\n"
            await asyncio.sleep(1)
            yield f"data: {json.dumps({'type': 'text', 'content': 'You have 3 open pull requests right now. '})}\n\n"
            await asyncio.sleep(0.5)
            yield f"data: {json.dumps({'type': 'text', 'content': 'The most recent one is updating the marketplace UI.'})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return
            
        async for chunk in agent.chat(request.message):
            yield f"data: {json.dumps(chunk)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/chat/reset")
async def chat_reset():
    """Reset the agent conversation history."""
    agent.reset()
    return {"status": "ok"}


@app.get("/api/sources")
async def list_sources():
    """Return all installed Coral sources."""
    sources = await coral_source_list()
    return {"sources": sources}


@app.get("/api/dashboard/summary")
async def dashboard_summary():
    """Return quick summary statistics for the morning briefing dashboard."""
    sources = await coral_source_list()
    installed = {s["name"].lower() for s in sources}
    
    cards = []
    
    if "github" in installed:
        try:
            # Query open PRs
            result = await coral_sql("SELECT COUNT(*) as count FROM github.search_issues WHERE q='is:pr is:open author:@me'")
            if "SQL Error" not in result:
                data = json.loads(result)
                count = data[0].get("count", 0) if data else 0
                cards.append({"title": "Open PRs", "value": str(count), "source": "GitHub", "action": "Review my open PRs"})
        except Exception as e:
            print("Dashboard GitHub error:", e)

    if "linear" in installed:
        # Mock Linear query if it exists
        cards.append({"title": "Assigned Issues", "value": "2", "source": "Linear", "action": "Show my assigned Linear issues"})

    if "datadog" in installed:
        cards.append({"title": "Recent Alerts", "value": "0", "source": "Datadog", "action": "Check Datadog alerts"})

    return {"cards": cards}


@app.get("/api/sources/discover")
async def discover_sources():
    """Return all available Coral sources (installed + available)."""
    sources = await coral_source_discover()
    return {"sources": sources}


@app.post("/api/sources/add/{name}")
async def add_source(name: str, config: SourceConfigInput | None = None):
    """Add (install) a Coral source by name, with optional credentials."""
    from fastapi import HTTPException
    token = config.token if config else None
    
    # Clean up name: e.g. 'Hugging Face' -> 'huggingface'
    clean_name = name.lower().replace(" ", "").replace("-", "")
    
    result = await coral_source_add(clean_name, token=token)
    if result.startswith("Error:"):
        raise HTTPException(status_code=400, detail=result)
    return {"result": result}


@app.get("/api/sources/health/{name}")
async def source_health(name: str):
    """Check if a connected source is healthy."""
    result = await coral_source_health(name)
    return result
