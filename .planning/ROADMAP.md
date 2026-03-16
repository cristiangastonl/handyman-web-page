# Roadmap: Admin Panel UX Overhaul

## Overview

Transform the functional-but-rough admin panel into a polished, self-explanatory content management experience. The work flows in three phases: first build the design system (tokens and reusable primitives), then restyle the admin shell (tabs, flash messages, loading states), then apply everything horizontally across all 7 tab content areas (cards, empty states, forms). Each phase builds on the previous -- tokens enable primitives, primitives enable consistent shell styling, shell styling establishes the patterns that tab content follows.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design System** - Create adminStyles.js tokens and ui.jsx primitives with typography, button, and input foundations (completed 2026-03-16)
- [ ] **Phase 2: Shell and Feedback** - Restyle admin header, tab bar, flash messages, and loading indicators
- [ ] **Phase 3: Tab Content** - Apply card layouts, empty states, and styled forms across all 7 tabs

## Phase Details

### Phase 1: Design System
**Goal**: A complete design token system and reusable UI primitive components exist, ready for consumption by all admin views
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-05, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. An `adminStyles.js` file exists with named tokens for colors, spacing, typography, radii, and shadows -- no magic numbers remain for admin styling
  2. Typography renders at the defined scale (18px page titles, 14px section headers, 13px body, 11px captions) when primitives are used
  3. Button primitives render three distinct visual variants: primary (filled orange), secondary (outlined/ghost), and danger (red)
  4. Input primitives render at 40px height with visible borders, brand-color focus ring, and persistent labels above the field
**Plans:** 1/1 plans complete

Plans:
- [ ] 01-01-PLAN.md -- Design tokens (adminStyles.js) and UI primitives (adminUI.jsx)

### Phase 2: Shell and Feedback
**Goal**: The admin panel outer frame (header, tab navigation, flash messages, loading states) looks professional and communicates state clearly
**Depends on**: Phase 1
**Requirements**: NAVF-02, NAVF-03, NAVF-04
**Success Criteria** (what must be TRUE):
  1. Tab bar stays visible (sticky) at the top when scrolling down within any tab's content
  2. Success flash messages appear green with a checkmark icon and error messages appear red with an X icon, both with smooth fade-out
  3. Clicking a submit button during an async operation shows a spinner adjacent to the button text (not just reduced opacity)
**Plans:** 1 plan

Plans:
- [ ] 02-01-PLAN.md -- AdminFlash component, sticky tab bar, token-based header/login, AdminButton replacements throughout

### Phase 3: Tab Content
**Goal**: All 7 tabs use consistent card layouts, form styling, empty states, and item lists -- the admin feels cohesive from tab to tab
**Depends on**: Phase 2
**Requirements**: DSGN-04, NAVF-01
**Success Criteria** (what must be TRUE):
  1. Every tab groups its "add new" form and its "existing items" list into visually distinct cards with subtle borders or shadows
  2. Every tab that can be empty shows guidance text with a specific call-to-action (e.g., "No categories yet. Add your first category above.") instead of blank space or faint gray text
  3. All 7 tabs use the same card, input, button, and typography primitives -- no tab has its own one-off inline styles for these elements
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System | 0/1 | Complete    | 2026-03-16 |
| 2. Shell and Feedback | 0/1 | Not started | - |
| 3. Tab Content | 0/0 | Not started | - |
