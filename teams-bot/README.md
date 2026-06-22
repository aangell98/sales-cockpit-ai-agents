# Teams Bot · Copilot Demo

Microsoft Bot Framework bot (Python) that surfaces the cockpit Copilot inside Microsoft Teams. It does not reimplement the agent: it calls the backend endpoint `/api/copilot/chat` and returns the answer, citations, and follow-up actions as an Adaptive Card.

This is a conceptual reusable demo using the placeholder brand **Acme**. Rebrand it by setting one environment variable: `BRAND_NAME`.

## Run locally

1. Start the backend that exposes `/api/copilot/chat` (default `http://localhost:8000`).
2. Copy `.env.example` to `.env` and fill the Bot Framework credentials from your Azure Bot registration.
3. Start the bot:

```powershell
.\run.ps1
```

Health check:

```powershell
curl http://localhost:3978/health
```

For local chat testing, use Bot Framework Emulator or expose `http://localhost:3978/api/messages` through an HTTPS tunnel and set that URL as the Azure Bot messaging endpoint.

## Required environment

```text
MICROSOFT_APP_ID=<Azure Bot app ID>
MICROSOFT_APP_PASSWORD=<Azure Bot client secret>
MICROSOFT_APP_TYPE=MultiTenant
MICROSOFT_APP_TENANT_ID=<tenant ID when required>
BACKEND_URL=http://localhost:8000
BRAND_NAME=Acme
PORT=3978
```

## Files

- `app.py`: aiohttp server with `/api/messages` and `/health`.
- `bot.py`: Teams conversation handler and Adaptive Card response.
- `agent_client.py`: SSE client for the backend `/api/copilot/chat` endpoint.
- `config.py`: environment-based configuration.
