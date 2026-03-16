# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**
- JavaScript (ES6+) - Frontend application code in `src/`
- JSX - React component syntax in `src/components/`

**Secondary:**
- Node.js JavaScript - Build scripts and dev tooling in `scripts/`

## Runtime

**Environment:**
- Node.js v25.2.1 or compatible

**Package Manager:**
- npm - Manages dependencies
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework for component-based architecture
  - Entry point: `src/main.jsx` → renders `<App />` into `#root`
  - Main orchestrator: `src/App.jsx` (~170 lines, handles routing and state)

**Routing:**
- react-router-dom 7.13.1 - Client-side routing
  - Routes defined in `src/App.jsx` (/, /portfolio, /reviews, /faq, /admin)
  - BrowserRouter wrapper in `src/main.jsx`

**Internationalization:**
- i18next 25.8.13 - Translation framework
- react-i18next 16.5.4 - React integration for i18next
  - Configuration: `src/i18n.js`
  - Supported languages: EN, DE, IT, FR, ES (5 total)
  - Translation files: `src/locales/{en,de,it,fr,es}.json`
  - Language selection via URL param or localStorage

**Build/Dev:**
- Vite 6.0.0 - Frontend build tool and dev server
  - Config: `vite.config.js`
  - Dev server runs on port 3000 with auto-browser-open
  - Bundle splitting via rollupOptions (vendor-react, vendor-i18n, vendor-supabase)
  - Build output: `dist/` directory

**Build Enhancement:**
- Puppeteer 24.37.5 - Headless browser automation
  - Used in `scripts/prerender.mjs` for static HTML pre-rendering
  - Pre-renders routes: /, /portfolio, /reviews, /faq
  - Runs during `npm run build` via `node scripts/prerender.mjs`

**React Plugin:**
- @vitejs/plugin-react 4.3.4 - Enables JSX transformation and Fast Refresh

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.97.0 - Backend as a service client
  - Used for all data persistence (CRUD for categories, work_items, FAQs, etc.)
  - Client initialization in `src/lib/supabase.js`
  - Supports auth, database, and file storage

**Framework Integration:**
- react-dom 18.3.1 - ReactDOM rendering

## Configuration

**Environment:**
- Environment variables loaded via Vite's `import.meta.env` (VITE_* prefix)
- `.env` file present (git-tracked environment configuration)
- `.env.supabase` file present (Supabase-specific configuration)
- `.env.example` provided for reference with required variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GOOGLE_TRANSLATE_KEY`

**Build:**
- Vite configuration: `vite.config.js`
  - React plugin enabled
  - Manual chunk splitting for vendor dependencies
  - Server auto-opens browser on dev start
- Vercel deployment config: `vercel.json`
  - Build command: `npm run build:fast` (skips pre-render for deploy)
  - Rewrites all routes to `/index.html` for SPA routing

## Platform Requirements

**Development:**
- Node.js v25+ (LTS or compatible)
- npm or similar package manager
- Modern browser for dev server (auto-opens Chrome/default)

**Production:**
- Vercel (current deployment platform)
- Environment variables configured in Vercel project settings
- Static site deployment (SPA with pre-rendered routes available)

**External:**
- Supabase project (PostgreSQL database, auth, file storage)

## Build Scripts

**Available Commands:**
- `npm run dev` - Start Vite dev server (port 3000, auto-opens browser)
- `npm run build` - Production build + pre-render static HTML
- `npm run build:fast` - Production build without pre-render (used by Vercel)
- `npm run preview` - Preview production build locally

---

*Stack analysis: 2026-03-16*
