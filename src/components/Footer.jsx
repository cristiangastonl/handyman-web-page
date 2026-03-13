import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R, PHONE, WA_LINK, SERVICE_AREAS, svgP, socialUrls } from "../lib/constants";
import { SocialIcon } from "./ui";

export default function Footer() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

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

        {/* Top: Contact + Areas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{t("footer.contact")}</div>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.8)", textDecoration: "none", marginBottom: 8 }}>{PHONE}</a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#25D366", textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
              WhatsApp
            </a>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{t("serviceAreas.title")}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              {SERVICE_AREAS.map(a => a.name).join(" · ")}
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
            style={{ background: "none", border: `1px solid ${copied ? "#4CAF50" : R}`, borderRadius: 8, padding: "6px 16px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "border-color .2s, background .2s", color: copied ? "#4CAF50" : R, fontSize: 11, fontWeight: 600 }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = "rgba(212,120,31,0.12)"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {copied ? "Copied!" : t("footer.share", "Share this page")}
          </button>

          {/* Copyright */}
          <div style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginTop: 4 }}>
            {t("footer.credit")} <a href="https://weekly-code-stream.vercel.app/es" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>CGL</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
