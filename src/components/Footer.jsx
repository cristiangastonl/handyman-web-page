import { useTranslation } from "react-i18next";
import { PHONE, WA_LINK, SERVICE_AREAS, svgP } from "../lib/constants";
import { Socials } from "./ui";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ borderTop: "1px solid #f0f0f0", padding: "40px 24px 28px", background: "#fafafa" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#333" }}>{t("footer.contact")}</div>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} style={{ display: "block", fontSize: 13, color: "#666", textDecoration: "none", marginBottom: 6 }}>{PHONE}</a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#25D366", textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
              WhatsApp
            </a>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#333" }}>{t("serviceAreas.title")}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
              {SERVICE_AREAS.map(a => a.name).join(" · ")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#333" }}>{t("footer.hours")}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
              Mon–Sat: 08:00–18:00<br/>
              {t("footer.emergency")}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #eee", paddingTop: 20, textAlign: "center" }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 16, color: "#ccc", marginBottom: 10 }}>{t("footer.follow")}</div>
          <div style={{ display: "flex", justifyContent: "center" }}><Socials sz={15} color="#bbb"/></div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "#ccc" }}>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          </div>
          <div style={{ fontSize: 10, color: "#ddd", marginTop: 6 }}>{t("footer.credit")} <span style={{ fontWeight: 600, color: "#bbb" }}>Zipper</span></div>
        </div>
      </div>
    </footer>
  );
}
