# Phase 2: Shell and Feedback - Research

**Researched:** 2026-03-16
**Domain:** React inline-style admin UI shell (sticky tabs, flash messages, loading spinners)
**Confidence:** HIGH

## Summary

Phase 2 reskins the admin panel's outer frame (header, tab bar, flash messages, loading states) using Phase 1's design tokens and primitives. The existing code in `AdminPanel.jsx` already has all the structural patterns -- sticky flash, tab bar, loading booleans -- they just use hardcoded values and the old `S`/`R` constants instead of the new `A` tokens and `AdminButton` component.

The primary work is: (1) restyle the header with tokens, (2) make the tab bar sticky with token-based styles, (3) create an `AdminFlash` component with icon + color-coding + animations, (4) replace all `<button className="admin-btn" disabled={adminLoading} style={{...S.btnPrimary, opacity: ...}}>` patterns with `<AdminButton loading={adminLoading}>`. The login form also gets restyled with `AdminInput` and `AdminButton`.

**Primary recommendation:** This is a mechanical refactor with one small new component (AdminFlash). Group into a single plan since all changes touch the same file and are interdependent.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Tab bar: Sticky at top, white background, subtle shadow when scrolled, active tab has thicker bottom border in brand color, text uses `typography.body` (13px) with `spacing.lg` (16px) padding, hover via `adminCss`, horizontal scroll for overflow, tokens for all values
- Flash messages: Green (`colors.success` + `colors.successLight` bg) with checkmark for success, red (`colors.danger` + `colors.dangerLight` bg) with X for errors. Icons inline before text. Sticky below tab bar. Auto-dismiss 4s for success, errors persist with close button. Slide-down entry + fade-out exit via CSS in `adminCss`. Create `AdminFlash` primitive in `adminUI.jsx`
- Loading/spinner: Replace `opacity: 0.5` disabled pattern with AdminButton's `loading` prop. Per-action loading (no global overlay). Login form uses `AdminButton` with `loading={loginLoading}`
- Header/shell: Apply tokens to existing layout, title uses `typography.pageTitle`, Logout = `AdminButton variant="danger" size="small"`, Back = `AdminButton variant="secondary" size="small"`, keep 620px max-width, `colors.gray50` or `colors.gray100` as page background

### Claude's Discretion
- Exact shadow value for sticky tab bar
- Flash message slide-down animation timing/easing
- Whether flash uses `position: fixed` toast or `position: sticky` inline (recommended: sticky inline)
- Login form restyling with admin tokens
- Whether to extract a reusable AdminHeader component or keep inline

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAVF-02 | Flash messages are color-coded -- green with checkmark for success, red with X for errors -- with smooth fade-out | AdminFlash component pattern, CSS keyframe animations for slide-down/fade-out, refactored `flash()` function |
| NAVF-03 | Tab bar is sticky at the top of the admin panel when scrolling | `position: sticky` with `top` offset, white background, shadow on scroll, token-based tab styles |
| NAVF-04 | Async operations show a spinner next to the submit button (not just opacity reduction) | AdminButton `loading` prop already has spinner -- wire into all submit buttons replacing current `opacity: 0.5` pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x (existing) | UI framework | Already in project |
| adminStyles.js | Phase 1 output | Design tokens (colors, spacing, typography, radii, shadows) | Foundation for all admin styling |
| adminUI.jsx | Phase 1 output | Primitive components (AdminButton, AdminInput, AdminCard, AdminLabel, AdminStyles) | Reusable building blocks |

### Supporting
No additional libraries needed. All work uses existing React + inline styles + the Phase 1 design system.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS keyframes in adminCss string | React animation library (framer-motion) | Overkill for 2 simple animations, adds bundle size, project convention is inline styles + CSS string |
| Inline SVG icons for checkmark/X | Icon library (react-icons) | Unnecessary dependency for 2 icons, inline SVG is ~3 lines each |

## Architecture Patterns

### Component Addition
```
src/components/Admin/
  adminUI.jsx          # ADD: AdminFlash component here (alongside existing primitives)
  AdminPanel.jsx       # MODIFY: shell (header, tabs, flash, all submit buttons)
  CarouselsTab.jsx     # MODIFY: flash prop signature change (if flash() API changes)
```

### Pattern 1: AdminFlash Component
**What:** Self-contained flash message component with type-based styling and auto-dismiss
**When to use:** Replaces the current inline `{adminMsg && <div>...}` block

The `flash()` function currently sets a plain string. Two options for type detection:
- **Option A (recommended):** Keep string-based, auto-detect type via `msg.startsWith("Error")` (matches existing convention, zero refactor of 30+ `flash()` call sites)
- **Option B:** Change `flash()` to accept `{ msg, type }` object (requires updating all 30+ call sites)

**Recommendation: Option A.** The existing convention of prefixing errors with "Error:" is consistent across all call sites. AdminFlash can detect type internally. Zero changes to call sites.

```jsx
// In adminUI.jsx
export function AdminFlash({ message, onDismiss }) {
  const isError = message.startsWith("Error");
  // ... render with icon, color, close button (errors only), CSS animation class
}
```

### Pattern 2: Sticky Tab Bar with Shadow-on-Scroll
**What:** Tab bar sticks to top, gains shadow when user scrolls past it
**When to use:** Always visible in admin authenticated view

Two approaches for shadow-on-scroll:
- **Option A:** CSS-only with `box-shadow` always present (simpler, minimal visual difference)
- **Option B:** JavaScript `IntersectionObserver` or scroll listener to toggle shadow class

**Recommendation: Option A (always-on subtle shadow).** The visual difference is negligible and avoids JS complexity. Use `shadows.sm` from tokens.

```jsx
<div style={{
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: colors.white,
  boxShadow: shadows.sm,
  borderBottom: `1px solid ${colors.gray200}`,
}}>
  {/* tab buttons */}
</div>
```

### Pattern 3: AdminButton Loading Replacement
**What:** Replace all `<button disabled={adminLoading} style={{opacity: adminLoading ? 0.5 : 1}}>` with `<AdminButton loading={adminLoading}>`
**When to use:** Every submit/action button in the admin panel

Current pattern (appears ~15 times in AdminPanel.jsx):
```jsx
// BEFORE
<button type="submit" className="admin-btn" disabled={adminLoading || !ncLabel.trim()}
  style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !ncLabel.trim()) ? 0.5 : 1 }}>
  {adminLoading ? "Adding..." : "Add Category"}
</button>

// AFTER
<AdminButton type="submit" loading={adminLoading} disabled={!ncLabel.trim()}
  style={{ marginTop: 12 }}>
  Add Category
</AdminButton>
```

Note: AdminButton already handles `opacity: 0.5` when loading/disabled and shows a spinner. The text no longer needs conditional "Adding..." since the spinner communicates state visually.

### Anti-Patterns to Avoid
- **Changing flash() call signature:** There are 30+ call sites using `flash("string")`. Do NOT change the API. AdminFlash auto-detects error type from string prefix.
- **Global loading overlay:** The per-button loading pattern (adminLoading boolean) already works. Do not add a full-screen spinner.
- **Moving tab state to URL:** Tab state is managed via `adminTab`/`setAdminTab` props from App.jsx. Keep this pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG icons | Custom icon system | Inline SVG strings (checkmark + X) | Only 2 icons needed, ~5 lines total |
| Animation keyframes | JS-based animation | CSS `@keyframes` in `adminCss` string | Project convention, simpler, respects `prefers-reduced-motion` |
| Scroll detection | IntersectionObserver setup | Always-on `box-shadow` on sticky tab bar | Simpler, visual difference is negligible |

## Common Pitfalls

### Pitfall 1: Flash Message z-index Stacking
**What goes wrong:** Flash message appears behind the sticky tab bar or behind other positioned elements
**Why it happens:** Multiple sticky/fixed elements with overlapping z-index values
**How to avoid:** Flash message must have `z-index` higher than tab bar. Tab bar: `z-index: 100`, flash: `z-index: 101`. Or render flash inside tab sticky container.
**Warning signs:** Flash message not visible when scrolled down

### Pitfall 2: CSS Animation Not Applying
**What goes wrong:** Flash slide-down/fade-out animation doesn't work
**Why it happens:** CSS keyframes defined in `adminCss` but not connected to a class name, or React re-renders remove the element before animation completes
**How to avoid:** Use a CSS class with `animation` property. For fade-out, use `onAnimationEnd` callback to clear the message, or use a two-phase approach (visible state + exiting state with animation, then remove).
**Warning signs:** Flash appears/disappears instantly

### Pitfall 3: Sticky Position Not Working
**What goes wrong:** Tab bar doesn't stick, scrolls with content
**Why it happens:** `position: sticky` requires the parent to have `overflow: visible` (not `overflow: hidden` or `overflow: auto`). The `admin-container` div or `S.root` might have overflow set.
**How to avoid:** Verify no ancestor has `overflow: hidden/auto/scroll` set. `S.root` in constants.js should be checked.
**Warning signs:** Tab bar scrolls away despite `position: sticky`

### Pitfall 4: Global CSS !important Overrides
**What goes wrong:** New admin token styles get overridden by existing global CSS `!important` rules
**Why it happens:** `constants.js` global CSS has `.admin-btn:hover { opacity: 0.85; }` and `.admin-tab:hover { color: #666 !important; }` which may conflict with new token-based hover styles
**How to avoid:** Update the global CSS rules in `constants.js` to either remove admin-specific rules (move them to `adminCss`) or ensure they use the new token colors. The `adminCss` string should contain all admin hover/pseudo rules.
**Warning signs:** Hover colors don't match token palette

### Pitfall 5: CarouselsTab Flash Prop Change
**What goes wrong:** CarouselsTab receives `flash` as a prop and calls it directly. If flash API changes, this breaks.
**Why it happens:** CarouselsTab is a separate component that receives `flash` and `adminLoading` as props
**How to avoid:** Keep `flash()` API as `flash(string)`. AdminFlash component reads from the same `adminMsg` state -- no prop change needed for CarouselsTab.
**Warning signs:** CarouselsTab flash messages stop appearing

## Code Examples

### AdminFlash Component
```jsx
// In adminUI.jsx
export function AdminFlash({ message, onDismiss }) {
  if (!message) return null;
  const isError = message.startsWith("Error");
  const icon = isError ? "\u2715" : "\u2713"; // X or checkmark
  const bg = isError ? colors.dangerLight : colors.successLight;
  const fg = isError ? colors.danger : colors.success;
  const border = isError ? colors.danger : colors.success;

  return (
    <div
      className="admin-flash"
      style={{
        position: "sticky",
        top: 52, // below tab bar
        zIndex: 101,
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: bg,
        border: `1px solid ${border}30`,
        borderRadius: radii.md,
        marginBottom: spacing.md,
        ...typography.body,
        color: fg,
        fontWeight: 500,
        animation: "admin-flash-in 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {isError && (
        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none", color: fg,
            cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0,
          }}
        >
          {"\u2715"}
        </button>
      )}
    </div>
  );
}
```

### CSS Keyframes for Flash Animation
```css
/* Add to adminCss string in adminStyles.js */
@keyframes admin-flash-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes admin-flash-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .admin-flash { animation: none !important; }
}
```

### Sticky Tab Bar with Tokens
```jsx
<div style={{
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: colors.white,
  boxShadow: shadows.sm,
  display: "flex",
  gap: 0,
  borderBottom: `2px solid ${colors.gray200}`,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
}}>
  {TABS.map(([k, l]) => (
    <button
      key={k}
      className="admin-tab"
      onClick={() => { window.__dragActive = false; setAdminTab(k); }}
      style={{
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: "none",
        border: "none",
        cursor: "pointer",
        ...typography.body,
        fontWeight: adminTab === k ? 600 : 400,
        color: adminTab === k ? colors.brand : colors.gray400,
        borderBottom: adminTab === k ? `3px solid ${colors.brand}` : "3px solid transparent",
        marginBottom: -2,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {l}
    </button>
  ))}
</div>
```

### Header with Tokens and AdminButton
```jsx
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing["2xl"],
}}>
  <h2 style={typography.pageTitle}>Admin Panel</h2>
  <div style={{ display: "flex", gap: spacing.sm }}>
    {session && (
      <AdminButton variant="danger" size="small" onClick={handleLogout}>
        Logout
      </AdminButton>
    )}
    <AdminButton variant="secondary" size="small" onClick={onBack}>
      Back
    </AdminButton>
  </div>
</div>
```

### Login Form with Primitives
```jsx
<form onSubmit={handleLogin} style={{ maxWidth: 320, margin: "60px auto" }}>
  <h3 style={{ ...typography.sectionHeader, fontSize: 15, marginBottom: spacing.lg, textAlign: "center" }}>
    Admin Login
  </h3>
  <AdminInput label="Email" type="email" value={loginEmail}
    onChange={e => setLoginEmail(e.target.value)} required />
  <AdminInput label="Password" type="password" value={loginPass}
    onChange={e => setLoginPass(e.target.value)} required />
  {loginErr && <div style={{ color: colors.danger, fontSize: 11, marginTop: spacing.xs }}>{loginErr}</div>}
  <AdminButton type="submit" loading={loginLoading} style={{ marginTop: spacing.md, width: "100%" }}>
    Sign In
  </AdminButton>
</form>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded colors (`#FFEBEE`, `#E8F5E9`, `R`) | Token-based (`colors.successLight`, `colors.dangerLight`) | Phase 1 (this project) | Consistent, maintainable |
| `opacity: 0.5` for loading buttons | `AdminButton loading` prop with spinner | Phase 1 (this project) | Clear visual feedback (NAVF-04) |
| Plain text flash messages | Color-coded with icons | Phase 2 (this phase) | Clearer success/error distinction (NAVF-02) |
| Non-sticky tab bar | `position: sticky` tab bar | Phase 2 (this phase) | Always-visible navigation (NAVF-03) |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run build` (type-checks JSX via Vite) |
| Full suite command | `npm run build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAVF-02 | Flash messages color-coded with icons and animation | manual-only | Visual inspection in browser | N/A |
| NAVF-03 | Tab bar sticky at top when scrolling | manual-only | Visual inspection -- scroll in admin panel | N/A |
| NAVF-04 | Spinner next to submit button during async ops | manual-only | Visual inspection -- trigger save action | N/A |

**Manual-only justification:** All three requirements are visual/CSS behaviors (sticky positioning, color, animation, spinner visibility). No test runner is configured, and these are best verified by visual inspection in the browser. `npm run build` confirms no syntax/import errors.

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build` + manual visual check in dev server
- **Phase gate:** Build passes + all 3 requirements visually confirmed in browser

### Wave 0 Gaps
None -- no test framework to set up. Build verification via `npm run build` is sufficient for this visual-only phase.

## Open Questions

1. **S.root overflow property**
   - What we know: `position: sticky` fails if any ancestor has `overflow: hidden/auto`. `S.root` is the outermost container.
   - What's unclear: Whether `S.root` or any parent div sets overflow
   - Recommendation: Check `S.root` definition in constants.js during implementation. If it has overflow set, the sticky tab bar needs to be positioned relative to a different container.

2. **Flash fade-out timing for auto-dismiss**
   - What we know: Success messages auto-dismiss after 4 seconds. Need smooth exit animation.
   - What's unclear: Best approach -- React state delay (set "exiting" class 300ms before removing) vs CSS `animation-fill-mode`
   - Recommendation: Use a two-phase approach: at 3.7s set an "exiting" class, at 4s clear the message. This gives 300ms for the fade-out animation.

## Sources

### Primary (HIGH confidence)
- `src/components/Admin/AdminPanel.jsx` -- Current shell implementation, all 30+ flash() call sites, all loading button patterns
- `src/lib/adminStyles.js` -- Phase 1 design tokens (colors, spacing, typography, radii, shadows, adminCss)
- `src/components/Admin/adminUI.jsx` -- Phase 1 primitives (AdminButton with loading prop, AdminInput, AdminCard)
- `src/lib/constants.js` -- Global CSS rules with `!important` that affect admin (lines 134-138), `S.root` definition, `@keyframes spin`
- `.planning/phases/02-shell-and-feedback/02-CONTEXT.md` -- All locked decisions for this phase

### Secondary (MEDIUM confidence)
- `.planning/codebase/CONVENTIONS.md` -- Inline style conventions, hover pattern conventions, responsive breakpoints

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Using existing Phase 1 outputs, no new dependencies
- Architecture: HIGH -- Restyling existing patterns with well-understood React inline styles
- Pitfalls: HIGH -- Identified from direct code inspection (z-index, sticky overflow, global CSS conflicts)

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- no external dependencies changing)
