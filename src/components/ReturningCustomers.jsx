import { useTranslation } from "react-i18next";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function ReturningCustomers({ returningCustomers, setLb }) {
  const { t } = useTranslation();
  if (!returningCustomers.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t("returningCustomers.title")}</h2>
      </div>
      <Carousel
        items={returningCustomers.map(h => ({ id: h.id, type: "image", src: h.image_url, title: h.title, desc: h.description }))}
        onClickItem={item => setLb(item)}
      />
    </section>
    </FadeIn>
  );
}
