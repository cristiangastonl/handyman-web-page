# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handyman services landing page for Zurich, Switzerland. Multi-page React app with Vite + Supabase backend.

## Commands

- `npm run dev` — Start dev server on http://localhost:3000 (auto-opens browser)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm test` — Run Vitest unit tests once
- `npm run test:watch` — Run Vitest in watch mode

No linter is configured.

## Verification harness — READ THIS BEFORE CLAIMING A CHANGE IS DONE

### Definition of done

A change is done when the harness is green. Not when the code looks right,
not when the diff reads well, not when it "should work".

**Never say "implemented", "works", or "fixed" without a green harness run in
this session.** If you have not run it, say so instead of implying success.
If it is red and you cannot fix it, say what is broken and what you tried —
an honest red beats a claimed green.

### The loop

Every code change goes through this cycle, automatically:

```
edit → guards (0.1s) → red? fix, repeat
     → done? → verify --scope → red? fix, repeat (up to 4 rounds)
     → commit/deploy → full verify → red? blocked
```

The rounds are the point. The first fix attempt is usually not the best one:
run, read the failure, fix the cause, run again. Converge, then report.

### Commands

| Command | Stages | Time | When |
|---|---|---|---|
| `npm run guards` | i18n + conventions + env | ~0.1s | After every file edit |
| `npm run verify:fast` | guards + unit | ~5s | Tight iteration loop |
| `npm run verify:scope` | picks stages from `git diff` | 5s–2min | Default before reporting done |
| `npm run verify` | guards + unit + build + e2e | ~1–2 min | Before commit / deploy |
| `npm run verify -- --stage=e2e` | one stage only | — | Debugging a specific failure |
| `npm run e2e:ui` | Playwright UI mode | — | Writing or fixing E2E tests |
| `npm run verify:prod` | prerender del sitio publicado | ~2s | Después de cada deploy |
| `npm run verify:db` | filas por tabla contra la base real | ~3s | Cuando algo cargado no aparece |
| `npm run verify:uso` | pedidos por día a Supabase (toda la org) | ~3s | Corre solo todos los días en GitHub; a mano si algo pesa |
| `npm run traducciones` | qué contenido de la base falta traducir | ~3s | La "corrida" de traducciones (ver abajo) |

`verify:scope` runs the full cycle when the diff touches anything that reaches
the browser (`src/components`, `src/lib`, `src/hooks`, `App.jsx`, `i18n.js`,
`index.html`, `public/`, configs, `e2e/`) and the fast cycle otherwise.

The harness exits non-zero on the **first** failing stage and prints a PASS/FAIL
summary. A non-zero exit means the change is broken — fix it, do not work around it.

### Fixing red, honestly

When a stage fails, fix the cause. Do **not**:

- weaken or delete a check so it passes
- add `waitForTimeout`, retries, or `try/catch` to paper over a real error
- mark a test `.skip` to move on
- claim the failure is unrelated without verifying it on a clean checkout

If a check itself is wrong, say so explicitly and change it deliberately,
with the reason in the commit message.

### What the harness checks

- **`scripts/guards/i18n.mjs`** — all 5 locales have the same keys as `en.json`,
  no empty values, matching `{{placeholders}}`, and brand words
  (`Handyman`, `Highlights`, `Specialist Technician At Domestic Matters`,
  `Handyman Services in Zurich`; única excepción: `Highlights` es "Destacados" en español)
  are never translated away.
- **`scripts/guards/conventions.mjs`** — no CSS imports or Tailwind classes
  (inline styles only), no hardcoded Supabase URLs/JWTs, no `debugger` or
  `.only`, required env vars present.
- **`scripts/check-prod-seo.mjs`** — pega contra el sitio **publicado** y verifica
  que las 4 rutas lleguen prerenderizadas (`<div id="root">` con contenido) y con
  title y meta description propios. No corre dentro de `verify` porque necesita
  red y un deploy vivo: se corre a mano después de deployar.
  Existe porque el resto del harness mira el build local, y eso no alcanzaba:
  Vercel estuvo buildeando con `build:fast` (sin prerender) y sirviendo 8 KB de
  cáscara vacía mientras los tests de SEO daban verde contra el build de acá.
- **`scripts/check-db-rows.mjs`** — cuenta las filas de cada tabla contra la base
  real y falla cuando una que todavía se lee de un saque pasa las 900. Tampoco
  corre dentro de `verify`: necesita red y las credenciales.
  Existe porque PostgREST recorta en `db-max-rows` (1000) **sin devolver error**.
  El 01/10/2026 `work_items` llegó a 1018 y las fotos que el cliente subía a
  "IKEA Lights" dejaron de aparecer: subían bien, se guardaban bien, y la app
  recibía una lista de 1000 que creía completa. Ninguna regla estática puede
  detectar eso, porque depende de cuánto creció la tabla. `work_items` ya se lee
  paginada (`src/lib/dbRead.js`) y un guard lo impone; este check es el que va a
  avisar cuando le toque a otra tabla.
- **`scripts/check-supabase-uso.mjs`** — pedidos por día a Supabase, sumando
  todos los proyectos de la organización (la cuota de egress es de la org). Falla
  si el último día o el de hoy pasan 20.000 pedidos al storage o 40.000 a la base.
  Lo corre todos los días `.github/workflows/uso-supabase.yml` (si falla, GitHub
  manda un mail). Existe porque el 21/10/2026 Supabase cortó la org con un 402
  (`exceed_cached_egress_quota`, los 250 GB de Pro) y el sitio quedó sin fotos:
  lo había gastado casi todo el propio e2e bajando fotos originales del bucket.
  Por eso **los tests no bajan fotos reales**: `test` de `e2e/helpers.js` las
  responde con un PNG falso (un guard prohíbe importar el `test` crudo de
  Playwright), y el prerender no pide imágenes.
- **`e2e/smoke.spec.js`** (Playwright, desktop + mobile) — the 4 public routes
  render with no console errors and no raw i18n keys, nav works, language
  switching persists across pages, portfolio images have `alt`, `/admin` shows
  the login form and leaks no admin tabs, every route has title + meta description.

### Adding coverage

When you add a feature, add its check to the harness in the same change:
a static rule goes in `scripts/guards/`, a user-visible behaviour goes in `e2e/`.
A feature with no check in the harness is a feature that will silently break.

### Automatic loop (Claude Code hooks)

`.claude/settings.json` wires the harness into the agent loop:

- **PostToolUse** on any edit → runs `guards`; a failure blocks with the error
  text so it gets fixed immediately.
- **Stop** → runs `verify:fast`; the session cannot end on a broken state.

To disable temporarily, rename `.claude/settings.json`.

### Setup (one time)

```bash
npm install
npx playwright install chromium
```

## Traducción del contenido que escribe Anibal

La interfaz se traduce con `src/locales/{en,de,it,fr,es}.json` (i18next). Lo que
Anibal escribe en el admin —textos del sitio (hero, bio, tarjetas de redes), FAQs,
categorías y subcategorías— vive en la base **sólo en inglés** y se traduce aparte.

**No se traducen, a propósito (Gastón, 21/10/2026):** lo que sube con las fotos
(título y descripción de cada trabajo, alt de Happy Customers) —cada foto nueva
esperaría una corrida— y **el pie entero**, que va siempre en inglés: el horario
es un dato que, traducido y desactualizado, mentiría.

- `src/locales/contenido/{de,it,fr,es}.json`: diccionarios `{ "texto en inglés tal cual": "traducción" }`.
- `src/lib/contenido.js`: `useContenido()` devuelve `tc(texto)`; los componentes
  lo usan **al mostrar** (el admin sigue viendo el inglés). Cada diccionario se
  baja sólo en su idioma.
- La clave es el texto entero: si Anibal cambia algo, se ve el inglés nuevo hasta
  la próxima corrida. Nunca una traducción vieja.

**La corrida** (cuando Gastón detecta cambios, a mano):
1. `npm run traducciones` → lista lo nuevo o cambiado en `traducciones-pendientes.json`.
2. Traducirlo (Claude) a un archivo `{ "de": {…}, "it": {…}, "fr": {…}, "es": {…} }`
   con las mismas reglas que el guard: alemán suizo (ss), palabras de marca en
   inglés, mismo estilo de letras Unicode, emojis y saltos de línea.
3. `npm run traducciones -- --aplicar <archivo>` y, si sobran textos viejos, `-- --limpiar`.
4. Verify, commit, deploy.

Al mostrar un texto nuevo de la base en un componente, pasarlo por `tc()` y, si
viene de otra tabla o clave de `site_config`, sumarlo en `scripts/traducciones.mjs`.
El guard `scripts/guards/contenido.mjs` chequea que los 4 diccionarios estén sanos.

## Links del portfolio

Cada nivel del portfolio y cada foto tienen su URL, para que Anibal pueda mandarle
a un cliente el link de un trabajo puntual (antes compartía álbumes de Facebook):
`/portfolio/<categoría>/<subcategoría>?tab=videos&foto=<id>`.

- `src/lib/portfolioRutas.js`: URL ↔ nivel. Lo usan la app y la función de vista
  previa: las dos tienen que entender las mismas URLs. Un link viejo (subcategoría
  renombrada) cae en el último nivel que existe.
- `App.jsx`: el nivel sale de la URL (`portfolioView` ya no es estado). Abrir una
  foto navega a `?foto=`; cerrarla vuelve a su grupo, y el "atrás" del celu la cierra.
- **Vista previa de WhatsApp**: los robots de vista previa (por user-agent, en
  `vercel.json`) van a `api/vista-previa.js`, que arma og:title/og:image con los
  datos del link (`src/lib/vistaPrevia.js`). La foto va achicada por el optimizador
  de imágenes de Vercel (`images` en `vercel.json`, mismo ancho y calidad que el
  código; lo chequea un test). Los visitantes reciben `/portfolio/index.html`.
- Los links profundos **no se indexan** (`X-Robots-Tag: noindex`) y su canonical es `/portfolio`.

## Architecture

Refactored component-based app with Supabase for data persistence.

### Key Files
- `src/App.jsx` (~170 lines) — main orchestrator, state management, routing
- `src/lib/constants.js` — brand config (`R = "#D4781F"`), default data, styles
- `src/lib/supabase.js` — CRUD for all tables (categories, work_items, faqs, subcategories, carousel_items, reviews, site_config)
- `src/i18n.js` — i18next config, 5 languages (EN, DE, IT, FR, ES)
- `src/locales/{en,de,it,fr,es}.json` — translation files

### Components (`src/components/`)
- Nav, Hero, StatsBar, About, ServiceAreas
- RecentWork, Highlights, ReturningCustomers, TailorJobs — 4 home page carousels
- Carousel — generic horizontal scroll carousel
- Portfolio — full drill-down page (categories → subcategories → photos/videos)
- Reviews, FAQ, CTA, Footer, StickyBar, WhatsAppFAB, Lightbox
- `Admin/AdminPanel.jsx` — admin panel with tabs (FAQs, Categories, Work, Subcats, Carousels, FB Reviews, G Reviews, Config)
- `Admin/CarouselsTab.jsx` — carousel curation UI (select portfolio items for each carousel)
- `Admin/DragList.jsx` — drag-to-reorder component

### Carousel Architecture
Portfolio (work_items) is the **single source of content**. The 4 home page carousels are "curated views" via the `carousel_items` table:
- **Recent Works** — latest work or curated selection
- **Highlights** — featured work
- **Returning Customers** — repeat client work
- **Tailor Jobs** — custom/tailored projects

Each carousel falls back to old data sources (highlights/returning_customers tables) if carousel_items is empty.

### Supabase Tables
- `categories`, `work_items`, `faqs`, `subcategories`, `carousel_items`
- `highlights`, `returning_customers` (legacy, kept for backward compat)
- `facebook_reviews`, `google_reviews`, `site_config`
- `images` (storage bucket)

Entry point: `src/main.jsx` renders `<App />` into `#root`.

## Key Conventions

- **Inline styles only**: no CSS modules, Tailwind, or external stylesheets. Style objects are defined inline or in the `S` constant in `constants.js`.
- **Global CSS** is injected via a template literal string (`css` variable) rendered as a `<style>` tag.
- **Static assets** go in `public/`.
- **Brand color**: `R = "#D4781F"` (orange)
- **"Handyman"** is a brand word — NEVER translate it
- **"Specialist Technician At Domestic Matters"** — brand subtitle, keep in English everywhere
- **"Highlights"** — keep in English everywhere, except Spanish: "Destacados" (Gastón, 21/10/2026)
- **"Handyman Services in Zurich"** — business name, never translated (hero title included)
- Admin panel at `/admin` (Ctrl+Shift+A shortcut), auth via Supabase
