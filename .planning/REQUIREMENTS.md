# Requirements: Admin Panel UX Overhaul

**Defined:** 2026-03-16
**Core Value:** Anibal can manage his website content confidently — every section is self-explanatory, visually clear, and pleasant to use.

## v1.0 Requirements (Complete)

### Design Foundation

- [x] **DSGN-01**: Admin panel uses a consistent typography scale
- [x] **DSGN-02**: Buttons have clear visual hierarchy (primary/secondary/danger)
- [x] **DSGN-03**: Form inputs have 40px height, clear borders, brand-color focus ring
- [x] **DSGN-04**: Related content is grouped in cards with subtle borders/shadows
- [x] **DSGN-05**: Design tokens live in a dedicated `adminStyles.js` file

### Navigation & Feedback

- [x] **NAVF-01**: Empty states show guidance text with clear call-to-action
- [x] **NAVF-02**: Flash messages are color-coded (green success, red error)
- [x] **NAVF-03**: Tab bar is sticky at the top
- [x] **NAVF-04**: Async operations show a spinner next to submit button

## v1.1 Requirements

Requirements for Admin Portfolio UX milestone. Each maps to roadmap phases.

### Portfolio Filtering

- [x] **FILT-01**: Admin can filter portfolio items by category via dropdown
- [x] **FILT-02**: Admin can filter portfolio items by subcategory (appears when category is selected)
- [x] **FILT-03**: Filter shows item count matching current selection (e.g., "Showing 42 of 312")

### Portfolio Pagination

- [x] **PAGE-01**: Portfolio item list displays a fixed number of items per page (e.g., 20-30)
- [x] **PAGE-02**: Admin can navigate between pages (previous/next + page numbers)

### Portfolio Preview

- [ ] **PREV-01**: Admin can click an item to see a larger preview (photo or video thumbnail) without leaving the tab
- [ ] **PREV-02**: Preview shows item details (title, category, subcategory, type)

## Future Requirements

Deferred to future release.

- **NAVE-01**: Tab icons for quick visual recognition
- **NAVE-02**: Count badges on tabs showing item counts
- **INTR-01**: Image preview thumbnail before upload
- **INTR-03**: Collapsible "How it works" info boxes
- **INTR-04**: Form validation feedback (red borders on empty required fields)
- **INTR-05**: Keyboard shortcuts (Enter to submit, Escape to cancel)
- **INTR-06**: Smooth CSS transitions on tab switches

## Out of Scope

| Feature | Reason |
|---------|--------|
| Public-facing portfolio changes | Admin only for this milestone |
| Bulk operations (multi-select, delete) | Single user, one at a time |
| Search/text filter | Category/subcategory filtering sufficient for now |
| Mobile responsive admin | Desktop only user |
| Backend/schema changes | Supabase stays as-is |
| Virtual scrolling / infinite scroll | Pagination is simpler and sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILT-01 | Phase 4 | Complete |
| FILT-02 | Phase 4 | Complete |
| FILT-03 | Phase 4 | Complete |
| PAGE-01 | Phase 4 | Complete |
| PAGE-02 | Phase 4 | Complete |
| PREV-01 | Phase 5 | Pending |
| PREV-02 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation*
