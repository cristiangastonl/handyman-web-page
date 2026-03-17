import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R, PHONE, WA_LINK, SERVICE_AREAS, svgP, socialUrls, getStyleConfig } from "../lib/constants";
import { SocialIcon } from "./ui";

export default function Footer({ nav, siteConfig = {} }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const headStyle = getStyleConfig(siteConfig, "footer_heading_style");
  const hoursStyle = getStyleConfig(siteConfig, "footer_hours_style");
  const phone = siteConfig.footer_phone || PHONE;
  const hours = siteConfig.footer_hours_text || t("footer.hours");
  const areas = siteConfig.footer_service_areas || SERVICE_AREAS.map(a => a.name).join(" · ");

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try { await navigator.clipboard.writeText(url); } catch {
      const inp = document.createElement("input"); inp.value = url;
      document.body.appendChild(inp); inp.select(); document.execCommand("copy"); document.body.removeChild(inp);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer style={{ borderTop: "none", padding: "40px 24px 28px", background: "#3a3a3a" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* Top: Contact + Hours + Areas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: headStyle.fontSize, fontFamily: `'${headStyle.fontFamily}', sans-serif`, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{t("footer.contact")}</div>
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.85)", textDecoration: "none", marginBottom: 8 }}>{phone}</a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#25D366", textDecoration: "none", marginBottom: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
              WhatsApp
            </a>
            <div style={{ fontSize: hoursStyle.fontSize, fontFamily: `'${hoursStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{hours}</div>
          </div>
          <div>
            <div style={{ fontSize: headStyle.fontSize, fontFamily: `'${headStyle.fontFamily}', sans-serif`, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{t("serviceAreas.title")}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              {areas}
            </div>
          </div>
          <div>
            <div style={{ fontSize: headStyle.fontSize, fontFamily: `'${headStyle.fontFamily}', sans-serif`, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{t("footer.quickLinks", "Quick Links")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["home", "portfolio", "reviews", "faq"].map(p => (
                <span key={p} onClick={() => nav(p)} role="link" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") nav(p); }} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>{t(`nav.${p}`)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Social links — clean icon row */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            {[
              { type: "fb", url: socialUrls.fb, label: "Facebook" },
              { type: "yt", url: socialUrls.yt, label: "YouTube" },
              { type: "wa", url: WA_LINK, label: "WhatsApp" },
            ].map(s => (
              <a key={s.type} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s, transform .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <SocialIcon type={s.type} size={22}/>
              </a>
            ))}
          </div>

          {/* Subtle copy link */}
          <button onClick={copyLink}
            style={{ background: "none", border: `1px solid ${copied ? "#4CAF50" : R}`, borderRadius: 10, padding: "6px 16px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "border-color .2s, background .2s", color: copied ? "#4CAF50" : R, fontSize: 11, fontWeight: 600 }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = "rgba(212,120,31,0.12)"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {copied ? "Copied!" : t("footer.share", "Share this page")}
          </button>

          {/* Copyright */}
          <div style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            {t("footer.credit")} <a href="https://weekly-code-stream.vercel.app/es" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>CGL</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
