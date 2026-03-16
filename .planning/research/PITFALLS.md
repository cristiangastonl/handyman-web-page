# Domain Pitfalls

**Domain:** Admin panel UX redesign (visual-only overhaul of existing React CRUD panel)
**Researched:** 2026-03-16

## Critical Pitfalls

Mistakes that cause rework, broken workflows, or regression in usability.

### Pitfall 1: Breaking Muscle Memory by Moving Things Around

**What goes wrong:** The redesign relocates tabs, reorders form fields, moves buttons to different positions, or renames sections. Anibal (the sole user) has built unconscious habits around where things are -- even if the current layout is ugly, he knows it. After the redesign he cannot find the "Add Item" button or expects the tab order to be different.

**Why it happens:** Designers conflate "better visual hierarchy" with "better information architecture." The PROJECT.md explicitly scopes this as visual/UX only, but it is easy to rationalize that reordering tabs or grouping fields differently "is just UX." The line between "visual polish" and "workflow restructuring" is blurry.

**Consequences:** Single user gets confused and frustrated. Since there is no documentation or onboarding flow, confusion leads to support requests (to the developer). Worst case: Anibal avoids using certain features because he cannot find them.

**Prevention:**
- Keep the 7 tabs in their current order: Categories, Portfolio, Carousels, FB Reviews, G Reviews, FAQs, Site Texts
- Keep form field order within each tab identical
- Keep button positions (submit at bottom, delete inline) unchanged
- Keep "How it works" info boxes in the same relative position (top of each tab)
- Rule of thumb: if a change would make a screenshot look structurally different (not just prettier), it is out of scope

**Detection:** Before any implementation, compare the wireframe/mockup against the current layout. If any interactive element has moved to a different position relative to its neighbors, flag it.

**Phase relevance:** Must be enforced from the very first phase. Every phase should include a "layout preservation check."

---

### Pitfall 2: Inline Style Object Explosion

**What goes wrong:** The current admin panel already has dense inline styles (look at the tab buttons: `style={{ padding: "6px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, ... }}`). A visual redesign that improves spacing, colors, shadows, typography, and hover states will roughly double the style object verbosity. The file grows from ~870 lines to 1200+ lines, and every small design tweak requires hunting through deeply nested JSX to find the right style object.

**Why it happens:** Project convention mandates inline styles only (no Tailwind, no CSS modules, no styled-components). This is fine for small components but painful for a comprehensive visual overhaul. The temptation is to either (a) break convention by sneaking in CSS classes, or (b) scatter style objects throughout the JSX making the code unmaintainable.

**Consequences:** Inconsistent styling across tabs (one tab gets the new card style, another uses slightly different padding). Future maintenance becomes a game of "find the right style object in 1200 lines of JSX." Design drift over time as each edit introduces small inconsistencies.

**Prevention:**
- Extract a design token / style constants object at the top of AdminPanel.jsx (or in constants.js alongside existing `S`). Name them semantically: `adminStyles.card`, `adminStyles.sectionTitle`, `adminStyles.formGroup`, `adminStyles.inputLabel`, etc.
- Every visual element should reference these constants, never use raw `{ padding: 16, ... }` inline
- The existing `S` object in constants.js already does this partially -- extend it with admin-specific tokens
- Keep the global `<style>` tag for hover/focus states that cannot be done inline (already the pattern)

**Detection:** If any inline style object in the JSX has more than 3-4 properties that are NOT from a named constant, it is a smell.

**Phase relevance:** Must be set up in phase 1 (design system/tokens) before any visual work begins. Retrofitting tokens after visual work is painful.

---

### Pitfall 3: Global Loading State Blocking All Interactions

**What goes wrong:** The current admin uses a single `adminLoading` boolean that disables ALL buttons across the entire panel when any async operation runs. During a redesign, this becomes more visible because the polished UI makes the "everything is disabled" state feel more broken. The redesign might make this worse by adding spinners or skeleton states that are overly aggressive.

**Why it happens:** The single `adminLoading` state was a quick implementation choice. Since the scope is "visual/UX only, no new functionality," there is pressure to NOT fix the underlying state management. But visual polish on top of broken interaction patterns highlights the broken patterns.

**Consequences:** User clicks "Add FAQ" (which triggers translation, taking 3-5 seconds), and during that time cannot even scroll or interact with any other UI element. The polished UI with better loading indicators actually makes this MORE frustrating because it draws attention to the blocked state.

**Prevention:**
- Accept this as a known limitation and do NOT try to fix it (scope is visual only)
- Design loading states that are subtle rather than attention-grabbing -- a small spinner next to the specific button, not a full-panel overlay
- Ensure the disabled opacity is consistent (currently some buttons use 0.5, which is correct) but do not add new blocking indicators like overlays or progress bars
- Document this as a future improvement, not a redesign task

**Detection:** If any phase plan includes "improve loading states" in a way that touches async logic or state management, it is scope creep.

**Phase relevance:** Loading state visual treatment should be part of the button/form styling phase, but kept minimal.

---

### Pitfall 4: Forgetting the Injected Global `<style>` Tag Interactions

**What goes wrong:** The admin panel relies on CSS classes injected via a `<style>` tag in constants.js (`.admin-ghost:hover`, `.admin-btn:hover`, `.admin-tab` styles, mobile overrides for `font-size: 16px !important`). A visual redesign that changes padding, colors, or sizing via inline styles can conflict with these global rules, especially the `!important` declarations. The result: styles that look correct in the style object but render differently due to CSS specificity battles.

**Why it happens:** Inline styles have higher specificity than CSS classes for most properties, but `!important` in the `<style>` tag overrides inline styles. The mobile override `font-size: 16px !important` will override any inline fontSize on inputs/textareas/selects inside `.admin-container`. Developers working on inline styles forget about the global CSS entirely.

**Consequences:** Mysterious styling bugs where inputs refuse to change font size, hover states conflict with inline background colors, or mobile renders look completely different from desktop (even though the admin is desktop-only, the CSS still applies on smaller viewports during development).

**Prevention:**
- Audit the existing `<style>` tag contents in constants.js BEFORE starting visual work
- Document which classes exist and what they do: `admin-ghost` (hover bg), `admin-btn` (hover transform/shadow), `admin-tab` (transition), `.admin-container input` (mobile font override)
- Any new hover/focus/active states must go in the `<style>` tag, not attempted via onMouseEnter/onMouseLeave state hacks
- Test at multiple viewport widths during development, even though the admin is desktop-only

**Detection:** Any styling that "works in the style object but looks wrong in the browser" is likely a specificity conflict with the global CSS.

**Phase relevance:** Must be addressed in phase 1 alongside the design tokens setup. The global CSS audit should happen before any visual changes.

---

## Moderate Pitfalls

### Pitfall 5: Over-Designing for One User

**What goes wrong:** The redesign adds elaborate animations, complex card layouts, sophisticated color schemes, or dashboard-like widgets. This adds implementation time and visual complexity for a single user who needs to quickly add a portfolio item and move on.

**Prevention:**
- Every design decision should pass the "does Anibal need this?" test
- Prefer whitespace and typography improvements over decorative elements
- No animations longer than 200ms, no complex transitions, no skeleton loading screens
- The "How it works" boxes are already the right complexity level -- improve their styling, do not replace them with interactive tutorials or modals

**Phase relevance:** All phases. Each visual improvement should be evaluated against the single-user context.

---

### Pitfall 6: Inconsistent Treatment Across Tabs

**What goes wrong:** The redesign starts with the Categories tab, polishes it beautifully, then runs out of steam or changes direction by the time it reaches Site Texts. The result is a panel where each tab looks like it was designed by a different person.

**Prevention:**
- Design the token system first, then apply it across ALL tabs before refining any individual tab
- Work horizontally (all tabs at one level of polish) rather than vertically (one tab fully polished)
- The 7 tabs share common patterns: info box at top, label + count, item list, add form at bottom. Style these patterns once, apply everywhere.
- Specific shared patterns to style consistently:
  - "How it works" info boxes (all tabs)
  - Section labels with counts (all tabs)
  - Add forms with submit buttons (all tabs)
  - Item lists with delete buttons (Categories, Portfolio, Reviews)
  - Empty state messages (all tabs)

**Detection:** After each phase, visually compare all 7 tabs side by side. If any two tabs use different spacing, font sizes, or card styles for equivalent elements, there is drift.

**Phase relevance:** The phase structure should enforce horizontal passes -- e.g., "Phase 1: tokens + typography across all tabs" rather than "Phase 1: redesign Categories tab."

---

### Pitfall 7: Flash Messages Getting Lost or Becoming Intrusive

**What goes wrong:** The current flash message system is a sticky div with a 4-second timeout. A redesign might make it more prominent (toast-style with animations) which becomes annoying when performing rapid CRUD operations, or less prominent (subtle color change) which causes the user to miss success confirmations.

**Prevention:**
- Keep the current positioning (sticky top) and timing (4 seconds) -- they work
- Improve the visual design (better colors, subtle border, maybe a checkmark icon) without changing behavior
- Do NOT add slide-in/slide-out animations that stack or overlap during rapid operations
- Do NOT move it to a corner (bottom-right toast pattern) -- Anibal is used to looking at the top

**Phase relevance:** Flash message styling should be part of the global component styling phase, not a standalone item.

---

### Pitfall 8: Confirmation Dialogs Staying as `window.confirm()`

**What goes wrong:** The current admin uses `window.confirm()` for all delete operations. During a visual redesign, the native browser dialog looks jarring against a polished UI. The temptation is to replace it with a custom modal component. This is scope creep -- it requires new state management, a modal component, overlay logic, focus trapping, and keyboard handling.

**Prevention:**
- Keep `window.confirm()` for now -- it is functional and accessible
- Do NOT introduce a custom modal system as part of the visual redesign
- If the contrast is truly jarring, note it as a future enhancement, not a redesign item
- The only exception would be if a modal component already existed in the codebase (it does not)

**Detection:** If any phase plan mentions "custom confirmation dialog" or "modal component," it is scope creep.

**Phase relevance:** Explicitly out of scope for all phases. Flag in documentation.

---

## Minor Pitfalls

### Pitfall 9: File Input Styling Inconsistency

**What goes wrong:** Native `<input type="file">` elements cannot be fully styled with inline styles. They look different across browsers and resist most CSS customization. A polished redesign with beautiful text inputs and selects makes the unstyled file inputs look broken by comparison.

**Prevention:**
- Accept that file inputs will look slightly different -- this is a known browser limitation
- Wrap file inputs in a styled label with `display: none` on the input and a custom button as the label content (this is a CSS-only technique, no new logic)
- Or simply improve the surrounding container styling and leave the file input native -- consistency with the OS is not necessarily bad for a single-user admin

**Phase relevance:** Address during form input styling phase. Low priority -- functional is more important than pretty for file inputs.

---

### Pitfall 10: Hover States on Touch Devices During Development

**What goes wrong:** The global CSS includes hover states (`.admin-ghost:hover`, `.admin-btn:hover`). While the admin is desktop-only, developers testing on touchscreens or in responsive mode may see sticky hover states that make elements look "stuck" in a highlighted state.

**Prevention:**
- Use `@media (hover: hover)` wrapper for hover styles in the global CSS
- Or simply document that the admin is desktop-only and hover-state bugs on touch are not worth fixing
- Do NOT add JavaScript-based hover state tracking (onMouseEnter/onMouseLeave) to work around this

**Phase relevance:** Minor concern. Only address if it causes confusion during development.

---

### Pitfall 11: CarouselsTab.jsx Being Treated Differently

**What goes wrong:** CarouselsTab is a separate component file (not inline in AdminPanel.jsx). During the redesign, it might get forgotten or styled inconsistently because it is in a different file. Alternatively, the redesigner might try to extract more tabs into separate files "while they're at it," which is scope creep per PROJECT.md ("Refactoring into multiple component files -- only if needed for the visual work").

**Prevention:**
- Include CarouselsTab.jsx explicitly in every phase checklist
- Use the same token constants from the shared style system
- Do NOT extract other tabs into separate files unless a single file genuinely exceeds maintainability limits (the current 870 lines is large but manageable)

**Phase relevance:** Every phase should explicitly mention "apply to CarouselsTab.jsx and DragList.jsx too."

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Design tokens / style system setup | Over-engineering the token system with too many abstraction levels | Keep it flat: `adminStyles.card`, `adminStyles.input`, etc. No nesting, no theme objects, no runtime computation |
| Typography and spacing | Changing font sizes breaks the compact layout that fits content without scrolling | Test each tab's content at realistic data volumes (10+ categories, 20+ work items, 15+ reviews) to ensure nothing overflows |
| Form input styling | Native file inputs resist styling, causing visual inconsistency | Accept native file inputs or use the label-wrapping technique, do not add JS workarounds |
| Button system (primary/secondary/danger) | Adding too many button variants creates decision fatigue | Three variants maximum: primary (add/save), ghost (cancel/back), danger (delete/remove). Current codebase already has this |
| Item list styling | Adding card-style wrappers to list items increases vertical space, pushing content below the fold | Test with realistic item counts. A category list with 8 items should not require scrolling |
| Tab navigation styling | Adding icons or changing tab labels breaks recognition | Keep text-only tabs with the exact same labels. Icons are optional decoration, not replacements for text |
| Empty states | Over-designing empty states (illustrations, CTAs) for a single user who will see them once | Keep them text-only with a helpful hint, matching the current pattern |
| Site Texts tab (most complex) | The nested font/size/preview controls are already dense; adding more visual structure could break the layout | This tab needs the most careful testing. Preview rendering must still work with the new styles |

## Sources

- [XB Software: How to Redesign a Legacy UI Without Losing Users](https://xbsoftware.com/blog/legacy-app-ui-redesign-mistakes/) -- MEDIUM confidence, well-documented case study
- [Eleken: Legacy App Redesign](https://www.eleken.co/blog-posts/legacy-app-uiux-design-services) -- MEDIUM confidence
- [Budibase: Admin UI Design Tips](https://budibase.com/blog/app-building/admin-ui/) -- MEDIUM confidence
- [Medium: How Many Lines Until Refactor](https://medium.com/geekculture/how-many-lines-of-code-until-i-need-to-refactor-a-react-component-c1b8d16f5a5b) -- LOW confidence, general guidance
- [Vocal Media: How to Redesign a UI Without Losing Usability](https://vocal.media/futurism/how-to-redesign-a-ui-without-losing-usability) -- MEDIUM confidence
- Direct codebase analysis of AdminPanel.jsx (~870 lines), CarouselsTab.jsx, DragList.jsx, and constants.js -- HIGH confidence
