import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, svgP, SERVICE_AREAS, getStyleConfig, pesoLetra, SECTION_PAD, SECTION_PAD_TIGHT } from "../lib/constants";
import { FadeIn } from "./FadeIn";
import BandaCentrada from "./BandaCentrada";

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
      <BandaCentrada py={34} px={28} style={{
        borderRadius: 14,
        background: `linear-gradient(180deg, ${R} 0%, #B5621A 50%, ${G} 100%)`,
        color: "#fff",
        boxShadow: "0 8px 32px rgba(212,120,31,0.25)",
      }}>
        <h3 style={{ fontSize: tTitleStyle.fontSize, fontFamily: `'${tTitleStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(tTitleStyle, 800), marginBottom: 12 }}>{t("tailoring.title")}</h3>
        <p style={{ fontSize: tTextStyle.fontSize, fontFamily: `'${tTextStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(tTextStyle), color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 20px" }}>{t("tailoring.text")}</p>
        {/* Un solo botón, "Let's chat" en el verde de WhatsApp: "See my work" se fue
            (Anibal, 26/10/2026). */}
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "11px 26px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("tailoring.button")}
        </a>
      </BandaCentrada>
    </section>
    </FadeIn>
  );
}

export function ServiceAreasCTA({ siteConfig = {} }) {
  const { t } = useTranslation();
  const tTitleStyle = getStyleConfig(siteConfig, "cta_tailoring_title_style");
  const tTextStyle = getStyleConfig(siteConfig, "cta_tailoring_text_style");
  const areasStr = siteConfig.site_service_areas || SERVICE_AREAS.map(a => a.name).join(" · ");
  const areaNames = areasStr.split("·").map(s => s.trim()).filter(Boolean);
  return (
    <FadeIn delay={0.15}>
    <section style={{ padding: SECTION_PAD_TIGHT, maxWidth: 940, margin: "0 auto" }}>
      <BandaCentrada py={26} px={28} style={{
        borderRadius: 14,
        background: `linear-gradient(180deg, ${R} 0%, #B5621A 50%, ${G} 100%)`,
        color: "#fff",
        boxShadow: "0 8px 32px rgba(212,120,31,0.25)",
      }}>
        {/* Título y bajada con el mismo estilo que "Need something specific?" (la
            otra banda naranja), incluido lo que se cambie en el admin para esa. Pedido
            de Anibal, 13/10/2026: "Service Areas quedó más chiquito y en gris el
            subtítulo; debería coincidir en color y tamaño". */}
        <h4 style={{ fontSize: tTitleStyle.fontSize, fontFamily: `'${tTitleStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(tTitleStyle, 800), marginBottom: 12 }}>{t("serviceAreas.title")}</h4>
        <p style={{ fontSize: tTextStyle.fontSize, fontFamily: `'${tTextStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(tTextStyle), color: "rgba(255,255,255,0.85)", marginBottom: 18 }}>{t("serviceAreas.subtitle")}</p>
        {/* Las zonas en una tirada de texto separada por puntos, como en el pie: con
            una pastilla por zona la banda ocupaba el doble ("reducir esta parte,
            hacerlo como el pie de página", Anibal, 26/10/2026). */}
        {/* .banda-centrada recorta los p a la línea de base, y la "g" de Thurgau
            colgaba abajo del recorte (27 px arriba contra 23 abajo en el celu): este
            recorta abajo al pie de las letras ("text") en vez de a la línea de base.
            Espacio duro antes del punto: si no, un renglón podía arrancar con "·". */}
        {/* 14 como el subtítulo: "28 a Service Areas y 14 a lo de abajo" (Anibal,
            02/11/2026). El título y el subtítulo ya salen del estilo de Tailoring
            en el admin (28 y 14); la banda no tiene campos propios y no los quiere. */}
        <p data-testid="zonas" style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 640, margin: 0, textBox: "trim-both cap text" }}>
          {areaNames.join(" · ")}
        </p>
      </BandaCentrada>
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
    {/* TIGHT: la sección de FAQs de arriba ya cierra con SECTION_Y. Abriendo con
        otro SECTION_Y quedaban 80 px arriba contra 40 abajo, y Anibal pidió el
        mismo aire de los dos lados (14/10/2026). */}
    <section style={{ padding: SECTION_PAD_TIGHT, textAlign: "center" }}>
      <BandaCentrada py={40} px={32} style={{ maxWidth: 600, margin: "0 auto", background: `linear-gradient(135deg, ${G} 0%, #3a3a3a 100%)`, borderRadius: 16, color: "#fff" }}>
        <h3 style={{ fontSize: bTitleStyle.fontSize, fontFamily: `'${bTitleStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(bTitleStyle, 800), marginBottom: 12 }}>{t("cta.title")}</h3>
        <p style={{ fontSize: bSubStyle.fontSize, fontFamily: `'${bSubStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(bSubStyle), color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>{t("cta.subtitle")}</p>
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("cta.button")}
        </a>
      </BandaCentrada>
    </section>
    </FadeIn>
  );
}
