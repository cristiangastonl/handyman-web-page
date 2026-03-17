# Requirements: Admin Panel UX Overhaul

**Defined:** 2026-03-16
**Core Value:** Anibal can manage his website content confidently -- every section is self-explanatory, visually clear, and pleasant to use.

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

## v1.1 Requirements (Complete)

### Portfolio Filtering

- [x] **FILT-01**: Admin can filter portfolio items by category via dropdown
- [x] **FILT-02**: Admin can filter portfolio items by subcategory
- [x] **FILT-03**: Filter shows item count matching current selection

### Portfolio Pagination

- [x] **PAGE-01**: Portfolio item list displays a fixed number of items per page
- [x] **PAGE-02**: Admin can navigate between pages (previous/next + page numbers)

### Portfolio Preview

- [x] **PREV-01**: Admin can click an item to see a larger preview without leaving the tab
- [x] **PREV-02**: Preview shows item details (title, category, subcategory, type)

## v1.2 Requirements

Requirements for Site Texts Redesign milestone.

### Typography Controls

- [ ] **TYPO-01**: Admin can control font size and font family for Hero section texts (title, subtitle, brand subtitle)
- [ ] **TYPO-02**: Admin can control font size and font family for About section texts (bio, highlight boxes, expat note)
- [ ] **TYPO-03**: Admin can control font size and font family for carousel section titles (Recent Work, Highlights, Returning Customers, Custom Projects)
- [ ] **TYPO-04**: Admin can control font size and font family for CTA section texts (tailoring CTA, bottom CTA)
- [ ] **TYPO-05**: Admin can control font size and font family for Stats bar labels
- [ ] **TYPO-06**: Admin can control font size and font family for Footer texts
- [ ] **TYPO-07**: Admin can control font size and font family for Reviews section title

### Existing Features (preserve)

- [x] **KEEP-01**: Stats counters remain editable (values)
- [x] **KEEP-02**: Hero image position control remains functional
- [x] **KEEP-03**: Existing text editing (hero titles, bio, highlights title) remains functional

### UX Redesign

- [x] **UXRD-01**: Site Texts tab organized by site sections (Hero, About, Stats, Carousels, CTAs, Reviews, Footer) instead of flat list
- [x] **UXRD-02**: Each section shows a visual preview of the text with current styling applied

## Future Requirements

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
| Text content editing for i18n texts | Language system handles content, admin controls styling only |
| Multi-language site_config | Too complex, single-language sufficient for brand texts |
| New Supabase tables | Use existing site_config key-value store |
| Mobile responsive admin | Desktop only user |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 3 | Complete |
| DSGN-05 | Phase 1 | Complete |
| NAVF-01 | Phase 3 | Complete |
| NAVF-02 | Phase 2 | Complete |
| NAVF-03 | Phase 2 | Complete |
| NAVF-04 | Phase 2 | Complete |
| FILT-01 | Phase 4 | Complete |
| FILT-02 | Phase 4 | Complete |
| FILT-03 | Phase 4 | Complete |
| PAGE-01 | Phase 4 | Complete |
| PAGE-02 | Phase 4 | Complete |
| PREV-01 | Phase 5 | Complete |
| PREV-02 | Phase 5 | Complete |
| TYPO-01 | Phase 7 | Pending |
| TYPO-02 | Phase 7 | Pending |
| TYPO-03 | Phase 7 | Pending |
| TYPO-04 | Phase 7 | Pending |
| TYPO-05 | Phase 7 | Pending |
| TYPO-06 | Phase 7 | Pending |
| TYPO-07 | Phase 7 | Pending |
| KEEP-01 | Phase 6 | Complete |
| KEEP-02 | Phase 6 | Complete |
| KEEP-03 | Phase 6 | Complete |
| UXRD-01 | Phase 6 | Complete |
| UXRD-02 | Phase 6 | Complete |

**Coverage:**
- v1.2 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after v1.2 roadmap creation*
