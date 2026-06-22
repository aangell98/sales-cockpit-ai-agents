"""Capa LLM compartida: streaming de Azure OpenAI + utilidades.

Expone `chat_stream()` que hace streaming token a token contra el deployment
configurado, y `split_on_marker()` para separar la prosa visible de una cola
estructurada (followups / JSON) dentro de un único stream.
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

from azure_client import get_client, deployment_name


def reasoning_effort() -> str | None:
    val = os.environ.get("OPENAI_REASONING_EFFORT", "low").strip().lower()
    return val or None


async def chat_stream(
    messages: list[dict],
    *,
    max_tokens: int = 1100,
) -> AsyncIterator[dict]:
    """Hace streaming de una respuesta de chat.

    Produce dicts: {"type": "delta", "text": str} por cada fragmento y, al final,
    {"type": "usage", ...} si el servicio lo reporta.
    Lanza excepción si Azure no está disponible (el llamador hace fallback a mock).
    """
    client = await get_client()
    effort = reasoning_effort()
    kwargs: dict = {
        "model": deployment_name(),
        "messages": messages,
        "max_completion_tokens": max_tokens,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    if effort:
        kwargs["extra_body"] = {"reasoning_effort": effort}

    stream = await client.chat.completions.create(**kwargs)
    async for chunk in stream:
        if getattr(chunk, "usage", None):
            u = chunk.usage
            yield {
                "type": "usage",
                "prompt_tokens": getattr(u, "prompt_tokens", None),
                "completion_tokens": getattr(u, "completion_tokens", None),
            }
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if delta and getattr(delta, "content", None):
            yield {"type": "delta", "text": delta.content}


class MarkerSplitter:
    """Filtra un stream de texto en dos partes separadas por un marcador.

    Emite el texto ANTES del marcador en tiempo real (reteniendo solo los últimos
    caracteres por si el marcador llega partido entre fragmentos) y acumula todo lo
    que viene DESPUÉS del marcador en `tail`.
    """

    def __init__(self, marker: str):
        self.marker = marker
        self.buffer = ""
        self.emitted = 0
        self.found = False
        self.tail = ""

    def feed(self, text: str) -> str:
        """Añade texto; devuelve la porción de prosa lista para emitir."""
        self.buffer += text
        if self.found:
            self.tail = self.buffer.split(self.marker, 1)[1]
            return ""
        idx = self.buffer.find(self.marker)
        if idx != -1:
            self.found = True
            out = self.buffer[self.emitted:idx]
            self.emitted = idx
            self.tail = self.buffer.split(self.marker, 1)[1]
            return out
        # No encontrado: emite hasta dejar un margen del tamaño del marcador
        safe_end = max(self.emitted, len(self.buffer) - len(self.marker))
        out = self.buffer[self.emitted:safe_end]
        self.emitted = safe_end
        return out

    def flush(self) -> str:
        """Emite cualquier prosa restante si nunca apareció el marcador."""
        if self.found:
            return ""
        out = self.buffer[self.emitted:]
        self.emitted = len(self.buffer)
        return out
