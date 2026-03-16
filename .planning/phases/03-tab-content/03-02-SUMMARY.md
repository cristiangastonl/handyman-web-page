---
phase: 03-tab-content
plan: 02
subsystem: ui
tags: [react, design-tokens, admin-panel, components]

requires:
  - phase: 03-tab-content/01
    provides: AdminSelect primitive, two-card pattern established for Categories/Portfolio/FAQs
  - phase: 01-design-system
    provides: Design tokens (colors, spacing, radii) and compound styles (A object)
  - phase: 02-shell-and-feedback
    provides: AdminCard, AdminInput, AdminTextarea, AdminButton, AdminFlash primitives
provides:
  - All 7 admin tabs using consistent AdminCard wrapping
  - All form inputs migrated to AdminInput/AdminTextarea/AdminSelect primitives
  - DragList fully tokenized with design tokens
  - CarouselsTab filter select using A.input base
affects: []

tech-stack:
  added: []
  patterns:
    - "AdminCard wrapping for all section groupings across admin tabs"
    - "A.input as base style for compact selects with size overrides"

key-files:
  created: []
  modified:
    - src/components/Admin/AdminPanel.jsx
    - src/components/Admin/DragList.jsx
    - src/components/Admin/CarouselsTab.jsx

key-decisions:
  - "FB Reviews and Google Reviews tabs were already migrated from Plan 01 -- only Site Texts tab needed changes"
  - "Sub-component internal inputs (StatRow, ConfigRow, SiteTextRow, HeroPositionControl) kept raw per plan guidance"
  - "CarouselsTab filter select uses A.input base with width/height/padding overrides for compact sizing"

patterns-established:
  - "All admin tabs now follow two-card pattern: form card + list card"
  - "DragList uses design tokens exclusively -- no hardcoded colors or magic numbers"

requirements-completed: [DSGN-04, NAVF-01]

duration: 3min
completed: 2026-03-16
---

# Phase 3 Plan 2: Remaining Tab Content Migration Summary

**Site Texts tab migrated to AdminCard pattern with input primitives, DragList fully tokenized with design tokens, CarouselsTab filter select normalized**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T19:46:59Z
- **Completed:** 2026-03-16T19:49:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Site Texts tab sections wrapped in AdminCard (Hero Image Position, Stats Bar, Add Custom Setting)
- Raw cfgKey/cfgVal inputs replaced with AdminInput primitives
- DragList hardcoded values replaced with design tokens (colors, spacing, radii)
- CarouselsTab filter select uses A.input as base style
- All 7 admin tabs now use consistent AdminCard wrapping and input primitives

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate FB Reviews, Google Reviews, and Site Texts tabs** - `c11170c` (feat)
2. **Task 2: Token cleanup in DragList.jsx and CarouselsTab.jsx** - `e86b523` (feat)

## Files Created/Modified
- `src/components/Admin/AdminPanel.jsx` - Fixed AdminCard closing tag for Hero Position, wrapped Stats Bar in AdminCard, replaced Add Custom Setting raw form with AdminCard + AdminInput
- `src/components/Admin/DragList.jsx` - Imported design tokens, replaced gap/padding/border/radius/color hardcoded values with token references
- `src/components/Admin/CarouselsTab.jsx` - Filter select uses A.input as base style with compact overrides

## Decisions Made
- FB Reviews and Google Reviews tabs were already in target state (migrated in Plan 01 scope) -- no changes needed
- Hero Image Position had a bug: AdminCard opening tag but </div> closing -- fixed to </AdminCard>

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed mismatched AdminCard closing tag**
- **Found during:** Task 1 (Site Texts tab migration)
- **Issue:** Hero Image Position section had `<AdminCard>` opening but `</div>` closing tag
- **Fix:** Changed `</div>` to `</AdminCard>`
- **Files modified:** src/components/Admin/AdminPanel.jsx
- **Verification:** npm run build passes
- **Committed in:** c11170c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was necessary for correct JSX. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All admin tabs fully migrated -- design system migration complete
- No further phases planned

---
*Phase: 03-tab-content*
*Completed: 2026-03-16*
