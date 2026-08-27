/** Extract YouTube video ID from a full URL or return as-is if already an ID */
export function ytId(raw) {
  if (!raw) return raw;
  const s = raw.trim();
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?.*v=))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : s;
}

export const R = "#D4781F";
export const G = "#4A4A4A";
export const PHONE = "+41 76 594 95 81";
export const WA_LINK = "https://wa.me/41765949581?text=Hi%2C%20I%20need%20a%20handyman%20in%20Zurich";
const WA_MSGS = {
  en: "Hi, I need a handyman in Zurich",
  de: "Hallo, ich brauche einen Handyman in Zurich",
  es: "Hola, necesito un handyman en Zurich",
  fr: "Bonjour, j'ai besoin d'un handyman à Zurich",
  it: "Ciao, ho bisogno di un handyman a Zurich",
};
export const getWALink = (lang = "en") => `https://wa.me/41765949581?text=${encodeURIComponent(WA_MSGS[lang] || WA_MSGS.en)}`;
export const HERO_IMG = "/anibal/hero.jpeg";
export const PROFILE_IMG = "/anibal/foto_perfil_colores.jpeg";

export const DEFAULT_CATS = [
  { id: "all", label: "All" },
];

export const DEFAULT_WORK = [];

export const DEFAULT_FAQS = [];
export const DEFAULT_SUBCATS = [];

export const DEFAULT_HIGHLIGHTS = [];

export const DEFAULT_FB_REVIEWS = [
  { id: "fb1", name: "Lidia Profir", rating: 5, text: "I totally recommend Anibal. He is very polite, he immediately responded to my request of installing lights in a new appartment, I was really happy with the work he did. He's very friendly and I appreciated his communication skills very much. For me it was a real plus he speaks English very well as I don't speak German too much. Don't hesitate to contact him, you'll be surprised by his work and the interaction with him. Thanks Anibal!", review_date: "2025" },
  { id: "fb2", name: "Lu Mo", rating: 5, text: "Anibal fitted our Samsung frame, some lights, mounted several pictures. He was pleasant, professional and very thorough.", review_date: "2025" },
  { id: "fb3", name: "Diana Ursachi", rating: 5, text: "Anibal installed a Tesla charging station in the garage and it worked perfectly ever since. I wholeheartedly recommend his services!", review_date: "2025" },
  { id: "fb4", name: "Vanessa Kitić", rating: 5, text: "Anibal was such a pro in installing the Philips smart lighting fixtures in my living and dining spaces. He was able to advise on the height and created a seamless solution for a once off center wiring issue that now looks perfectly centered over my dining table. The whole service was flawless, and not a speck of dust was left behind. I recommend Anibal for truly anything you may need done in your home. He is so precise, professional, and friendly.", review_date: "2025" },
  { id: "fb5", name: "Kamel Ghosn", rating: 5, text: "Great communication, service and price. Anibal did a great job hanging a TV and moving a light. Thank you", review_date: "2025" },
  { id: "fb6", name: "Heather Halsey", rating: 5, text: "Aníbal did a great job. He has good attention to detail and checks with me that I was happy with the position of a hanging light. The clean up was immaculate as well. We are very happy with the work and will definitely contact him when we have more jobs around the house.", review_date: "2025" },
  { id: "fb7", name: "Catherine Grau", rating: 5, text: "Ausgezeichnete Arbeit, ich empfehle Euch allen Herrr Handyman. Excelente trabajo 10+, recomiendo ampliamente los servicios del Sr. Handyman.", review_date: "2025" },
  { id: "fb8", name: "Paco Olivares", rating: 5, text: "Excelente Servicio 5 estrellas y 3 diamantes! Fueron instalaciones de lámparas con problemas de conexión. Todo quedó al 100%", review_date: "2025" },
  { id: "fb9", name: "Sissi Schulz", rating: 5, text: "I can definitely recommend the \"Handyman Services\" aka Aníbal. I needed some lights installed in my new flat, with ceiling drilling and all. He did an amazing job! Every light was precisely placed with some Laser technology which helped putting them exactly in one line as they were three lights in a row. They are also placed exactly in the centre of the ceiling as I wanted. He worked cleanly but at the same time was very efficient, it couldn't have been done better. Booking was very easy and he was very punctual. The price given was fair and he shared his knowledge of some other stuff that could help improve my flat, which I really appreciated. All in all I am super happy with the service he provided and would definitively book him again for anything else that needs doing in the flat.", review_date: "2025" },
  { id: "fb10", name: "Natalia Lucas", rating: 5, text: "Just wanted to recommend Handyman Services in Zurich, for his truly amazing work! Today he installed two lamps (one he suggested, and I LOVE it!), fixed a poorly done wall, and mounted a super tricky wall hanger perfectly. Thank you so much! What really stands out is his precision, honesty, and great advice. He knows his craft, works with top-quality tools, and makes everything easy and stress-free. His service is his passion! He knows about the new products and technologies in the market. If you need someone, you can fully trust for electrical work or home repairs, Handyman's the one to call!", review_date: "2025" },
  { id: "fb11", name: "Karen Orozco", rating: 5, text: "Hace unas semanas, Aníbal vino a casa e instaló los rieles para cortinas en cuatro ventanales, además de la iluminación de nuestra sala. ¡Queremos destacar su profesionalismo y la excelente calidad de su trabajo! Estamos súper contentos con el resultado! Súper recomendado 🙌🏽", review_date: "2025" },
];

export const SERVICE_AREAS = [
  { name: "Zurich", primary: true },
  { name: "Saint Gallen", primary: false },
  { name: "Zug", primary: false },
  { name: "Basel", primary: false },
  { name: "Schwyz", primary: false },
  { name: "Aarau", primary: false },
];

export const LANGS = [
  { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "English" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", label: "Deutsch" },
  { code: "it", flag: "\u{1F1EE}\u{1F1F9}", label: "Italiano" },
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", label: "Fran\u00e7ais" },
  { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Espa\u00f1ol" },
];

export const REVIEWS = [
  { name: "Anna M.", r: 5, text: "Outstanding service! Our bathroom looks brand new. Very professional and punctual. Will definitely call again for future projects.", time: "2 weeks ago" },
  { name: "Thomas K.", r: 5, text: "Assembled our entire IKEA kitchen in one day. Perfect work. Highly recommended!", time: "1 month ago" },
  { name: "Sarah L.", r: 4, text: "Quick response and great electrical work. Fair prices for the Zurich area. Very clean and tidy.", time: "1 month ago" },
  { name: "Marco R.", r: 5, text: "Third time hiring \u2014 always top quality. Best handyman in Zurich! Friendly, on time, and does excellent work.", time: "2 months ago" },
  { name: "Lisa W.", r: 5, text: "Our new parquet floor is beautiful. Impressive attention to detail and very reasonable pricing.", time: "3 months ago" },
  { name: "Peter H.", r: 5, text: "Reliable and honest. Fixed multiple things in one visit. Great value for money.", time: "3 months ago" },
  { name: "Julia B.", r: 5, text: "Mounted our TV and installed floating shelves perfectly. Very careful with the walls. Cleaned everything after. Top!", time: "4 months ago" },
  { name: "Daniel F.", r: 5, text: "Emergency plumbing fix on a Saturday. Arrived within 2 hours. Lifesaver! Fair price even for weekend work.", time: "4 months ago" },
  { name: "Nina S.", r: 4, text: "Painted our entire apartment in 3 days. Neat work, protected all furniture. Good communication throughout.", time: "5 months ago" },
  { name: "Robert M.", r: 5, text: "Built custom shelving in our office. Measured everything perfectly, looks like it was always there. Highly professional.", time: "5 months ago" },
  { name: "Elena K.", r: 5, text: "Garden maintenance and new lighting installation. Transformed our outdoor space completely. So happy with the result!", time: "6 months ago" },
  { name: "Stefan W.", r: 5, text: "Fixed a leaking faucet and installed a new bathroom mirror. Quick, efficient, and very friendly. Recommended to all my neighbors.", time: "6 months ago" },
];

// Legacy image paths (kept for reference)
// fb: "/anibal/facebook_icon.jpeg", yt: "/anibal/youtube_icon.jpeg", wa: "/anibal/whatsapp_icon.jpeg"
export const socialColors = { fb: "#1877F2", yt: "#FF0000", wa: "#25D366" };

export const svgP = {
  fb: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  yt: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  wa: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  // Pulgar arriba del badge "Recommends" — Facebook no da estrellas, da recomendación.
  thumbsUp: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
};

export const socialUrls = {
  fb: "https://www.facebook.com/HandymanServicesinZurich",
  yt: "https://www.youtube.com/@HandymanServicesinZurich",
  wa: WA_LINK,
};

export const ytThumb = (item) => item.thumb || (item.videoId ? `https://img.youtube.com/vi/${ytId(item.videoId)}/hqdefault.jpg` : "");

// ─── Stats bar ───
// Single source of truth so the admin preview and the live bar can't drift apart.
// Each stat stores its number in `key` and its magnitude in `key_unit` ("" = none).
export const STAT_UNITS = ["", "K", "M"];

// `needsExplicitUnit` marks the two stats whose magnitude changed before the selector
// existed (views K->M, followers none->K). A number stored back then is ambiguous — 950
// could mean 950K or 950M — so it is only trusted once a unit is stored alongside it.
export const STATS = [
  { key: "stat_experience", label: "Years Experience", i18nKey: "stats.experience", defaultVal: "20", defaultUnit: "", decimals: 0 },
  { key: "stat_videos", label: "Video Shows", i18nKey: "stats.videos", defaultVal: "400", defaultUnit: "", decimals: 0 },
  { key: "stat_yt_views", label: "YouTube Views", i18nKey: "stats.ytViews", defaultVal: "1.3", defaultUnit: "M", decimals: 1, needsExplicitUnit: true },
  { key: "stat_fb_followers", label: "Facebook Followers", i18nKey: "stats.fbFollowers", defaultVal: "1.4", defaultUnit: "K", decimals: 1, needsExplicitUnit: true },
];

export const statUnitKey = (key) => `${key}_unit`;

/** Saved magnitude for a stat. An explicitly saved "" means "no magnitude". */
export const getStatUnit = (siteConfig, key, fallback = "") => {
  const raw = siteConfig?.[statUnitKey(key)];
  if (raw === undefined || raw === null) return fallback;
  return STAT_UNITS.includes(raw) ? raw : fallback;
};

/**
 * Number to display for a stat. Saving from the admin always writes the value and its
 * unit together, so a unit-sensitive stat with no stored unit predates the selector and
 * falls back to the default until it is re-saved.
 */
export const getStatValue = (siteConfig, stat) => {
  const fallback = Number(stat.defaultVal);
  const stored = Number(siteConfig?.[stat.key]);
  if (!Number.isFinite(stored) || stored === 0) return fallback;
  if (stat.needsExplicitUnit && siteConfig?.[statUnitKey(stat.key)] === undefined) return fallback;
  return stored;
};

/** "K" -> "K+",  "" -> "+" */
export const formatStatSuffix = (unit) => `${unit || ""}+`;

// ─── Site text definitions (known keys with defaults) ───
export const SITE_TEXTS = {
  hero_title: { label: "Hero Title", defaultText: "Professional Handyman\nServices in Zurich", defaultFontSize: 36, defaultFontFamily: "DM Sans" },
  hero_subtitle: { label: "Hero Subtitle", defaultText: "Your satisfaction, my commitment", defaultFontSize: 14, defaultFontFamily: "DM Sans" },
  hero_brand_subtitle: { label: "Hero Brand Subtitle", defaultText: "Specialist Technician At Domestic Matters", defaultFontSize: 15, defaultFontFamily: "Dancing Script" },
  highlights_section_title: { label: "Highlights Section Title", defaultText: "Highlights", defaultFontSize: 17, defaultFontFamily: "DM Sans" },
  bio_text: { label: "About / Bio Text", defaultText: "", defaultFontSize: 14, defaultFontFamily: "DM Sans" },
  // About highlight boxes — editable copy (defaults mirror the English translations)
  about_highlight1_title: { label: "Highlight 1 — Title", defaultText: "What to expect", defaultFontSize: 13, defaultFontFamily: "DM Sans" },
  about_highlight1_text: { label: "Highlight 1 — Text", defaultText: "Fresh ideas that save you time and stress, aiming to your overall satisfaction, my top commitment.", defaultFontSize: 12, defaultFontFamily: "DM Sans" },
  about_highlight2_title: { label: "Highlight 2 — Title", defaultText: "What you truly get", defaultFontSize: 13, defaultFontFamily: "DM Sans" },
  about_highlight2_text: { label: "Highlight 2 — Text", defaultText: "Professional-quality work at affordable prices — excellent results, a flawless finish, and the peace of mind + guarantee everyone looks for.", defaultFontSize: 12, defaultFontFamily: "DM Sans" },
  about_highlight3_title: { label: "Highlight 3 — Title", defaultText: "Who I serve", defaultFontSize: 13, defaultFontFamily: "DM Sans" },
  about_highlight3_text: { label: "Highlight 3 — Text", defaultText: "Always happy to assist both the local community and the expat community across Zurich and the surrounding region.", defaultFontSize: 12, defaultFontFamily: "DM Sans" },
};

// Parse a site config value — supports both plain text (legacy) and JSON {text, fontSize, fontFamily}
export const parseSiteText = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && "text" in parsed) return parsed;
  } catch {}
  return { text: value }; // legacy plain text
};
// ─── Style-only config keys (no text content -- fontSize + fontFamily only) ───
export const STYLE_KEYS = {
  // About section (TYPO-02)
  about_highlight1_title_style: { fontSize: 13, fontFamily: "DM Sans" },
  about_highlight1_text_style: { fontSize: 12, fontFamily: "DM Sans" },
  about_highlight2_title_style: { fontSize: 13, fontFamily: "DM Sans" },
  about_highlight2_text_style: { fontSize: 12, fontFamily: "DM Sans" },
  about_highlight3_title_style: { fontSize: 13, fontFamily: "DM Sans" },
  about_highlight3_text_style: { fontSize: 12, fontFamily: "DM Sans" },
  // Carousel titles (TYPO-03)
  carousel_recent_work_title_style: { fontSize: 18, fontFamily: "DM Sans" },
  carousel_returning_customers_title_style: { fontSize: 18, fontFamily: "DM Sans" },
  carousel_tailor_jobs_title_style: { fontSize: 18, fontFamily: "DM Sans" },
  // CTA sections (TYPO-04)
  cta_tailoring_title_style: { fontSize: 20, fontFamily: "DM Sans" },
  cta_tailoring_text_style: { fontSize: 14, fontFamily: "DM Sans" },
  cta_bottom_title_style: { fontSize: 24, fontFamily: "DM Sans" },
  cta_bottom_subtitle_style: { fontSize: 14, fontFamily: "DM Sans" },
  // Stats bar labels (TYPO-05)
  stats_label_style: { fontSize: 11, fontFamily: "DM Sans" },
  stats_number_style: { fontSize: 24, fontFamily: "DM Sans" },
  // Footer (TYPO-06)
  footer_heading_style: { fontSize: 12, fontFamily: "DM Sans" },
  footer_hours_style: { fontSize: 12, fontFamily: "DM Sans" },
  // Reviews (TYPO-07)
  reviews_title_style: { fontSize: 14, fontFamily: "DM Sans" },
};

// Read a style-only config value (no text content). Returns {fontSize, fontFamily} with defaults.
export const getStyleConfig = (siteConfig, key) => {
  const defaults = STYLE_KEYS[key] || { fontSize: 14, fontFamily: "DM Sans" };
  const raw = siteConfig?.[key];
  if (!raw) return defaults;
  try {
    const parsed = typeof raw === "object" ? raw : JSON.parse(raw);
    return {
      fontSize: parsed.fontSize || defaults.fontSize,
      fontFamily: parsed.fontFamily || defaults.fontFamily,
    };
  } catch {
    return defaults;
  }
};

/**
 * Reviews carry dates loosely: Google rows have an optional ISO `review_date` plus a
 * free-text `time_label` ("2 weeks ago"), Facebook rows have `review_date` as text and
 * older ones only hold a year. Returns epoch ms, or null when nothing parseable is there.
 */
export const parseReviewDate = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (/^\d{4}$/.test(s)) return Date.UTC(Number(s), 0, 1); // legacy year-only rows
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
};

/**
 * Value for an <input type="date"> from whatever a review has stored.
 * Year-only rows ("2025") normalise to Jan 1st so they become sortable once saved;
 * anything unparseable yields "" so the field shows up empty and can be filled in.
 */
export const toDateInput = (value) => {
  const ms = parseReviewDate(value);
  if (ms === null) return "";
  return new Date(ms).toISOString().slice(0, 10);
};

/** Human-readable date for a review card; falls back to the raw stored value. */
export const formatReviewDate = (value, lang = "en") => {
  const ms = parseReviewDate(value);
  if (ms === null) return value || "";
  if (/^\d{4}$/.test(String(value).trim())) return String(value).trim();
  return new Date(ms).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
};

/**
 * Resolve one About highlight-box field (title or body).
 *
 * The copy now lives in `about_highlightN_title` / `about_highlightN_text` as JSON with
 * optional font overrides. The older `..._style` keys only ever held font settings, so
 * they stay as the fallback and any values the client already saved keep applying.
 * Falls back to the translated string when nothing is configured.
 */
export const getHighlightField = (siteConfig, key, fallbackText) => {
  const parsed = parseSiteText(siteConfig?.[key]) || {};
  const legacy = getStyleConfig(siteConfig, `${key}_style`);
  return {
    text: parsed.text || fallbackText,
    fontSize: parsed.fontSize || legacy.fontSize,
    fontFamily: parsed.fontFamily || legacy.fontFamily,
  };
};

export const fbEmbedUrl = (url) => `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
export const itemThumb = (item) => {
  if (!item) return "";
  if (item.thumb) return item.thumb;
  if (item.type === "video") return item.videoId ? `https://img.youtube.com/vi/${ytId(item.videoId)}/hqdefault.jpg` : "";
  if (item.type === "facebook") return item.thumb || "/anibal/facebook_icon.jpeg";
  return item.src;
};

export const ab = (s) => ({
  position: "absolute", top: "33%", [s]: -4, width: 44, height: 44, borderRadius: "50%",
  background: "#fff", border: "1px solid #e5e5e5", cursor: "pointer", fontSize: 18, color: "#555",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", zIndex: 2,
});

export const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .hs::-webkit-scrollbar { display: none; }
  .hs { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes heroFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  @keyframes heroImageIn { from { opacity: 0; } to { opacity: 1; } }
  /* The photo lands first on its own, then the text block writes itself in on top. */
  .hero-image { animation: heroImageIn 0.9s ease both; }
  .heroContent { animation: heroFadeUp 0.7s ease 0.9s both; }
  .heroContent h1 { animation: heroFadeUp 0.7s ease 1.05s both; }
  .heroContent p { animation: heroFadeUp 0.7s ease 1.25s both; }
  .heroContent > div:last-child { animation: heroFadeUp 0.7s ease 1.45s both; }
  @media (max-width: 900px) {
    .sticky-bar { display: none !important; }
  }
  @media (max-width: 640px) {
    .desktop-nav { display: none !important; }
    .mobile-hamburger { display: block !important; }
    /* Keep the full horizontal wordmark on mobile — the circular icon alone
       dropped the "Handyman Services in Zurich" name from small screens. */
    .logo-desktop { height: 26px !important; max-width: 60vw !important; }
    .about-row { justify-content: center !important; text-align: center; }
    .about-row img { margin: 0 auto; }
    /* A definite height is what keeps the photo covering the whole hero. With
       height:auto the image fell back to its intrinsic height while the section
       stretched to min-height, leaving a grey gradient band under the photo. */
    .hero-section { height: 46vh !important; min-height: 300px !important; max-height: 420px !important; }
    .hero-section .heroContent { padding-bottom: 0; }
    .hero-section .heroContent h1 { font-size: 31px !important; margin-bottom: 2px !important; }
    .hero-section .heroContent .hero-brand { font-size: 20px !important; }
    .hero-section .heroContent .hero-subtitle { font-size: 18px !important; }
    /* El bloque de texto ocupa mucha más altura proporcional acá que en desktop, así que
       trepa hasta donde el degradado de escritorio todavía está tenue y el título vuelve
       a competir con las paredes claras. Misma curva, corrida hacia arriba. */
    .hero-scrim { background: linear-gradient(to top, rgba(15,15,15,0.94) 0%, rgba(15,15,15,0.86) 45%, rgba(15,15,15,0.55) 70%, rgba(15,15,15,0.18) 88%, transparent 100%) !important; }
    .mobile-menu-item { min-height: 44px !important; display: flex !important; align-items: center !important; }
    .skill-tag { padding: 8px 14px !important; font-size: 13px !important; min-height: 36px !important; }
    /* Los tags son un flex aparte y no heredan el centrado de .about-row: acá el bloque
       entero va centrado y ellos quedaban pegados al borde izquierdo. En desktop, en
       cambio, van a la izquierda alineados con el párrafo del bio. */
    .skill-tags { justify-content: center !important; }
    .admin-container { padding: 20px 16px !important; }
    .admin-container input, .admin-container textarea, .admin-container select { font-size: 16px !important; }
    .stats-section { padding: 10px 12px !important; }
    .stats-grid { display: flex !important; flex-wrap: nowrap !important; justify-content: space-evenly !important; gap: 0 !important; }
    .stats-grid > div { min-width: unset !important; text-align: center !important; flex: 1 !important; }
    .stats-grid > div > div:first-child { font-size: 14px !important; font-weight: 800 !important; }
    .stats-grid > div > div:last-child { font-size: 8px !important; margin-top: 1px !important; letter-spacing: 0 !important; }
    .social-cards { padding: 10px 16px 14px !important; }
    .social-card { padding: 8px 6px !important; gap: 4px !important; flex: 1 1 0 !important; min-width: 0 !important; }
    .social-card svg { width: 18px !important; height: 18px !important; }
    .social-card span { font-size: 9px !important; line-height: 1.3 !important; }
    .brand-marquee { gap: 20px !important; }
    .brand-fade-left, .brand-fade-right { width: 30px !important; }
    .review-card { min-width: 240px !important; }
  }
  @media (min-width: 641px) {
    .mobile-menu { display: none !important; }
  }
  button:focus-visible, a:focus-visible { outline: 2px solid #D4781F; outline-offset: 2px; }
  .brand-marquee { display: flex; gap: 32px; align-items: center; width: max-content; animation: marquee 25s linear infinite; }
  .brand-marquee:hover { animation-play-state: paused; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* ── Happy Customers ──
     Desktop: dos rieles fijos en los márgenes del viewport, fuera del contenedor
     de 940px, desplazándose lento y cruzados. Fixed y no sticky para que
     acompañen TODO el scroll en vez de morir con el bloque de rating.
     Mobile: no hay márgenes, así que las fotos se intercalan en la grilla. */
  .hc-edges { display: none; }
  .hc-marquee-track { display: flex; flex-direction: column; gap: 10px; animation: hcUp 40s linear infinite; }
  .hc-marquee-track.down { animation-name: hcDown; }
  /* La foto intercalada rompe el padding de 24px del contenedor y va de borde a
     borde: así se lee como una banda que corta el ritmo de las reviews, en vez
     de parecer una card más. */
  .hc-inline-tile { grid-column: 1 / -1; margin-left: -24px; margin-right: -24px; }
  @keyframes hcUp { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes hcDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
  @media (min-width: 1300px) {
    .hc-edges {
      display: block; position: fixed; top: 56px; bottom: 0; z-index: 1;
      width: calc((100vw - 980px) / 2);
      /* El hueco vacío no debe robar clicks al contenido; las fotos sí los reciben. */
      pointer-events: none;
      /* Desvanecido arriba y abajo: sin esto el riel se lee como un panel pegado
         con bordes duros. Así se funde con la página. */
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 90px, #000 calc(100% - 90px), transparent);
      mask-image: linear-gradient(to bottom, transparent, #000 90px, #000 calc(100% - 90px), transparent);
    }
    .hc-edges.left { left: 0; }
    .hc-edges.right { right: 0; }
    .hc-edge-scroll { height: 100%; width: 100%; overflow: hidden; padding: 0 18px; pointer-events: auto; }
    .hc-edge-scroll:hover .hc-marquee-track { animation-play-state: paused; }
    /* En desktop las fotos viven en los márgenes: los tiles de la grilla sobran. */
    .hc-inline-tile { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  }
`;

export const S = {
  root: { fontFamily: "'DM Sans', -apple-system, sans-serif", background: "#fff", minHeight: "100vh", color: "#1a1a1a" },
  nav: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 100 },
  navIn: { maxWidth: 940, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", justifyContent: "space-between", alignItems: "center" },
  ghost: { background: "none", border: "1px solid #e5e5e5", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "#666" },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#777", marginBottom: 10 },
  input: { width: "100%", padding: "8px 11px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, outline: "none", display: "block" },
  btnPrimary: { background: "#222", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  adminCard: { padding: 16, background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0" },
  adminCardTitle: { fontSize: 12, fontWeight: 600, marginBottom: 10 },
  btnDanger: { background: "none", border: "1px solid #fdd", padding: "2px 8px", borderRadius: 5, cursor: "pointer", fontSize: 10, color: R, fontWeight: 500 },
  btnSmall: { background: "none", border: "1px solid #e5e5e5", padding: "2px 8px", borderRadius: 5, cursor: "pointer", fontSize: 10, color: "#666" },
  listItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f3f3" },
};
