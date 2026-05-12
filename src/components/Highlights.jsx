import { useTranslation } from "react-i18next";
import { WA_LINK, svgP, parseSiteText } from "../lib/constants";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function Highlights({ highlights, curatedItems = [], setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  const titleCfg = parseSiteText(siteConfig.highlights_section_title);
  // Use curated carousel items if available, otherwise fallback to old highlights table data
  const displayItems = curatedItems.length > 0
    ? curatedItems
    : highlights.map(h => ({ id: h.id, type: "image", src: h.image_url, title: h.title, desc: h.description }));
  if (!displayItems.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{
          fontSize: titleCfg?.fontSize ? `${titleCfg.fontSize}px` : 18,
          fontFamily: titleCfg?.fontFamily ? `'${titleCfg.fontFamily}', sans-serif` : undefined,
          fontWeight: 700
        }}>{titleCfg?.text || t("highlights.title")}</h2>
      </div>
      <Carousel
        items={displayItems}
        onClickItem={item => setLb(item, displayItems)}
      />
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
