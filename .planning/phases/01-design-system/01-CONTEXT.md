# Phase 1: Design System - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a design token system (`adminStyles.js`) and reusable UI primitive components (`adminUI.jsx`) for the admin panel. These are new files — zero changes to existing admin code in this phase. The tokens and primitives will be consumed by Phases 2 and 3.

</domain>

<decisions>
## Implementation Decisions

### Token structure
- Nested by category: `colors.primary`, `colors.danger`, `spacing.sm`, `typography.heading`, etc.
- Tokens live in `src/lib/adminStyles.js` — separate from the public site's `constants.js` and `S` object
- Export a single `A` object (mirrors the `S` convention) plus individual named exports for granular imports
- Must NOT modify or import from `S` in constants.js — complete isolation from public site styles

### Color palette
- Brand accent: `#D4781F` (existing `R` constant) for primary actions
- Warm neutral grays for backgrounds/borders/text (complement the orange, not cool blue-grays)
- Semantic colors: green for success, red for danger/errors, blue for info — standard web conventions
- Danger buttons use RED, not brand orange (current admin uses orange for delete buttons — confusing)
- Text hierarchy: near-black for headings (#222), dark gray for body (#555), medium gray for captions (#888), light gray for placeholders (#aaa)

### Typography scale
- Page titles: 18px, weight 700
- Section headers: 14px, weight 600
- Body text / labels: 13px, weight 400-500
- Captions / helper text: 11px, weight 400
- Font family: inherit from existing (DM Sans)

### Button primitives
- Three variants: primary (filled orange bg, white text), secondary (ghost/outlined, dark text), danger (red bg or red outlined)
- Consistent height: 36px for standard, 28px for small
- Border-radius: 8px (slightly rounded, modern feel)
- Disabled state: opacity 0.5 + cursor not-allowed
- Loading state: spinner icon replaces or sits beside button text

### Input primitives
- Height: 40px for standard inputs, auto for textareas
- Border: 1px solid light gray, 2px brand-color border on focus
- Border-radius: 8px
- Persistent label above each input (not placeholder-only)
- Placeholder text in light gray for examples

### Card primitives
- Subtle border (1px solid #e8e8e8) + small shadow (0 1px 3px rgba(0,0,0,0.06))
- Padding: 20px
- Border-radius: 12px
- White background
- Card title style for form section headers

### Claude's Discretion
- Exact gray hex values within the warm neutral range
- Shadow depth and spread values
- Whether to include a Spinner primitive in this phase or Phase 2
- Internal structure of the adminStyles.js file (grouping, comments)
- Whether AdminCard gets a `variant` prop or stays single-style

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing style system
- `src/lib/constants.js` — Contains the `S` style object, `R` brand color, `css` global styles string, `SITE_TEXTS`, `parseSiteText`. Do NOT modify this file. Study it to understand naming patterns and style conventions.
- `src/components/ui.jsx` — Public site UI primitives (Stars, SocialIcon, Logo, etc.). Admin primitives go in a SEPARATE file.

### Admin components (consumers of the design system)
- `src/components/Admin/AdminPanel.jsx` — ~870 lines, main admin component. Study current inline styles to understand what tokens need to cover.
- `src/components/Admin/CarouselsTab.jsx` — Separate admin tab component that must also consume the tokens.
- `src/components/Admin/DragList.jsx` — Drag-to-reorder component with its own inline styles.

### Research findings
- `.planning/research/STACK.md` — Design token recommendations, color palette, typography scale
- `.planning/research/ARCHITECTURE.md` — Component extraction strategy, file organization
- `.planning/research/PITFALLS.md` — Global CSS audit warning, !important conflicts

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` — Inline styles only, S object patterns, hover via onMouseEnter/Leave, global css string for pseudo-elements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `S` object in `constants.js`: Has `S.input`, `S.btnPrimary`, `S.btnDanger`, `S.btnSmall`, `S.ghost`, `S.adminCard`, `S.label`, `S.listItem` — these are the current admin styles to REPLACE (not extend)
- `R` constant (`#D4781F`): Brand color, import and reuse in admin tokens
- `css` template literal: Global styles including `.admin-btn`, `.admin-ghost`, `.admin-tab`, `.admin-container` classes with hover/focus states

### Established Patterns
- Style objects as JS constants (S.input, S.btnPrimary) — follow same pattern for admin tokens
- Hover effects via `onMouseEnter`/`onMouseLeave` direct style mutation — admin primitives should encapsulate this
- Global CSS `<style>` tag for pseudo-elements and media queries — admin hover/focus states can use existing `.admin-*` class names

### Integration Points
- New `src/lib/adminStyles.js` — imported by AdminPanel.jsx, CarouselsTab.jsx, DragList.jsx in Phase 2/3
- New `src/components/Admin/adminUI.jsx` — lightweight React primitives (AdminButton, AdminInput, AdminCard, AdminLabel) imported by admin components in Phase 2/3
- Phase 1 creates files only — no imports added to existing code yet

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants it to "look professional" and "be self-explanatory." Research recommended warm neutrals + clear semantic colors as the highest-impact visual change.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-design-system*
*Context gathered: 2026-03-16*
