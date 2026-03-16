# Structure

## Directory Layout

```
handyman-web-page/
├── .claude/                    # Claude Code project config
├── .planning/
│   └── codebase/               # Architecture documentation (this directory)
├── .vercel/                    # Vercel deployment config (gitignored)
├── dist/                       # Production build output (gitignored)
├── node_modules/               # Dependencies (gitignored)
├── public/                     # Static assets served at root
│   ├── anibal/                 # Client photos, logos, hero image
│   ├── brands/                 # Brand logo images for BrandStrip marquee
│   ├── images/                 # OG image, misc images
│   ├── favicon.png
│   ├── favicon.svg
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── prerender.mjs           # Puppeteer pre-rendering script (4 routes)
├── src/
│   ├── components/             # React components (21 files)
│   │   ├── Admin/              # Admin panel components (3 files)
│   │   │   ├── AdminPanel.jsx  # Main admin panel (870 lines, largest file)
│   │   │   ├── CarouselsTab.jsx # Carousel curation UI (193 lines)
│   │   │   └── DragList.jsx    # Drag-to-reorder list (201 lines)
│   │   ├── About.jsx           # About section with bio and skill tags
│   │   ├── BrandStrip.jsx      # Auto-scrolling brand logo marquee
│   │   ├── Carousel.jsx        # Generic infinite auto-play carousel
│   │   ├── CTA.jsx             # Call-to-action sections (3 exports)
│   │   ├── FAQ.jsx             # FAQ home section + full page (104 lines)
│   │   ├── FadeIn.jsx          # FadeIn + AnimatedCounter components
│   │   ├── Footer.jsx          # Site footer with contact and social links
│   │   ├── Hero.jsx            # Hero banner with parallax and admin image positioning
│   │   ├── Highlights.jsx      # Highlights carousel section
│   │   ├── Lightbox.jsx        # Modal media viewer (images, YouTube, Facebook)
│   │   ├── Nav.jsx             # Top navigation (desktop + mobile)
│   │   ├── Portfolio.jsx       # Full portfolio page with category drill-down
│   │   ├── RecentWork.jsx      # Recent work carousel section
│   │   ├── ReturningCustomers.jsx # Returning customers carousel section
│   │   ├── Reviews.jsx         # Reviews home carousel + full reviews page
│   │   ├── ServiceAreas.jsx    # Service areas with map pin icons
│   │   ├── ShareButton.jsx     # Web Share API / clipboard fallback
│   │   ├── StatsBar.jsx        # Animated stats counter bar
│   │   ├── StickyBar.jsx       # Sticky CTA bar (appears on scroll, desktop only)
│   │   ├── TailorJobs.jsx      # Custom projects carousel section
│   │   ├── WhatsAppFAB.jsx     # Floating WhatsApp button (bottom-right)
│   │   └── ui.jsx              # Shared UI primitives (Stars, Socials, Logo, etc.)
│   ├── hooks/
│   │   ├── useFadeIn.js        # IntersectionObserver visibility hook
│   │   └── useScrollY.js       # Throttled scroll position hook
│   ├── lib/
│   │   ├── constants.js        # Brand config, defaults, styles, helpers (200 lines)
│   │   ├── supabase.js         # Supabase client + all CRUD functions (242 lines)
│   │   └── translate.js        # Google Translate API integration
│   ├── locales/
│   │   ├── en.json             # English translations (113 keys)
│   │   ├── de.json             # German translations
│   │   ├── es.json             # Spanish translations
│   │   ├── fr.json             # French translations
│   │   └── it.json             # Italian translations
│   ├── App.jsx                 # Main orchestrator (252 lines)
│   ├── i18n.js                 # i18next configuration
│   └── main.jsx                # React entry point
├── supabase/                   # Supabase local config
├── .env                        # Environment variables (gitignored)
├── .env.example                # Template for env vars
├── .env.supabase               # Supabase-specific env (gitignored)
├── .gitignore
├── CLAUDE.md                   # Claude Code instructions
├── carousel-migration.sql      # SQL migration for carousel_items
├── index.html                  # HTML entry point with SEO metadata
├── package.json
├── package-lock.json
├── supabase-setup.sql          # Full database schema + seed data
├── vercel.json                 # Vercel deployment config
└── vite.config.js              # Vite build config with chunk splitting
```

## Key Locations

| What | Where |
|---|---|
| All application state | `src/App.jsx` |
| Brand colors, phone, URLs | `src/lib/constants.js` (lines 1-14) |
| Default/fallback data | `src/lib/constants.js` (lines 16-71) |
| Shared style objects | `src/lib/constants.js` (`S` export, lines 186-199) |
| Global CSS (injected) | `src/lib/constants.js` (`css` export, lines 124-184) |
| Supabase CRUD operations | `src/lib/supabase.js` |
| Translation keys | `src/locales/en.json` (canonical) |
| SEO metadata, structured data | `index.html` (head section) |
| Static images | `public/anibal/`, `public/brands/` |
| Database schema | `supabase-setup.sql` |
| Admin panel logic | `src/components/Admin/AdminPanel.jsx` |
| Environment variables | `.env.example` (3 vars: Supabase URL, key, Google Translate key) |

## File Size Distribution

The codebase totals ~2,900 lines of component code plus ~700 lines of lib/config/hooks code.

| File | Lines | Notes |
|---|---|---|
| `Admin/AdminPanel.jsx` | 870 | Largest file — all admin CRUD tabs |
| `App.jsx` | 252 | Central orchestrator |
| `Admin/DragList.jsx` | 201 | Drag-and-drop reorder |
| `lib/constants.js` | 200 | Config, defaults, styles |
| `Admin/CarouselsTab.jsx` | 193 | Carousel curation |
| `Portfolio.jsx` | 190 | Category drill-down |
| `Reviews.jsx` | 181 | Home + full page reviews |
| `lib/supabase.js` | 242 | All database operations |
| Everything else | ~20-130 each | Smaller focused components |

## Naming Conventions

- **Components**: PascalCase `.jsx` files, one primary export per file. Some files export multiple related components (e.g., `CTA.jsx` exports `TailoringCTA`, `ServiceAreasCTA`, `BottomCTA`; `Reviews.jsx` exports `GoogleReviewsHome` and `ReviewsPage`).
- **Hooks**: camelCase with `use` prefix, `.js` extension, in `src/hooks/`.
- **Lib modules**: camelCase `.js` files in `src/lib/`.
- **Translations**: lowercase language codes (`en.json`, `de.json`) with dot-notation keys (`nav.home`, `portfolio.title`).
- **Constants**: UPPER_SNAKE_CASE for exported constants (`R`, `G`, `PHONE`, `WA_LINK`, `HERO_IMG`, `DEFAULT_CATS`). Single-letter abbreviations are used for frequently referenced values (`R` = brand orange, `G` = gray, `S` = styles).
- **Supabase functions**: verb + noun pattern (`fetchCategories`, `addWorkItem`, `deleteHighlight`, `upsertSiteConfig`).
- **State variables**: short abbreviations in some places (`lb` = lightbox, `cats` = categories, `subcats` = subcategories).
- **CSS classes**: kebab-case, defined in the global `css` string (e.g., `hero-section`, `sticky-bar`, `mobile-hamburger`, `brand-marquee`).

## Multi-file Components

Several logical features span multiple files:

- **Reviews**: `Reviews.jsx` (component) + `constants.js` (fallback REVIEWS data) + `supabase.js` (fetchGoogleReviews, fetchFbReviews) + `ui.jsx` (Stars, GoogleG, SocialIcon)
- **Carousel system**: `Carousel.jsx` (generic) + `RecentWork.jsx` + `Highlights.jsx` + `ReturningCustomers.jsx` + `TailorJobs.jsx` + `Admin/CarouselsTab.jsx`
- **Portfolio**: `Portfolio.jsx` (page) + `App.jsx` (portfolioView state) + `Lightbox.jsx` (media viewer)
- **Admin**: `Admin/AdminPanel.jsx` + `Admin/CarouselsTab.jsx` + `Admin/DragList.jsx` + `lib/supabase.js` (all CRUD) + `lib/translate.js` (FAQ auto-translation)
