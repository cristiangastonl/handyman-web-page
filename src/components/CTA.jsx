import { useTranslation } from "react-i18next";
import { R, WA_LINK, svgP } from "../lib/constants";
import { FadeIn } from "./FadeIn";

export function TailoringCTA({ nav }) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={0.15}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{
        padding: "32px 28px", borderRadius: 14,
        background: `linear-gradient(135deg, ${R} 0%, #B5621A 50%, #4A4A4A 100%)`,
        color: "#fff", textAlign: "center",
        boxShadow: "0 8px 32px rgba(212,120,31,0.25)",
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t("tailoring.title")}</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 20px" }}>{t("tailoring.text")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: R, padding: "11px 26px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={R}><path d={svgP.wa}/></svg>
          {t("tailoring.button")}
        </a>
        <button onClick={() => nav("portfolio")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", padding: "11px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.5)", cursor: "pointer", transition: "background .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {t("tailoring.seeWork")}
        </button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

export function BottomCTA() {
  const { t } = useTranslation();
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "8px 24px 48px", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 32px", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", borderRadius: 16, color: "#fff" }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{t("cta.title")}</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{t("cta.subtitle")}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{t("cta.multilingual")}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{t("cta.description")}</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("cta.button")}
        </a>
      </div>
    </section>
    </FadeIn>
  );
}
