import { useTranslation } from "react-i18next";
import { R, svgP, socialUrls, WA_LINK } from "../lib/constants";
import { FadeIn, AnimatedCounter } from "./FadeIn";

export default function StatsBar() {
  const { t } = useTranslation();
  return (
    <>
      {/* Stats counters */}
      <FadeIn>
      <section style={{ padding: "32px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { val: 20, label: t("stats.experience"), suffix: "+", decimals: 0 },
            { val: 100, label: t("stats.reviews"), suffix: "+", decimals: 0 },
            { val: 400, label: t("stats.videos"), suffix: "+", decimals: 0 },
            { val: 900, label: t("stats.ytViews"), suffix: "K+", decimals: 0 },
            { val: 1400, label: t("stats.fbFollowers"), suffix: "+", decimals: 0 },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: R }}>
                {s.prefix || ""}<AnimatedCounter target={s.val} decimals={s.decimals ?? 1}/>{s.suffix}
              </div>
              <div style={{ fontSize: 11, color: "#777", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* Social proof cards */}
      <FadeIn>
      <section style={{ padding: "20px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", lineHeight: 1.6, whiteSpace: "pre-line" }}>{t("social.reviewsNote")}</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: svgP.fb, url: socialUrls.fb, text: t("social.fb") },
            { icon: svgP.yt, url: socialUrls.yt, text: t("social.yt") },
            { icon: svgP.wa, url: WA_LINK, text: t("social.wa") },
          ].map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ flex: "1 1 200px", maxWidth: 300, display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0", textDecoration: "none", transition: "border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#ddd"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#f0f0f0"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#999" style={{ flexShrink: 0, marginTop: 1 }}><path d={s.icon}/></svg>
              <span style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{s.text}</span>
            </a>
          ))}
        </div>
      </section>
      </FadeIn>
    </>
  );
}
