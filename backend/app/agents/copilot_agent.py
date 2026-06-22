"""Agente Copilot para asesores (FAQ con grounding sobre la base de conocimiento).

Responde en tiempo real (streaming) **citando** las cláusulas del condicionado y
políticas internas. Reproduce el patrón de un agente RAG: el conocimiento se inyecta
como contexto y el modelo debe ceñirse a él y citar las fuentes.
"""

from __future__ import annotations

import os
import re
from collections.abc import AsyncIterator

from .llm import chat_stream, MarkerSplitter
from brand import BRAND_NAME

_KB_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge", "knowledge_base.md")

with open(_KB_PATH, encoding="utf-8") as _f:
    KNOWLEDGE = _f.read()

FOLLOWUP_MARKER = "###FOLLOWUPS###"

# Mapa de prefijo de referencia → nombre de fuente legible para mostrar la cita.
_SOURCE_BY_PREFIX: dict[str, str] = {
    "Hogar": f"Condicionado Hogar {BRAND_NAME}",
    "Salud": f"Condicionado Salud {BRAND_NAME}",
    "Auto": f"Condicionado Auto {BRAND_NAME}",
    "Vida": f"Condicionado Vida {BRAND_NAME}",
    "Decesos": f"Condicionado Decesos {BRAND_NAME}",
    "Incentivos": "Plan de Incentivos Comercial FY26",
    "Playbook": "Playbook de Retención Auto",
    "NBA": "Gobernanza Next Best Action",
    "Retención": "Política de Retención y Vinculación",
    "Proceso": "Manual de Procesos y Tramitación",
}

SYSTEM = f"""Eres **Copilot Asistente Seguros**, el agente de IA de {BRAND_NAME} que ayuda
a los banqueros de la red comercial. Respondes dudas sobre coberturas, carencias, comisiones,
retención y procesos.

REGLAS:
- Responde EXCLUSIVAMENTE con la información del CONOCIMIENTO de abajo. No inventes cifras.
- Si la respuesta no está en el conocimiento, dilo claramente y sugiere a quién consultar.
- Cita SIEMPRE las fuentes usando los identificadores entre corchetes tal cual aparecen en el
  conocimiento, por ejemplo [Hogar §4.2] o [Salud Anexo II]. Coloca la cita justo tras el dato.
- Usa **negritas** para los datos clave (porcentajes, plazos, importes, franquicias).
- Sé claro y conciso (2-5 frases). Tono profesional y cercano, en español de España.
- El banquero NO debe comunicar nada al cliente sin verificar; tú solo informas.

Tras tu respuesta, escribe en una línea nueva exactamente {FOLLOWUP_MARKER} y a continuación
2 sugerencias de seguimiento MUY cortas (≤ 42 caracteres cada una), redactadas como si las
escribiera EL BANQUERO para preguntarte algo más sobre el tema (su punto de vista) y que puedan
responderse con la base de conocimiento. NUNCA escribas preguntas en las que TÚ le pides que
elija o aclare (evita cosas como "¿Qué seguro quieres revisar?"). Escríbelas SIN comillas y
SEPARADAS EXACTAMENTE por una barra vertical " | ". Ejemplo del formato exacto:
Detállame la franquicia | ¿Qué documentación pido?

=== CONOCIMIENTO ===
{KNOWLEDGE}
=== FIN CONOCIMIENTO ===
"""


def extract_citations(text: str) -> list[dict]:
    """Extrae las referencias [..] del texto y las mapea a fuentes legibles."""
    seen: list[dict] = []
    keys: set[str] = set()
    for ref in re.findall(r"\[([^\]]+)\]", text):
        ref = ref.strip()
        if ref in keys:
            continue
        keys.add(ref)
        prefix = ref.split("§")[0].split("·")[0].split(" ")[0].strip()
        source = _SOURCE_BY_PREFIX.get(prefix, f"Base de conocimiento {BRAND_NAME}")
        seen.append({"source": source, "ref": ref})
    return seen


def _parse_followups(tail: str) -> list[str]:
    tail = tail.strip()
    if not tail:
        return []
    # Toma la primera línea no vacía
    line = next((ln for ln in tail.splitlines() if ln.strip()), "")
    # Separador principal "|"; fallback robusto a " · " o " / "
    if "|" in line:
        raw = line.split("|")
    elif " · " in line:
        raw = line.split(" · ")
    elif " / " in line:
        raw = line.split(" / ")
    else:
        raw = [line]
    parts = [p.strip(" -•\t\"'“”‘’") for p in raw]
    return [p for p in parts if p][:3]


async def answer(question: str, history: list[dict] | None = None) -> AsyncIterator[dict]:
    """Produce eventos de streaming para una pregunta del banquero.

    Eventos:
      {"type": "token", "text": str}         — fragmento de la respuesta
      {"type": "done", "citations": [...], "followups": [...], "usage": {...}}
    """
    messages: list[dict] = [{"role": "system", "content": SYSTEM}]
    for h in (history or [])[-6:]:
        role = "assistant" if h.get("who") == "agent" else "user"
        messages.append({"role": role, "content": h.get("text", "")})
    messages.append({"role": "user", "content": question})

    splitter = MarkerSplitter(FOLLOWUP_MARKER)
    prose = ""
    usage: dict = {}

    try:
        async for ev in chat_stream(messages, max_tokens=1100):
            if ev["type"] == "usage":
                usage = {k: ev[k] for k in ("prompt_tokens", "completion_tokens") if ev.get(k) is not None}
                continue
            emit = splitter.feed(ev["text"])
            if emit:
                prose += emit
                yield {"type": "token", "text": emit}
        tail_emit = splitter.flush()
        if tail_emit:
            prose += tail_emit
            yield {"type": "token", "text": tail_emit}
    except Exception as exc:  # noqa: BLE001 — fallback mock para que la demo nunca se rompa
        async for ev in _mock_answer(question):
            yield ev
        return

    followups = _parse_followups(splitter.tail)
    yield {
        "type": "done",
        "citations": extract_citations(prose),
        "followups": followups,
        "usage": usage,
        "mode": "live",
    }


# ── Fallback mock (sin Azure): respuestas de alta fidelidad en streaming ────────
import asyncio  # noqa: E402

_MOCK: list[tuple[list[str], str, list[dict], list[str]]] = [
    (
        ["hogar", "agua", "fuga", "vecino"],
        "Sí. La cobertura de **Daños por Agua** del seguro de Hogar cubre los daños que una "
        "fuga del vecino cause en tu continente y contenido, incluida la **localización de la "
        "avería** [Hogar §4.2]. La reparación en origen corre a cargo de la póliza del vecino. "
        "Franquicia: **0 €** en Confort y Premium [Hogar §4.2].",
        [{"source": f"Condicionado Hogar {BRAND_NAME}", "ref": "Hogar §4.2"}],
        ["¿Qué documentación pido al cliente?", "¿Cubre la reposición de mobiliario?"],
    ),
    (
        ["carencia", "salud", "operaci", "cirug"],
        "Depende: **urgencias y accidentes sin carencia** desde el día 1; **cirugía programada "
        "6 meses**; **parto 8 meses** [Salud Anexo II]. La carencia se elimina aportando el "
        "certificado de la póliza anterior por continuidad de coberturas [Salud Anexo II].",
        [{"source": f"Condicionado Salud {BRAND_NAME}", "ref": "Salud Anexo II"}],
        ["¿Cómo tramito la eliminación de carencias?", "¿Qué incluye el cuadro médico en Madrid?"],
    ),
    (
        ["comis", "vida", "ahorro"],
        "La retribución de **Vida-Ahorro** es del **50% de la prima del primer año** más un "
        "**3% recurrente** [Incentivos · Tabla por ramo]. Para 720 €/año, la comisión del primer "
        "año es de **360 €**. Se liquida con la nómina del mes siguiente al alta [Incentivos · Liquidación].",
        [{"source": "Plan de Incentivos Comercial FY26", "ref": "Incentivos · Tabla por ramo"}],
        ["¿Y la comisión de Decesos?", "¿Cuándo se liquidan los incentivos?"],
    ),
    (
        ["baja", "auto", "reten"],
        "Antes de tramitar la baja: (1) identifica el **motivo** (el **68%** es precio), (2) ofrece "
        "**revisión de coberturas** y ajuste de franquicia, (3) aplica el **descuento de fidelidad "
        "multiproducto** si tiene 2+ ramos [Playbook R-Auto v2]. Si persiste, ofrece **pausa de 30 "
        "días**. Retención media con este flujo: **41%** [Playbook R-Auto v2].",
        [{"source": "Playbook de Retención Auto", "ref": "Playbook R-Auto v2"}],
        ["Aplica el descuento de fidelidad a este cliente", "Genera el argumentario de retención"],
    ),
]


def _mock_match(question: str):
    q = question.lower()
    best = None
    best_score = 0
    for keys, ans, cits, fups in _MOCK:
        score = sum(1 for k in keys if k in q)
        if score > best_score:
            best, best_score = (ans, cits, fups), score
    if best and best_score > 0:
        return best
    return (
        "Puedo ayudarte con coberturas, carencias, comisiones, retención y procesos de "
        f"{BRAND_NAME}. Por ejemplo: «¿el Hogar cubre daños por agua del vecino?» o "
        "«¿qué comisión me llevo por Vida-Ahorro?».",
        [],
        ["¿El Hogar cubre daños por agua del vecino?", "¿Qué comisión tiene Vida-Ahorro?"],
    )


async def _mock_answer(question: str) -> AsyncIterator[dict]:
    ans, cits, fups = _mock_match(question)
    # Stream por palabras para emular la sensación de tiempo real
    words = ans.split(" ")
    for i, w in enumerate(words):
        await asyncio.sleep(0.025)
        yield {"type": "token", "text": (" " if i else "") + w}
    yield {"type": "done", "citations": cits, "followups": fups, "usage": {}, "mode": "mock"}
