import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R } from "../lib/constants";
import Carousel from "./Carousel";
import { FadeIn } from "./FadeIn";

export function RecentWork({ items, setLb, nav }) {
  const { t } = useTranslation();
  const photos = items.filter(w => w.type === "image");
  const videos = items.filter(w => w.type === "video");
  const [tab, setTab] = useState("all");
  if (!items.length) return null;

  const displayItems = tab === "photos" ? photos.slice(0, 8)
    : tab === "videos" ? videos.slice(0, 8)
    : items.slice(0, 10);

  return (
    <FadeIn delay={0.1}>
    <section style={{ padding: "40px 24px", maxWidth: 940, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t("recentWork.title")}</h2>
          <div style={{ display: "flex", gap: 0, background: "#f5f5f5", borderRadius: 8, padding: 2 }}>
            <button onClick={() => setTab("all")}
              style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: tab === "all" ? "#fff" : "transparent", color: tab === "all" ? R : "#999", boxShadow: tab === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all .2s" }}>
              All ({items.length})
            </button>
            {videos.length > 0 && (
              <button onClick={() => setTab("videos")}
                style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: tab === "videos" ? "#fff" : "transparent", color: tab === "videos" ? R : "#999", boxShadow: tab === "videos" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all .2s" }}>
                {t("portfolio.videos")} ({videos.length})
              </button>
            )}
            {photos.length > 0 && (
              <button onClick={() => setTab("photos")}
                style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: tab === "photos" ? "#fff" : "transparent", color: tab === "photos" ? R : "#999", boxShadow: tab === "photos" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all .2s" }}>
                {t("portfolio.photos")} ({photos.length})
              </button>
            )}
          </div>
        </div>
        <button onClick={() => nav("portfolio")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("recentWork.viewAll")}</button>
      </div>
      {displayItems.length > 0 && <Carousel items={displayItems} onClickItem={setLb}/>}
    </section>
    </FadeIn>
  );
}
