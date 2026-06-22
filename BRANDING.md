# White-label guide — rebranding Sales Cockpit AI Agents

This demo ships as a **brand-agnostic preset**. The bundled brand is **`Acme`** (a generic
placeholder). To present it to a different audience or client, swap the brand in a few minutes by
editing the files below. Everything brand-related is centralized — there is no need to hunt through
components.

---

## 1. Frontend brand — `frontend/src/brand.ts`

Single source of truth for brand text and asset references shown in the dashboard:

```ts
export const BRAND = {
  bank: 'Acme',                 // Full brand / company name
  unit: 'Acme',                 // Name the agent speaks as (header subtitle)
  product: 'Cockpit Comercial', // Product name (header, accent split)
  productAccent: 'Copilot para Banqueros',
  logoUrl: '/brand-logo.svg',   // Header / footer logo
  logoAlt: 'Acme',
  tagline: 'El copiloto de IA de la red comercial de bancaseguros',
  primaryHex: '#0D9488',        // Primary brand color (keep in sync with Tailwind)
  caseId: 'SC-01',
  caseTitle: 'Dashboard comercial y agente de Teams para banqueros',
} as const;
```

After editing, run `cd frontend && npm run build` to validate.

> The demo UI strings are in Spanish. Sample data and the agent's scripted messages mention the
> brand inline as **“Acme”** — a project-wide search-replace of `Acme` updates them. The live
> (backend-driven) responses use `BRAND_NAME` (see §4).

## 2. Logo & favicon — `frontend/public/`

Replace these files (keep the file names so no code changes are needed):

| File | What it is | Recommended size |
|---|---|---|
| `frontend/public/brand-logo.svg` | Horizontal logo in header, footer, autoplay. | viewBox ~196×48. |
| `frontend/public/brand-logo-dark.svg` | Same logo with a light wordmark for dark backgrounds (used by the README). | viewBox ~196×48. |
| `frontend/public/favicon.svg` | Browser tab / app icon. | 64×64 square. |

If you only have a raster logo, drop it into `public/` (e.g. `brand-logo.png`) and update
`BRAND.logoUrl` in `brand.ts`.

## 3. Color palette — `frontend/tailwind.config.js` + `frontend/src/index.css`

The dashboard uses a semantic `primary` palette plus a `brand` alias. Replace the hex values to
change the dominant color (default is a teal placeholder `#0D9488`):

```js
primary: {
  50:  '#F0FDFA', /* … */ 500: '#0D9488', /* main — replace */ 600: '#0F766E', /* … */ 900: '#0B3B38',
},
```

The glow/animation effects read a CSS variable — update it too in `frontend/src/index.css`:

```css
:root { --brand: 13, 148, 136; --brand-dark: 15, 118, 110; }  /* RGB of your primary */
```

## 4. Backend & Teams bot brand — env var

The agents interpolate the brand name into their prompts and messages at import time. Set the same
value in both services:

| Variable | Default | Where | Purpose |
|---|---|---|---|
| `BRAND_NAME` | `Acme` | `backend/.env` | The brand the cockpit agents speak as (prompts + messages). |
| `BRAND_NAME` | `Acme` | `teams-bot/.env` | The brand shown in the Teams Adaptive Cards. |

Source: `backend/app/brand.py` and `teams-bot/config.py`. Changing it requires a **restart**. The
knowledge base used for grounding lives at `backend/app/knowledge/knowledge_base.md` — replace its
contents with your own product / coverage / commission docs.

The Teams app package (`teams-bot/appManifest/manifest.json` + `color.png` / `outline.png`) also
carries the brand name and icons — update them before publishing to your tenant.

## 5. Architecture diagram — `tools/gen_arch_svg.py`

The diagrams (`images/architecture.svg`, `images/architecture-en.svg`) are generated from a Python
script, so they're easy to rebrand. Edit the brand tokens at the top:

```python
BRAND_NAME        = "Acme"
BRAND_MARK_LETTER = "A"
BRAND_PRIMARY     = "#0D9488"
BRAND_PRIMARY_DARK = "#0F766E"
```

Then regenerate:

```powershell
python tools\gen_arch_svg.py
```

## 6. README & metadata

Update the top of `README.md` (logo alt, brand references) and the `<title>` in
`frontend/index.html` to match your brand.

---

## Quick rebrand checklist

1. `frontend/src/brand.ts` ← edit the `BRAND` object.
2. `frontend/public/brand-logo.svg` (+ `brand-logo-dark.svg`, `favicon.svg`) ← drop in your logo.
3. `frontend/tailwind.config.js` + `frontend/src/index.css` ← replace the primary palette / `--brand`.
4. `BRAND_NAME` env var on the **backend** and **teams-bot** (+ swap `knowledge_base.md`).
5. `teams-bot/appManifest/` ← manifest name + Teams icons.
6. `tools/gen_arch_svg.py` ← update tokens, run `python tools\gen_arch_svg.py`.
7. (Optional) project-wide search-replace `Acme` for the Intro demo copy.
8. `cd frontend && npm run build` to validate.
