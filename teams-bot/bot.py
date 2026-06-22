"""Bot de Teams · Copilot Asistente Acme.

Comparte el agente del backend EN VIVO. Cuando un usuario escribe una pregunta en
Teams, el bot la envía al endpoint /api/copilot/chat y responde con una Adaptive Card
que incluye la respuesta, las **fuentes citadas** y botones de seguimiento.
"""

from __future__ import annotations

import re

from botbuilder.core import ActivityHandler, CardFactory, MessageFactory, TurnContext
from botbuilder.schema import Activity, ActivityTypes, Attachment, ChannelAccount

import agent_client
from config import Config

CONFIG = Config()
WELCOME = (
    f"👋 Hola, soy **Copilot Asistente de {CONFIG.BRAND_NAME}**. Pregúntame sobre coberturas, carencias, "
    f"comisiones, retención o procesos de {CONFIG.BRAND_NAME} y te responderé al instante "
    "**con las fuentes citadas**.\n\nPor ejemplo: *¿el seguro de Hogar cubre daños por una "
    "fuga del vecino de arriba?*"
)


def _md(text: str) -> str:
    """Normaliza el texto (las negritas **..** ya son markdown válido en Adaptive Cards)."""
    return text.strip()


def _answer_card(result: dict) -> Attachment:
    body: list[dict] = [
        {"type": "TextBlock", "text": f"{CONFIG.BRAND_NAME} · Copilot Asistente", "weight": "Bolder", "size": "Small", "spacing": "None"},
        {"type": "TextBlock",
         "text": ("🟢 en vivo · Azure OpenAI" if result.get("mode") == "live" else "🔵 modo simulado"),
         "isSubtle": True, "size": "Small", "spacing": "None"},
        {"type": "TextBlock", "text": _md(result["answer"]), "wrap": True, "spacing": "Medium"},
    ]

    citations = result.get("citations") or []
    if citations:
        body.append({"type": "TextBlock", "text": "FUENTES VERIFICADAS", "weight": "Bolder",
                     "size": "Small", "isSubtle": True, "spacing": "Medium", "wrap": True})
        for c in citations:
            body.append({
                "type": "TextBlock",
                "text": f"📄 **{c['source']}** · {c['ref']}",
                "size": "Small", "spacing": "None", "wrap": True,
            })

    lat = result.get("latency_ms")
    if lat is not None:
        body.append({"type": "TextBlock", "text": f"⚡ {lat} ms · gpt-5.4-mini · verifica antes de comunicar al cliente",
                     "isSubtle": True, "size": "Small", "spacing": "Medium", "wrap": True})

    def _short(t: str) -> str:
        t = t.strip()
        return (t[:44].rstrip() + "…") if len(t) > 46 else t

    actions = [
        {"type": "Action.Submit", "title": _short(f), "data": {"msteams": {"type": "imBack", "value": f}}}
        for f in (result.get("followups") or [])[:2]
    ]

    card = {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": body,
        "actions": actions,
    }
    return CardFactory.adaptive_card(card)


class CopilotBot(ActivityHandler):
    async def on_members_added_activity(self, members_added: list[ChannelAccount], turn_context: TurnContext):
        for member in members_added:
            if member.id != turn_context.activity.recipient.id:
                await turn_context.send_activity(MessageFactory.text(WELCOME))

    async def on_message_activity(self, turn_context: TurnContext):
        question = (turn_context.activity.text or "").strip()
        # Quita la mención al bot si viene de un canal
        question = re.sub(r"<at>.*?</at>", "", question).strip()
        if not question:
            await turn_context.send_activity(MessageFactory.text(WELCOME))
            return

        # Indicador de "escribiendo…" mientras el agente razona
        await turn_context.send_activity(Activity(type=ActivityTypes.typing))

        try:
            result = await agent_client.ask(question)
        except Exception as exc:  # noqa: BLE001
            await turn_context.send_activity(MessageFactory.text(
                f"⚠️ No he podido contactar con el servicio del agente ({exc}). "
                f"Verifica que el backend EN VIVO esté arrancado."
            ))
            return

        if not result.get("answer"):
            await turn_context.send_activity(MessageFactory.text("No he obtenido respuesta del agente. Inténtalo de nuevo."))
            return

        await turn_context.send_activity(MessageFactory.attachment(_answer_card(result)))
