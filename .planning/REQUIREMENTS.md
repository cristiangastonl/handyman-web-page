# Requirements: Admin Panel UX Overhaul

**Defined:** 2026-03-16
**Core Value:** Anibal can manage his website content confidently — every section is self-explanatory, visually clear, and pleasant to use.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Design Foundation

- [ ] **DSGN-01**: Admin panel uses a consistent typography scale — page titles (18px), section headers (14px), body text (13px), captions (11px)
- [ ] **DSGN-02**: Buttons have clear visual hierarchy — primary (filled orange), secondary (outlined/ghost), danger (red for destructive actions)
- [ ] **DSGN-03**: Form inputs have 40px height, clear borders, brand-color focus ring, and persistent labels above each field
- [ ] **DSGN-04**: Related content is grouped in cards with subtle borders/shadows (add form in one card, existing items list in another)
- [ ] **DSGN-05**: Design tokens live in a dedicated `adminStyles.js` file, separate from the public site's `constants.js`

### Navigation & Feedback

- [ ] **NAVF-01**: Empty states show guidance text with a clear call-to-action (e.g., "Add your first category") instead of faint gray text
- [ ] **NAVF-02**: Flash messages are color-coded — green with checkmark for success, red with X for errors — with smooth fade-out
- [ ] **NAVF-03**: Tab bar is sticky at the top of the admin panel when scrolling
- [ ] **NAVF-04**: Async operations show a spinner next to the submit button (not just opacity reduction)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Navigation Enhancements

- **NAVE-01**: Tab icons for quick visual recognition (grid, image, layers, star, question, gear)
- **NAVE-02**: Count badges on tabs showing item counts (e.g., "Portfolio (24)")

### Interaction Polish

- **INTR-01**: Image preview thumbnail before upload (URL.createObjectURL)
- **INTR-02**: Richer item previews in lists (larger thumbnails, type badges, more metadata)
- **INTR-03**: Improved "How it works" info boxes with collapsible behavior and distinct styling
- **INTR-04**: Form validation feedback (red borders on empty required fields with helper text)
- **INTR-05**: Keyboard shortcuts (Enter to submit forms, Escape to cancel edits)
- **INTR-06**: Smooth CSS transitions on tab switches and list item changes
- **INTR-07**: Spacing and whitespace improvements (20-24px padding, 32px between sections)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sidebar navigation | Overkill for 7 tabs, horizontal tabs are perfect for this count |
| Dark mode | Single user, desktop only, likely uses during business hours — zero value |
| Role-based access / permissions | Single user (Anibal), no other admins |
| Drag-and-drop file upload zones | Overkill — standard file inputs with better styling are sufficient |
| Undo/redo system | Complex state management for minimal value |
| Dashboard/analytics page | No metrics to show, Anibal manages content not analytics |
| Bulk operations | Single-user adding items one at a time |
| Custom modal dialogs | Replace window.confirm() is engineering effort with minimal UX gain |
| Search/filter across tabs | Content set is small enough for scrolling |
| Mobile responsive admin | User is desktop-only |
| New CRUD functionality | Focus is purely UX/visual |
| Backend/schema changes | Supabase stays as-is |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | TBD | Pending |
| DSGN-02 | TBD | Pending |
| DSGN-03 | TBD | Pending |
| DSGN-04 | TBD | Pending |
| DSGN-05 | TBD | Pending |
| NAVF-01 | TBD | Pending |
| NAVF-02 | TBD | Pending |
| NAVF-03 | TBD | Pending |
| NAVF-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9 ⚠️

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after initial definition*
