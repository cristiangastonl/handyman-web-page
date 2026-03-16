# Admin Panel UX Overhaul

## What This Is

A visual and UX redesign of the Handyman Zurich admin panel (`/admin`). The admin is used by a single person (Anibal, the business owner) on desktop to manage his website content — portfolio items, categories, carousels, reviews, FAQs, and site texts. The goal is to make it look professional, feel intuitive, and clearly communicate what each action does.

## Core Value

Anibal can manage his website content confidently — every section is self-explanatory, visually clear, and pleasant to use.

## Current Milestone: v1.1 Admin Portfolio UX

**Goal:** Make the admin Portfolio tab usable at scale (1000+ items) with filtering, pagination, and quick preview.

**Target features:**
- Filter portfolio items by category and subcategory
- Paginated item list instead of infinite scroll
- Quick preview of photos/videos without leaving the admin

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

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
- ✓ Professional design system (tokens + primitives) — v1.0
- ✓ Sticky tab bar, color-coded flash messages, spinner buttons — v1.0
- ✓ Card layouts, empty states, styled forms across all tabs — v1.0

### Active

<!-- v1.1 scope -->

- [ ] Portfolio tab: filter items by category
- [ ] Portfolio tab: filter items by subcategory (when category selected)
- [ ] Portfolio tab: paginated item list (not infinite scroll)
- [ ] Portfolio tab: quick preview of photo/video from the item list

### Out of Scope

- New functionality beyond portfolio filtering/preview — focus is portfolio UX
- Mobile responsiveness — Anibal uses desktop only
- Admin internationalization — stays in English
- Backend changes — Supabase schema stays as-is
- Public-facing portfolio changes — admin only
- Bulk operations (multi-select, bulk delete) — single user, one at a time

## Context

- Admin panel: `AdminPanel.jsx` (~870 lines) + `CarouselsTab.jsx` + `DragList.jsx` + `adminUI.jsx` + `adminStyles.js`
- All styling is inline React style objects (project convention)
- Design system from v1.0: tokens in `adminStyles.js`, primitives in `adminUI.jsx`
- Portfolio tab currently shows ALL items in a flat list with 52x36px thumbnails — unusable at scale
- 7 tabs: Categories, Portfolio, Carousels, FB Reviews, G Reviews, FAQs, Site Texts

## Constraints

- **Styling**: Inline styles only (project convention)
- **Stack**: React + Vite, no new dependencies
- **User**: Single desktop user (Anibal), not tech-savvy
- **Brand**: Keep `R = "#D4781F"` as accent color
- **Existing design system**: Use adminStyles.js tokens and adminUI.jsx primitives

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Inline styles only | Project convention, consistency with rest of codebase | ✓ Good |
| Desktop-first (no mobile) | Only user is on desktop | ✓ Good |
| English UI | User preference | ✓ Good |
| Design system (tokens + primitives) | Foundation-first approach from v1.0 | ✓ Good |

---
*Last updated: 2026-03-16 after milestone v1.1 started*
