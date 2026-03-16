# Phase 5: Quick Preview - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add an inline preview to the admin Portfolio tab's item list. When the admin clicks an item row, an expanded preview appears below it showing the full-size image (or video thumbnail) and metadata. The preview can be dismissed without losing filter or page position. This phase does NOT add video playback or editing capabilities.

</domain>

<decisions>
## Implementation Decisions

### Preview trigger and display
- Click the thumbnail or item row to expand an inline preview below the clicked item (toggle behavior)
- Preview image is ~300-400px wide, proportional height — fits in the card without excessive scrolling
- Dismiss by clicking the same row again or an "X" close button
- For YouTube/Facebook items, show the thumbnail image at larger size (not an embedded player) — keeps it fast and simple

### Metadata display
- Show: title + category name only (minimal)
- Metadata below the image, left-aligned, using existing typography tokens
- Show description below title in gray caption text if description exists

### Claude's Discretion
- Exact preview expansion animation (smooth expand, instant, or fade)
- Whether to add a subtle background or border to distinguish the preview from list items
- Internal preview component structure (inline in AdminPanel or extracted helper)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system
- `src/lib/adminStyles.js` — All design tokens (colors, spacing, typography, radii, shadows) and compound styles (A object)
- `src/components/Admin/adminUI.jsx` — Primitive components (AdminCard, AdminButton, etc.)

### Admin components
- `src/components/Admin/AdminPanel.jsx` — Portfolio tab with filter + pagination (lines ~602-720). Item list renders `pagedItems.map()` at line ~658. Each item row has thumbnail (52x36px), title, type/category, and Remove button.

### Prior phase context
- `.planning/phases/04-filter-and-paginate/04-CONTEXT.md` — Filter/pagination decisions, item list structure

### Utilities
- `src/lib/constants.js` — `itemThumb()` function for generating thumbnail URLs from items

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `itemThumb(item)` in `constants.js`: Generates thumbnail URLs — already used in item rows, reuse for larger preview
- `AdminCard` in `adminUI.jsx`: Could wrap the preview section if needed
- `A.listItem` compound style: Current item row styling — preview expands below this
- `typography.caption`: For description text below the preview image
- `colors`, `spacing`, `radii`, `shadows` tokens: For preview container styling

### Established Patterns
- Item rows use `A.listItem` with flex layout: thumbnail (52x36), text info, Remove button
- Items have: `id`, `type` ("image"|"video"|"facebook"), `cat`, `subcategory_id`, `src`, `thumb`, `title`, `desc`, `videoId`
- `cats` array has `{id, label}` — lookup category name via `cats.find(c => c.id === item.cat)?.label`
- Filter/pagination state (`filterCat`, `filterSubcat`, `page`, `pageSize`) must be preserved when preview opens/closes

### Integration Points
- Preview state (`previewId` or similar) added to AdminPanel component state
- Click handler on item row toggles preview
- Preview renders conditionally below the clicked item row within the `pagedItems.map()` loop
- Must not interfere with the Remove button click (event handling)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard inline expand/collapse preview pattern. User wants to quickly identify what each item is when managing 1000+ photos.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-quick-preview*
*Context gathered: 2026-03-16*
