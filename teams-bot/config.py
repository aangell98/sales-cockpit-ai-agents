"""Configuración del bot (lee variables de entorno / .env)."""

import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Atributos esperados por ConfigurationBotFrameworkAuthentication."""

    PORT = int(os.environ.get("PORT", "3978"))
    APP_ID = os.environ.get("MICROSOFT_APP_ID", "")
    APP_PASSWORD = os.environ.get("MICROSOFT_APP_PASSWORD", "")
    APP_TYPE = os.environ.get("MICROSOFT_APP_TYPE", "MultiTenant")
    APP_TENANTID = os.environ.get("MICROSOFT_APP_TENANT_ID", "")
    BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000").rstrip("/")
    BRAND_NAME = os.environ.get("BRAND_NAME", "Acme")
