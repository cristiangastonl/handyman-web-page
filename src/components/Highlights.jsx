import { useTranslation } from "react-i18next";
import { parseSiteText, getStyleConfig, SECTION_PAD_TIGHT, SECTION_TITLE_MB } from "../lib/constants";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function Highlights({ highlights, curatedItems = [], setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  // El texto sigue siendo editable (es el único de los tres que lo es), pero el
  // tamaño y la fuente salen del mismo StyleControl que Recent Work y Custom
  // Projects. Antes los sacaba del propio highlights_section_title, que tenía un
  // fontSize 17 guardado en el admin y le ganaba a cualquier default: el título
  // se veía más chico que los otros dos.
  const titleCfg = parseSiteText(siteConfig.highlights_section_title);
  const titleStyle = getStyleConfig(siteConfig, "carousel_highlights_title_style");
  // Use curated carousel items if available, otherwise fallback to old highlights table data
  const displayItems = curatedItems.length > 0
    ? curatedItems
    : highlights.map(h => ({ id: h.id, type: "image", src: h.image_url, title: h.title, desc: h.description }));
  if (!displayItems.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: SECTION_PAD_TIGHT, maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SECTION_TITLE_MB }}>
        <h2 style={{
          fontSize: titleStyle.fontSize,
          fontFamily: `'${titleStyle.fontFamily}', sans-serif`,
          fontWeight: 700
        }}>{titleCfg?.text || t("highlights.title")}</h2>
      </div>
      <Carousel
        items={displayItems}
        onClickItem={item => setLb(item, displayItems)}
      />
    </section>
    </FadeIn>
  );
}
