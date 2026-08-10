import { useTranslation } from "react-i18next";
import { R, G, socialUrls, WA_LINK, getStyleConfig } from "../lib/constants";
import { SocialIcon } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";

export default function StatsBar({ siteConfig = {} }) {
  const { t } = useTranslation();
  const stat = (key, fallback) => Number(siteConfig[key]) || fallback;
  // yt_views / fb_followers switched units (K→M and units→K). Values stored under the old
  // scheme are large integers (e.g. 950 meaning 950K); ignore them in favour of the current
  // default until they're re-entered from the admin in the new unit.
  const unitStat = (key, fallback, legacyThreshold) => {
    const v = stat(key, fallback);
    return v >= legacyThreshold ? fallback : v;
  };
  const numStyle = getStyleConfig(siteConfig, "stats_number_style");
  const lblStyle = getStyleConfig(siteConfig, "stats_label_style");
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* Stats counters */}
      <FadeIn>
      <section className="stats-section" style={{ padding: "28px 24px", background: G }}>
        <div className="stats-grid" style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { val: stat("stat_experience", 20), label: t("stats.experience"), suffix: "+", decimals: 0 },
            { val: stat("stat_videos", 400), label: t("stats.videos"), suffix: "+", decimals: 0 },
            { val: unitStat("stat_yt_views", 1.3, 100), label: t("stats.ytViews"), suffix: "M+", decimals: 1 },
            { val: unitStat("stat_fb_followers", 1.4, 100), label: t("stats.fbFollowers"), suffix: "K+", decimals: 1 },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: numStyle.fontSize, fontFamily: `'${numStyle.fontFamily}', sans-serif`, fontWeight: 800, color: R }}>
                {s.prefix || ""}<AnimatedCounter target={s.val} decimals={s.decimals ?? 1}/>{s.suffix}
              </div>
              <div style={{ fontSize: lblStyle.fontSize, fontFamily: `'${lblStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* Social proof cards */}
      <FadeIn>
      <section className="social-cards" style={{ padding: "20px 24px 28px", maxWidth: 940, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { type: "fb", url: socialUrls.fb, text: t("social.fb"), label: "Facebook" },
            { type: "yt", url: socialUrls.yt, text: t("social.yt"), label: "YouTube" },
            { type: "wa", url: WA_LINK, text: t("social.wa"), label: "WhatsApp" },
          ].map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="social-card"
              style={{ flex: "1 1 200px", maxWidth: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 14px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0", textDecoration: "none", transition: "border-color .2s", textAlign: "center" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = R}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#f0f0f0"}>
              <SocialIcon type={s.type} size={28}/>
              <span style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{s.text}</span>
            </a>
          ))}
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
