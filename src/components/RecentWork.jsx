import { useTranslation } from "react-i18next";
import { getStyleConfig } from "../lib/constants";
import Carousel from "./Carousel";
import { carouselSource } from "../lib/carouselItems";
import { FadeIn } from "./FadeIn";

/**
 * Recent Work — el primer carrusel de la home.
 *
 * Sin filtros, sin contadores y sin "View all": es un carrusel igual a los
 * otros tres. Anibal los mandó a volar el 29/08/2026 ("en los otros carrouseles
 * no está y me parece mejor, es una info innecesaria"). Al portfolio se sigue
 * llegando desde el nav y desde los tags de categoría de la presentación.
 */
export function RecentWork({ items, curatedItems = [], setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  // Lo que curó el cliente manda entero; el fallback (lo último que subió al
  // portfolio) sí lleva tope, que ahí no hay una selección detrás.
  const { items: source } = carouselSource(curatedItems, items);
  const titleStyle = getStyleConfig(siteConfig, "carousel_recent_work_title_style");
  if (!source.length) return null;

  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "40px 24px", maxWidth: 940, margin: "0 auto" }}>
      <h2 style={{
        fontSize: titleStyle.fontSize,
        fontFamily: `'${titleStyle.fontFamily}', sans-serif`,
        fontWeight: 700,
        marginBottom: 14,
      }}>{t("recentWork.title")}</h2>
      <Carousel items={source} onClickItem={item => setLb(item, source)}/>
    </section>
    </FadeIn>
  );
}
