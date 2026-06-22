"""Brand configuration — single source of truth for the backend brand name.
Set BRAND_NAME (e.g. via .env or the Container App) to rebrand the agent's
spoken/written brand. Changing it requires a backend restart."""
import os

BRAND_NAME = os.environ.get("BRAND_NAME", "Acme")
