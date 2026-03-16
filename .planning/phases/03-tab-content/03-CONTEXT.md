# Phase 3: Tab Content - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply consistent card layouts, empty states, and styled forms across all 7 admin tabs (Categories, Portfolio, Carousels, FAQs, FB Reviews, Google Reviews, Site Texts). Every tab should use the same AdminCard, AdminInput, AdminButton, and typography primitives — no tab has its own one-off inline styles. This phase does NOT add new functionality, only visual consistency using Phase 1/2 primitives.

</domain>

<decisions>
## Implementation Decisions

### Card wrapping
- Every tab wraps its "add new" form in an AdminCard (most already do via `A.card` — standardize to `<AdminCard>` component)
- Every tab wraps its "existing items" list in a SEPARATE AdminCard — visually distinct from the form card
- Two-card pattern per tab: one card for "Add [thing]" form, one card for "[things] list"
- Categories tab: wrap category pills in AdminCard titled "Categories (N)", wrap subcategory pills + grouped lists in AdminCard titled "Subcategories (N)"
- Site Texts tab: hero position control, stats bar, and site texts sections each get their own AdminCard (already partially done — standardize)

### Empty states
- Replace generic `emptyMsg()` calls with tab-specific guidance that tells the user WHAT to do:
  - Categories: "No categories yet. Add your first category above to organize your Portfolio."
  - Subcategories: "No subcategories yet. These are optional — use them to group items within a category."
  - Portfolio: "No portfolio items yet. Add photos, YouTube videos, or Facebook reels above."
  - FAQs: "No FAQs yet. Add your first question and answer above — they'll be auto-translated to all 5 languages."
  - FB Reviews: "No Facebook reviews yet. Add reviews from your Facebook page above."
  - Google Reviews: "No Google reviews yet. Add reviews from your Google Business profile above."
  - Carousels: keep existing empty state pattern (handled by CarouselsTab.jsx)
- Empty state text uses `A.emptyState` style but with improved wording per above
- Keep the `emptyMsg()` helper but update its call sites with specific text

### List item consistency
- FB Reviews list items: replace raw inline styles with `A.listItem` base + consistent layout
- Google Reviews list items: same — replace raw inline styles with `A.listItem`
- Portfolio items: already use `A.listItem` — keep as-is
- Category/subcategory pills: keep pill layout (it's the right UX for tags) but use tokens for all values (colors.gray100, spacing.sm, radii.full already used — just clean up any remaining magic numbers)
- FAQ list via DragList: keep DragList rendering but ensure inner content uses token-based styles

### Input primitives migration
- Replace all raw `<input className="admin-input" style={{...A.input}}>` with `<AdminInput>` component
- Replace all raw `<textarea className="admin-input" style={{...A.textarea}}>` with `<AdminTextarea>` component
- Replace all raw `<select className="admin-input" style={{...A.input}}>` with either a new `AdminSelect` primitive or consistent token-based styling (Claude's discretion)
- File inputs (`<input type="file">`) stay as raw inputs (no primitive needed) but get consistent caption label styling via `typography.caption`
- All labels above inputs use `<AdminLabel>` or `AdminInput`'s built-in `label` prop

### Claude's Discretion
- Whether to create an `AdminSelect` primitive in adminUI.jsx or style selects inline with tokens
- Whether to refactor CarouselsTab.jsx for consistency or leave it (it's a separate component, may already be consistent enough)
- Exact empty state icon or illustration (emoji, SVG, or text-only)
- Whether to add subtle section dividers between card groups or rely on card separation alone
- Internal ordering of changes (tab by tab vs. pattern by pattern)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system (Phase 1 output — consume these)
- `src/lib/adminStyles.js` — All design tokens (colors, spacing, typography, radii, shadows) and compound styles (A object). Contains A.card, A.cardTitle, A.emptyState, A.listItem, A.infoBox.
- `src/components/Admin/adminUI.jsx` — Primitive components (AdminButton, AdminInput, AdminTextarea, AdminCard, AdminLabel, AdminFlash, AdminStyles). Extend with AdminSelect if needed.

### Admin components (modify these)
- `src/components/Admin/AdminPanel.jsx` — Main admin component (~930 lines). Contains all 7 tab content sections plus helper components (HeroPositionControl, StatRow, ConfigRow, SiteTextRow). Primary file to modify.
- `src/components/Admin/CarouselsTab.jsx` — Separate tab component for carousel curation. Check for consistency with primitives.
- `src/components/Admin/DragList.jsx` — Drag-to-reorder component used in FAQs tab.

### Prior phase context
- `.planning/phases/01-design-system/01-CONTEXT.md` — Token structure, color palette, typography scale, button/input/card primitive decisions.
- `.planning/phases/02-shell-and-feedback/02-CONTEXT.md` — Shell styling, flash messages, loading patterns, AdminFlash component.

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` — Inline styles only, hover via onMouseEnter/Leave, global css for pseudo-elements.

### Requirements
- `.planning/REQUIREMENTS.md` — DSGN-04 (card grouping) and NAVF-01 (empty states) are the two requirements for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminCard` in `adminUI.jsx`: Wraps content in `A.card` with optional `title` prop. Use for both form and list sections.
- `AdminButton` in `adminUI.jsx`: Already used in most tabs for submit and delete actions. Loading/disabled states work.
- `AdminInput` / `AdminTextarea` in `adminUI.jsx`: Ready to replace raw inputs. Include `label` prop and focus ring CSS class.
- `AdminLabel` in `adminUI.jsx`: Standalone label using `A.inputLabel` style.
- `emptyMsg()` helper (line 19): Returns `<p style={{...A.emptyState}}>` — update call sites with specific text.
- `A.listItem` compound style: flex row with gap, padding, bottom border — use for review lists.
- `A.infoBox` compound style: blue info box — already used in all tabs for "How it works" sections.

### Established Patterns
- Forms wrapped in `A.card` with `A.cardTitle` heading — Categories, Portfolio, FAQs, Reviews tabs already follow this.
- `AdminButton` with `loading={adminLoading}` and `disabled` for validation — consistent pattern across tabs.
- `prevent()` helper wraps form `onSubmit` to avoid page reload.
- `typography.label` used for section headers with count badges (e.g., "Categories (3)").
- `typography.caption` used for file input labels and helper text.

### Integration Points
- `adminUI.jsx` — May need `AdminSelect` primitive added here.
- `AdminPanel.jsx` tabs — Each tab section (lines ~430-795) gets card wrapping and input migration.
- `CarouselsTab.jsx` — Check for one-off styles that should use primitives.
- `DragList.jsx` — Styling is internal; may need token updates if it has magic numbers.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-mode selected recommended defaults. The goal is visual cohesion: every tab should feel like it belongs to the same admin panel. The two-card pattern (form card + list card) creates clear visual separation between "add new" and "existing items" in each tab.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-tab-content*
*Context gathered: 2026-03-16*
