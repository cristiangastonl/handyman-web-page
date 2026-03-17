import { useTranslation } from "react-i18next";
import { WA_LINK, svgP, getStyleConfig } from "../lib/constants";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function TailorJobs({ items, setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  const titleStyle = getStyleConfig(siteConfig, "carousel_tailor_jobs_title_style");
  if (!items.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: titleStyle.fontSize, fontFamily: `'${titleStyle.fontFamily}', sans-serif`, fontWeight: 700 }}>{t("tailorJobs.title")}</h2>
      </div>
      <Carousel items={items} onClickItem={item => setLb(item)}/>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
          {t("carousel.cta", "Interested? Ask me via WhatsApp")}
        </a>
      </div>
    </section>
    </FadeIn>
  );
}
