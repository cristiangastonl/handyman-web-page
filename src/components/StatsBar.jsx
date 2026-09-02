import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, getYtPlaylistsUrl, getStyleConfig, STATS, getStatValue, getStatUnit, formatStatSuffix } from "../lib/constants";
import { SocialIcon } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";

export default function StatsBar({ siteConfig = {} }) {
  const { t } = useTranslation();
  const numStyle = getStyleConfig(siteConfig, "stats_number_style");
  const lblStyle = getStyleConfig(siteConfig, "stats_label_style");
  const redes = getSocialUrls(siteConfig);
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* Stats counters */}
      <FadeIn>
      <section className="stats-section" style={{ padding: "28px 24px", background: G }}>
        <div className="stats-grid" style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.key} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: numStyle.fontSize, fontFamily: `'${numStyle.fontFamily}', sans-serif`, fontWeight: 800, color: R }}>
                <AnimatedCounter target={getStatValue(siteConfig, s)} decimals={s.decimals}/>
                {formatStatSuffix(getStatUnit(siteConfig, s.key, s.defaultUnit))}
              </div>
              <div style={{ fontSize: lblStyle.fontSize, fontFamily: `'${lblStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{t(s.i18nKey)}</div>
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
            { type: "fb", url: redes.fb, text: t("social.fb"), label: "Facebook" },
            { type: "yt", url: getYtPlaylistsUrl(siteConfig), text: t("social.yt"), label: "YouTube" },
            { type: "wa", url: redes.wa, text: t("social.wa"), label: "WhatsApp" },
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
