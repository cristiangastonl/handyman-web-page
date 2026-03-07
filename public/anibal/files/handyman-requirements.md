# Handyman Zurich - Website Requirements v2

**Client:** Anibal Rodriguez  
**Project:** Handyman Services Zurich - Landing Page  
**Date:** 2026-02-28  
**Source:** WhatsApp group chat  

---

## REQ-1: Restructure "Meet Your Handyman" Section

**Priority:** High  
**Status:** Pending content (PDF)

The client wants to consolidate the "Introducing Myself" content into the "Meet your handyman" section. He sent a PDF called `English.pdf` with the text to use.

**Action items:**
- Get the `English.pdf` content from the client
- Replace/expand the current "Meet your handyman" bio section with the PDF content
- Keep the personal, approachable tone

---

## REQ-2: Portfolio Redesign with Deep Navigation

**Priority:** High  
**Status:** Needs design + implementation

The client wants the portfolio completely restructured with category navigation. Currently it's a flat carousel — he wants a multi-level browsing experience.

**Structure requested:**
```
Portfolio
├── Category buttons (e.g., "Luces", "Pintura", etc.)
│   └── Click a category → opens subpage
│       ├── Photos
│       │   ├── Luces colgando
│       │   ├── Luces pasillo
│       │   └── etc.
│       └── Videos
│           └── (YouTube/playlist embeds)
```

**Details:**
- Main portfolio section shows category "buttons" (visual thumbnails with labels)
- Clicking a category opens a subpage/modal with two tabs: **Fotos** and **Videos**
- Photos are further subcategorized (e.g., type of lighting install)
- Videos section should link to his YouTube playlists
- Client sent reference photos of how the buttons should look (thumbnail grid style)
- Client sent a screenshot of his video playlists as content source

**Technical notes:**
- This implies React Router or in-page navigation (modal/overlay approach may be simpler for SPA)
- Need YouTube playlist integration
- Need more photos from client organized by category

---

## REQ-3: Reviews Section — No Changes

**Priority:** None  
**Status:** Done ✅

Client explicitly said to leave reviews as they are: *"Las de las reviews, yo la dejaria"*

---

## REQ-4: Credibility / Numbers Section

**Priority:** Medium  
**Status:** Pending content (2 PDFs)

The client wants a section that subtly showcases data and stats to build credibility. Not a braggy "look how big I am" vibe — more like "the numbers speak for themselves" to encourage deeper engagement.

**PDFs sent:**
- `LRVS1.pdf` — appears to be some kind of stats/support document
- `L I+C.pdf` — additional credibility data

**Client's vision:**
- Show the data where the current counter/numbers area is
- Tone: subtle confidence, not boastful
- Purpose: make visitors curious enough to keep scrolling and eventually contact him
- Quote: *"Sino mas 'epa, los numeros lo bancan...'"*

**Action items:**
- Get and read both PDFs to extract actual numbers/stats
- Design a refined stats/credibility section
- Could include: years in business, projects completed, coverage area, certifications, insurance info

---

## REQ-5: Add Business Hours to FAQs

**Priority:** Medium  
**Status:** Pending confirmation of exact hours

Client sent a screenshot showing his Google Business hours. Add this as a FAQ entry.

**Hours (from screenshot):**
- Need to extract exact hours from the screenshot
- Format as a clean FAQ: "What are your working hours?"
- Include note about emergency/weekend availability if applicable

---

## REQ-6: Expanded Service Areas

**Priority:** Medium  
**Status:** Ready to implement

Client wants to show he covers more areas beyond just Zürich. From the screenshot he sent:

**Service areas:**
- Zürich (primary)
- Saint Gallen
- Zug
- Basel
- Aarau

**Implementation:**
- Add a service area map or visual indicator
- Could be an interactive map or a simple list with icons
- Update "Services in Zürich" branding to reflect broader coverage (e.g., "Services in the Zürich Region & Beyond")

---

## REQ-7: Multi-Language Support with Flag Selector

**Priority:** High  
**Status:** Needs full implementation

Client wants a language selector with country flags. Languages in this specific order:

1. 🇬🇧 English (default)
2. 🇩🇪 German (Deutsch)
3. 🇮🇹 Italian (Italiano)
4. 🇫🇷 French (Français)
5. 🇪🇸 Spanish (Castellano)

**Implementation notes:**
- Flag icons in the header/navbar
- Clicking a flag switches all site content to that language
- Requires i18n framework (react-i18next or similar)
- All text content needs translation files for each language
- This is a significant feature — may need to be phased

---

## REQ-8: Expat Community Focus

**Priority:** Medium  
**Status:** Tone adjustment needed

Client's primary clientele is the expat community in Zurich and he wants this reflected in the website, but without alienating non-expat Swiss residents.

**Client's words:**
- *"Q por ahora es mi clientela principal y seguramente lo seguirá siendo"*
- *"Pero estaría bueno tmb algún desliz por ahí corte evitar 'Ahora volas tan alto q ignoras a los expats...' nunca!"*
- He shows "proud support" for the expat community

**Implementation:**
- Add subtle messaging that welcomes expats (e.g., "Proudly serving Zurich's international community")
- Multilingual support (REQ-7) already helps here
- Consider mentioning expat-friendly service in the bio or services section
- Don't make it exclusive — phrase it as inclusive of everyone

---

## REQ-9: Subtitle — "Specialist Technician At Domestic Matters"

**Priority:** High  
**Status:** Ready to implement

Wherever "Handyman Services in Zurich" appears, add the subtitle: **"Specialist Technician At Domestic Matters"**. This clarifies the type of handyman service. Should appear in the hero, navbar/header, and any branding areas.

---

## REQ-10: Admin-Editable Counters (Supabase)

**Priority:** Medium  
**Status:** Needs Supabase setup

The stat counters (20.0+ years, 200+ projects, 4.8/5 rating, <2.0h response) should be editable from `/admin`.

**Implementation:**
- Persist counter values in Supabase
- Default values = current hardcoded values
- Admin panel at `/admin` to update them
- Frontend reads from Supabase on load

---

## REQ-11: "Highlights" Carousel Section

**Priority:** Medium  
**Status:** Ready to implement

Add a new carousel section called **"Highlights"** alongside (or replacing) the "Recent Work" and "Videos" carousels.

**Details:**
- Default name: "Highlights" (editable from admin)
- Same carousel style as Recent Work / Videos
- Content TBD — could be best projects, featured work, etc.
- Section title should be stored in Supabase and editable from `/admin`

---

## REQ-12: Category Buttons → Portfolio Deep Link

**Priority:** High  
**Status:** Ready to implement

The service category buttons in the "Meet your handyman" section (Electricity, Plumbing, Assembly, etc.) should be clickable and navigate to the Portfolio page with that category pre-filtered.

**Implementation:**
- Click "Electricity" → navigates to `/portfolio?category=electricity` (or scrolls to portfolio section with filter applied)
- Each button acts as a direct link to filtered portfolio view
- Ties into REQ-2 (portfolio redesign with categories)

---

## REQ-13: Tailoring Work / Custom Jobs CTA

**Priority:** Medium  
**Status:** Ready to implement

The client offers custom/non-standard jobs beyond his usual services. Instead of adding yet another carousel, present this as a **CTA card** that breaks the visual pattern and stands out.

**Implementation:**
- A visually distinct card/banner between or after the carousel sections
- Copy along the lines of: "Need something specific? I also do tailored work"
- Button leads to a dedicated page, modal, or contact form with context
- Should feel like an invitation, not another portfolio item
- Could include a few example photos of past custom jobs

**Why not a carousel:**
- Already have Recent Work, Videos, Highlights — too many carousels stacked
- A CTA card breaks the visual rhythm and draws attention precisely by being different

---

## REQ-14: Portfolio as Category-Based Drill-Down Carousels

**Priority:** High  
**Status:** Needs design + Supabase + admin

Replace the current flat portfolio with **two main carousels**: Photos and Videos. Each carousel shows **category cards** (Luces, Pintura, Plomería, etc.). Clicking a category opens a **modal/overlay** with subcategories, and clicking a subcategory shows the actual content.

**Structure:**
```
📷 Photos Carousel → [Luces] [Pintura] [Plomería] [Assembly] ...
   Click "Luces" → Modal opens:
     [Colgantes] [Techo] [Pared] [Piso] ...
     Click "Colgantes" → Gallery of photos

🎬 Videos Carousel → [Luces] [Pintura] [Plomería] [Assembly] ...
   Click "Luces" → Modal opens:
     [Colgantes] [Techo] [Pared] [Piso] ...
     Click "Colgantes" → YouTube videos
```

**Admin panel:**
- CRUD categories and subcategories
- Upload photos / paste YouTube URLs per subcategory
- Same categories shared between Photos and Videos carousels
- All persisted in Supabase

**UX:** Modal overlay (not page navigation) so the user doesn't lose context on the landing page.

**Note:** This supersedes REQ-2 (original portfolio redesign). REQ-2 is now captured here with the agreed approach.

---

## REQ-15: Admin-Editable Hero Title (Supabase)

**Priority:** Medium  
**Status:** Ready to implement

The hero title (currently "Professional Handyman Services in Zurich") should be editable from `/admin`.

**Implementation:**
- Store in Supabase alongside counters (REQ-10)
- Default value: "Professional Handyman Services in Zurich"
- Editable from the same admin panel
- Could extend to subtitle and other static text blocks too

---

## REQ-16: Facebook Reviews Section

**Priority:** Medium  
**Status:** Needs Facebook data source

Add Facebook reviews **below the existing Google Reviews carousel**, within the same Reviews section.

**Implementation:**
- Same carousel style as Google Reviews but with Facebook branding/icon
- Could be manually curated (admin uploads review text + name) since Facebook API for reviews is limited
- Or scrape/screenshot approach if dynamic isn't feasible
- Both Google and Facebook carousels under one "Reviews" heading

---

## REQ-17: Sticky Header with Logo Always Visible

**Priority:** High  
**Status:** Ready to implement

The header/navbar should be **sticky** (fixed to top on scroll) so the logo is always visible. Currently there's a sticky contact bar but the header scrolls away.

**Implementation:**
- Make the main header `position: sticky; top: 0`
- Logo + nav links always visible
- May need to compact the header slightly on scroll (shrink logo, reduce padding) to not eat too much viewport space
- The existing sticky contact bar should sit below (or merge into) the sticky header

---

## Content Still Needed from Client

| Item | Format | For which REQ |
|------|--------|---------------|
| English.pdf (bio text) | PDF | REQ-1 |
| LRVS1.pdf (stats) | PDF | REQ-4 |
| L I+C.pdf (credibility data) | PDF | REQ-4 |
| Business hours confirmation | Screenshot/text | REQ-5 |
| Portfolio photos by category | Images | REQ-2 |
| YouTube playlist links | URLs | REQ-2 |
| Translations (DE, IT, FR, ES) | Text | REQ-7 |

---

---

## Data Extracted from Video Frames

### Facebook Page (Video 18:21)
The client has a Facebook page: **https://www.facebook.com/HandymanServicesinZurich**
- Profile shows "Handyman Services in Zurich"
- Has cover photo collage with work samples
- Description includes "Introducing myself in Switzerland" text in English and German
- Languages listed: English, Italian, Portuguese, and Spanish

### "Introducing Myself" Text (Video 18:24 mid-frame - Google Doc)
From his Facebook/Google Doc, the English bio reads:
- "Introducing myself in Switzerland"
- After more than 20 years building experience around the world, based in Zurich
- Offering: electrical work, assembly and shelving, furniture installation, painting, pictures/frames/mirror installation, home decor renovation
- "Always happy to assist both the local community and the expat community"
- "Fresh ideas that might save a lot of time or stress"
- Services at affordable prices with professional quality work
- "Excellent results, a flawless finish, and the peace of mind a guarantee everyone looks for"
- **Also has German (Deutsch) version below**

### Info & Contact Data (Video 18:24 mid-frame - Google Doc "L I+C")
**Facebook Page stats:**
- +1,400 Followers
- 10 Portfolios
- 100's Reels
- Over 100 Real Reviews
- +100,000 Views/Month
- URL: https://www.facebook.com/HandymanServicesinZurich

**YouTube Channel stats:**
- 14 Different Playlists
- 100's Posts
- Over 400 Video Shows
- +850,000 Views
- URL: https://www.youtube.com/@HandymanServicesinZurich

**WhatsApp Contact:**
- Response in less than 24hs
- wa.me/41765949581

### Current Live Site (Videos 18:54-19:02)
The site is deployed at: **handyman-web-page.vercel.app**

Current state visible in videos:
- Has a "Videos" section already (IKEA Stylish Light Unboxing, RANARP IKEA Pendant Lamp, IKEA SINNERLIG Light Installation)
- Portfolio categories visible: Electricity, Plumbing, Assembly, Thingy(?), Changes, Cleaning, Self Mounting
- Google Reviews section: 4.8 stars with Anna M., Thomas K., Sarah L.
- FAQ section with area coverage and scheduling info
- WhatsApp button in header

---

## Audio Transcriptions — PENDING

2 voice notes and 8 video narrations could not be transcribed due to environment limitations. The client should listen to these and provide text summaries:

| File | Duration | Content (from visual context) |
|------|----------|------------------------------|
| Ptt_18_25_38.ogg | 1:14 | Voice note — likely discussing initial website feedback |
| Ptt_18_57_39.ogg | 0:17 | Voice note — short comment, probably about a specific section |
| Video_18_21_11.mp4 | 1:56 | Screencast of Facebook page — showing existing online presence |
| Video_18_24_22.mp4 | 1:40 | Screencast of Google Docs with bio text and contact info |
| Video_18_54_01.mp4 | 1:20 | Screencast of current website — browsing through sections |
| Video_18_56_32.mp4 | 1:38 | Screencast of website — showing portfolio and videos sections |
| Video_18_57_20.mp4 | 0:19 | Quick screencast of a document |
| Video_18_58_48.mp4 | 0:52 | Screencast of website — showing reviews and FAQ |
| Video_19_02_16.mp4 | 2:20 | Longest screencast — full site walkthrough |

---

## Notes

- Client communicates mostly via voice notes and videos — text messages captured here are the source of truth for requirements
- Video frames provided significant additional context including exact URLs, stats, and bio text
- The site is already deployed on Vercel at handyman-web-page.vercel.app
- Client has strong YouTube presence (400+ videos, 14 playlists) which should be leveraged for portfolio
- The website is currently a single React component (JSX) — migration to proper project structure is planned
