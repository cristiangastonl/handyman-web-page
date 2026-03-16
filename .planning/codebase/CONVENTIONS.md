# Conventions

## Styling

### Inline Styles Only
The project uses **no CSS modules, Tailwind, styled-components, or external stylesheets**. All styling is done through:

1. **Inline `style` objects** on JSX elements — the dominant pattern. Styles are written directly on elements or stored as reusable objects in `src/lib/constants.js` under the `S` export.
2. **Global CSS string** — the `css` template literal in `src/lib/constants.js` is rendered as a `<style>` tag in `App.jsx`. This handles things inline styles cannot: pseudo-elements, media queries, keyframe animations, scrollbar hiding, and hover states via class names.
3. **CSS class names** — used sparingly, primarily for responsive breakpoints (`desktop-nav`, `mobile-hamburger`, `logo-desktop`, `logo-mobile`, `hero-section`, `sticky-bar`, `brand-marquee`) and animations (`heroContent`, `hs` for scrollbar hiding).

### Style Object Conventions
- The `S` object in `constants.js` holds reusable admin/layout styles: `S.root`, `S.nav`, `S.navIn`, `S.ghost`, `S.label`, `S.input`, `S.btnPrimary`, `S.adminCard`, `S.btnDanger`, `S.btnSmall`, `S.listItem`.
- The `ab()` function generates absolute-positioned circular nav arrow buttons (`ab("left")`, `ab("right")`).
- Hover effects are applied via `onMouseEnter`/`onMouseLeave` handlers that directly mutate `e.currentTarget.style`. This is used extensively for card lift effects, opacity changes, and scale transforms.

### Responsive Design
- Mobile breakpoint: 640px. Desktop breakpoint: 641px (min-width).
- StickyBar hides below 900px.
- All responsive rules are in the global `css` string using `@media` queries.
- The `!important` flag is used frequently in mobile overrides to override inline styles.
- `prefers-reduced-motion` is respected — all animations are disabled.

## Component Patterns

### Export Style
- Most components use `export default function ComponentName()`.
- Some files export multiple named components: `CTA.jsx` exports `{ TailoringCTA, ServiceAreasCTA, BottomCTA }`, `Reviews.jsx` exports `{ GoogleReviewsHome, ReviewsPage }`, `FAQ.jsx` exports `{ FAQHome, FAQPage }`, `FadeIn.jsx` exports `{ FadeIn, AnimatedCounter }`.
- `RecentWork.jsx` uses a named export `{ RecentWork }` (not default).

### Props Pattern
- Components receive all data and callbacks as props from `App.jsx`.
- No component fetches data on its own (except `AdminPanel`).
- Setter functions are passed down for child-to-parent communication (e.g., `setLb` for opening the lightbox, `setPortfolioView` for navigation).
- Default values are provided via parameter defaults: `siteConfig = {}`, `curatedItems = []`, `fbReviewCount = 120`.

### Conditional Rendering
- Ternary expressions for simple conditionals.
- `&&` short-circuit for optional sections.
- IIFE pattern `{(() => { ... })()}` used in `Portfolio.jsx` for the category detail view, which needs local variables.

### Event Handling
- Inline arrow functions are used throughout: `onClick={() => nav("portfolio")}`.
- Keyboard accessibility is added to interactive non-button elements via `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers (e.g., the "See My Work" link in Hero).

## Naming Patterns

### Data Shapes
Data fetched from Supabase is transformed in `App.jsx` to match the component-expected shape:
- `work_items` rows are mapped to `{ id, type, cat, src, thumb, title, desc, videoId }` (note: `description` becomes `desc`, `video_id` becomes `videoId`).
- `categories` get an `{ id: "all", label: "All" }` entry prepended.
- `carousel_items` are normalized via `normalizeCarouselItem()` which flattens the joined `work_items` relation.
- FAQs map `question`/`answer` to `q`/`a` with multilingual fields preserved.

### Translation Keys
- Dot-notation namespace: `nav.home`, `portfolio.title`, `reviews.count`.
- Interpolation uses double braces: `{{count}}`, `{{year}}`.
- Some keys have inline defaults: `t("hero.seeWork", "See My Work")`.
- "Handyman" is never translated — it is a brand word.
- "Specialist Technician At Domestic Matters" and "Highlights" are kept in English across all locales.

## Error Handling

### Fetch Errors
- `App.jsx` wraps each Supabase fetch in a `safe()` helper: `const safe = (fn) => fn().catch(err => { console.warn('Fetch error:', err.message); return null; })`. Each fetch is independent — one failure does not block others.
- If a fetch returns `null` or empty, the corresponding state keeps its default value (usually an empty array or hardcoded fallback data from `constants.js`).

### Supabase Client Nullability
- Every function in `supabase.js` starts with `if (!supabase) return null;` (for fetches) or `if (!supabase) return;` (for mutations). The app works without Supabase using fallback data.

### Admin Operations
- Admin CRUD operations in `AdminPanel.jsx` use try/catch with `alert()` for error display and `setAdminMsg()` for success confirmation.
- Image uploads validate file size (5MB max) and MIME type before uploading.

### No Global Error Boundary
- There is no React error boundary. Errors in components will crash the app.

## Build and Deploy

### Chunk Splitting
`vite.config.js` defines manual chunks:
- `vendor-react`: react, react-dom, react-router-dom
- `vendor-i18n`: i18next, react-i18next
- `vendor-supabase`: @supabase/supabase-js

### Code Splitting
- `Portfolio` and `AdminPanel` are lazy-loaded via `React.lazy()`.
- A `<Suspense>` wrapper with a spinner fallback covers all routes.

### Pre-rendering
- `scripts/prerender.mjs` uses Puppeteer to pre-render 4 routes (`/`, `/portfolio`, `/reviews`, `/faq`) into static HTML in `dist/`.
- The `build` script runs this after `vite build`. A `build:fast` script skips pre-rendering.
- Vercel uses `build:fast` (per `vercel.json`).

### Environment Variables
Three env vars are used (all `VITE_` prefixed for Vite client exposure):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_GOOGLE_TRANSLATE_KEY` — Google Cloud Translation API key (used only in admin for FAQ auto-translation)

## Accessibility

- Skip-to-content link at the top of the page.
- `aria-label` attributes on icon buttons, social links, and the lightbox dialog.
- `role="dialog"` and `aria-modal="true"` on the lightbox.
- Focus trap implemented in `Lightbox.jsx`.
- `focus-visible` outline styling in global CSS.
- `aria-pressed` on language selector buttons.
- `lang` attribute on `<html>` updates dynamically based on selected language.
- `prefers-reduced-motion` media query disables all animations.

## Performance Patterns

- Hero image preloaded via `<link rel="preload">` in `index.html` with `fetchpriority="high"`.
- Lazy loading on all non-hero images via `loading="lazy"`.
- Font loading optimized with `preconnect` and deferred loading for decorative fonts (`media="print" onload="this.media='all'"` trick).
- `will-change: transform` on animated elements (carousel track, hero parallax).
- Scroll handler throttled via `requestAnimationFrame` in `useScrollY`.
- Carousel animation uses `requestAnimationFrame` loop with ref-based position tracking (no React state during animation).
