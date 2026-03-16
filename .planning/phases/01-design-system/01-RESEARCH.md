# Phase 1: Design System - Research

**Researched:** 2026-03-16
**Domain:** Design tokens (JS objects) + React UI primitives for admin panel
**Confidence:** HIGH

## Summary

Phase 1 creates two new files -- `src/lib/adminStyles.js` (design tokens) and `src/components/Admin/adminUI.jsx` (UI primitives) -- with zero changes to existing code. The entire phase is additive: new files only, no imports added to existing components yet. The tokens formalize the ad-hoc inline styles currently scattered across AdminPanel.jsx (870+ lines of magic numbers) into a structured system of colors, spacing, typography, radii, and shadows. The UI primitives are thin React wrappers (AdminButton, AdminInput, AdminCard, AdminLabel) that consume those tokens.

The project uses inline styles exclusively (no Tailwind, CSS modules, or CSS-in-JS). This constraint means tokens are plain JS objects and primitives are standard React components with style props. Hover/focus states that cannot be handled inline use CSS class names in the existing global `<style>` tag -- this is the established escape hatch. The existing `S` object in `constants.js` and `R` brand color are the patterns to mirror (not modify).

**Primary recommendation:** Build `adminStyles.js` first with all token categories, then build `adminUI.jsx` primitives that consume those tokens. Export a single `A` object for compound styles (mirroring `S` convention) plus individual named exports for granular token access.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Token structure: Nested by category (`colors.primary`, `spacing.sm`, `typography.heading`, etc.)
- File location: `src/lib/adminStyles.js` -- separate from public site's `constants.js` and `S` object
- Export pattern: Single `A` object plus individual named exports for granular imports
- Must NOT modify or import from `S` in constants.js -- complete isolation from public site styles
- Brand accent: `#D4781F` (existing `R` constant) for primary actions
- Warm neutral grays (not cool blue-grays) for backgrounds/borders/text
- Semantic colors: green success, red danger, blue info -- standard web conventions
- Danger buttons use RED, not brand orange
- Text hierarchy: near-black headings (#222), dark gray body (#555), medium gray captions (#888), light gray placeholders (#aaa)
- Typography scale: 18px/700 page titles, 14px/600 section headers, 13px/400-500 body, 11px/400 captions
- Font family: inherit (DM Sans)
- Button variants: primary (filled orange bg, white text), secondary (ghost/outlined), danger (red)
- Button height: 36px standard, 28px small; border-radius 8px
- Disabled state: opacity 0.5 + cursor not-allowed; Loading state: spinner replaces/sits beside text
- Input height: 40px standard, auto for textareas; border 1px solid light gray, 2px brand-color focus; border-radius 8px
- Persistent label above each input (not placeholder-only)
- Card: 1px solid #e8e8e8 border + small shadow (0 1px 3px rgba(0,0,0,0.06)), 20px padding, 12px border-radius, white bg

### Claude's Discretion
- Exact gray hex values within the warm neutral range
- Shadow depth and spread values
- Whether to include a Spinner primitive in this phase or defer to Phase 2
- Internal structure of the adminStyles.js file (grouping, comments)
- Whether AdminCard gets a `variant` prop or stays single-style

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-05 | Design tokens live in a dedicated `adminStyles.js` file, separate from public site's `constants.js` | Token file structure, export pattern (`A` object + named exports), color/spacing/typography/radii/shadow primitives all documented. Imports only `R` from constants.js. |
| DSGN-01 | Admin panel uses consistent typography scale -- page titles (18px), section headers (14px), body text (13px), captions (11px) | Typography token category with exact sizes, weights, and line heights. Font family inherits DM Sans. |
| DSGN-02 | Buttons have clear visual hierarchy -- primary (filled orange), secondary (outlined/ghost), danger (red) | Three button variant styles in tokens + AdminButton primitive with variant prop, loading/disabled states. Heights: 36px standard, 28px small. |
| DSGN-03 | Form inputs have 40px height, clear borders, brand-color focus ring, and persistent labels above each field | Input token styles + AdminInput primitive with label prop. Focus ring via CSS class in global stylesheet (inline styles cannot do :focus). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | existing (18.x) | Component rendering | Already in project |
| Plain JS objects | N/A | Design tokens | Project convention is inline styles, no CSS-in-JS |

### Supporting
No new dependencies. The entire design system is plain JavaScript objects and React components.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain JS tokens | CSS Custom Properties | Project convention is inline styles; CSS vars would mix two systems |
| Custom primitives | Chakra UI / MUI | Massive bundle for a single-user admin; project has no UI library |
| Inline styles | styled-components / Emotion | Declining in React ecosystem (RSC issues); project convention forbids CSS-in-JS |

**Installation:**
```bash
# No installation needed -- zero new dependencies
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    constants.js          # EXISTING -- DO NOT MODIFY. Public site styles (S, R, css)
    adminStyles.js        # NEW -- Admin design tokens + compound styles (A)
  components/
    Admin/
      adminUI.jsx         # NEW -- Reusable admin UI primitive components
      AdminPanel.jsx      # EXISTING -- unchanged in Phase 1
      CarouselsTab.jsx    # EXISTING -- unchanged in Phase 1
      DragList.jsx        # EXISTING -- unchanged in Phase 1
```

### Pattern 1: Token-First Styling
**What:** Every visual value comes from a token constant, never a magic hex/number.
**When to use:** All admin component styling from Phase 2 onward.
**Example:**
```javascript
// src/lib/adminStyles.js
import { R } from "./constants";

// ── Color Tokens ──
export const colors = {
  brand: R,                    // "#D4781F"
  brandLight: "#FFF3E8",       // Warm orange tint for highlights/active states
  brandDark: "#C06A18",        // Hover/pressed state

  // Warm neutral grays (complement orange, not cool blue-gray)
  gray50:  "#FAFAF8",          // Page background
  gray100: "#F5F3F0",          // Card hover, subtle backgrounds
  gray200: "#E8E6E3",          // Dividers, subtle borders
  gray300: "#D4D1CC",          // Input borders, secondary borders
  gray400: "#AAA69F",          // Placeholder text
  gray500: "#888480",          // Captions, muted text
  gray600: "#6B6762",          // Secondary body text
  gray700: "#555250",          // Body text
  gray800: "#333130",          // Subheadings
  gray900: "#222120",          // Headings, primary text

  white: "#FFFFFF",

  // Semantic
  success:      "#2E7D4F",
  successLight: "#E8F5EE",
  danger:       "#D64545",
  dangerLight:  "#FEF2F2",
  info:         "#3B82F6",
  infoLight:    "#EFF6FF",
};
```

### Pattern 2: Compound Style Objects (the `A` export)
**What:** Pre-composed style objects that combine tokens into ready-to-use component styles, mirroring the existing `S` pattern.
**When to use:** Applied to components via `style={A.card}` or spread `style={{...A.input, ...overrides}}`.
**Example:**
```javascript
// Compound styles -- the A object
export const A = {
  card: {
    background: colors.white,
    border: "1px solid #e8e8e8",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  btnPrimary: {
    background: colors.brand,
    color: colors.white,
    border: "none",
    height: 36,
    padding: "0 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  // ... more compound styles
};
```

### Pattern 3: Thin Wrapper Primitives
**What:** React components that encapsulate token application + interaction states (hover, disabled, loading). Not complex -- just style-application helpers.
**When to use:** Whenever a styled element repeats 3+ times in the admin.
**Example:**
```javascript
// src/components/Admin/adminUI.jsx
import { A, colors, spacing } from "../../lib/adminStyles";

export function AdminButton({
  children, variant = "primary", size = "standard",
  loading, disabled, style, ...props
}) {
  const isDisabled = loading || disabled;
  const baseStyle = variant === "danger" ? A.btnDanger
    : variant === "secondary" ? A.btnSecondary
    : A.btnPrimary;
  const sizeStyle = size === "small" ? A.btnSmall : {};

  return (
    <button
      className="admin-btn"
      disabled={isDisabled}
      style={{
        ...baseStyle,
        ...sizeStyle,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
```

### Pattern 4: CSS Class Escape Hatch for Pseudo-States
**What:** Hover, focus, and transition states go in global CSS class names (existing pattern), not onMouseEnter/onMouseLeave JS hacks.
**When to use:** Any :hover, :focus, :active, :focus-visible state.
**Example:**
```css
/* Add to the css template literal in constants.js (or a separate admin CSS block) */
.admin-input:focus { border-color: #D4781F !important; box-shadow: 0 0 0 3px rgba(212,120,31,0.12) !important; }
.admin-btn-primary:hover { opacity: 0.88 !important; }
.admin-btn-danger:hover { background: #FEF2F2 !important; }
.admin-btn-secondary:hover { background: #F5F3F0 !important; }
```

### Anti-Patterns to Avoid
- **Modifying constants.js:** Admin tokens go in adminStyles.js. The `S` object and `css` string in constants.js serve the public site and must not be touched.
- **Over-engineering primitives:** 3 button variants, not 12. No theme provider, no context, no runtime token switching.
- **Deep nesting in token structure:** Keep tokens max 2 levels deep (`colors.brand`, `typography.pageTitle`). No `tokens.components.button.variants.primary.hover.background`.
- **Extracting tab content:** Only extract UI primitives. Tab CRUD logic stays in AdminPanel.jsx per project scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus ring styling | JS onFocus/onBlur state tracking | CSS class `.admin-input:focus` with `!important` | Inline styles cannot handle :focus; the project already uses this pattern |
| Hover effects | onMouseEnter/onMouseLeave state mutation | CSS class `.admin-btn:hover` | Simpler, no re-renders, already established pattern |
| Spinner animation | JS-based rotation with requestAnimationFrame | CSS `@keyframes spin` (already exists in global CSS) | The spin keyframe already exists in the `css` template literal |
| Disabled cursor | Manual pointer-events toggling | `disabled` attribute + `cursor: "not-allowed"` in style | Native HTML disabled + CSS is simpler and more accessible |

**Key insight:** The global `css` template literal in constants.js already has `@keyframes spin`, `.admin-btn:hover`, `.admin-ghost:hover`, and `.admin-tab:hover`. Reuse and extend these rather than inventing new mechanisms.

## Common Pitfalls

### Pitfall 1: Global CSS `!important` Overriding Inline Styles
**What goes wrong:** The `css` template literal in constants.js has `!important` on several admin rules, notably `.admin-container input, textarea, select { font-size: 16px !important }` for mobile. This overrides any inline `fontSize` on inputs inside `.admin-container`.
**Why it happens:** Developers set fontSize in tokens/inline styles and forget about the global CSS specificity.
**How to avoid:** Audit the existing admin-related CSS classes before writing token values. The input primitives must use the `.admin-input` class name so focus styles work, and must account for the mobile `!important` override. Since admin is desktop-only, the mobile override is benign but should be documented.
**Warning signs:** Inputs that refuse to change font size in the browser despite correct inline styles.

### Pitfall 2: Inconsistent Warm Gray Selection
**What goes wrong:** Picking gray values that lean cool (blue-tinted like #F7F8FA) instead of warm (slightly yellow/orange-tinted). Cool grays clash with the orange brand color and make the UI feel disjointed.
**Why it happens:** Default "gray" in most design systems is cool-tinted. Copy-pasting from other design systems brings cool grays.
**How to avoid:** All grays should have a slight warm undertone. Test: place the gray next to #D4781F -- it should feel harmonious, not competing.
**Warning signs:** The admin feels "cold" or the orange looks out of place against the backgrounds.

### Pitfall 3: Token System Too Complex for Scope
**What goes wrong:** Building a theme provider, context-based token injection, or runtime-switchable themes for a single-user admin panel.
**Why it happens:** Design system best practices from large-scale apps get applied to a small scope.
**How to avoid:** Tokens are plain exported JS objects. Primitives import them directly. No React context, no provider, no theme switching. The `A` object is imported directly where needed.
**Warning signs:** If `adminStyles.js` imports React or has any runtime logic, it is over-engineered.

### Pitfall 4: Forgetting CarouselsTab.jsx and DragList.jsx
**What goes wrong:** Tokens and primitives are designed only for AdminPanel.jsx patterns. When Phase 2/3 applies them to CarouselsTab and DragList, the tokens do not cover those components' specific needs (grid layouts, drag handles, selection states).
**Why it happens:** CarouselsTab and DragList are separate files, easy to overlook during token design.
**How to avoid:** Review CarouselsTab.jsx and DragList.jsx inline styles during token design to ensure coverage. Include selection/active states, grid item styles, and drag handle styles in the token system.
**Warning signs:** Phase 2/3 discovers missing tokens and has to extend adminStyles.js retroactively.

## Code Examples

### adminStyles.js -- Complete Token File Structure

```javascript
// src/lib/adminStyles.js
import { R } from "./constants";

// ── Color Tokens ──
export const colors = {
  brand: R,
  brandLight: "#FFF3E8",
  brandDark: "#C06A18",

  gray50:  "#FAFAF8",
  gray100: "#F5F3F0",
  gray200: "#E8E6E3",
  gray300: "#D4D1CC",
  gray400: "#AAA69F",
  gray500: "#888480",
  gray600: "#6B6762",
  gray700: "#555250",
  gray800: "#333130",
  gray900: "#222120",

  white: "#FFFFFF",

  success:      "#2E7D4F",
  successLight: "#E8F5EE",
  danger:       "#D64545",
  dangerLight:  "#FEF2F2",
  info:         "#3B82F6",
  infoLight:    "#EFF6FF",
};

// ── Spacing (4px base grid) ──
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
};

// ── Typography ──
export const typography = {
  pageTitle:     { fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: colors.gray900 },
  sectionHeader: { fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: colors.gray900 },
  body:          { fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: colors.gray700 },
  bodyMedium:    { fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: colors.gray700 },
  caption:       { fontSize: 11, fontWeight: 400, lineHeight: 1.5, color: colors.gray500 },
  label:         { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.gray600, marginBottom: spacing.xs },
};

// ── Border Radius ──
export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 999,
};

// ── Shadows ──
export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 24px rgba(0,0,0,0.12)",
};

// ── Compound Styles (the A object) ──
export const A = {
  // Card
  card: {
    background: colors.white,
    border: "1px solid #e8e8e8",
    borderRadius: radii.lg,
    padding: spacing.xl,
    boxShadow: shadows.sm,
  },
  cardTitle: {
    ...typography.sectionHeader,
    marginBottom: spacing.md,
  },

  // Buttons
  btnPrimary: {
    background: colors.brand,
    color: colors.white,
    border: "none",
    height: 36,
    padding: "0 20px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnSecondary: {
    background: "none",
    color: colors.gray800,
    border: `1px solid ${colors.gray300}`,
    height: 36,
    padding: "0 16px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnDanger: {
    background: "none",
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    height: 36,
    padding: "0 16px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnSmall: {
    height: 28,
    padding: "0 12px",
    fontSize: 12,
  },

  // Inputs
  input: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: `1px solid ${colors.gray300}`,
    borderRadius: radii.md,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: colors.gray900,
    background: colors.white,
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${colors.gray300}`,
    borderRadius: radii.md,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: colors.gray900,
    background: colors.white,
    resize: "vertical",
    minHeight: 80,
  },
  inputLabel: {
    ...typography.label,
    display: "block",
    marginBottom: spacing.xs,
  },
  inputPlaceholder: {
    color: colors.gray400,
  },

  // List
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.gray200}`,
  },

  // Info box
  infoBox: {
    background: colors.infoLight,
    border: "1px solid #DBEAFE",
    borderRadius: radii.md,
    padding: spacing.lg,
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.gray700,
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: `${spacing["4xl"]}px ${spacing["2xl"]}px`,
    color: colors.gray500,
    fontSize: 13,
  },
};
```

### adminUI.jsx -- Primitive Components

```javascript
// src/components/Admin/adminUI.jsx
import { A, colors, spacing, typography } from "../../lib/adminStyles";

export function AdminButton({
  children,
  variant = "primary",
  size = "standard",
  loading = false,
  disabled = false,
  style,
  ...props
}) {
  const isDisabled = loading || disabled;
  const base = variant === "danger" ? A.btnDanger
    : variant === "secondary" ? A.btnSecondary
    : A.btnPrimary;
  const sizeOverride = size === "small" ? A.btnSmall : {};

  return (
    <button
      className="admin-btn"
      disabled={isDisabled}
      style={{
        ...base,
        ...sizeOverride,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}

export function AdminInput({
  label,
  type = "text",
  style,
  ...props
}) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && <label style={A.inputLabel}>{label}</label>}
      <input
        type={type}
        className="admin-input"
        style={{ ...A.input, ...style }}
        {...props}
      />
    </div>
  );
}

export function AdminTextarea({ label, style, ...props }) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && <label style={A.inputLabel}>{label}</label>}
      <textarea
        className="admin-input"
        style={{ ...A.textarea, ...style }}
        {...props}
      />
    </div>
  );
}

export function AdminCard({ title, children, style, ...props }) {
  return (
    <div style={{ ...A.card, ...style }} {...props}>
      {title && <div style={A.cardTitle}>{title}</div>}
      {children}
    </div>
  );
}

export function AdminLabel({ children, style }) {
  return <div style={{ ...A.inputLabel, ...style }}>{children}</div>;
}
```

## State of the Art

| Old Approach (current) | New Approach (Phase 1) | Impact |
|------------------------|----------------------|--------|
| Magic hex values scattered in JSX | Centralized `colors` token object | Single source of truth for all admin colors |
| Arbitrary font sizes (10, 11, 12, 13px) | Four-tier typography scale (18/14/13/11) | Clear visual hierarchy |
| `S.btnDanger` uses brand orange for delete | `A.btnDanger` uses red (#D64545) | Delete actions are unambiguous |
| Each button instance manages its own disabled/loading | AdminButton primitive encapsulates states | Consistent behavior everywhere |
| `S.input` has no focus styling | `.admin-input:focus` CSS class with brand-color ring | Clear focus indication |
| No label convention (some inline, some missing) | AdminInput has built-in `label` prop | Persistent labels on all inputs |

**Deprecated/outdated after Phase 1 completion:**
- `S.adminCard`, `S.adminCardTitle`, `S.btnDanger`, `S.btnSmall`, `S.ghost`, `S.label`, `S.input`, `S.btnPrimary`, `S.listItem` -- these will be superseded by the `A` object equivalents (actual removal happens in Phase 2/3 when components are migrated)

## Open Questions

1. **Spinner primitive -- include now or defer?**
   - What we know: CONTEXT.md lists this as Claude's discretion. NAVF-04 (spinner next to submit button) is a Phase 2 requirement.
   - Recommendation: Include a minimal `Spinner` component in adminUI.jsx now (a simple CSS-animated circle using the existing `@keyframes spin`). It costs almost nothing and AdminButton's loading state can use it immediately.

2. **AdminCard variant prop**
   - What we know: CONTEXT.md lists this as Claude's discretion. Current uses are uniform (all cards look the same).
   - Recommendation: Start with a single style. If Phase 3 tab content needs a variant (e.g., elevated vs flat), add it then. YAGNI applies.

3. **Global CSS additions for focus/hover**
   - What we know: New `.admin-input:focus` and `.admin-btn-danger:hover` classes need to go somewhere. The `css` template literal in constants.js is the established location.
   - What's unclear: Whether to add these to the existing `css` string in constants.js (mixing concerns) or create a separate admin CSS injection.
   - Recommendation: Add to existing `css` string in constants.js. It already has `.admin-btn:hover`, `.admin-ghost:hover`, `.admin-tab:hover` -- admin CSS classes are already there. Keep it simple.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None -- no test runner configured per CLAUDE.md |
| Config file | none |
| Quick run command | `npm run build` (verifies no import/syntax errors) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-05 | adminStyles.js exports A object + named tokens | smoke | `npm run build` (import validation) | n/a -- new file |
| DSGN-01 | Typography tokens match spec (18/14/13/11px) | manual-only | Visual inspection of exported values | n/a -- new file |
| DSGN-02 | Three button variants with correct colors | manual-only | Visual inspection of exported styles | n/a -- new file |
| DSGN-03 | Input style tokens with 40px height, focus ring | manual-only | Visual inspection of exported styles + CSS class | n/a -- new file |

**Manual-only justification:** Phase 1 creates new files with no integration into existing components. The only automated check is that `npm run build` succeeds (no syntax errors, valid imports). Visual verification of token values is done by reading the file -- these are static JS objects, not rendered UI.

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build`
- **Phase gate:** Build succeeds + manual review that all token categories and primitives match CONTEXT.md spec

### Wave 0 Gaps
None -- no test infrastructure needed. Phase 1 outputs are static files verified by build success and code review.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `src/lib/constants.js` (199 lines) -- existing S object, R constant, css template literal
- Direct codebase analysis: `src/components/ui.jsx` (84 lines) -- existing public site primitives pattern
- Direct codebase analysis: `src/components/Admin/AdminPanel.jsx` (870+ lines) -- all current inline admin styles
- `.planning/research/STACK.md` -- Token system design, color palette, typography scale, spacing
- `.planning/research/ARCHITECTURE.md` -- File structure, component boundaries, build order
- `.planning/research/PITFALLS.md` -- Global CSS conflicts, style explosion, consistency risks
- `.planning/codebase/CONVENTIONS.md` -- Inline style convention, hover patterns, S object usage

### Secondary (MEDIUM confidence)
- `.planning/phases/01-design-system/01-CONTEXT.md` -- User decisions on exact values and patterns

### Tertiary (LOW confidence)
- None. All findings are from direct codebase analysis and prior project research.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, plain JS objects following existing patterns
- Architecture: HIGH -- two new files, well-defined structure mirroring existing S/ui.jsx patterns
- Pitfalls: HIGH -- identified from direct codebase analysis of CSS specificity and style patterns

**Research date:** 2026-03-16
**Valid until:** indefinite -- no external dependencies to become outdated
