"""Coral Copilot — Pydantic request/response models."""

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""

    message: str


class ChatChunk(BaseModel):
    """A single streaming chunk sent back to the frontend via SSE."""

    type: str  # "text", "sql", "error", "done"
    content: str = ""


class SourceInfo(BaseModel):
    """Represents a single Coral source."""

    name: str
    status: str  # "installed" | "available"
    description: str = ""
