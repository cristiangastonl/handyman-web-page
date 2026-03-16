# Phase 2: Shell and Feedback - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle the admin panel outer frame — header, tab navigation, flash messages, and loading indicators — using Phase 1's design tokens and primitives. The admin shell should look professional and clearly communicate state (active tab, success/error, loading). Tab content styling is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Tab bar styling
- Sticky at top with white background and subtle shadow when scrolled (NAVF-03)
- Active tab: thicker bottom border in brand color, using `colors.brand` from tokens
- Tab text: `typography.body` (13px, up from current 12px) with `spacing.lg` (16px) padding
- Hover effect via `adminCss` — subtle background highlight (`colors.gray100`)
- Keep horizontal scroll for overflow on narrow windows
- Use tokens for all colors/spacing — no magic numbers

### Flash message design
- Color-coded: green (`colors.success` + `colors.successLight` bg) with checkmark icon for success, red (`colors.danger` + `colors.dangerLight` bg) with X icon for errors (NAVF-02)
- Icons inline before message text, same line
- Sticky below tab bar, inline in content flow (current pattern, polished)
- Auto-dismiss: 4 seconds for success messages, errors persist until manually dismissed (click X to close)
- Smooth animation: slide-down entry + fade-out exit via CSS transition in `adminCss`
- Create an `AdminFlash` primitive in `adminUI.jsx` to encapsulate flash logic

### Loading/spinner integration
- Replace current `opacity: 0.5` disabled pattern with AdminButton's `loading` prop (NAVF-04)
- Per-action loading states (no global overlay) — keep existing per-button pattern
- AdminButton already has spinner — wire it into each form's submit handler via existing `loading` boolean states
- Login form should also use AdminButton with `loading={loginLoading}`

### Header/shell layout
- Apply tokens to existing header layout (title + Logout/Back buttons), keep same structure
- Title uses `typography.pageTitle` (18px, weight 700)
- Logout button: AdminButton with `variant="danger"` + `size="small"`
- Back button: AdminButton with `variant="secondary"` + `size="small"`
- Keep 620px max-width container
- Use `colors.gray50` or `colors.gray100` as admin page background (warmer than current)

### Claude's Discretion
- Exact shadow value for sticky tab bar
- Flash message slide-down animation timing/easing
- Whether flash component uses `position: fixed` toast or `position: sticky` inline (recommended: sticky inline)
- Login form restyling with admin tokens (apply same card/input/button primitives)
- Whether to extract a reusable AdminHeader component or keep inline

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system (Phase 1 output — consume these)
- `src/lib/adminStyles.js` — All design tokens (colors, spacing, typography, radii, shadows) and compound styles (A object). Import tokens from here.
- `src/components/Admin/adminUI.jsx` — Primitive components (AdminButton, AdminInput, AdminCard, AdminLabel, AdminStyles). Extend with AdminFlash in this phase.

### Admin components (modify these)
- `src/components/Admin/AdminPanel.jsx` — Main admin component (~870 lines). Contains header, tab bar, flash message, and all tab content. Phase 2 modifies the shell (lines ~340-390) and flash/loading patterns throughout.
- `src/components/Admin/CarouselsTab.jsx` — Separate tab component, may need flash/loading pattern updates.

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` — Inline styles only, hover via onMouseEnter/Leave, global css string for pseudo-elements, `!important` in CSS overrides.

### Prior phase context
- `.planning/phases/01-design-system/01-CONTEXT.md` — Phase 1 decisions on tokens, color palette, typography, buttons, inputs, cards.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdminButton` in `adminUI.jsx`: Already has `loading` prop with inline spinner animation — wire directly into submit handlers
- `AdminCard` in `adminUI.jsx`: Can wrap shell sections if needed
- `AdminStyles` in `adminUI.jsx`: Injects `adminCss` — extend with tab hover, flash animation CSS
- `adminCss` in `adminStyles.js`: Currently has focus/hover rules — add tab hover, flash animation keyframes here
- `colors.success`, `colors.danger`, `colors.successLight`, `colors.dangerLight` in `adminStyles.js`: Ready for flash message coloring

### Established Patterns
- Flash messages: `flash()` helper at line 105 sets `adminMsg` string with 4s timeout. Error detection via `msg.startsWith("Error")`. Extend to support type (success/error) explicitly.
- Tab bar: `TABS` array of `[key, label]` pairs rendered as buttons with inline styles. Currently uses `S` styles and `R` color — swap to admin tokens.
- Loading states: `loginLoading`, `translating`, `adminLoading` booleans exist — map to AdminButton `loading` prop.
- Hover via `onMouseEnter`/`onMouseLeave` for some elements, CSS classes (`.admin-tab`, `.admin-ghost`) for others — keep CSS class approach for tabs.

### Integration Points
- `adminCss` string in `adminStyles.js` — add new CSS rules for tab hover, flash animations
- `AdminStyles` component — already rendered once, injects all admin CSS
- `flash()` function — refactor to pass `{ msg, type }` instead of plain string, or create `AdminFlash` component that auto-detects type
- `S.root`, `S.ghost`, `S.btnPrimary`, `S.btnDanger` currently used in shell — replace with `A` tokens and `AdminButton`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-mode selected recommended defaults. Key principle from PROJECT.md: "Anibal can manage his website content confidently — every section is self-explanatory, visually clear, and pleasant to use." Flash messages and loading states should communicate clearly to a non-technical user.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-shell-and-feedback*
*Context gathered: 2026-03-16*
