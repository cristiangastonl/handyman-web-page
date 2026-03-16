# Testing

## Current State

**There is no test infrastructure configured in this project.** No test runner, no testing libraries, no test files, and no linter or formatter.

### What Is Missing

| Category | Status |
|---|---|
| Test runner (Jest, Vitest, etc.) | Not installed |
| React testing library | Not installed |
| E2E framework (Playwright, Cypress) | Not installed |
| Linter (ESLint) | Not installed |
| Formatter (Prettier) | Not installed |
| Type checking (TypeScript) | Not used — pure JavaScript |
| CI/CD pipeline | None configured |
| Pre-commit hooks | None configured |
| Code coverage | Not configured |

### Existing Test-Adjacent Files

- `test-drag.mjs` — a one-off manual test file for the drag-and-drop component (gitignored via `test-*.mjs` pattern). Not part of any automated test suite.
- `scripts/prerender.mjs` — uses Puppeteer to pre-render routes. This is a build script, not a test, but it does verify that pages render without crashing.

## What Would Benefit from Testing

### High-Value Unit Test Targets

1. **`src/lib/constants.js`** — Pure functions that are easy to test:
   - `parseSiteText()` — parses legacy plain text and JSON `{text, fontSize, fontFamily}` objects
   - `itemThumb()` — resolves thumbnail URLs for different item types (image, video, facebook)
   - `getWALink()` — generates localized WhatsApp links
   - `ytThumb()` — generates YouTube thumbnail URLs

2. **`src/lib/supabase.js`** — CRUD functions could be tested with a mocked Supabase client:
   - Verify null guard behavior when `supabase` is null
   - Verify correct table/column references
   - Verify `uploadImage()` file size and MIME type validation

3. **`normalizeCarouselItem()` in `src/App.jsx`** — Data transformation logic that maps joined Supabase responses to the shape components expect.

4. **`src/lib/translate.js`** — `translateFaq()` parallel translation logic.

### Component Test Targets

1. **`Carousel.jsx`** — Complex interaction logic (auto-play, drag, seamless looping). Would benefit from verifying:
   - Items are tripled for loop continuity
   - Pause behavior on hover/touch
   - Scroll direction on button clicks

2. **`DragList.jsx`** — Pointer-event-based drag reorder with click blocking. Fragile interaction code that would benefit from integration tests.

3. **`Lightbox.jsx`** — Keyboard navigation (Escape, ArrowLeft, ArrowRight), focus trap, and body overflow lock.

4. **`Portfolio.jsx`** — Two-level drill-down view with tab state management.

5. **`AdminPanel.jsx`** — 870 lines of CRUD logic across 8 tabs. The highest-risk file for regressions.

### E2E Test Targets

1. Navigation flow: Home -> Portfolio -> Category -> Photos/Videos
2. Language switching persistence (localStorage)
3. Lightbox open/close/navigate
4. Mobile menu open/close
5. Admin login and CRUD operations

## Recommended Setup

If testing were added, **Vitest** would be the natural choice since the project already uses Vite:

```json
{
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^25.x"
  }
}
```

### Mocking Strategy

- **Supabase client**: The nullable pattern (`export const supabase = url && key ? createClient(...) : null`) already provides a natural seam. Tests can run without env vars, and all functions will return null/no-op. For active testing, mock `createClient` to return controlled responses.
- **i18next**: Already initializes with bundled JSON files, so translations work without network calls. Tests would need to initialize i18next or mock `useTranslation`.
- **IntersectionObserver**: Used by `useFadeIn` and `AnimatedCounter`. Would need a mock in JSDOM environments.
- **requestAnimationFrame**: Used by `Carousel`, `useScrollY`, and `AnimatedCounter`. Would need mocking or `vi.useFakeTimers()`.
- **Google Translate API**: `src/lib/translate.js` makes fetch calls. Would need `fetch` mocking.

### Coverage Priority

Given limited resources, testing effort should prioritize:
1. Pure utility functions in `constants.js` (highest ROI, easiest to test)
2. Data transformation in `App.jsx` (`normalizeCarouselItem`)
3. Supabase CRUD null guards
4. Lightbox keyboard interaction
5. Admin panel CRUD flows (most complex, most error-prone)

## Validation That Exists

Although there are no automated tests, some validation does occur:

- **Image upload validation** in `supabase.js`: checks file size (5MB max) and MIME type (JPEG, PNG, WebP, GIF only).
- **Build-time validation**: `vite build` will fail on import errors, syntax errors, or missing modules.
- **Pre-render smoke test**: `scripts/prerender.mjs` loads each route in Puppeteer and waits for `<main>` to appear — this catches rendering crashes.
- **Runtime null guards**: Every Supabase function checks `if (!supabase) return null/undefined`, preventing crashes when the backend is unavailable.
