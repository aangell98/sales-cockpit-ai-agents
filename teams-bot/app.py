"""Servidor aiohttp del bot de Teams · Copilot Asistente Acme.

Expone /api/messages (endpoint de mensajería de Bot Framework) y /health.
Usa CloudAdapter (botbuilder 4.16) con autenticación basada en configuración.
"""

from __future__ import annotations

import sys
import traceback

from aiohttp import web
from aiohttp.web import Request, Response, json_response
from botbuilder.core.integration import aiohttp_error_middleware
from botbuilder.integration.aiohttp import CloudAdapter, ConfigurationBotFrameworkAuthentication

from bot import CopilotBot
from config import Config

CONFIG = Config()
ADAPTER = CloudAdapter(ConfigurationBotFrameworkAuthentication(CONFIG))


async def on_error(context, error: Exception):
    print(f"\n[on_turn_error] {error}", file=sys.stderr)
    traceback.print_exc()
    await context.send_activity("El bot ha encontrado un error. Revisa los logs.")


ADAPTER.on_turn_error = on_error
BOT = CopilotBot()


async def messages(req: Request) -> Response:
    return await ADAPTER.process(req, BOT)


async def health(_req: Request) -> Response:
    return json_response({
        "status": "ok",
        "service": f"{CONFIG.BRAND_NAME.lower().replace(' ', '-')}-teams-bot",
        "brand": CONFIG.BRAND_NAME,
        "backend": CONFIG.BACKEND_URL,
        "app_id_set": bool(CONFIG.APP_ID),
    })


APP = web.Application(middlewares=[aiohttp_error_middleware])
APP.router.add_post("/api/messages", messages)
APP.router.add_get("/health", health)


if __name__ == "__main__":
    try:
        web.run_app(APP, host="0.0.0.0", port=CONFIG.PORT)
    except Exception as exc:  # noqa: BLE001
        raise exc
