import { useTranslation } from "react-i18next";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export default function ReturningCustomers({ returningCustomers, curatedItems = [], setLb }) {
  const { t } = useTranslation();
  // Use curated carousel items if available, otherwise fallback to old returning_customers table data
  const displayItems = curatedItems.length > 0
    ? curatedItems
    : returningCustomers.map(h => ({ id: h.id, type: "image", src: h.image_url, title: h.title, desc: h.description }));
  if (!displayItems.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t("returningCustomers.title")}</h2>
      </div>
      <Carousel
        items={displayItems}
        onClickItem={item => setLb(item)}
      />
    </section>
    </FadeIn>
  );
}
