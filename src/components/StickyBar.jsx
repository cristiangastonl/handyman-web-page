import { useTranslation } from "react-i18next";
import { WA_LINK, svgP } from "../lib/constants";

export default function StickyBar({ scrollY, nav }) {
  const { t } = useTranslation();
  return (
    <div className="sticky-bar" style={{
      position: "fixed", top: 52, left: 0, right: 0, zIndex: 99,
      background: "rgba(26,26,26,0.95)", backdropFilter: "blur(10px)",
      transform: scrollY > 500 ? "translateY(0)" : "translateY(-100%)",
      opacity: scrollY > 500 ? 1 : 0,
      transition: "transform 0.35s ease, opacity 0.35s ease",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>{t("sticky.tagline")}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
            {t("sticky.whatsapp")}
          </a>
          <button onClick={() => nav("portfolio")}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            {t("sticky.seeWork")}
          </button>
        </div>
      </div>
    </div>
  );
}
