# Backend EN VIVO · Sales Cockpit

Backend FastAPI para una demo reutilizable de cockpit comercial: Copilot para asesores y Next Best Action.

## Variables principales

Copia `.env.example` a `.env` y ajusta lo necesario:

- `AZURE_OPENAI_ENDPOINT`: endpoint de Azure OpenAI. Si no se define, el backend usa modo mock.
- `AZURE_OPENAI_DEPLOYMENT`: deployment del modelo.
- `BRAND_NAME`: marca que el agente usa en sus respuestas. Por defecto: `Acme`.
- `FRONTEND_URL`: origen permitido para CORS.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado y modo (`live`/`mock`). |
| `GET` | `/api/clients` | Clientes candidatos a Next Best Action. |
| `POST` | `/api/copilot/chat` | Copilot para asesores — **SSE** con tokens, citas y sugerencias. |
| `POST` | `/api/nba/generate` | Next Best Action — **SSE** con razonamiento y recomendación JSON. |
| `WS` | `/ws/live` | Feed de señales/oportunidades en tiempo real. |

## Ejecución local

```powershell
.\run.ps1
```

También puedes ejecutar desde `app`:

```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Estructura relevante

```text
app/
  main.py                 API FastAPI del cockpit
  data.py                 Clientes y señales mock
  azure_client.py         Cliente Azure OpenAI / APIM opcional
  brand.py                Configuración de marca (`BRAND_NAME`)
  agents/
    copilot_agent.py      Copilot con grounding y citas
    nba_agent.py          Motor Next Best Action
    llm.py                Streaming LLM compartido
  knowledge/
    knowledge_base.md     Base de conocimiento para grounding/citas
```
