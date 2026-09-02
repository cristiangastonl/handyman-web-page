import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, svgP, SERVICE_AREAS, getStyleConfig, SECTION_PAD, SECTION_PAD_TIGHT } from "../lib/constants";
import { MapPin } from "./ui";
import { FadeIn } from "./FadeIn";

export function TailoringCTA({ nav, siteConfig = {} }) {
  const { t } = useTranslation();
  const tTitleStyle = getStyleConfig(siteConfig, "cta_tailoring_title_style");
  const tTextStyle = getStyleConfig(siteConfig, "cta_tailoring_text_style");
  return (
    <FadeIn delay={0.15}>
    {/* Cierra con SECTION_Y como todo lo demás. Con 12 el título de Highlights
        quedaba pegado al banner: 12px de aire contra los 40 de los otros dos
        carruseles. Fue lo que se me escapó al normalizar los márgenes. */}
    <section style={{ padding: SECTION_PAD_TIGHT, maxWidth: 940, margin: "0 auto" }}>
      <div style={{
        padding: "36px 28px 32px", borderRadius: 14,
        background: `linear-gradient(180deg, ${R} 0%, #B5621A 50%, ${G} 100%)`,
        color: "#fff", textAlign: "center",
        boxShadow: "0 8px 32px rgba(212,120,31,0.25)",
      }}>
        <h3 style={{ fontSize: tTitleStyle.fontSize, fontFamily: `'${tTitleStyle.fontFamily}', sans-serif`, fontWeight: 800, marginBottom: 8 }}>{t("tailoring.title")}</h3>
        <p style={{ fontSize: tTextStyle.fontSize, fontFamily: `'${tTextStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 20px" }}>{t("tailoring.text")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
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

export function ServiceAreasCTA({ siteConfig = {} }) {
  const { t } = useTranslation();
  const areasStr = siteConfig.site_service_areas || SERVICE_AREAS.map(a => a.name).join(" · ");
  const areaNames = areasStr.split("·").map(s => s.trim()).filter(Boolean);
  return (
    <FadeIn delay={0.15}>
    <section style={{ padding: SECTION_PAD_TIGHT, maxWidth: 940, margin: "0 auto" }}>
      <div style={{
        padding: "28px 28px 32px", borderRadius: 14,
        background: `linear-gradient(180deg, ${R} 0%, #B5621A 50%, ${G} 100%)`,
        color: "#fff", textAlign: "center",
        boxShadow: "0 8px 32px rgba(212,120,31,0.25)",
      }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t("serviceAreas.title")}</h4>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>{t("serviceAreas.subtitle")}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {areaNames.map(name => (
            <div key={name} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
            }}>
              <MapPin size={13} color="rgba(255,255,255,0.7)"/>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

export function BottomCTA({ siteConfig = {} }) {
  const { t } = useTranslation();
  const bTitleStyle = getStyleConfig(siteConfig, "cta_bottom_title_style");
  const bSubStyle = getStyleConfig(siteConfig, "cta_bottom_subtitle_style");
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: SECTION_PAD, textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 32px", background: `linear-gradient(135deg, ${G} 0%, #3a3a3a 100%)`, borderRadius: 16, color: "#fff" }}>
        <h3 style={{ fontSize: bTitleStyle.fontSize, fontFamily: `'${bTitleStyle.fontFamily}', sans-serif`, fontWeight: 800, marginBottom: 8 }}>{t("cta.title")}</h3>
        <p style={{ fontSize: bSubStyle.fontSize, fontFamily: `'${bSubStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>{t("cta.subtitle")}</p>
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("cta.button")}
        </a>
      </div>
    </section>
    </FadeIn>
  );
}
