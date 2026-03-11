import { useTranslation } from "react-i18next";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function TailorJobs({ items, setLb }) {
  const { t } = useTranslation();
  if (!items.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t("tailorJobs.title")}</h2>
      </div>
      <Carousel items={items} onClickItem={item => setLb(item)}/>
    </section>
    </FadeIn>
  );
}
