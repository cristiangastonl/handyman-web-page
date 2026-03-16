# Admin Panel UX Overhaul

## What This Is

A visual and UX redesign of the Handyman Zurich admin panel (`/admin`). The admin is used by a single person (Anibal, the business owner) on desktop to manage his website content — portfolio items, categories, carousels, reviews, FAQs, and site texts. The goal is to make it look professional, feel intuitive, and clearly communicate what each action does.

## Core Value

Anibal can manage his website content confidently — every section is self-explanatory, visually clear, and pleasant to use.

## Requirements

### Validated

<!-- Existing functionality that works and must be preserved -->

- ✓ Login/logout with Supabase auth — existing
- ✓ Category CRUD (add, delete, with header image) — existing
- ✓ Subcategory CRUD (add, delete, with header image + playlist ID) — existing
- ✓ Portfolio item CRUD (image/YouTube/Facebook, with category + subcategory) — existing
- ✓ FAQ CRUD with auto-translation to 5 languages — existing
- ✓ FAQ drag-to-reorder — existing
- ✓ Carousel curation (4 carousels, select items from portfolio) — existing
- ✓ Facebook reviews CRUD — existing
- ✓ Google reviews CRUD with star ratings — existing
- ✓ Site texts editor with font size/family + live preview — existing
- ✓ Hero image position control with sliders — existing
- ✓ Stats bar number editing — existing
- ✓ Flash messages for success/error feedback — existing

### Active

<!-- UX and visual improvements -->

- [ ] Professional, modern visual design for the entire admin panel
- [ ] Clear section labels and descriptions so every area is self-explanatory
- [ ] Better visual hierarchy — headings, spacing, grouping of related elements
- [ ] Improved form layouts — clearer inputs, better placeholder text, visual feedback
- [ ] Better tab navigation — icons or visual cues to help find things quickly
- [ ] Consistent button styles with clear primary/secondary/danger distinction
- [ ] Better item lists — clearer display of existing items with key info visible
- [ ] Improved empty states — helpful guidance when sections have no content yet
- [ ] Loading and disabled states that feel polished, not broken

### Out of Scope

- New functionality (search, bulk operations, edit existing reviews, etc.) — focus is purely UX/visual
- Mobile responsiveness — Anibal uses desktop only
- Admin internationalization — stays in English
- Refactoring into multiple component files — only if needed for the visual work
- Backend changes — Supabase schema stays as-is

## Context

- The admin is a single ~870-line React component (`AdminPanel.jsx`) plus `CarouselsTab.jsx` and `DragList.jsx`
- All styling is inline React style objects + a global `<style>` tag (project convention, no Tailwind/CSS modules)
- 7 tabs: Categories, Portfolio, Carousels, FB Reviews, G Reviews, FAQs, Site Texts
- Each tab has "How it works" info boxes already — these help but could be improved
- Brand color is `R = "#D4781F"` (orange), used throughout
- The current design is functional but looks like a developer prototype — small fonts, cramped spacing, minimal visual hierarchy

## Constraints

- **Styling**: Inline styles only (project convention — no CSS modules, Tailwind, or external stylesheets)
- **Stack**: React + Vite, no new dependencies for styling
- **Scope**: Visual/UX only — all CRUD logic stays identical
- **User**: Single desktop user (Anibal), not tech-savvy
- **Brand**: Keep `R = "#D4781F"` as accent color

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Inline styles only | Project convention, consistency with rest of codebase | — Pending |
| Desktop-first (no mobile) | Only user is on desktop | — Pending |
| English UI | User preference | — Pending |
| No new features | Keep scope focused on UX polish | — Pending |

---
*Last updated: 2026-03-16 after initialization*
