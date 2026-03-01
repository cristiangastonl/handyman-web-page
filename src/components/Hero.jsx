import { useTranslation } from "react-i18next";
import { WA_LINK, HERO_IMG, svgP } from "../lib/constants";

export default function Hero({ scrollY, nav, siteConfig = {} }) {
  const { t } = useTranslation();
  return (
    <section className="hero-section" style={{ position: "relative", height: "70vh", minHeight: 300, maxHeight: 600, overflow: "hidden" }}>
      <img src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" style={{ width: "100%", height: "120%", objectFit: "cover", transform: `translateY(${scrollY * -0.08}px)`, willChange: "transform" }}/>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)" }}/>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 44px" }}>
        <div className="heroContent" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 42px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,0.7)", marginBottom: 8, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
            {siteConfig.hero_title || t("hero.title")}
          </h1>
          <p style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", marginBottom: 6, fontStyle: "italic", fontFamily: "'Dancing Script', cursive", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            {t("brand.subtitle")}
          </p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>
            {siteConfig.hero_subtitle || t("hero.subtitle")}
          </p>
          <div style={{ marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 10 }}>
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
