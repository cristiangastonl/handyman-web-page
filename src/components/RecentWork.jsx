import { useTranslation } from "react-i18next";
import { R, ytThumb } from "../lib/constants";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export function RecentWork({ items, setLb, nav }) {
  const { t } = useTranslation();
  if (!items.length) return null;
  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "8px 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t("recentWork.title")}</h2>
        <button onClick={() => nav("portfolio")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("recentWork.viewAll")}</button>
      </div>
      <Carousel items={items.slice(0, 6)} onClickItem={setLb}/>
    </section>
    </FadeIn>
  );
}

export function VideoShowcase({ items, setLb, nav }) {
  const { t } = useTranslation();
  const videos = items.filter(w => w.type === "video");
  if (!videos.length) return null;
  return (
    <FadeIn delay={0.15}>
    <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill={R} style={{ verticalAlign: "-3px", marginRight: 6 }}><path d="M6 4l10 6-10 6V4z"/></svg>
          {t("videos.title")}
        </h2>
        <button onClick={() => nav("portfolio")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("videos.viewAll")}</button>
      </div>
      <Carousel items={videos} onClickItem={setLb}/>
    </section>
    </FadeIn>
  );
}
