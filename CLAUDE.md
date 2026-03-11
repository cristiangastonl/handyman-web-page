# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handyman services landing page for Zurich, Switzerland. Multi-page React app with Vite + Supabase backend.

## Commands

- `npm run dev` — Start dev server on http://localhost:3000 (auto-opens browser)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

No test runner or linter is configured.

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
