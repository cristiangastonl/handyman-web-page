import { useTranslation } from "react-i18next";
import { WA_LINK, HERO_IMG, svgP } from "../lib/constants";

export default function Hero({ scrollY, nav, siteConfig = {} }) {
  const { t } = useTranslation();
  return (
    <section className="hero-section" style={{ position: "relative", height: "38vh", minHeight: 240, maxHeight: 380, overflow: "hidden" }}>
      <img src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" fetchPriority="high" style={{ width: "100%", height: "120%", objectFit: "cover", transform: `translateY(${scrollY * -0.08}px)`, willChange: "transform" }}/>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)" }}/>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 20px" }}>
        <div className="heroContent" style={{ maxWidth: 940, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,0.7)", marginBottom: 4, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
            {siteConfig.hero_title || t("hero.title")}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 3, fontStyle: "italic", fontFamily: "'Dancing Script', cursive", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            {t("brand.subtitle")}
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>
            {siteConfig.hero_subtitle || t("hero.subtitle")}
          </p>
          <div style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
              {t("hero.whatsapp")}
            </a>
            <button onClick={() => nav("portfolio")} style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              {t("hero.seeWork")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
