# Roadmap: Admin Panel UX Overhaul

## Milestones

- v1.0 Admin Panel UX Overhaul - Phases 1-3 (shipped 2026-03-16)
- v1.1 Admin Portfolio UX - Phases 4-5 (shipped 2026-03-17)
- v1.2 Site Texts Redesign - Phases 6-7 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Admin Panel UX Overhaul (Phases 1-3) - SHIPPED 2026-03-16</summary>

- [x] **Phase 1: Design System** - Create adminStyles.js tokens and adminUI.jsx primitives with typography, button, and input foundations (completed 2026-03-16)
- [x] **Phase 2: Shell and Feedback** - Restyle admin header, tab bar, flash messages, and loading indicators (completed 2026-03-16)
- [x] **Phase 3: Tab Content** - Apply card layouts, empty states, and styled forms across all 7 tabs (completed 2026-03-16)

### Phase 1: Design System
**Goal**: A complete design token system and reusable UI primitive components exist, ready for consumption by all admin views
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-05, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. An `adminStyles.js` file exists with named tokens for colors, spacing, typography, radii, and shadows
  2. Typography renders at the defined scale (18px page titles, 14px section headers, 13px body, 11px captions)
  3. Button primitives render three distinct visual variants: primary, secondary, danger
  4. Input primitives render at 40px height with visible borders, brand-color focus ring
**Plans:** 1/1 plans complete

Plans:
- [x] 01-01: Design tokens (adminStyles.js) and UI primitives (adminUI.jsx)

### Phase 2: Shell and Feedback
**Goal**: The admin panel outer frame looks professional and communicates state clearly
**Depends on**: Phase 1
**Requirements**: NAVF-02, NAVF-03, NAVF-04
**Success Criteria** (what must be TRUE):
  1. Tab bar stays visible (sticky) at the top when scrolling
  2. Flash messages are color-coded (green success, red error) with icons
  3. Submit buttons show a spinner during async operations
**Plans:** 1/1 plans complete

Plans:
- [x] 02-01: AdminFlash, sticky tab bar, token-based header/login, AdminButton replacements

### Phase 3: Tab Content
**Goal**: All 7 tabs use consistent card layouts, form styling, empty states, and item lists
**Depends on**: Phase 2
**Requirements**: DSGN-04, NAVF-01
**Success Criteria** (what must be TRUE):
  1. Every tab groups content into visually distinct cards
  2. Empty tabs show guidance text with call-to-action
  3. All 7 tabs use the same primitives -- no one-off inline styles
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01: AdminSelect + Categories/Portfolio/FAQs card wrapping and input migration
- [x] 03-02: FB Reviews/Google Reviews/Site Texts card wrapping + DragList/CarouselsTab token cleanup

</details>

<details>
<summary>v1.1 Admin Portfolio UX (Phases 4-5) - SHIPPED 2026-03-17</summary>

- [x] **Phase 4: Filter and Paginate** - Category/subcategory filtering with paginated results for navigating large portfolios (completed 2026-03-17)
- [x] **Phase 5: Quick Preview** - Inline media preview and item details without leaving the portfolio list (completed 2026-03-17)

### Phase 4: Filter and Paginate
**Goal**: Admin can efficiently navigate a large portfolio by narrowing items with filters and browsing page by page
**Depends on**: Phase 3
**Requirements**: FILT-01, FILT-02, FILT-03, PAGE-01, PAGE-02
**Success Criteria** (what must be TRUE):
  1. Admin can select a category from a dropdown and the portfolio list shows only items in that category
  2. When a category is selected, a subcategory dropdown appears and further narrows the list to items in that subcategory
  3. A count label shows how many items match the current filter vs total (e.g., "Showing 42 of 312")
  4. The item list shows a fixed page of 20-30 items with previous/next buttons and page numbers to navigate between pages
  5. Filters and pagination work together -- changing a filter resets to page 1 and paginates the filtered results
**Plans:** 1/1 plans complete

Plans:
- [x] 04-01: Category/subcategory filters, count label, pagination with page size selector

### Phase 5: Quick Preview
**Goal**: Admin can inspect any portfolio item's media and metadata without navigating away from the list
**Depends on**: Phase 4
**Requirements**: PREV-01, PREV-02
**Success Criteria** (what must be TRUE):
  1. Clicking a portfolio item opens an inline preview showing the full-size photo or video thumbnail
  2. The preview displays the item's title, category, subcategory, and media type (photo/YouTube/Facebook)
  3. The preview can be dismissed to return to the list without losing the current filter or page position
**Plans:** 1/1 plans complete

Plans:
- [x] 05-01: Inline preview toggle on portfolio item rows with image, title, category, and media type

</details>

### v1.2 Site Texts Redesign (In Progress)

**Milestone Goal:** Redesign the admin Site Texts tab into a comprehensive typography control center, organized by site section, covering all visible text areas.

- [ ] **Phase 6: Section Layout and Preservation** - Restructure Site Texts tab from flat list to section-based layout while preserving all existing editing features
- [ ] **Phase 7: Typography Controls** - Add font size and font family controls for every text area across all site sections

## Phase Details

### Phase 6: Section Layout and Preservation
**Goal**: The Site Texts tab is organized by site section with all existing editing features intact and a visual preview for each section
**Depends on**: Phase 5
**Requirements**: UXRD-01, UXRD-02, KEEP-01, KEEP-02, KEEP-03
**Success Criteria** (what must be TRUE):
  1. The Site Texts tab shows collapsible or visually distinct sections for Hero, About, Stats, Carousels, CTAs, Reviews, and Footer
  2. Each section displays a visual preview showing the text with its current styling applied
  3. Stats counter values (numbers) remain editable within the Stats section
  4. Hero image position sliders remain functional within the Hero section
  5. Existing text fields (hero title, hero subtitle, brand subtitle, bio, highlights title) remain editable within their respective sections
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Typography Controls
**Goal**: Admin can customize font size and font family for every visible text area on the site, with changes persisted and applied live
**Depends on**: Phase 6
**Requirements**: TYPO-01, TYPO-02, TYPO-03, TYPO-04, TYPO-05, TYPO-06, TYPO-07
**Success Criteria** (what must be TRUE):
  1. Each section (Hero, About, Carousels, CTAs, Stats, Footer, Reviews) has font size and font family controls for its text elements
  2. Changing a font size or font family value persists to site_config and survives page reload
  3. The live site renders text using the admin-configured font sizes and font families
  4. All 7 text areas (Hero, About, Carousels, CTAs, Stats, Footer, Reviews) have independent typography controls -- changing one does not affect others
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design System | v1.0 | 1/1 | Complete | 2026-03-16 |
| 2. Shell and Feedback | v1.0 | 1/1 | Complete | 2026-03-16 |
| 3. Tab Content | v1.0 | 2/2 | Complete | 2026-03-16 |
| 4. Filter and Paginate | v1.1 | 1/1 | Complete | 2026-03-17 |
| 5. Quick Preview | v1.1 | 1/1 | Complete | 2026-03-17 |
| 6. Section Layout and Preservation | v1.2 | 0/1 | Not started | - |
| 7. Typography Controls | v1.2 | 0/1 | Not started | - |
