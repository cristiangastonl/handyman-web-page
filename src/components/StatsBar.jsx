import { useTranslation } from "react-i18next";
import { R, G, socialIcons, socialUrls, WA_LINK } from "../lib/constants";
import { FadeIn, AnimatedCounter } from "./FadeIn";

export default function StatsBar() {
  const { t } = useTranslation();
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* Stats counters */}
      <FadeIn>
      <section style={{ padding: "28px 24px", background: G }}>
        <div style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { val: 20, label: t("stats.experience"), suffix: "+", decimals: 0 },
            { val: 100, label: t("stats.reviews"), suffix: "+", decimals: 0 },
            { val: 400, label: t("stats.videos"), suffix: "+", decimals: 0 },
            { val: 900, label: t("stats.ytViews"), suffix: "K+", decimals: 0 },
            { val: 1400, label: t("stats.fbFollowers"), suffix: "+", decimals: 0 },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: R }}>
                {s.prefix || ""}<AnimatedCounter target={s.val} decimals={s.decimals ?? 1}/>{s.suffix}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* Social proof cards */}
      <FadeIn>
      <section style={{ padding: "20px 24px 28px", maxWidth: 940, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: "#666", fontStyle: "italic", lineHeight: 1.6, whiteSpace: "pre-line" }}>{t("social.reviewsNote")}</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: socialIcons.fb, url: socialUrls.fb, text: t("social.fb"), label: "Facebook" },
            { icon: socialIcons.yt, url: socialUrls.yt, text: t("social.yt"), label: "YouTube" },
            { icon: socialIcons.wa, url: WA_LINK, text: t("social.wa"), label: "WhatsApp" },
          ].map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ flex: "1 1 200px", maxWidth: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 14px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0", textDecoration: "none", transition: "border-color .2s", textAlign: "center" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = R}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#f0f0f0"}>
              <img src={s.icon} alt={s.label} width={28} height={28} style={{ flexShrink: 0, borderRadius: 6, objectFit: "cover" }}/>
              <span style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{s.text}</span>
            </a>
          ))}
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
