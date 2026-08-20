import { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { R, REVIEWS, svgP, WA_LINK, ab, getStyleConfig, parseReviewDate, formatReviewDate } from "../lib/constants";
import { fetchHappyCustomers } from "../lib/supabase";
import { Stars, GoogleG, SocialIcon } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";
import HappyCustomerRails, { HappyCustomerTile } from "./HappyCustomers";

// Facebook no da estrellas, da recomendación. El pulgar arriba le da al badge el
// mismo peso visual que las 5 estrellas de una card de Google al lado.
const FbBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#1877F2", fontWeight: 600 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d={svgP.thumbsUp}/></svg>
    Recommends
  </span>
);

/**
 * Merge both sources into one chronologically sortable list.
 * `sortedAt` is what we order by; `time` is what the card shows (Google's free-text
 * label reads better than a formatted date when it exists). Reviews with no usable
 * date sink to the bottom in either direction so they never displace dated ones.
 */
function useAllReviews(googleReviews, fbReviews, lang, direction = "desc") {
  return useMemo(() => {
    const gReviews = googleReviews.length > 0
      ? googleReviews.map(r => ({
          name: r.name, r: r.rating, text: r.text, source: "google",
          time: r.time_label || formatReviewDate(r.review_date, lang),
          sortedAt: parseReviewDate(r.review_date) ?? parseReviewDate(r.created_at),
        }))
      : REVIEWS.map(r => ({ ...r, source: "google", sortedAt: null }));
    const fReviews = fbReviews.map(r => ({
      name: r.name, r: null, text: r.text, source: "facebook", recommends: true,
      time: formatReviewDate(r.review_date, lang),
      sortedAt: parseReviewDate(r.review_date) ?? parseReviewDate(r.created_at),
    }));

    const all = [...gReviews, ...fReviews];
    const sign = direction === "asc" ? 1 : -1;
    return all.slice().sort((a, b) => {
      if (a.sortedAt === null && b.sortedAt === null) return 0;
      if (a.sortedAt === null) return 1;
      if (b.sortedAt === null) return -1;
      return (a.sortedAt - b.sortedAt) * sign;
    });
  }, [googleReviews, fbReviews, lang, direction]);
}

/** Star average — Facebook reviews are thumbs-up only, so they never count here. */
const starAverage = (reviews) => {
  const rated = reviews.filter(r => r.source === "google" && r.r);
  return rated.length > 0 ? (rated.reduce((a, r) => a + r.r, 0) / rated.length).toFixed(1) : "0.0";
};

// Unified reviews carousel for the home page (Google + Facebook)
export function GoogleReviewsHome({ nav, googleReviews = [], fbReviews = [], siteConfig = {} }) {
  const { t, i18n } = useTranslation();
  const revTitleStyle = getStyleConfig(siteConfig, "reviews_title_style");
  const revRef = useRef(null);
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (e, i) => {
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  // Home always leads with the newest reviews — the asc/desc control lives on /reviews.
  const allReviews = useAllReviews(googleReviews, fbReviews, i18n.language, "desc");
  const avg = starAverage(allReviews);

  return (
    <FadeIn>
    <section style={{ padding: "40px 24px 48px", background: "#fafafa" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GoogleG/>
              <span style={{ fontSize: 11, color: "#ccc" }}>+</span>
              <SocialIcon type="fb" size={20}/>
              <span style={{ fontSize: revTitleStyle.fontSize, fontFamily: `'${revTitleStyle.fontFamily}', sans-serif`, fontWeight: 600, color: "#444" }}>{t("reviews.title")}</span>
            </div>
            <div style={{ width: 1, height: 24, background: "#e0e0e0" }}/>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1400} decimals={1}/></span>
              <div>
                <Stars n={Math.round(parseFloat(avg))} sz={15}/>
                <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{t("reviews.count", { count: allReviews.length })}</div>
              </div>
            </div>
          </div>
          <button onClick={() => nav("reviews")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("reviews.seeAll")}</button>
        </div>

        <div style={{ position: "relative" }}>
          <div ref={revRef} className="hs" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
            {allReviews.slice(0, 12).map((rev, i) => (
              <div key={i} className="review-card" style={{ minWidth: 280, maxWidth: 310, flexShrink: 0, scrollSnapAlign: "start", padding: "18px", borderRadius: 12, background: "#fff", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff" }}>{rev.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
                  </div>
                  {rev.source === "google" ? <GoogleG/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg>}
                </div>
                {rev.source === "facebook" ? <FbBadge/> : <Stars n={rev.r} sz={14}/>}
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "8px 0 0", ...(!expanded.has(i) ? { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>{rev.text}</p>
                <span
                  onClick={(e) => toggleExpand(e, i)}
                  style={{ fontSize: 12, color: R, cursor: "pointer", fontWeight: 600, marginTop: 4, display: "inline-block" }}
                >{expanded.has(i) ? t("reviews.readLess", "Read less") : t("reviews.readMore", "Read more")}</span>
              </div>
            ))}
          </div>
          <button onClick={() => revRef.current?.scrollBy({ left: -340, behavior: "smooth" })} style={ab("left")} aria-label="Previous">&#8249;</button>
          <button onClick={() => revRef.current?.scrollBy({ left: 340, behavior: "smooth" })} style={ab("right")} aria-label="Next">&#8250;</button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

/**
 * Las fotos de Happy Customers sólo se usan en esta página, así que se piden
 * acá y no en la carga inicial de App.jsx — en las otras 3 rutas sería un
 * request muerto. `happyItems` llega por props cuando el admin ya las cargó
 * en memoria; si no, se buscan.
 */
function useHappyCustomers(happyItems) {
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    if (happyItems.length > 0) return;
    let alive = true;
    fetchHappyCustomers()
      .then(data => { if (alive && data) setLoaded(data); })
      .catch(err => console.warn("Happy customers load error:", err.message));
    return () => { alive = false; };
  }, [happyItems.length]);

  return useMemo(
    () => (happyItems.length > 0 ? happyItems : loaded).filter(it => it.src || it.thumb),
    [happyItems, loaded],
  );
}

/**
 * Mobile: una foto cada 4 reviews, para que acompañen el scroll en vez de
 * quedar todas amontonadas arriba. En desktop el CSS las oculta — ahí el
 * contenido vive en los rieles de los márgenes.
 */
function interleaveHappy(reviews, photos) {
  if (photos.length === 0) return reviews;
  // El paso se calcula sobre el largo real de la lista. Con un paso fijo (una
  // foto cada 4 reviews) las 12 se agotaban en el primer tercio de la página y
  // los últimos 30.000px quedaban sin ninguna — el mismo defecto que esto vino
  // a resolver. Repartidas así, la última cae cerca del final.
  const step = Math.max(2, Math.floor(reviews.length / (photos.length + 1)));
  const out = [];
  let p = 0;
  reviews.forEach((rev, i) => {
    out.push(rev);
    if ((i + 1) % step === 0 && p < photos.length) out.push({ __photo: photos[p++] });
  });
  return out;
}

// Full reviews page
export function ReviewsPage({ googleReviews = [], fbReviews = [], happyItems = [], setLb }) {
  const { t, i18n } = useTranslation();
  const [direction, setDirection] = useState("desc");
  const happy = useHappyCustomers(happyItems);
  const reviews = useAllReviews(googleReviews, fbReviews, i18n.language, direction);
  const allReviews = reviews;
  const googleOnly = reviews.filter(r => r.source === "google" && r.r);
  const avg = starAverage(reviews);

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
      <HappyCustomerRails items={happy} setLb={setLb}/>
      <div style={{ textAlign: "center", padding: "24px 0 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: 11, color: "#ccc" }}>+</span>
          <SocialIcon type="fb" size={26}/>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{t("reviews.title")}</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1600} decimals={1}/></div>
        <div style={{ margin: "8px 0 6px" }}><Stars n={Math.round(parseFloat(avg))} sz={22}/></div>
        <div style={{ fontSize: 14, color: "#777" }}>{t("reviews.based", { count: allReviews.length })}</div>

        {/* Rating distribution bars (Google only) */}
        <div style={{ maxWidth: 280, margin: "20px auto 0" }}>
          {[5,4,3,2,1].map(star => {
            const count = googleOnly.filter(r => r.r === star).length;
            const pct = googleOnly.length ? (count / googleOnly.length) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#666", width: 12, textAlign: "right" }}>{star}</span>
                <span style={{ fontSize: 11, color: "#F59E0B" }}>★</span>
                <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }}/>
                </div>
                <span style={{ fontSize: 11, color: "#ccc", width: 20 }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Chronological order toggle */}
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setDirection(d => d === "desc" ? "asc" : "desc")}
            aria-label={t("reviews.sortAria", "Change review order")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#555", transition: "border-color .2s, color .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.color = R; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#555"; }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>{direction === "desc" ? "↓" : "↑"}</span>
            {direction === "desc" ? t("reviews.newestFirst", "Newest first") : t("reviews.oldestFirst", "Oldest first")}
          </button>
        </div>

        <a href="https://www.google.com/maps/place/Handyman+Services+in+Zurich/" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 20, padding: "8px 20px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#555", textDecoration: "none" }}>
          {t("reviews.leaveReview")}
        </a>
      </div>

      {/* All reviews grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {interleaveHappy(reviews, happy).map((rev, i) => rev.__photo ? (
          <HappyCustomerTile key={`hc${i}`} item={rev.__photo} setLb={setLb} context={happy}/>
        ) : (
          <div key={i} style={{ padding: "20px", borderRadius: 12, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" }}>{rev.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
              </div>
              {rev.source === "facebook" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg> : <GoogleG/>}
            </div>
            {rev.source === "facebook" ? <FbBadge/> : <Stars n={rev.r} sz={14}/>}
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "8px 0 0" }}>{rev.text}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32, padding: "24px 20px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", marginBottom: 10 }}>{t("reviews.ctaTitle", "Ready to experience the same quality?")}</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("cta.button")}
        </a>
      </div>
    </div>
  );
}
