"""Cliente del backend EN VIVO compartido.

El bot de Teams NO reimplementa el agente: llama al MISMO endpoint
`/api/copilot/chat` que usa el frontend, de modo que el conocimiento, el grounding
y las citas son idénticos en la web y en Teams.
"""

from __future__ import annotations

import json
import os

import httpx


def backend_url() -> str:
    return os.environ.get("BACKEND_URL", "http://localhost:8000").rstrip("/")


async def ask(question: str, history: list[dict] | None = None) -> dict:
    """Consulta el agente Copilot del backend (SSE) y devuelve la respuesta agregada.

    Returns: { answer, citations: [{source, ref}], followups: [str], mode, latency_ms }
    """
    answer = ""
    citations: list[dict] = []
    followups: list[str] = []
    mode = "live"
    latency_ms: int | None = None

    payload = {"question": question, "history": history or []}
    async with httpx.AsyncClient(timeout=120, verify=False) as client:
        async with client.stream("POST", f"{backend_url()}/api/copilot/chat", json=payload) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                try:
                    ev = json.loads(line[6:])
                except json.JSONDecodeError:
                    continue
                t = ev.get("type")
                if t == "first_token":
                    latency_ms = ev.get("latency_ms")
                elif t == "token":
                    answer += ev.get("text", "")
                elif t == "done":
                    citations = ev.get("citations", []) or []
                    followups = ev.get("followups", []) or []
                    mode = ev.get("mode", mode)

    return {
        "answer": answer.strip(),
        "citations": citations,
        "followups": followups,
        "mode": mode,
        "latency_ms": latency_ms,
    }
