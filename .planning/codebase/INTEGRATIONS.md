# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**WhatsApp Business:**
- WhatsApp Web API (deeplink) - Direct messaging contact method
  - Channel: Float button fixed at bottom-right of page
  - Component: `src/components/WhatsAppFAB.jsx`
  - Link template: `https://wa.me/{phone}?text={encoded_message}`
  - Phone number: +41 76 594 95 81 (stored in `src/lib/constants.js` as `PHONE`, `WA_LINK`)
  - Multi-language message support via `getWALink(lang)` function
  - Green button (#25D366) with WhatsApp icon

**Facebook:**
- Facebook share integration - Social sharing
  - Share button in `src/components/ShareButton.jsx`
  - Share URL: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Facebook Reviews embedding
  - Table: `facebook_reviews` in Supabase
  - Stored reviews displayed on Reviews page and home
  - Video embed via Facebook plugins: `fbEmbedUrl()` helper in `src/lib/constants.js`

**YouTube:**
- YouTube video embedding
  - Video player in lightbox: `src/components/Lightbox.jsx`
  - Embed template: `https://www.youtube.com/embed/{videoId}?autoplay=1`
  - Thumbnail generation: `ytThumb()` function in `src/lib/constants.js`
  - Playlist links for portfolio items: `https://www.youtube.com/playlist?list={playlistId}`
- YouTube channel link
  - @HandymanServicesinZurich channel referenced in constants
  - Social URL: `https://www.youtube.com/@HandymanServicesinZurich`

**Google Maps:**
- Google Reviews integration
  - Google Maps link: `https://www.google.com/maps/place/Handyman+Services+in+Zurich/`
  - Review data stored in `google_reviews` table in Supabase
  - Star ratings displayed on Reviews page

## Data Storage

**Databases:**
- Supabase PostgreSQL (primary backend)
  - Connection: Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Client library: @supabase/supabase-js 2.97.0
  - Client initialization: `src/lib/supabase.js` (nullable if not configured)

**Database Tables:**
- `categories` - Service categories, ordered by sort_order
- `work_items` - Portfolio work/project items, includes optional subcategory_id
- `subcategories` - Nested portfolio structure under categories
- `carousel_items` - Curated carousel views referencing work_items
- `faqs` - Frequently asked questions with multi-language support
- `highlights` - Featured work (legacy, kept for backward compatibility)
- `returning_customers` - Repeat client work (legacy, kept for backward compatibility)
- `facebook_reviews` - Customer reviews from Facebook
- `google_reviews` - Customer reviews from Google
- `site_config` - Key-value configuration store (hero title, subtitle, bio text, fonts, etc.)

**File Storage:**
- Supabase Storage bucket: `images`
  - Image upload: `uploadImage(file, folder)` in `src/lib/supabase.js`
  - Max file size: 5MB
  - Allowed types: JPEG, PNG, WebP, GIF
  - Files organized by folder: portfolio items, categories, etc.
  - Public URLs generated via `getPublicUrl()`
  - Upload naming: `{folder}/{timestamp}_{randomId}.{ext}`

**Caching:**
- Not detected - Client-side only, no caching layer configured

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (email/password)
  - Used only for admin panel access at `/admin`
  - Admin users manage content through `src/components/Admin/AdminPanel.jsx`
  - Keyboard shortcut: Ctrl+Shift+A to access admin
  - Session managed by Supabase client library

## Monitoring & Observability

**Error Tracking:**
- Not detected - No dedicated error tracking service integrated

**Logs:**
- Browser console only (console.log statements)
- Errors thrown and caught at Supabase CRUD layer in `src/lib/supabase.js`

## CI/CD & Deployment

**Hosting:**
- Vercel - Cloud platform for static site deployment
  - Project configuration: `.vercel/project.json`
  - Deployment config: `vercel.json`
  - Live URL: handyman-web-page.vercel.app

**CI Pipeline:**
- Vercel automatic deployments
  - Build command: `npm run build:fast` (skips pre-rendering)
  - Pre-render happens locally during `npm run build` command
  - Static output deployed to Vercel CDN

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL (https://your-project.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous public key
- `VITE_GOOGLE_TRANSLATE_KEY` - Google Translate API key (referenced but not used in current codebase)

**Secrets location:**
- `.env` file in project root (local development)
- Vercel project environment variables (production)
- `.env.supabase` for Supabase-specific secrets

**Development:**
- `.env.example` provides template for required variables

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Not detected - No webhooks sent to external services

## Social Media Integration

**Shareable Content:**
- Open Graph meta tags in HTML (for social preview)
- Share button component supports:
  - WhatsApp share: `https://wa.me/?text={encoded}`
  - Facebook share: Facebook Share Dialog
  - Direct URL sharing

**Social Links:**
- Facebook page: https://www.facebook.com/HandymanServicesinZurich
- YouTube channel: https://www.youtube.com/@HandymanServicesinZurich
- WhatsApp business number: +41 76 594 95 81
- Icons and social colors defined in `src/lib/constants.js`

---

*Integration audit: 2026-03-16*
