# Phase 3: Tab Content - Research

**Researched:** 2026-03-16
**Domain:** React inline-style admin UI consistency / component migration
**Confidence:** HIGH

## Summary

Phase 3 is a pure refactoring phase -- no new CRUD functionality, no new libraries, no backend changes. The work is applying existing Phase 1/2 primitives (`AdminCard`, `AdminInput`, `AdminTextarea`, `AdminButton`, `AdminLabel`) consistently across all 7 admin tabs and improving empty state messaging. The codebase already has all the building blocks; this phase eliminates one-off inline styles and wraps content in the two-card pattern (form card + list card).

The primary risk is regression -- the AdminPanel.jsx file is ~930 lines with tightly coupled form state. Changes must be surgical: wrap existing JSX in `AdminCard`, replace raw `<input>` with `AdminInput`, replace raw `<select>` with either `AdminSelect` or token-styled selects, and update `emptyMsg()` call sites with specific guidance text.

**Primary recommendation:** Work tab-by-tab through AdminPanel.jsx, applying the two-card pattern and input primitive migration. Create an `AdminSelect` primitive to match `AdminInput`/`AdminTextarea` for consistency. DragList.jsx needs minor token cleanup for its magic numbers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Every tab wraps its "add new" form in an AdminCard, and its "existing items" list in a SEPARATE AdminCard -- two-card pattern per tab
- Categories tab: category pills in AdminCard titled "Categories (N)", subcategory pills in AdminCard titled "Subcategories (N)"
- Site Texts tab: hero position, stats bar, and site texts each get their own AdminCard
- Replace generic `emptyMsg()` calls with tab-specific guidance text (exact wording provided in CONTEXT.md)
- Empty state text uses `A.emptyState` style but with improved wording
- FB Reviews and Google Reviews list items: replace raw inline styles with `A.listItem` base + consistent layout
- Portfolio items: keep existing `A.listItem` usage as-is
- Category/subcategory pills: keep pill layout, clean up magic numbers to use tokens
- FAQ list via DragList: keep DragList rendering, ensure inner content uses token-based styles
- Replace all raw `<input className="admin-input">` with `<AdminInput>` component
- Replace all raw `<textarea className="admin-input">` with `<AdminTextarea>` component
- Replace all raw `<select className="admin-input">` with `AdminSelect` primitive or consistent token-based styling
- File inputs stay raw but get consistent caption label via `typography.caption`
- All labels above inputs use `<AdminLabel>` or `AdminInput`'s built-in `label` prop
- Carousels tab: keep existing empty state pattern

### Claude's Discretion
- Whether to create an `AdminSelect` primitive in adminUI.jsx or style selects inline with tokens
- Whether to refactor CarouselsTab.jsx for consistency or leave it
- Exact empty state icon or illustration (emoji, SVG, or text-only)
- Whether to add subtle section dividers between card groups or rely on card separation alone
- Internal ordering of changes (tab by tab vs. pattern by pattern)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-04 | Related content is grouped in cards with subtle borders/shadows (add form in one card, existing items list in another) | Two-card pattern per tab using existing `AdminCard` component with `A.card` + `A.cardTitle` styles. All primitives exist in adminUI.jsx. |
| NAVF-01 | Empty states show guidance text with a clear call-to-action instead of faint gray text | `emptyMsg()` helper already uses `A.emptyState` style. Update call sites with tab-specific guidance wording from CONTEXT.md decisions. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | existing | Component framework | Already in use |
| adminStyles.js | Phase 1 output | Design tokens (colors, spacing, typography, radii, shadows, A compound styles) | Single source of truth for admin styling |
| adminUI.jsx | Phase 1 output | Primitive components (AdminButton, AdminInput, AdminTextarea, AdminCard, AdminLabel, AdminFlash, AdminStyles) | Consistent wrappers around tokens |

### Supporting
No new libraries needed. This is purely a refactoring phase using existing primitives.

## Architecture Patterns

### Two-Card Pattern (per tab)
**What:** Every tab has two distinct visual sections: (1) a form card for adding new items, (2) a list card for existing items.
**When to use:** Every tab except Carousels (delegated to CarouselsTab.jsx) and Site Texts (which has multiple sections with their own cards already).

```jsx
// Pattern: Two-card layout
<div>
  <div style={{ ...A.infoBox, marginBottom: spacing.lg }}>
    <strong>How it works:</strong> ...
  </div>

  <AdminCard title="Add [Thing]">
    <AdminInput label="Name" value={val} onChange={...} />
    <AdminButton type="submit" loading={adminLoading}>Add [Thing]</AdminButton>
  </AdminCard>

  <AdminCard title="[Things] (N)" style={{ marginTop: spacing.xl }}>
    {items.length === 0
      ? emptyMsg("No [things] yet. Add your first [thing] above.")
      : items.map(item => <div style={A.listItem}>...</div>)
    }
  </AdminCard>
</div>
```

### AdminSelect Primitive (recommended: CREATE)
**What:** A new `AdminSelect` component matching `AdminInput`/`AdminTextarea` patterns.
**Why create vs. inline:** There are 6 raw `<select>` elements across AdminPanel.jsx and CarouselsTab.jsx. An `AdminSelect` component eliminates repetitive `className="admin-input" style={{ ...A.input }}` boilerplate and ensures consistent placeholder color handling.

```jsx
// Recommended AdminSelect primitive
export function AdminSelect({ label, children, style, ...props }) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && <label style={A.inputLabel}>{label}</label>}
      <select
        className="admin-input"
        style={{ ...A.input, ...style }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
```

**Note:** The placeholder color trick (`color: value ? colors.gray900 : colors.gray400`) is currently applied inline at each call site. AdminSelect can accept this as a prop or leave it to the caller via `style` override since it depends on runtime state.

### Empty State Messaging Pattern
**What:** Replace generic messages with actionable guidance.
**Current:** `emptyMsg("No categories yet. Add one below.")`
**Target:** `emptyMsg("No categories yet. Add your first category above to organize your Portfolio.")`

The `emptyMsg()` helper stays as-is -- it's just a thin wrapper around `A.emptyState`. The improvement is in the text passed to it, which now tells the user specifically what to do and why.

### Anti-Patterns to Avoid
- **Changing form behavior:** This phase is purely visual. Do NOT change form validation, submission handlers, or state management.
- **Moving JSX between files:** Keep all tab content in AdminPanel.jsx. Do NOT extract tab components (except CarouselsTab which is already separate).
- **Wrapping DragList in AdminCard:** The FAQ DragList renders its own item borders. Wrapping it in AdminCard is correct for the container, but don't nest cards.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card containers | Custom div with border/shadow | `AdminCard` component | Already exists with correct tokens |
| Text inputs | Raw `<input>` with className + style | `AdminInput` component | Handles label, focus ring, spacing |
| Textareas | Raw `<textarea>` with className + style | `AdminTextarea` component | Same consistency benefits |
| Labels | Raw `<label>` or `<div>` with typography.label | `AdminLabel` or AdminInput's `label` prop | Token-based, consistent |
| Buttons | Raw `<button>` with inline styles | `AdminButton` with variant prop | Handles loading, disabled, hover states |

## Common Pitfalls

### Pitfall 1: Breaking the `marginBottom` chain
**What goes wrong:** AdminInput/AdminTextarea have built-in `marginBottom: spacing.lg` in their wrapper div. Raw inputs currently use `marginBottom: spacing.sm` inline. Switching to primitives changes spacing.
**Why it happens:** The primitive's wrapper adds its own margin that differs from the inline style.
**How to avoid:** When replacing raw inputs, check whether the surrounding layout depends on `spacing.sm` gaps. Override with `style={{ marginBottom: spacing.sm }}` on the wrapping div if needed, or accept the slightly larger spacing as the new standard.
**Warning signs:** Forms look visually different (too spread out or too tight) after migration.

### Pitfall 2: Select elements losing placeholder color
**What goes wrong:** Raw selects use `color: scParent ? colors.gray900 : colors.gray400` to show placeholder text in gray. If AdminSelect doesn't handle this, all selects look the same regardless of whether a value is selected.
**How to avoid:** Either pass a `style` override with the conditional color, or add a `placeholder` boolean prop to AdminSelect.

### Pitfall 3: Nesting cards incorrectly
**What goes wrong:** Some sections already use `style={A.card}`. Wrapping them in `AdminCard` creates double borders/shadows.
**Why it happens:** Categories tab forms already have `style={A.card}`, Site Texts sections already have `style={{ ...A.card }}`.
**How to avoid:** When adding AdminCard wrappers, first check if the content already uses `A.card` styling. Replace the inline `A.card` with `<AdminCard>` wrapping -- don't add a second layer.

### Pitfall 4: File input key reset breaking
**What goes wrong:** File inputs use `key={fileKey}` or `key={fileKey + 1}` for reset after submit. If wrapped in AdminInput, the key must stay on the actual `<input>` element.
**How to avoid:** File inputs are excluded from primitive migration (per CONTEXT.md decision). Keep them as raw `<input type="file">` with `typography.caption` labels.

### Pitfall 5: DragList internal styles
**What goes wrong:** DragList.jsx has hardcoded values (`gap: 10`, `padding: "10px 8px"`, `borderBottom: "1px solid #f0f0f0"`, `borderRadius: 8`, `background: "#FFF8F0"`, colors `"#999"` and `"#ccc"`).
**How to avoid:** Replace magic numbers with tokens: `gap: spacing.md`, `padding: \`${spacing.md}px ${spacing.sm}px\``, `borderBottom: \`1px solid ${colors.gray100}\``, `borderRadius: radii.md`, `background: colors.brandLight`. But be conservative -- the drag handle colors and subtle visual feedback are intentional UX.

## Code Examples

### Current vs. Target: Categories Tab (form card)

**Current (raw input):**
```jsx
<form onSubmit={prevent(handleAddCategory)} style={A.card}>
  <p style={A.cardTitle}>Add Category</p>
  <input value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name" className="admin-input" style={{ ...A.input, marginBottom: spacing.sm }}/>
```

**Target (primitive):**
```jsx
<AdminCard title="Add Category">
  <form onSubmit={prevent(handleAddCategory)}>
    <AdminInput label="Category name" value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name" />
```

### Current vs. Target: Review List Items

**Current (raw inline styles):**
```jsx
<div key={r.id} style={{ padding: `${spacing.sm}px 0`, borderBottom: `1px solid ${colors.gray200}` }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
```

**Target (A.listItem):**
```jsx
<div key={r.id} style={A.listItem}>
  <div style={{ flex: 1, minWidth: 0 }}>
```

### Current vs. Target: Select Elements

**Current (raw select):**
```jsx
<select value={scParent} onChange={e => setScParent(e.target.value)} className="admin-input" style={{ ...A.input, marginBottom: spacing.sm, color: scParent ? colors.gray900 : colors.gray400 }}>
  <option value="" disabled>Select parent category...</option>
  {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
</select>
```

**Target (AdminSelect):**
```jsx
<AdminSelect label="Parent category" value={scParent} onChange={e => setScParent(e.target.value)} style={{ color: scParent ? colors.gray900 : colors.gray400 }}>
  <option value="" disabled>Select parent category...</option>
  {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
</AdminSelect>
```

## Inventory: What Needs to Change Per Tab

### 1. Categories Tab (~80 lines, lines 431-509)
- **Form wrapping:** `<form style={A.card}>` -> wrap form content in `<AdminCard title="Add Category">`
- **List wrapping:** Category pills -> wrap in `<AdminCard title="Categories (N)">`
- **Subcategory list wrapping:** Subcategory section -> wrap in `<AdminCard title="Subcategories (N)">`
- **Subcategory form:** Already has `A.card` -> convert to `<AdminCard title="Add Subcategory">`
- **Raw inputs (3):** `ncLabel` input, `scName` input, `scPlaylistId` input -> `AdminInput`
- **Raw selects (1):** `scParent` select -> `AdminSelect`
- **Empty states (2):** Categories empty, subcategories empty -> update text
- **File inputs (2):** Keep raw, ensure `typography.caption` labels

### 2. Portfolio Tab (~80 lines, lines 512-590)
- **Form wrapping:** Already uses `A.card` -> convert to `<AdminCard title="Add Item">`
- **List wrapping:** Item list -> wrap in `<AdminCard title="Portfolio Items (N)">`
- **Raw inputs (4):** `wiTitle`, `wiDesc`, `wiVideoId`, FB URL input -> `AdminInput`
- **Raw selects (2):** `wiCat` select, `wiSubcat` select -> `AdminSelect`
- **Empty state (1):** "No work items yet." -> update text
- **File inputs (2):** Keep raw

### 3. FAQs Tab (~50 lines, lines 593-640)
- **Form wrapping:** Already uses `A.card` -> convert to `<AdminCard title="Add FAQ">`
- **List wrapping:** DragList -> wrap in `<AdminCard title="FAQs (N)">`
- **Raw inputs in form (1):** `faqQ` input -> `AdminInput`
- **Raw textareas in form (1):** `faqA` textarea -> `AdminTextarea`
- **Raw inputs in DragList renderItem (1):** edit `faqQ` input -> `AdminInput`
- **Raw textareas in DragList renderItem (1):** edit `faqA` textarea -> `AdminTextarea`
- **Empty state (1):** "No FAQs yet. Add one below." -> update text

### 4. Carousels Tab (CarouselsTab.jsx, ~210 lines)
- **Discretionary:** Already uses tokens and AdminButton. Mostly consistent.
- **Minor cleanup:** The portfolio picker select has custom inline styles instead of `AdminSelect`
- **Empty state:** Already has good contextual text -- keep as-is per CONTEXT.md

### 5. FB Reviews Tab (~35 lines, lines 657-692)
- **Form wrapping:** Already uses `A.card` -> convert to `<AdminCard title="Add Facebook Review">`
- **List wrapping:** Review list -> wrap in `<AdminCard title="Facebook Reviews (N)">`
- **Raw inputs (1):** `fbrName` input -> `AdminInput`
- **Raw textareas (1):** `fbrText` textarea -> `AdminTextarea`
- **Raw date input (1):** `fbrDate` date input -> `AdminInput` with `type="date"`
- **List items:** Replace raw inline styles with `A.listItem`
- **Empty state (1):** "No Facebook reviews yet." -> update text

### 6. Google Reviews Tab (~40 lines, lines 695-732)
- **Form wrapping:** Already uses `A.card` -> convert to `<AdminCard title="Add Google Review">`
- **List wrapping:** Review list -> wrap in `<AdminCard title="Google Reviews (N)">`
- **Raw inputs (2):** `grName` input, `grTime` input -> `AdminInput`
- **Raw selects (1):** `grRating` select -> `AdminSelect`
- **Raw textareas (1):** `grText` textarea -> `AdminTextarea`
- **List items:** Replace raw inline styles with `A.listItem`
- **Empty state (1):** "No Google reviews yet." -> update text

### 7. Site Texts Tab (~60 lines, lines 735-793)
- **Card wrapping:** Hero position, Stats bar, and Site Texts sections already use `A.card` -> convert to `<AdminCard>`
- **Custom settings form:** Already uses `A.card` -> convert to `<AdminCard title="Add Custom Setting">`
- **Raw inputs (2):** `cfgKey`, `cfgVal` -> `AdminInput`
- **Sub-components (HeroPositionControl, StatRow, ConfigRow, SiteTextRow):** These have their own raw inputs and selects -- migrate to primitives where sensible but be careful not to break layout

### 8. DragList.jsx (standalone component)
- **Token cleanup:** Replace hardcoded `gap: 10`, `padding: "10px 8px"`, color strings with tokens
- **Low risk:** Visual-only changes to the drag container styles

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run build` (catches syntax/import errors) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-04 | Every tab groups content in cards | manual-only | Visual inspection in browser | N/A |
| NAVF-01 | Empty states show guidance text | manual-only | Visual inspection in browser | N/A |

**Justification for manual-only:** This phase is purely visual refactoring. There are no testable behaviors beyond "does it render without crashing" (covered by `npm run build`) and "does it look right" (visual inspection). No test framework is configured in this project.

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build` + visual inspection of all 7 tabs in dev server
- **Phase gate:** Build succeeds + all tabs render correctly with two-card layout and improved empty states

### Wave 0 Gaps
None -- no test infrastructure to set up. Build verification is sufficient for this refactoring phase.

## Open Questions

1. **AdminSelect placeholder color handling**
   - What we know: All selects currently use inline `color: value ? colors.gray900 : colors.gray400` for placeholder styling
   - What's unclear: Whether AdminSelect should internalize this logic or leave it to callers
   - Recommendation: Keep it as a `style` override at call sites -- the conditional depends on the value state which varies per usage. Simpler than adding a prop.

2. **CarouselsTab.jsx scope**
   - What we know: It already uses tokens and AdminButton consistently. The portfolio picker filter select has custom inline styles.
   - What's unclear: Whether it's worth refactoring for the few inconsistencies
   - Recommendation: Light touch -- only replace the filter select with AdminSelect and any remaining magic numbers with tokens. Don't restructure the component.

3. **Sub-components in Site Texts tab (HeroPositionControl, StatRow, ConfigRow, SiteTextRow)**
   - What we know: These are small helper components with their own raw inputs and selects
   - What's unclear: Whether to migrate their internal inputs to AdminInput/AdminSelect
   - Recommendation: Migrate where it doesn't break the tight inline layouts (StatRow has flex row with input). For StatRow, keep raw input since it's in a constrained flex layout with maxWidth. For SiteTextRow, the selects and textareas can use primitives.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of AdminPanel.jsx (~930 lines), adminUI.jsx, adminStyles.js, CarouselsTab.jsx, DragList.jsx
- CONTEXT.md decisions from user discussion phase

### Secondary (MEDIUM confidence)
- Phase 1/2 output patterns observed in existing code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all primitives exist
- Architecture: HIGH - two-card pattern is clearly defined in CONTEXT.md, code locations identified line-by-line
- Pitfalls: HIGH - derived from direct code inspection of margin, nesting, and key patterns

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- no external dependencies)
