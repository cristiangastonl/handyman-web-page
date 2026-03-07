# Claude Code Prompt — Handyman Zurich Website Refactor

## Context

You are working on a **handyman services landing page** for a client named Anibal Rodriguez based in Zurich, Switzerland. The current website is a single React JSX component (`handyman-zurich.jsx`, ~638 lines) that runs as an artifact. It needs to be refactored into a proper React project with Supabase backend and admin panel.

**Live site:** handyman-web-page.vercel.app  
**Client contact:** +41 76 594 95 81 (WhatsApp: wa.me/41765949581)  
**Target audience:** Expat community in Zurich (primary), plus local Swiss residents  
**Social presence:**  
- Facebook: https://www.facebook.com/HandymanServicesinZurich (1,420 followers, 119 reviews, 100% recommended)  
- YouTube: https://www.youtube.com/@HandymanServicesinZurich (14 playlists, 414 videos, 368 subscribers)  

## Current State

The site is a monolithic JSX artifact with:
- Hero section with parallax photo collage
- Animated stat counters (20+ years, 200+ projects, 4.8/5 rating, <2h response)
- "Meet your handyman" bio section with service category tags
- "Recent work" photo carousel (5 real portfolio photos)
- "Videos" carousel with YouTube thumbnails
- Google Reviews carousel (4.8 stars, 12 reviews)
- FAQ accordion
- Footer with social links
- Sticky contact bar (phone + WhatsApp)
- Dancing Script font for branding
- Red (#C62828) as primary accent color

## What Needs to Be Built

### Phase 1 — Project Setup & Supabase

1. **Migrate from single JSX to a proper React project** (Vite + React Router or Next.js — your call, but keep it deployable on Vercel).

2. **Set up Supabase** with tables for:
   - `site_config` — key/value store for editable text (hero title, subtitle, section names, etc.)
   - `counters` — the stat counter values (years, projects, rating, response time)
   - `categories` — portfolio categories (name, thumbnail, order)
   - `subcategories` — subcategories under each category (name, parent_category_id, order)
   - `photos` — photos linked to subcategories (url, caption, subcategory_id)
   - `videos` — YouTube video links linked to subcategories (youtube_url, title, subcategory_id)
   - `highlights` — featured items for the Highlights carousel (title, image_url, description, order)
   - `facebook_reviews` — manually curated Facebook reviews (name, rating, text, date)

3. **Admin panel at `/admin`** — Extend the existing admin panel (which already has username/password auth) with CRUD interfaces. Sections to add:
   - Site Config: edit hero title, subtitle, section names
   - Counters: edit stat values
   - Categories & Subcategories: create/edit/delete/reorder
   - Photos & Videos: upload/add per subcategory
   - Highlights: manage highlight carousel items
   - Facebook Reviews: add/edit review entries

### Phase 2 — Frontend Features

4. **Sticky header** — Make the navbar sticky (`position: sticky; top: 0; z-index: 50`). Logo should always be visible. Compact slightly on scroll (reduce padding, shrink logo). The existing sticky contact bar should integrate below or merge into the header.

5. **Subtitle branding** — Add "Specialist Technician At Domestic Matters" as a subtitle wherever "Handyman Services in Zurich" appears (hero, header). Read from `site_config` in Supabase.

6. **Hero title from Supabase** — The main hero text ("Professional Handyman Services in Zurich") should be fetched from `site_config`. Default: current text.

7. **Portfolio section refactor** — Replace the current flat carousels with two category-based carousels:

   **📷 Photos carousel:** Shows category cards (Electricity, Plumbing, Lights, etc.) as a horizontal scroll. Each card has a thumbnail and label.  
   → Click a category → **Modal opens** showing subcategory cards  
   → Click a subcategory → Photo gallery view inside the modal  

   **🎬 Videos carousel:** Same categories, same drill-down, but shows YouTube videos at the leaf level.  

   Both carousels pull from the same `categories`/`subcategories` tables. The content differs (photos vs videos tables).  
   
   **UX:** Modal/overlay approach — user stays on the landing page, doesn't navigate away.

8. **Highlights carousel** — New carousel section between Recent Work and Reviews. Title defaults to "Highlights" but is editable from admin. Same card style as other carousels. Content managed from admin.

9. **Tailoring Work CTA card** — A visually distinct banner/card (NOT a carousel) placed between/after the carousel sections. Something like:
   > "Need something specific? I also do tailored work — from unique installations to custom projects."  
   > [Contact me →]
   
   Make it visually break the carousel pattern — different background, maybe an accent color block or subtle pattern.

10. **Category buttons deep link** — The service tags in "Meet your handyman" (Electricity, Plumbing, Assembly, etc.) should be clickable. Clicking one scrolls to the portfolio section and opens the modal for that category.

11. **Facebook Reviews** — Below the Google Reviews carousel, add a second carousel for Facebook reviews with the Facebook icon/branding. Data from `facebook_reviews` table (manually curated via admin).

12. **Service areas** — Update the FAQ or add a dedicated small section showing coverage: Zürich (primary), Saint Gallen, Zug, Basel, Aarau. A simple list with map pin icons is fine.

13. **Expat community messaging** — Add subtle expat-welcoming copy. In the bio or services section, something like "Proudly serving Zurich's international community." Don't make it exclusive — welcoming to all.

### Phase 3 — Future (Don't build yet, just plan for)

14. **Multi-language support** — Flag selector in header (EN, DE, IT, FR, ES). Will need i18n framework and translation files. For now, just leave a placeholder/comment in the header where flags will go.

15. **Business hours FAQ entry** — Leave a placeholder FAQ item for "What are your working hours?" Content TBD.

16. **Bio section content update** — The "Meet your handyman" text will be updated with content from a PDF the client is providing. For now, keep the existing text but make sure it reads from Supabase `site_config` so it's easy to update later.

## Tech Stack

- **Frontend:** React (Vite or Next.js), Tailwind CSS (already the aesthetic), deploy on Vercel
- **Backend:** Supabase (Postgres + Storage for images)
- **Styling:** Keep the current design language — red accents (#C62828), clean white backgrounds, Dancing Script for logo, parallax hero, smooth scroll animations, fade-in effects
- **Admin auth already exists** — `/admin` has single username/password login. Do NOT remove or replace it, build on top of the existing auth flow

## Design Principles

- Keep the current visual identity (the client likes how it looks)
- The site should feel premium but approachable
- Mobile-first — many expats will find this via WhatsApp/social on mobile
- Performance matters — lazy load images, optimize carousels
- Subtle animations (existing fade-ins, counters) should be preserved
- The "credibility" stats should feel confident but not boastful

## Default Data

Seed Supabase with content from `seed-data.md` which contains real data. Key defaults:
- **Hero title:** "Professional Handyman Services in Zurich"
- **Subtitle:** "Specialist Technician At Domestic Matters" (confirmed from Facebook page)
- **Counters:** 20.0+ years, 200+ projects, 4.8/5 rating, <2.0h response
- **Categories:** Based on real YouTube playlists — Electricity/Lights, Wall Mounting, Assembly, Painting, Plumbing, Baby/Kid Rooms, General Reparations
- **Videos:** Use real YouTube playlist IDs for embeds (see seed-data.md)
- **Facebook Reviews:** 5 real reviews with names and dates (see seed-data.md)
- **Highlights section title:** "Highlights"
- Keep all existing Google Reviews data
- Keep all existing portfolio photos assigned to appropriate categories

## File References

- **`handyman-zurich.jsx`** — Current monolithic component. Source of truth for styling, structure, and existing features. Preserve all while adding new ones.
- **`seed-data.md`** — Real content from YouTube (14 playlists with IDs and URLs) and Facebook (5 real reviews, page stats). Use this to seed Supabase with actual data.
- **`handyman-requirements.md`** — Full requirements document with 17 REQs for reference.

## Real YouTube Playlist IDs (for video portfolio embedding)

| Playlist | ID | Videos |
|----------|----|--------|
| IKEA LIGHTS | PLO8avQ6ndCk9B1qC4DTjggn9AlvwCtkLi | 46 |
| PHILIPS HUE LIGHTS | PLO8avQ6ndCk-s3w5hPWd3iPH44t503EA7 | 23 |
| IKEA Stuff (all) | PLO8avQ6ndCk8vyO4kGwdP_x8IThvFZ7wQ | 104 |
| Painting | PLO8avQ6ndCk9GKavzXZem8A3vRlUVYpmv | 5 |
| Plumbing | PLO8avQ6ndCk86X3zUKICgwQE5Ad8xawzJ | 4 |
| Baby/Kid Rooms | PLO8avQ6ndCk9DwgMGO7W8dyeYcq6oMSla | 24 |
| MIRRORS | PLO8avQ6ndCk9KMGyZJ5JdfZjw0vkRxSH- | 34 |
| SHELVES | PLO8avQ6ndCk-iPglKXcbpDfqbQHxgAdHs | 31 |
| FRAMES | PLO8avQ6ndCk9Bl5hBCYBwL71Rz5MwWpeS | 69 |
| GENERAL MONTAGES | PLO8avQ6ndCk-Rp3eYJXzFYZ626urhpasp | 81 |
| LIGHTS - LAMPS (all) | (see seed-data.md) | 176 |
| ASSEMBLY | (see seed-data.md) | 36 |

Use these real playlist IDs for YouTube embeds in the video portfolio drill-down.
