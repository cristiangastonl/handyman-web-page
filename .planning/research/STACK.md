# Technology Stack

**Project:** Admin Panel UX Overhaul
**Researched:** 2026-03-16

## Recommended Stack

No new dependencies. The entire overhaul uses the existing React + Vite stack with a formalized design token system implemented as plain JavaScript objects in a new `src/lib/adminStyles.js` file.

### Design Token System (in `adminStyles.js`)

The current `S` object in `constants.js` is the right pattern but is ad-hoc and inconsistent. Create a new `adminStyles.js` file with a structured design token system that exports plain JS objects for inline styles. The existing `S` object stays untouched to avoid public site regressions.

| Token Category | Purpose | Why |
|----------------|---------|-----|
| `colors` | Semantic color palette (brand, neutral, feedback) | Eliminates magic hex values scattered across components |
| `spacing` | 4px-based scale (4, 8, 12, 16, 20, 24, 32, 48) | Current spacing is inconsistent (padding "18px 0", "8px 0", etc.) |
| `typography` | Font sizes, weights, line heights | Current uses arbitrary sizes (10, 11, 12, 13px) with no hierarchy |
| `radii` | Border radius scale (4, 8, 12) | Currently mixes 5, 6, 10 with no logic |
| `shadows` | Elevation levels (sm, md, lg) | Gives cards and modals consistent depth |
| `adminStyles` | Composed component styles (card, button variants, input, tab) | Replaces current `S` object's admin entries with better-organized presets |

**Confidence:** HIGH -- This is just organizing existing inline style patterns. No library needed.

### Color Palette

Built around brand orange `#D4781F` with the existing charcoal `#4A4A4A`.

```javascript
const adminColors = {
  // Brand
  brand: "#D4781F",
  brandLight: "#FFF3E8",    // Orange tinted background for highlights
  brandDark: "#B8621A",     // Hover/pressed state

  // Neutrals (warm-tinted to complement orange)
  gray900: "#1A1A1A",       // Primary text
  gray700: "#4A4A4A",       // Secondary text (existing G constant)
  gray500: "#888888",       // Muted text, placeholders
  gray300: "#D1D1D1",       // Borders
  gray200: "#E8E8E8",       // Dividers, subtle borders
  gray100: "#F5F5F5",       // Card backgrounds, hover states
  gray50: "#FAFAFA",        // Page background
  white: "#FFFFFF",         // Card surfaces

  // Semantic feedback
  success: "#2E7D4F",       // Green for success messages
  successLight: "#E8F5EE",  // Success background
  danger: "#D64545",        // Red for destructive actions
  dangerLight: "#FEF2F2",   // Danger background
  warning: "#E6A817",       // Yellow for warnings
  warningLight: "#FFF9E6",  // Warning background
  info: "#3B82F6",          // Blue for informational
  infoLight: "#EFF6FF",     // Info background
};
```

**Why this palette:**
- Orange + charcoal gray is a proven professional combination: orange brings energy, gray adds stability. The existing `G = "#4A4A4A"` already follows this pattern.
- `brandLight` (#FFF3E8) serves as a warm highlight background for selected items, active tabs, and info boxes -- replacing the current approach of using opacity or arbitrary light colors.
- Semantic colors (success/danger/warning/info) are essential for an admin panel where feedback on CRUD operations is constant. The current panel uses `R` (brand orange) for danger buttons, which is confusing -- delete buttons should be red, not orange.
- Light variants of each semantic color provide background fills for flash messages and status indicators.

**Confidence:** HIGH -- Standard color system principles. Orange-gray complementary palettes are well-documented in UI design.

### Typography Scale

Keep DM Sans (already loaded). Define a clear hierarchy.

```javascript
const adminTypography = {
  // Page level
  pageTitle:    { fontSize: 22, fontWeight: 700, lineHeight: 1.3 },
  pageSubtitle: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: adminColors.gray500 },

  // Section level
  sectionTitle: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  sectionDesc:  { fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: adminColors.gray500 },

  // Card level
  cardTitle:    { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  cardBody:     { fontSize: 13, fontWeight: 400, lineHeight: 1.6 },

  // Form level
  label:        { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: adminColors.gray700 },
  input:        { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  helpText:     { fontSize: 12, fontWeight: 400, color: adminColors.gray500 },

  // Small UI
  badge:        { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" },
  caption:      { fontSize: 11, fontWeight: 400, color: adminColors.gray500 },
};
```

**Why this scale:**
- Current admin uses 10-13px for almost everything, making it hard to distinguish headings from body text. This scale creates clear separation: 22px page title, 16px sections, 14px cards/inputs, 12px labels, 11px captions.
- `fontSize: 14` for inputs (up from current 13) improves readability and meets accessibility guidelines.
- Line heights are explicitly set (currently missing from most styles) for consistent vertical rhythm.
- Labels use `textTransform: "uppercase"` with `letterSpacing` -- this is already in the current `S.label` and works well for form labels.

**Confidence:** HIGH -- Standard typography scale, grounded in 4px grid system.

### Spacing Scale

```javascript
const sp = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
};
```

**Why 4px base:** The 4px grid is the industry standard for UI spacing. Current styles use arbitrary values (18px padding, 10px gaps, etc.) that create visual inconsistency. A constrained scale forces consistency.

**Confidence:** HIGH -- Universal spacing convention.

### Border Radius Scale

```javascript
const radii = {
  sm: 4,    // Small elements: badges, tags
  md: 8,    // Inputs, buttons, small cards
  lg: 12,   // Cards, panels
  full: 999, // Circular elements (avatars, indicators)
};
```

**Why:** Current code mixes borderRadius 5, 6, 10 arbitrarily. A constrained scale (4/8/12) creates visual consistency.

**Confidence:** HIGH -- Standard practice.

### Shadow Scale

```javascript
const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 24px rgba(0,0,0,0.12)",
};
```

**Confidence:** HIGH -- Standard elevation system.

### Composed Admin Styles

These replace the current `S` object's admin-related entries with better-organized presets.

```javascript
const adminStyles = {
  // Layout
  page: {
    maxWidth: 860,
    margin: "0 auto",
    padding: `${sp["3xl"]}px ${sp["2xl"]}px`,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },

  // Cards
  card: {
    background: adminColors.white,
    borderRadius: radii.lg,
    border: `1px solid ${adminColors.gray200}`,
    padding: sp["2xl"],
  },
  cardElevated: {
    background: adminColors.white,
    borderRadius: radii.lg,
    boxShadow: shadows.sm,
    padding: sp["2xl"],
  },

  // Buttons
  btnPrimary: {
    background: adminColors.gray900,
    color: adminColors.white,
    border: "none",
    padding: `${sp.sm}px ${sp.xl}px`,
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "opacity 0.15s",
  },
  btnBrand: {
    background: adminColors.brand,
    color: adminColors.white,
    border: "none",
    padding: `${sp.sm}px ${sp.xl}px`,
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  btnDanger: {
    background: "none",
    border: `1px solid ${adminColors.danger}`,
    color: adminColors.danger,
    padding: `${sp.xs}px ${sp.md}px`,
    borderRadius: radii.sm,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
  },
  btnGhost: {
    background: "none",
    border: `1px solid ${adminColors.gray300}`,
    padding: `${sp.xs}px ${sp.md}px`,
    borderRadius: radii.sm,
    cursor: "pointer",
    fontSize: 12,
    color: adminColors.gray700,
  },

  // Inputs
  input: {
    width: "100%",
    padding: `${sp.sm + 2}px ${sp.md}px`,
    border: `1px solid ${adminColors.gray300}`,
    borderRadius: radii.md,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },

  // Tabs
  tab: {
    padding: `${sp.sm}px ${sp.lg}px`,
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    border: "none",
    background: "none",
    transition: "all 0.15s",
  },
  tabActive: {
    background: adminColors.brandLight,
    color: adminColors.brand,
    fontWeight: 600,
  },

  // List items
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: sp.md,
    padding: `${sp.md}px 0`,
    borderBottom: `1px solid ${adminColors.gray100}`,
  },

  // Info box (replaces "How it works" boxes)
  infoBox: {
    background: adminColors.infoLight,
    border: `1px solid #DBEAFE`,
    borderRadius: radii.md,
    padding: sp.lg,
    fontSize: 13,
    lineHeight: 1.6,
    color: adminColors.gray700,
  },

  // Flash message
  flash: {
    padding: `${sp.sm}px ${sp.lg}px`,
    borderRadius: radii.md,
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: `${sp["4xl"]}px ${sp["2xl"]}px`,
    color: adminColors.gray500,
    fontSize: 14,
  },
};
```

**Confidence:** HIGH -- These are direct upgrades of the existing `S` object patterns.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Styling approach | Inline JS objects (design tokens) | CSS Custom Properties (`:root` vars) | Project convention is inline styles. CSS vars would require mixing two systems. Tokens-as-JS-objects is the right fit. |
| Token file location | Separate `adminStyles.js` | Add to existing `constants.js` | ARCHITECTURE.md correctly identifies that modifying `constants.js` risks public site regressions. A separate file isolates admin changes completely. |
| UI library | None (custom styles) | Chakra UI, MUI | Adding a UI library for a single admin panel is overkill. The admin has ~7 tabs of CRUD forms -- custom tokens give full control without dependency weight. |
| CSS-in-JS | None | styled-components, Emotion | These are declining in the React ecosystem (RSC incompatibility). Inline style objects with tokens achieve the same consistency for this scope. |
| Icon library | Unicode/emoji or inline SVG | lucide-react, react-icons | The project already uses inline SVG paths (see `svgP` in constants.js). Adding an icon library for just the admin is unnecessary. A few hand-picked SVG icons for tab navigation are sufficient. |

## What NOT to Use

### No Tailwind CSS
The entire project uses inline styles. Introducing Tailwind for just the admin would create two competing style systems. The migration effort is not worth it for a single-user admin panel.

### No CSS Modules
Same reasoning. The project convention is inline styles and that should remain consistent.

### No UI Component Library (MUI, Ant Design, Chakra)
These bring huge bundle sizes and impose their own design language. The admin is ~3 components total. Custom design tokens give full control at zero cost.

### No CSS-in-JS Libraries (styled-components, Emotion)
The React ecosystem is moving away from runtime CSS-in-JS due to performance and RSC concerns. For a project already using inline styles, there is no benefit to adding these.

### No Dark Mode
The admin has a single user (Anibal) on desktop. Dark mode is scope creep for this milestone. The light palette with warm neutrals is sufficient.

## Implementation Notes

### File Organization

Create a new `src/lib/adminStyles.js` that imports only `R` from `constants.js`. Keep the existing `S` object and `constants.js` completely untouched.

```
src/lib/adminStyles.js    (NEW -- all admin design tokens + composed styles)
src/components/Admin/ui.jsx (NEW -- reusable admin UI primitives consuming tokens)
```

1. `adminStyles.js` defines token primitives (`adminColors`, `sp`, `radii`, `shadows`, `adminTypography`) and composed styles (`A`)
2. `ui.jsx` creates thin wrapper components (`AdminCard`, `AdminButton`, `AdminInput`, etc.) that consume tokens
3. `AdminPanel.jsx` and `CarouselsTab.jsx` import from `ui.jsx` instead of using raw inline styles
4. `constants.js` is NOT modified -- public site styles are untouched

### Migration Strategy

Do NOT rewrite all styles at once. Instead:
1. Create `adminStyles.js` and `ui.jsx` (non-breaking, no changes to existing code)
2. Update the admin shell (header, tabs, flash, container) to use new tokens
3. Update each tab horizontally (all tabs get cards, then all tabs get inputs, etc.)
4. The old admin-specific entries in `S` (`S.adminCard`, `S.adminCardTitle`, `S.btnDanger`, `S.btnSmall`) can be deprecated once all admin code references the new system

### CSS Pseudo-classes and Hover States

Inline styles cannot handle `:hover`, `:focus`, or transitions natively. The current approach (classes in the global `<style>` tag like `.admin-btn:hover`) is correct and should continue. Add a few more utility hover classes to the global CSS string:

```css
.admin-input:focus { border-color: #D4781F !important; box-shadow: 0 0 0 3px rgba(212,120,31,0.12) !important; }
.admin-card:hover { border-color: #D1D1D1 !important; }
.admin-btn-danger:hover { background: #FEF2F2 !important; }
.admin-tab:hover { background: #F5F5F5 !important; }
```

This is the one area where inline styles fall short, and the project already has the right escape hatch via the global `css` template literal.

**Confidence:** HIGH -- Extends existing pattern, no new concepts.

## Sources

- [UXPin: Managing Global Styles in React with Design Tokens](https://www.uxpin.com/studio/blog/managing-global-styles-in-react-with-design-tokens/)
- [CSS-Tricks: What Are Design Tokens?](https://css-tricks.com/what-are-design-tokens/)
- [Penpot: Developer's Guide to Design Tokens](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/)
- [Piktochart: Orange Gray Color Palette Combinations](https://piktochart.com/tips/orange-gray-color-palette)
- [BootstrapDash: Best Color Schemes for Admin Templates](https://www.bootstrapdash.com/blog/best-color-schemes-for-websites)
- [Medium: Admin Dashboard UI/UX Best Practices 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [UXPin: Card Design UI](https://www.uxpin.com/studio/blog/card-design-ui/)
