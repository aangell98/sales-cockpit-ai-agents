"""Backend EN VIVO del cockpit comercial con Copilot para asesores y Next Best Action.

FastAPI con:
  GET  /api/health            — estado y configuración (modo live/mock, deployment)
  GET  /api/clients           — clientes candidatos a Next Best Action
  POST /api/copilot/chat      — agente Copilot (SSE, streaming token a token + citas)
  POST /api/nba/generate      — Next Best Action (SSE, razonamiento + recomendación)
  WS   /ws/live               — feed de señales/oportunidades en tiempo real

Reutiliza el patrón de Azure OpenAI con AI Gateway opcional. Si Azure no está
configurado, los agentes hacen fallback a un modo simulado de alta fidelidad
para que la demo nunca se rompa.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import time

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv(override=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("cockpit.api")

from azure_client import azure_configured, deployment_name, get_client  # noqa: E402
from agents import copilot_agent, nba_agent  # noqa: E402
from data import client_summary, CLIENT_BY_ID, random_signal  # noqa: E402


async def _warmup() -> None:
    """Calienta el token AAD y el deployment para que la PRIMERA pregunta sea rápida.

    El coste alto (~15 s) está en la adquisición del token vía DefaultAzureCredential;
    se paga aquí en segundo plano al arrancar, no en la primera interacción del usuario.
    """
    if not azure_configured():
        logger.info("Sin Azure configurado: modo mock (sin warmup)")
        return
    try:
        t0 = time.time()
        client = await get_client()
        await client.chat.completions.create(
            model=deployment_name(),
            messages=[{"role": "user", "content": "ok"}],
            max_completion_tokens=16,
        )
        logger.info("Warmup completo en %.1fs (token AAD + modelo listos)", time.time() - t0)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Warmup falló (se reintentará on-demand): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Sales cockpit backend arrancando · modo=%s", "live" if azure_configured() else "mock")
    asyncio.create_task(_warmup())
    yield
    logger.info("Sales cockpit backend apagándose")


app = FastAPI(title="Acme · Sales Cockpit Live Backend", version="1.0.0", lifespan=lifespan)

_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:4173", "http://127.0.0.1:4173",
    os.environ.get("FRONTEND_URL", ""),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in _origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


class ChatRequest(BaseModel):
    question: str
    history: list[dict] | None = None


class NbaRequest(BaseModel):
    client_id: str | None = None
    client: dict | None = None


@app.get("/api/health")
async def health():
    live = azure_configured()
    return {
        "status": "ok",
        "mode": "live" if live else "mock",
        "azure_connected": live,
        "deployment": deployment_name() if live else None,
        "service": "sales-cockpit-live",
    }


@app.get("/api/clients")
async def clients():
    return {"clients": client_summary()}


@app.post("/api/copilot/chat")
async def copilot_chat(req: ChatRequest):
    async def gen():
        t0 = time.time()
        yield _sse({"type": "start", "ts": t0})
        first = True
        try:
            async for ev in copilot_agent.answer(req.question, req.history):
                if first and ev["type"] == "token":
                    yield _sse({"type": "first_token", "latency_ms": int((time.time() - t0) * 1000)})
                    first = False
                yield _sse(ev)
        except Exception as exc:  # noqa: BLE001
            logger.exception("copilot error")
            yield _sse({"type": "error", "message": str(exc)})
        yield _sse({"type": "end", "elapsed_ms": int((time.time() - t0) * 1000)})

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/nba/generate")
async def nba_generate(req: NbaRequest):
    client = req.client or CLIENT_BY_ID.get(req.client_id or "")
    if not client:
        client = {"id": "adhoc", "name": "Cliente", "signals": [], "products": [], "context": ""}

    async def gen():
        t0 = time.time()
        yield _sse({"type": "start", "client": {"name": client.get("name"), "initials": client.get("initials", "")}})
        try:
            async for ev in nba_agent.recommend(client):
                yield _sse(ev)
        except Exception as exc:  # noqa: BLE001
            logger.exception("nba error")
            yield _sse({"type": "error", "message": str(exc)})
        yield _sse({"type": "end", "elapsed_ms": int((time.time() - t0) * 1000)})

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.websocket("/ws/live")
async def ws_live(ws: WebSocket):
    await ws.accept()
    logger.info("WS /ws/live conectado")
    try:
        await ws.send_json({"type": "hello", "mode": "live" if azure_configured() else "mock"})
        while True:
            await asyncio.sleep(random.uniform(2.6, 4.8))
            sig = random_signal()
            sig.update({"type": "signal", "id": f"sig-{int(time.time()*1000)}", "ts": time.time()})
            await ws.send_json(sig)
    except WebSocketDisconnect:
        logger.info("WS /ws/live desconectado")
    except Exception as exc:  # noqa: BLE001
        logger.warning("WS error: %s", exc)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
