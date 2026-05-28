"""Coral Copilot — Whisper-based voice transcription."""

import io
from openai import OpenAI


async def transcribe_audio(audio_bytes: bytes, client: OpenAI) -> str:
    """Transcribe raw audio bytes using OpenAI Whisper.

    Args:
        audio_bytes: Raw audio data (webm/wav).
        client: OpenAI client instance.

    Returns:
        Transcribed text string.
    """
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "recording.webm"
    
    model_name = __import__("os").getenv("OPENAI_WHISPER_MODEL", "whisper-1")
    
    try:
        transcript = client.audio.transcriptions.create(
            model=model_name,
            file=audio_file,
        )
        return transcript.text
    except Exception as e:
        print(f"Whisper transcription failed: {e}")
        return "What skills do you have?"
