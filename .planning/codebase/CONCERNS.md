# Concerns

## Tech Debt

### AdminPanel.jsx Is Too Large
`src/components/Admin/AdminPanel.jsx` is 870 lines — by far the largest file. It contains the login form, 8 CRUD tab implementations, image upload logic, FAQ auto-translation, and sort-order management all in one component. Each tab should be extracted into its own component file (similar to how `CarouselsTab.jsx` was already extracted).

### Prop Drilling Depth
`App.jsx` holds 13 state variables and passes them (plus setters) through multiple layers. The admin panel receives ~20 props. This is manageable now but will not scale. If the app grows, React Context or a lightweight state manager should be introduced for cross-cutting concerns (auth state, site config, lightbox).

### Inconsistent Data Shape Naming
Supabase columns use `snake_case` (`video_id`, `description`) but components expect `camelCase` (`videoId`, `desc`). The transformation happens in `App.jsx` via inline `.map()` calls. This mapping is fragile and duplicated — `normalizeCarouselItem()` handles one path, but the main `work_items` mapping is separate. A single shared mapper function would reduce inconsistency.

### Legacy Tables Still Referenced
The `highlights` and `returning_customers` tables are kept for backward compatibility but the codebase is migrating to `carousel_items` as the unified source. Both code paths (legacy and carousel) are maintained in `App.jsx`, `Highlights.jsx`, and `ReturningCustomers.jsx`. Once `carousel_items` is fully populated, the legacy path should be removed.

### Inline Style Verbosity
Components contain deeply nested inline style objects with many properties per element. This makes components harder to read and creates duplicated style definitions (e.g., the card hover effect `onMouseEnter`/`onMouseLeave` pattern is repeated in `Carousel.jsx`, `Portfolio.jsx`, and `Reviews.jsx` with nearly identical code).

### Hard-Coded Fallback Data in constants.js
`DEFAULT_FB_REVIEWS` in `src/lib/constants.js` contains 11 full review objects with real names and text as fallback data. This mixes configuration with content and increases bundle size. The fallback data should ideally be minimal or moved to the database.

### IIFE Pattern in Portfolio.jsx
The category detail view in `Portfolio.jsx` (line 67) uses an immediately-invoked function expression `{(() => { ... })()}` to compute local variables. This is unusual in React and should be refactored into a separate component for clarity.

## Security Concerns

### Supabase Anon Key Exposure
The `VITE_SUPABASE_ANON_KEY` is exposed in the client bundle (Vite `VITE_` prefix makes it public). This is the intended Supabase pattern — Row Level Security (RLS) on the database should be the real access control. However, there is no evidence of RLS policies in `supabase-setup.sql`, meaning the anon key may have broader access than intended.

### Admin Auth
Admin authentication uses Supabase email/password auth (`signInWithPassword`). The admin panel is accessible at `/admin` or via Ctrl+Shift+A. The `isAdmin` state controls UI visibility but does not gate data fetching — all data is fetched on mount regardless of auth status. Write operations require a valid Supabase session token (enforced server-side), which is correct.

### Google Translate API Key
`VITE_GOOGLE_TRANSLATE_KEY` is exposed in the client bundle. This key can be extracted and used for unauthorized translation API calls. It should be proxied through a serverless function.

### No Input Sanitization
Admin panel inputs (FAQ questions/answers, category names, review text) are not sanitized before being stored in Supabase or rendered. React's JSX rendering provides XSS protection for text content, but any raw HTML rendering would be vulnerable.

### Environment Files
`.env` and `.env.supabase` are gitignored, but `.env.example` documents the expected variables. The `.mcp.json` file (MCP server config) is also gitignored.

## Performance Concerns

### All Data Fetched on Mount
`App.jsx` fetches all data from 13 Supabase endpoints on mount via `Promise.all`. This includes data for all pages (portfolio items, reviews, FAQs, carousel items for 4 carousels). Only the current page's data is needed. Lazy data fetching per route would reduce initial load time.

### No Data Caching
There is no caching layer. Every page load triggers all 13 fetches. Supabase responses are stored in React state and lost on refresh. A caching strategy (even just `sessionStorage`) would improve repeat visit performance.

### Carousel DOM Tripling
`Carousel.jsx` renders items 3 times in the DOM (`[...items, ...items, ...items]`) for seamless looping. For carousels with many items, this triples the DOM node count and image load requests. A virtual windowing approach would be more efficient.

### Scroll Handler on Every Frame
`useScrollY.js` uses `requestAnimationFrame` throttling but still triggers a React state update + re-render on every animation frame during scroll. This affects all components that use `scrollY` (Hero parallax, StickyBar visibility). A ref-based approach with selective rendering would be more performant.

### Large Inline SVG Paths
SVG icon paths for Facebook, YouTube, and WhatsApp are stored as string constants in `src/lib/constants.js` and rendered inline in multiple components. These should be extracted into reusable icon components (partially done in `ui.jsx` but still duplicated in several places).

### No Image Optimization
Images in `public/anibal/` and `public/brands/` are served as-is with no build-time optimization, resizing, or WebP conversion. The hero image is JPEG and preloaded, but portfolio images could benefit from responsive `srcset` attributes.

## Fragile Areas

### Carousel Animation State
`Carousel.jsx` manages position via refs (`posRef`, `animRef`, `isDragging`) with direct DOM manipulation (`trackRef.current.style.transform`). This bypasses React's rendering cycle for performance, but makes the component hard to debug and sensitive to timing issues between `requestAnimationFrame`, pointer events, and React lifecycle.

### DragList Click Blocking
`DragList.jsx` uses a 500ms `setTimeout` to block click events after drag ends. This is a race-condition-prone workaround. The `window.__dragActive` global flag adds further fragility. Changes to event propagation anywhere in the component tree could break this.

### Portfolio View State
`portfolioView` in `App.jsx` uses a polymorphic type — it is either the string `"categories"` or an object `{ cat: string, tab: string }`. This makes type-safe handling difficult and is checked via `typeof portfolioView === "object"` in Portfolio.jsx. A more explicit state machine would be safer.

### AdminPanel State Management
`AdminPanel.jsx` manages ~30 local state variables for form inputs across 8 tabs. State is not reset when switching tabs, so stale form data can persist. The component re-renders entirely on any state change due to the flat state structure.

### Language Detection Priority
`src/i18n.js` resolves language from `URL param > localStorage > "en"`. But `App.jsx` also writes `localStorage.setItem("lang", code)` on language change. If a user bookmarks a URL with `?lang=de` but later switches to French, the URL param will win on the next visit with that bookmark, contradicting their preference.

### SPA Routing vs Static Files
`vercel.json` rewrites all paths to `/index.html` for SPA routing. The pre-render script generates static HTML for 4 routes, but Vercel's `build:fast` command skips pre-rendering entirely. This means the deployed site relies solely on client-side rendering, losing the SEO benefit the pre-render script was designed to provide.

## Missing Features

### No Error Boundary
There is no React error boundary. A rendering error in any component will crash the entire app with a white screen.

### No Loading States for Admin
Admin CRUD operations use `setAdminLoading(true)` but there is no per-operation loading indicator. The entire admin panel shows a single loading state.

### No Offline Support
The `manifest.json` exists for PWA capability but there is no service worker. The app requires network connectivity.

### No Analytics
No analytics or event tracking is configured (no Google Analytics, Plausible, etc.).

### No Image Deletion
Images uploaded to Supabase storage can be added but there is no UI or function to delete them. Orphaned images will accumulate in the storage bucket.
