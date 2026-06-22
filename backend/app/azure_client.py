"""Cliente compartido de Azure OpenAI para el backend EN VIVO del cockpit comercial.

Reutiliza el patrón del proyecto `insurance-ai-agents` (agents/shared/azure_client.py):

Dos modos de enrutado controlados por la variable ``USE_APIM_GATEWAY``:

1. ``false`` (por defecto): llamada directa a Azure OpenAI usando un token AAD
   obtenido vía ``DefaultAzureCredential`` (o ``az account get-access-token`` como
   fallback). Ideal para desarrollo local con ``az login``.

2. ``true``: enruta por el AI Gateway de Azure API Management (identidad gestionada,
   content safety, límites de tokens, telemetría). El agente solo lleva una
   subscription key — los secretos se quedan dentro del gateway.

Variables de entorno:
- ``AZURE_OPENAI_ENDPOINT``   (requerida) — p.ej. https://xxx.openai.azure.com/
- ``AZURE_OPENAI_DEPLOYMENT`` (requerida) — p.ej. gpt-4o-mini
- ``AZURE_OPENAI_API_VERSION``(opcional, por defecto 2025-04-01-preview)
- ``USE_APIM_GATEWAY``        (opcional, por defecto false)
- ``APIM_GATEWAY_URL``        (cuando APIM está activo)
- ``APIM_SUBSCRIPTION_KEY``   (cuando APIM está activo)
- ``AGENT_ID``                (opcional) — emitido como X-Agent-Id para metering
- ``INSECURE_TLS``            (opcional, por defecto true) — salta verificación TLS
                              (redes corporativas con MITM). Poner false en producción.
"""

from __future__ import annotations

import logging
import os
import subprocess
import time

import httpx
from openai import AsyncAzureOpenAI

logger = logging.getLogger("cockpit.azure")

DEFAULT_API_VERSION = "2025-04-01-preview"

_cached_token: str | None = None
_token_expires: float = 0.0
_client: AsyncAzureOpenAI | None = None


def _insecure_tls() -> bool:
    return os.environ.get("INSECURE_TLS", "true").lower() in ("1", "true", "yes")


def _use_apim() -> bool:
    return os.environ.get("USE_APIM_GATEWAY", "false").lower() in ("1", "true", "yes")


def azure_configured() -> bool:
    """¿Hay configuración suficiente para intentar una llamada real a Azure?"""
    if _use_apim():
        return bool(os.environ.get("APIM_GATEWAY_URL") and os.environ.get("APIM_SUBSCRIPTION_KEY"))
    return bool(os.environ.get("AZURE_OPENAI_ENDPOINT"))


def deployment_name() -> str:
    return os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")


def _api_version() -> str:
    return os.environ.get("AZURE_OPENAI_API_VERSION", DEFAULT_API_VERSION)


def _get_token_via_default_credential() -> str | None:
    """DefaultAzureCredential — funciona con `az login`, managed identity y OIDC en CI."""
    try:
        from azure.identity import DefaultAzureCredential  # type: ignore
    except ImportError:
        return None
    try:
        cred = DefaultAzureCredential(
            exclude_interactive_browser_credential=True,
            process_timeout=60,
        )
        token = cred.get_token("https://cognitiveservices.azure.com/.default")
        logger.info("Token Azure obtenido vía DefaultAzureCredential")
        return token.token
    except Exception as exc:  # noqa: BLE001
        logger.warning("DefaultAzureCredential falló: %s", exc)
        return None


def _get_token_via_cli() -> str:
    """Fallback: token AAD llamando a `az` síncronamente (dev local)."""
    for az_path in (r"C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd", "az"):
        try:
            result = subprocess.run(
                [az_path, "account", "get-access-token",
                 "--resource", "https://cognitiveservices.azure.com",
                 "--query", "accessToken", "-o", "tsv"],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode == 0 and result.stdout.strip():
                logger.info("Token Azure obtenido vía az CLI")
                return result.stdout.strip()
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    raise RuntimeError("No se pudo obtener token de Azure. Ejecuta 'az login' primero.")


def _get_token() -> str:
    return _get_token_via_default_credential() or _get_token_via_cli()


async def get_client() -> AsyncAzureOpenAI:
    """Devuelve un AsyncAzureOpenAI configurado (APIM o directo con token AAD cacheado)."""
    global _cached_token, _token_expires, _client

    verify = not _insecure_tls()

    if _use_apim():
        if _client is None:
            apim_url = os.environ.get("APIM_GATEWAY_URL", "").rstrip("/")
            apim_key = os.environ.get("APIM_SUBSCRIPTION_KEY", "")
            if not apim_url or not apim_key:
                raise RuntimeError(
                    "USE_APIM_GATEWAY=true requiere APIM_GATEWAY_URL y APIM_SUBSCRIPTION_KEY."
                )
            apim_http = httpx.AsyncClient(
                verify=verify,
                headers={
                    "Ocp-Apim-Subscription-Key": apim_key,
                    "X-Agent-Id": os.environ.get("AGENT_ID", "sales-cockpit-agent"),
                },
            )
            _client = AsyncAzureOpenAI(
                azure_endpoint=apim_url,
                api_key="apim-managed",
                api_version=_api_version(),
                http_client=apim_http,
            )
            logger.info("Cliente OpenAI enrutado por APIM gateway")
        return _client

    if _cached_token is None or time.time() > _token_expires:
        _cached_token = _get_token()
        _token_expires = time.time() + 3000
        _client = None  # fuerza nuevo cliente con token fresco

    if _client is None:
        _client = AsyncAzureOpenAI(
            azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
            azure_ad_token=_cached_token,
            api_version=_api_version(),
            http_client=httpx.AsyncClient(verify=verify),
        )
    return _client
