# Phase 4: Filter and Paginate - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add category/subcategory filtering and pagination to the admin Portfolio tab's item list. The list currently renders all items in a flat `items.map()` with no filtering or paging — unusable at scale (1000+ items). This phase makes the list navigable. Quick preview of individual items is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Filter placement
- Filters go INSIDE the existing "Portfolio Items (N)" AdminCard — above the item list, below the card title
- Two AdminSelect dropdowns side by side: Category and Subcategory
- Subcategory dropdown only appears when a category with subcategories is selected
- First option in each dropdown is "All categories" / "All subcategories" to clear the filter
- Count label below filters: "Showing X of Y" where X is filtered count and Y is total

### Pagination
- Default 30 items per page
- Page size selector (e.g., 20 / 30 / 50) so admin can adjust
- Navigation style: Previous/Next arrows + page number buttons with ellipsis
  - Example: < 1 [2] 3 4 ... 14 >
  - Current page highlighted with brand color
- Pagination controls at bottom of the item list, inside the card
- Changing a filter resets to page 1

### Claude's Discretion
- Exact pagination component implementation (inline vs extracted)
- Whether page size selector is a dropdown or button group
- Ellipsis logic for page numbers (how many visible, when to show "...")
- Whether to also show pagination at the top of the list

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system (consume these tokens and primitives)
- `src/lib/adminStyles.js` — All design tokens (colors, spacing, typography, radii, shadows) and compound styles (A object)
- `src/components/Admin/adminUI.jsx` — Primitive components (AdminButton, AdminInput, AdminSelect, AdminCard, AdminLabel)

### Admin components (modify these)
- `src/components/Admin/AdminPanel.jsx` — Main admin component. Portfolio tab at lines ~518-601. Item list renders via `items.map()` with no filtering.

### Prior phase context
- `.planning/phases/03-tab-content/03-CONTEXT.md` — Two-card pattern, AdminSelect primitive, list item styling decisions

### Requirements
- `.planning/REQUIREMENTS.md` — FILT-01, FILT-02, FILT-03, PAGE-01, PAGE-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminSelect` in `adminUI.jsx`: Already exists with label prop, focus ring CSS class — use for category/subcategory filter dropdowns
- `AdminCard` in `adminUI.jsx`: Portfolio list is already wrapped in AdminCard — filters go inside it
- `AdminButton` in `adminUI.jsx`: Use for pagination prev/next buttons (secondary variant)
- `A.listItem` compound style: Already used for portfolio item rows
- `itemThumb()` in `constants.js`: Generates thumbnail URLs for items

### Established Patterns
- `items` array is passed as prop to AdminPanel, contains all work items with `cat` (category ID) and `subcategory_id` fields
- `cats` array has `{id, label}` — filter by `item.cat === selectedCat`
- `subcats` array has `{id, category_id, name}` — filter by `item.subcategory_id === selectedSubcat`
- AdminSelect already used in Portfolio "Add Item" form for category/subcategory selection (lines ~541-549)
- Two-card pattern: "Add Item" card + "Portfolio Items (N)" card — filters go in the second card

### Integration Points
- Portfolio tab section in AdminPanel.jsx (lines ~518-601) — add filter state, filtered/paginated rendering
- `items` prop — filter client-side (all items already loaded in memory)
- Card title count — update to show filtered count: "Portfolio Items (42 of 312)"

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard admin filtering and pagination patterns. User wants it to feel manageable when there are 1000+ photos.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-filter-and-paginate*
*Context gathered: 2026-03-16*
