# Architecture

## Pattern

Single-page application (SPA) using a **top-down props-passing** pattern. There is no state management library (no Redux, Zustand, or Context API). All state lives in `src/App.jsx` and flows down as props to child components. This is a deliberate simplification — the app is small enough that prop drilling is manageable.

The app follows a **page-as-route** pattern with React Router v7, where each route renders a distinct top-level section. Two routes (`/portfolio` and `/admin`) are lazy-loaded via `React.lazy()` for code splitting.

## Layers

### 1. Entry Layer
- `index.html` — static shell with extensive SEO metadata (Open Graph, Twitter Cards, JSON-LD structured data for LocalBusiness and FAQPage), font preloading, and hreflang tags for 5 languages.
- `src/main.jsx` — bootstraps React 18 with `createRoot`, wraps in `BrowserRouter` and `StrictMode`.

### 2. Orchestration Layer
- `src/App.jsx` (~252 lines) — the central orchestrator. Owns all application state (13 `useState` hooks), fetches all data from Supabase on mount via `Promise.all`, derives the current page from `location.pathname`, and renders the route tree. Defines the `HomePage` component inline and passes data/callbacks to every child.

### 3. Component Layer
- `src/components/` — 21 component files plus 3 admin components. Components are presentational — they receive data via props and call callbacks for mutations. No component fetches its own data (except `AdminPanel` which handles CRUD operations directly).
- `src/components/ui.jsx` — shared UI primitives (`Stars`, `SocialIcon`, `Socials`, `Logo`, `GoogleG`, `MapPin`, `LangSelector`).

### 4. Data Layer
- `src/lib/supabase.js` — thin async CRUD functions over the Supabase client. Each function is a standalone export (e.g., `fetchCategories`, `addWorkItem`, `deleteHighlight`). The Supabase client is nullable — if env vars are missing, it returns `null` and all fetch functions return `null` or no-op.
- `src/lib/constants.js` — brand config, default/fallback data arrays, style objects (`S`), global CSS string (`css`), helper functions (`itemThumb`, `parseSiteText`, `getWALink`).
- `src/lib/translate.js` — Google Translate API integration for auto-translating FAQs into 4 languages.

### 5. Internationalization Layer
- `src/i18n.js` — i18next initialization. Language is resolved from URL query param (`?lang=`), then `localStorage`, then defaults to `en`.
- `src/locales/{en,de,it,fr,es}.json` — flat key-value translation files (~113 keys each).

### 6. Hooks Layer
- `src/hooks/useFadeIn.js` — IntersectionObserver-based visibility detection, fires once.
- `src/hooks/useScrollY.js` — throttled scroll position via `requestAnimationFrame`.

## Data Flow

```
Supabase DB
    |
    v
App.jsx (useEffect on mount)
    |-- Promise.all([fetchCategories, fetchWorkItems, ...])
    |-- normalizeCarouselItem() transforms joined data
    |-- Sets 13 state variables
    |
    v
Props passed to child components
    |-- Home page: Hero, StatsBar, About, RecentWork, Highlights, etc.
    |-- /portfolio: Portfolio (cats, items, subcats, portfolioView, setPortfolioView, setLb)
    |-- /reviews: ReviewsPage (googleReviews, fbReviews)
    |-- /faq: FAQPage (faqs)
    |-- /admin: AdminPanel (all state + setters)
```

### Carousel Data Flow
Portfolio `work_items` is the single source of content. The 4 home-page carousels (RecentWork, Highlights, ReturningCustomers, TailorJobs) are "curated views" via the `carousel_items` table, which references `work_items` by foreign key. Each carousel component receives both `curatedItems` and legacy fallback data, preferring curated items when available.

### Admin Data Flow
`AdminPanel` receives all state and setters from `App.jsx`. It calls Supabase CRUD functions directly (add/delete/update) and updates the parent state via the setter props. Authentication is handled within `AdminPanel` using Supabase Auth (`signInWithPassword`).

## Abstractions

### Generic Carousel (`src/components/Carousel.jsx`)
A reusable auto-playing infinite carousel using `requestAnimationFrame` for smooth animation. Supports pointer drag/swipe, pause on hover, and manual prev/next navigation. Items are tripled in the DOM for seamless looping.

### DragList (`src/components/Admin/DragList.jsx`)
A pointer-event-based drag-to-reorder list. Uses direct DOM manipulation via refs for performance — no React state during drag. Creates a full-screen overlay during drag to prevent event leaking. Blocks clicks for 500ms after drag ends.

### FadeIn / AnimatedCounter (`src/components/FadeIn.jsx`)
Intersection Observer-based entrance animations. `FadeIn` supports directional slide-in (up/down/left/right). `AnimatedCounter` animates from 0 to a target number with eased timing.

### Site Config System
`site_config` table stores arbitrary key-value pairs. `parseSiteText()` in `src/lib/constants.js` handles both legacy plain-text values and JSON objects with `{text, fontSize, fontFamily}`. Used for hero title, subtitle, and brand subtitle customization.

## Entry Points

| Entry Point | File | Purpose |
|---|---|---|
| Browser | `index.html` | Static HTML shell, SEO metadata, font loading |
| React | `src/main.jsx` | Mounts `<App />` into `#root` |
| Build | `vite.config.js` | Vite config with manual chunk splitting |
| Pre-render | `scripts/prerender.mjs` | Puppeteer-based pre-rendering of 4 routes |
| Deploy | `vercel.json` | Vercel config with SPA rewrites |
| SQL | `supabase-setup.sql` | Database schema and seed data |
| SQL | `carousel-migration.sql` | Migration for carousel_items table |

## Routing

| Path | Component | Loading |
|---|---|---|
| `/` | HomePage (inline in App.jsx) | Eager |
| `/portfolio` | Portfolio | Lazy |
| `/reviews` | ReviewsPage | Eager |
| `/faq` | FAQPage | Eager |
| `/admin` | AdminPanel | Lazy |
| `*` | HomePage (catch-all) | Eager |

Navigation is handled by `useNavigate` from React Router. The `nav()` helper in `App.jsx` normalizes page names to paths, resets portfolio view, closes mobile menu, and scrolls to top.
