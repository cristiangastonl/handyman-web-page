import { useTranslation } from "react-i18next";
import { PHONE, WA_LINK, SERVICE_AREAS, svgP } from "../lib/constants";
import { Socials } from "./ui";
import ShareBar from "./ShareButton";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ borderTop: "none", padding: "40px 24px 28px", background: "#4A4A4A" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{t("footer.contact")}</div>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 6 }}>{PHONE}</a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#25D366", textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
              WhatsApp
            </a>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{t("serviceAreas.title")}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              {SERVICE_AREAS.map(a => a.name).join(" · ")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{t("footer.hoursTitle")}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              {t("footer.hours")}<br/>
              {t("footer.emergency")}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 20, textAlign: "center" }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{t("footer.follow")}</div>
          <div style={{ display: "flex", justifyContent: "center" }}><Socials sz={15}/></div>
          <div style={{ marginTop: 16, marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{t("footer.share", "Share this page")}</div>
            <ShareBar/>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>{t("footer.credit")} <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Zipper</span></div>
        </div>
      </div>
    </footer>
  );
}
