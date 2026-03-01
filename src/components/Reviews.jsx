import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { R, REVIEWS, svgP, socialUrls, ab } from "../lib/constants";
import { Stars, GoogleG } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";

// Unified reviews carousel for the home page (Google + Facebook)
export function GoogleReviewsHome({ nav, googleReviews = [], fbReviews = [] }) {
  const { t } = useTranslation();
  const revRef = useRef(null);
  const gReviews = googleReviews.length > 0
    ? googleReviews.map(r => ({ name: r.name, r: r.rating, text: r.text, time: r.time_label, source: "google" }))
    : REVIEWS.map(r => ({ ...r, source: "google" }));
  const fReviews = fbReviews.map(r => ({ name: r.name, r: r.rating, text: r.text, time: r.review_date, source: "facebook" }));
  const allReviews = [...gReviews, ...fReviews];
  const avg = (allReviews.reduce((a, r) => a + r.r, 0) / allReviews.length).toFixed(1);

  return (
    <FadeIn>
    <section style={{ padding: "40px 24px 48px", background: "#fafafa" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GoogleG/>
              <span style={{ fontSize: 11, color: "#ccc" }}>+</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>{t("reviews.title")}</span>
            </div>
            <div style={{ width: 1, height: 24, background: "#e0e0e0" }}/>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1400}/></span>
              <div>
                <Stars n={Math.round(parseFloat(avg))} sz={15}/>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{t("reviews.count", { count: allReviews.length })}</div>
              </div>
            </div>
          </div>
          <button onClick={() => nav("reviews")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("reviews.seeAll")}</button>
        </div>

        <div style={{ position: "relative" }}>
          <div ref={revRef} className="hs" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
            {allReviews.slice(0, 10).map((rev, i) => (
              <div key={i} style={{ minWidth: 280, maxWidth: 310, flexShrink: 0, scrollSnapAlign: "start", padding: "18px", borderRadius: 12, background: "#fff", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff" }}>{rev.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
                  </div>
                  {rev.source === "google" ? <GoogleG/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg>}
                </div>
                <Stars n={rev.r} sz={14}/>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{rev.text}</p>
              </div>
            ))}
          </div>
          <button onClick={() => revRef.current?.scrollBy({ left: -340, behavior: "smooth" })} style={ab("left")}>&#8249;</button>
          <button onClick={() => revRef.current?.scrollBy({ left: 340, behavior: "smooth" })} style={ab("right")}>&#8250;</button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

// Full reviews page
export function ReviewsPage({ googleReviews = [] }) {
  const { t } = useTranslation();
  const reviews = googleReviews.length > 0
    ? googleReviews.map(r => ({ name: r.name, r: r.rating, text: r.text, time: r.time_label }))
    : REVIEWS;
  const avg = (reviews.reduce((a, r) => a + r.r, 0) / reviews.length).toFixed(1);

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
      <div style={{ textAlign: "center", padding: "24px 0 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{t("reviews.title")}</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1600}/></div>
        <div style={{ margin: "8px 0 6px" }}><Stars n={Math.round(parseFloat(avg))} sz={22}/></div>
        <div style={{ fontSize: 14, color: "#aaa" }}>{t("reviews.based", { count: reviews.length })}</div>

        {/* Rating distribution bars */}
        <div style={{ maxWidth: 280, margin: "20px auto 0" }}>
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.r === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
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

        <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 20, padding: "8px 20px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#555", textDecoration: "none" }}>
          {t("reviews.leaveReview")}
        </a>
      </div>

      {/* All reviews grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {reviews.map((rev, i) => (
          <div key={i} style={{ padding: "20px", borderRadius: 12, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" }}>{rev.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
              </div>
              <GoogleG/>
            </div>
            <Stars n={rev.r} sz={14}/>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "8px 0 0" }}>{rev.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
