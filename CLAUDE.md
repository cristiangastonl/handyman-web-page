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
  (`Handyman`, `Highlights`, `Specialist Technician At Domestic Matters`)
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
- **"Highlights"** — keep in English everywhere
- Admin panel at `/admin` (Ctrl+Shift+A shortcut), auth via Supabase
