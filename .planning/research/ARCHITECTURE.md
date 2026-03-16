# Architecture Patterns

**Domain:** Admin panel UX overhaul for inline-styled React app
**Researched:** 2026-03-16

## Current State Analysis

The admin panel is a single 871-line component (`AdminPanel.jsx`) with 3 helper sub-components defined in the same file (`HeroPositionControl`, `StatRow`, `SiteTextRow`, `ConfigRow`) plus 2 external files (`CarouselsTab.jsx`, `DragList.jsx`). All styling is inline React style objects, with shared styles in the `S` constant from `constants.js`.

### Current Problems

1. **No design token system** -- colors, spacing, font sizes are hardcoded magic numbers scattered across 870+ lines (e.g., `fontSize: 12`, `padding: "8px 0"`, `color: "#666"` repeated dozens of times)
2. **Inconsistent visual patterns** -- the same concept (info box, empty state, list item, form card) is styled slightly differently each time
3. **No component reuse for UI primitives** -- buttons, inputs, labels, cards are all inline style objects, making a visual overhaul require changing every instance
4. **Cramped layout** -- small fonts (10-12px), tight padding, minimal whitespace between sections

## Recommended Architecture

### Design Token System (Admin-Specific)

Create an `adminStyles.js` file that extends the existing `S` constant with a comprehensive admin design token system. This is the single most impactful change -- it makes the entire visual overhaul consistent and maintainable without breaking the inline-styles constraint.

```
src/
  lib/
    constants.js          (existing -- keep S as-is for public site)
    adminStyles.js        (NEW -- admin-specific design tokens + compound styles)
  components/
    Admin/
      AdminPanel.jsx      (existing -- simplified, uses new primitives)
      CarouselsTab.jsx    (existing -- uses new primitives)
      DragList.jsx        (existing -- minimal changes)
      ui.jsx              (NEW -- reusable admin UI primitives)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `adminStyles.js` | Design tokens: colors, spacing, typography, shadows, radii. Compound style objects for cards, inputs, buttons, labels. | Imported by all Admin components |
| `ui.jsx` | Reusable presentational primitives: `AdminCard`, `AdminInput`, `AdminButton`, `AdminLabel`, `InfoBox`, `EmptyState`, `ItemRow`, `TabBar`, `FlashMessage` | Used by AdminPanel, CarouselsTab |
| `AdminPanel.jsx` | Tab routing, auth, CRUD handlers, data orchestration | Composes ui.jsx primitives, delegates to CarouselsTab |
| `CarouselsTab.jsx` | Carousel curation UI | Uses ui.jsx primitives |
| `DragList.jsx` | Generic drag-to-reorder | Receives style tokens for theming |

### Data Flow

```
adminStyles.js (tokens)
       |
       v
    ui.jsx (primitives consume tokens, expose styled components)
       |
       v
AdminPanel.jsx / CarouselsTab.jsx (compose primitives, pass data)
       |
       v
DragList.jsx (receives renderItem from parent, renders with parent-provided styles)
```

## Design Token Structure

The token system replaces scattered magic numbers with a single source of truth. Because the project uses inline styles only, tokens are plain JS objects -- no CSS variables, no build step, no new dependencies.

```javascript
// adminStyles.js

import { R } from "./constants";

// ── Primitives ──
export const color = {
  brand: R,                    // "#D4781F"
  brandLight: "#FFF3E0",       // backgrounds, hover states
  brandFaded: "#FDEBD0",       // very subtle brand tint
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#bbb",
  border: "#e5e5e5",
  borderLight: "#f0f0f0",
  bg: "#fff",
  bgSubtle: "#fafafa",
  bgMuted: "#f5f5f5",
  success: "#2E7D32",
  successBg: "#E8F5E9",
  error: R,
  errorBg: "#FFEBEE",
  dangerBorder: "#fdd",
  google: "#E8A317",
  facebook: "#1877F2",
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  section: 24,       // between major sections
};

export const fontSize = {
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  title: 20,
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 20,
};

// ── Compound Styles (replace scattered inline objects) ──
export const A = {
  card: { padding: space.lg, background: color.bgSubtle, borderRadius: radius.lg, border: `1px solid ${color.borderLight}` },
  cardTitle: { fontSize: fontSize.base, fontWeight: 600, marginBottom: space.md },
  label: { fontSize: fontSize.sm, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: color.textMuted, marginBottom: space.sm },
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${color.border}`, borderRadius: radius.md, fontSize: fontSize.base, outline: "none", display: "block" },
  // ... button variants, info boxes, etc.
};
```

**Confidence: HIGH** -- This is a standard pattern for React inline-style systems. No external research needed; it follows directly from the codebase structure.

## UI Primitives (`ui.jsx`)

Thin wrapper components that apply design tokens consistently. These are NOT complex components -- they are style-application helpers that eliminate repetition.

### Primitives to Extract

| Primitive | Replaces | Instances in Codebase |
|-----------|---------|----------------------|
| `InfoBox` | "How it works" gray boxes | 7 (one per tab) |
| `EmptyState` | `emptyMsg()` function + inline empty states | 8+ |
| `AdminCard` | `S.adminCard` + title pattern | 10+ form cards |
| `AdminButton` | `S.btnPrimary` / `S.btnDanger` / `S.btnSmall` with loading/disabled logic | 20+ buttons |
| `AdminInput` | `S.input` with label and optional help text | 15+ inputs |
| `TabBar` | Tab rendering logic in AdminPanel + CarouselsTab | 2 (main tabs + carousel sub-tabs) |
| `FlashMessage` | Sticky flash message div | 1 (but encapsulates animation/positioning) |
| `ItemRow` | `S.listItem` pattern with thumbnail + text + actions | 10+ list items |

### Example: InfoBox

```javascript
// Before (repeated 7 times with slight variations):
<div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
  <strong>How it works:</strong> ...text...
</div>

// After:
export function InfoBox({ children }) {
  return (
    <div style={A.infoBox}>
      <strong>How it works:</strong> {children}
    </div>
  );
}
```

### Example: AdminButton

```javascript
// Before (repeated 20+ times with varying logic):
<button className="admin-btn" disabled={adminLoading || !valid}
  style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !valid) ? 0.5 : 1 }}>
  {adminLoading ? "Adding..." : "Add Item"}
</button>

// After:
export function AdminButton({ children, loading, loadingText, disabled, variant = "primary", style, ...props }) {
  const isDisabled = loading || disabled;
  return (
    <button className="admin-btn" disabled={isDisabled}
      style={{ ...A.btn[variant], opacity: isDisabled ? 0.5 : 1, ...style }} {...props}>
      {loading ? (loadingText || "Loading...") : children}
    </button>
  );
}
```

**Confidence: HIGH** -- This is straightforward component extraction from existing patterns.

## Patterns to Follow

### Pattern 1: Token-First Styling

**What:** Every visual value comes from a token, never a magic number.
**When:** Always, for all admin components.
**Why:** A single change in `adminStyles.js` propagates everywhere. Makes the overhaul a matter of tuning tokens rather than hunting through 870 lines.

### Pattern 2: Composition Over Configuration

**What:** UI primitives are simple, composable building blocks. An `AdminCard` wraps content. An `AdminButton` handles loading state. They compose, not configure.
**When:** For all extracted primitives.
**Why:** Avoids creating "mega-components" with 15 props. Keeps things simple for a single-user admin panel.

### Pattern 3: Visual Hierarchy Through Spacing

**What:** Use the space scale consistently. Sections get `space.section` (24px) between them. Cards get `space.lg` (16px) padding. Related items get `space.sm` (8px).
**When:** Everywhere in the admin layout.
**Why:** The current admin looks cramped because spacing is inconsistent (8px here, 10px there, 14px elsewhere). A consistent scale creates visual breathing room without any structural changes.

### Pattern 4: Keep CRUD Handlers in AdminPanel

**What:** Do NOT extract tab content into separate files. The business logic (CRUD handlers) stays in `AdminPanel.jsx`. Only extract UI primitives.
**When:** For this overhaul scope.
**Why:** The PROJECT.md explicitly says "Refactoring into multiple component files -- only if needed for the visual work." The CRUD handlers are fine where they are. Extracting tab content would be a refactoring project, not a visual overhaul. The `ui.jsx` primitives file is the only new component file needed, and it directly serves the visual goal.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Extracting Every Tab into a Separate File
**What:** Moving each tab (Categories, Portfolio, FAQs, etc.) into its own component file.
**Why bad:** Creates a refactoring scope creep that does not improve visuals. Adds prop-drilling complexity. The 870-line file becomes manageable once UI primitives reduce repetition -- the visual overhaul naturally shrinks the file by ~30% through primitive reuse.
**Instead:** Extract only UI primitives (`ui.jsx`) and design tokens (`adminStyles.js`). Keep tab content inline.

### Anti-Pattern 2: CSS-in-JS Libraries
**What:** Adding styled-components, Emotion, or similar.
**Why bad:** Violates project constraint (inline styles only). Adds build complexity. The token system achieves the same consistency without new dependencies.
**Instead:** Plain JS objects as design tokens.

### Anti-Pattern 3: Overly Generic Primitives
**What:** Making `AdminButton` handle 12 variants, sizes, icons, animations.
**Why bad:** This is a single-user admin panel. Over-engineering primitives wastes time and adds cognitive load.
**Instead:** 3 button variants (primary, secondary/ghost, danger). That covers every existing use case.

### Anti-Pattern 4: Changing Public Site Styles
**What:** Modifying the `S` constant in `constants.js` to serve admin needs.
**Why bad:** The public site uses `S` extensively. Changing it risks visual regressions on the customer-facing site.
**Instead:** Create a separate `A` (admin) style constant in `adminStyles.js` that imports `R` from `constants.js` but is otherwise independent.

## Suggested Build Order

The order below maximizes visual impact at each step. Each step produces a visible improvement, so progress is tangible throughout.

### Step 1: Design Tokens (`adminStyles.js`) -- Foundation

Create the token file with color, spacing, typography, and compound styles. This is invisible to the user but enables everything that follows.

**Visual impact:** None yet (foundation work).
**Risk:** Low -- new file, no changes to existing code.

### Step 2: UI Primitives (`ui.jsx`) -- Building Blocks

Create `InfoBox`, `EmptyState`, `AdminCard`, `AdminButton`, `AdminInput`, `TabBar`, `FlashMessage`, `ItemRow`. Each primitive consumes tokens from step 1.

**Visual impact:** None yet (building blocks, not yet wired).
**Risk:** Low -- new file, no changes to existing code.

### Step 3: Admin Shell -- Maximum Visual Impact First

Apply the new design to the admin "shell": header, tab bar, flash message, overall layout/spacing. This transforms the first impression immediately.

**Visual impact:** HIGH -- the admin instantly looks different and more professional.
**Risk:** Low -- only touching the outer wrapper, not tab content.
**What changes:** Top section of `AdminPanel.jsx` render (header, tabs, flash message, container widths/padding).

### Step 4: Tab Content Migration -- Systematic Sweep

Go through each tab and replace inline styles with UI primitives. This is mechanical work -- swap `<div style={{...S.adminCard}}>` with `<AdminCard>`, swap button patterns with `<AdminButton>`, etc.

**Visual impact:** HIGH -- each tab transforms as primitives are applied.
**Risk:** Medium -- touching CRUD form rendering, must not break submit handlers.
**Order within step:**
1. Categories tab (simplest, good first test)
2. FB Reviews tab (simple CRUD, validates pattern)
3. Google Reviews tab (similar to FB, fast)
4. FAQs tab (has DragList, slightly more complex)
5. Portfolio tab (most complex form with conditional fields)
6. Site Texts tab (has sub-components: HeroPositionControl, StatRow, SiteTextRow)
7. CarouselsTab.jsx (separate file, apply same primitives)

### Step 5: Polish -- Details That Complete the Look

Empty states with helpful icons/illustrations. Hover states via the existing `admin-ghost`/`admin-btn` CSS classes. Subtle transitions. Consistent border treatments. Final spacing tweaks.

**Visual impact:** Medium -- takes it from "good" to "polished."
**Risk:** Low -- cosmetic only.

## File Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/adminStyles.js` | CREATE | Design tokens + compound admin styles |
| `src/components/Admin/ui.jsx` | CREATE | Reusable admin UI primitives |
| `src/components/Admin/AdminPanel.jsx` | MODIFY | Replace inline styles with tokens/primitives |
| `src/components/Admin/CarouselsTab.jsx` | MODIFY | Replace inline styles with tokens/primitives |
| `src/components/Admin/DragList.jsx` | MODIFY | Minor -- accept token-based styles |
| `src/lib/constants.js` | NO CHANGE | Public site styles untouched |

## Sources

- Direct codebase analysis of `AdminPanel.jsx` (871 lines), `CarouselsTab.jsx` (193 lines), `DragList.jsx` (201 lines), `constants.js` (199 lines)
- Project constraints from `PROJECT.md` and `CLAUDE.md`
- React inline-style patterns are well-established and do not require external verification
