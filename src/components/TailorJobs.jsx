import { useTranslation } from "react-i18next";
import { getStyleConfig, SECTION_PAD_TIGHT, SECTION_TITLE_MB } from "../lib/constants";
import Carousel from "./Carousel";
import { SPEED_FACTORS } from "../lib/carouselSpeed";
import { FadeIn } from "./FadeIn";

export default function TailorJobs({ items, setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  const titleStyle = getStyleConfig(siteConfig, "carousel_tailor_jobs_title_style");
  if (!items.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: SECTION_PAD_TIGHT, maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SECTION_TITLE_MB }}>
        <h2 style={{ fontSize: titleStyle.fontSize, fontFamily: `'${titleStyle.fontFamily}', sans-serif`, fontWeight: 700 }}>{t("tailorJobs.title")}</h2>
      </div>
      <Carousel items={items} onClickItem={item => setLb(item, items)} speedFactor={SPEED_FACTORS.tailorJobs}/>
    </section>
    </FadeIn>
  );
}
