"""Agente Next Best Action: analiza un cliente y sus señales y decide, en tiempo real,
la mejor acción comercial para el banquero. Hace streaming del razonamiento y luego
devuelve una recomendación estructurada (JSON) que el frontend pinta como tarjeta.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections.abc import AsyncIterator

from .llm import chat_stream, MarkerSplitter
from brand import BRAND_NAME

NBA_MARKER = "###NBA###"

# Tabla de incentivos (coherente con la base de conocimiento) para estimar comisión.
_INCENTIVES = """Retribución por ramo (primer año / recurrente):
Hogar 22%/4% · Salud 18%/5% · Auto 14%/4% · Vida-Ahorro 50%/3% · Decesos 30%/6% ·
Protección de Pagos 25%/3% · Mascotas 20%/4% · Multirriesgo Comercio 20%/4%."""

SYSTEM = f"""Eres el **motor Next Best Action** de {BRAND_NAME}. Recibes un cliente con su
perfil y señales detectadas (CRM, transaccional, comportamiento) y decides la MEJOR acción
comercial para que el banquero la ejecute hoy.

{_INCENTIVES}

Primero RAZONA en voz alta de forma breve (2-4 frases, español de España): qué señales son
relevantes, qué producto encaja y por qué es el mejor momento. No te repitas.

Después escribe en una línea nueva exactamente {NBA_MARKER} y a continuación SOLO un objeto
JSON válido (sin ```), con esta forma exacta:
{{
  "product": "Hogar|Auto|Vida-Ahorro|Salud|Decesos|Protección de Pagos|Mascotas|Multirriesgo Comercio",
  "propensity": <entero 0-100>,
  "reason": "<una frase explicando la recomendación>",
  "signals_used": ["<señal 1>", "<señal 2>"],
  "best_channel": "Llamada|Mensaje app|Reunión|Oficina|Push app|Email",
  "best_time": "<franja sugerida, p.ej. 'Hoy 11:30–12:30'>",
  "premium_eur": <entero, prima anual estimada>,
  "commission_eur": <entero, comisión primer año estimada según la tabla>,
  "script": "<frase de apertura natural para el banquero, en segunda persona>"
}}
La propensión debe ser coherente con la fuerza de las señales. Sé realista con prima y comisión."""


def _client_prompt(client: dict) -> str:
    edad = client.get("age")
    edad_txt = f"{edad} años" if edad else "—"
    señales = "\n".join(f"- {s}" for s in client.get("signals", []))
    return (
        f"CLIENTE: {client['name']}\n"
        f"Segmento: {client.get('segment', '—')} · Edad: {edad_txt}\n"
        f"Productos actuales: {', '.join(client.get('products', [])) or '—'}\n"
        f"Señales detectadas:\n{señales}\n"
        f"Contexto: {client.get('context', '')}"
    )


def _parse_nba(tail: str) -> dict | None:
    tail = tail.strip()
    if not tail:
        return None
    # Quita posibles fences ```json ... ```
    tail = re.sub(r"^```(?:json)?", "", tail.strip()).strip()
    tail = re.sub(r"```$", "", tail).strip()
    m = re.search(r"\{.*\}", tail, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


async def recommend(client: dict) -> AsyncIterator[dict]:
    """Eventos de streaming para la recomendación NBA de un cliente.

    Eventos:
      {"type": "reasoning", "text": str}   — fragmento del razonamiento
      {"type": "done", "nba": {...}, "usage": {...}, "mode": "live"|"mock"}
    """
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": _client_prompt(client)},
    ]
    splitter = MarkerSplitter(NBA_MARKER)
    usage: dict = {}

    try:
        async for ev in chat_stream(messages, max_tokens=900):
            if ev["type"] == "usage":
                usage = {k: ev[k] for k in ("prompt_tokens", "completion_tokens") if ev.get(k) is not None}
                continue
            emit = splitter.feed(ev["text"])
            if emit:
                yield {"type": "reasoning", "text": emit}
        tail_emit = splitter.flush()
        if tail_emit:
            yield {"type": "reasoning", "text": tail_emit}
    except Exception:  # noqa: BLE001
        async for ev in _mock_recommend(client):
            yield ev
        return

    nba = _parse_nba(splitter.tail)
    if not nba:
        async for ev in _mock_recommend(client, reasoning=False):
            yield ev
        return
    yield {"type": "done", "nba": nba, "usage": usage, "mode": "live"}


# ── Fallback mock por cliente ──────────────────────────────────────────────────
_MOCK_NBA: dict[str, dict] = {
    "cli-carlos": {
        "product": "Hogar", "propensity": 92, "premium_eur": 540, "commission_eur": 119,
        "reason": "Hipoteca reciente sin Hogar vinculado: ventana óptima de venta cruzada.",
        "signals_used": ["Firmó hipoteca de 185.000 € hace 9 días", "Sin póliza de Hogar activa"],
        "best_channel": "Llamada", "best_time": "Hoy 11:30–12:30",
        "script": "Enhorabuena por la nueva vivienda. Tu hipoteca incluye condiciones preferentes en el seguro de Hogar…",
    },
    "cli-lucia": {
        "product": "Salud", "propensity": 87, "premium_eur": 1180, "commission_eur": 212,
        "reason": "Nacimiento reciente: evento de máxima intención para Salud familiar.",
        "signals_used": ["Alta de beneficiario recién nacido en CRM", "Búsquedas de 'cuadro médico' en la web"],
        "best_channel": "Mensaje app", "best_time": "Hoy 18:00–19:00",
        "script": "Felicidades por la llegada de la peque. Tenemos un plan de Salud familiar con pediatría sin esperas…",
    },
    "cli-talleres": {
        "product": "Auto", "propensity": 81, "premium_eur": 3400, "commission_eur": 476,
        "reason": "Renovación de flota inminente con riesgo de fuga: defender y ampliar a multirriesgo.",
        "signals_used": ["Renovación de flota en 21 días", "Competidor envió oferta (riesgo de fuga)"],
        "best_channel": "Reunión", "best_time": "Mañana 09:30",
        "script": "Antes de la renovación repasamos la flota y un pack que mejora cobertura y precio…",
    },
    "cli-javier": {
        "product": "Vida-Ahorro", "propensity": 74, "premium_eur": 720, "commission_eur": 360,
        "reason": "Subida de ingresos y edad idónea: Vida-Ahorro con fiscalidad favorable.",
        "signals_used": ["Nómina domiciliada +18% (últimos 3 meses)", "Visitó el simulador de Vida"],
        "best_channel": "Llamada", "best_time": "Jueves 12:00",
        "script": "Con tu nueva situación, un Vida-Ahorro te protege y optimiza fiscalidad…",
    },
    "cli-ana": {
        "product": "Decesos", "propensity": 69, "premium_eur": 380, "commission_eur": 114,
        "reason": "Tramo de edad de máxima contratación y alta vinculación: Decesos.",
        "signals_used": ["Cumple 60 años este mes", "Alta vinculación (3 productos)"],
        "best_channel": "Oficina", "best_time": "Próxima visita",
        "script": "Aprovechando tu visita, te explico el plan de Decesos que da tranquilidad a la familia…",
    },
}


async def _mock_recommend(client: dict, reasoning: bool = True) -> AsyncIterator[dict]:
    nba = _MOCK_NBA.get(client.get("id", ""), {
        "product": "Hogar", "propensity": 70, "premium_eur": 480, "commission_eur": 106,
        "reason": "Señales compatibles con una oportunidad de venta cruzada.",
        "signals_used": client.get("signals", [])[:2],
        "best_channel": "Llamada", "best_time": "Hoy",
        "script": "Tengo una propuesta que encaja muy bien con tu situación actual…",
    })
    if reasoning:
        txt = (f"Analizando a {client['name']}: las señales más fuertes apuntan a "
               f"{nba['product']}. {nba['reason']} El momento es propicio, así que recomiendo "
               f"contactar por {nba['best_channel'].lower()}.")
        for i, w in enumerate(txt.split(" ")):
            await asyncio.sleep(0.03)
            yield {"type": "reasoning", "text": (" " if i else "") + w}
    yield {"type": "done", "nba": nba, "usage": {}, "mode": "mock"}
