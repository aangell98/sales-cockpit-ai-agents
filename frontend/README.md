<div align="center">

<img src="public/brand-logo.svg" alt="Acme" height="40" />

# Sales Cockpit · Frontend

**Highly-visual dashboard — Intro (zero-backend) + Live (Azure OpenAI) modes.**

`Vite` · `React 18` · `TypeScript` · `Tailwind CSS 3` · `lucide-react`

</div>

---

The dashboard for **Sales Cockpit AI Agents**. Toggle **Intro ⇆ Live** in the header.

- **Intro** — a self-contained, high-impact visual demo (hero, commercial cockpit with KPIs &
  gamification, Next Best Action, a Microsoft Teams Copilot mockup, tech reveal, cinematic
  auto-demo). Runs with **no backend**.
- **Live** — the tool working for real on Azure OpenAI: the **Copilot answers advisor questions
  grounded on a knowledge base** (with citations) and the agent **reasons the Next Best Action** in
  streaming. Falls back to a high-fidelity simulation if the backend is offline.

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # http://localhost:4173
```

Override the backend with `VITE_LIVE_API` at build time (see `.env.example`) to target a deployed
backend.

## Branding

Everything brand-related lives in `src/brand.ts` and `public/brand-logo.svg` / `favicon.svg`.
See [`../BRANDING.md`](../BRANDING.md).
