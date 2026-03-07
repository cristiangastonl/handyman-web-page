import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R, G, WA_LINK, svgP } from "../lib/constants";
import { FadeIn } from "./FadeIn";

function faqText(f, field, lang) {
  if (lang !== "en") {
    const translated = f[`${field}_${lang}`];
    if (translated) return translated;
  }
  return field === "question" ? f.q : f.a;
}

// Quick FAQs on home page
export function FAQHome({ faqs, nav }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  return (
    <FadeIn>
    <section style={{ padding: "40px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", background: "#fafafa", borderRadius: 14, padding: "28px 24px", border: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, textAlign: "center", color: "#222" }}>{t("faq.common")}</h2>
        {faqs.slice(0, 3).map((f, i) => (
          <div key={f.id || i} style={{ borderBottom: i < 2 ? "1px solid #e8e8e8" : "none", padding: "14px 0", borderLeft: `3px solid ${R}`, paddingLeft: 14, marginBottom: i < 2 ? 0 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#333" }}>{faqText(f, "question", lang)}</div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>{faqText(f, "answer", lang)}</div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
          <button onClick={() => nav("faq")} style={{ background: "none", border: "none", color: R, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{t("faq.viewAll")}</button>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
            {t("faq.askWhatsApp", "Ask me directly")}
          </a>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

// Full FAQ page
export function FAQPage({ faqs }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  const [fq, setFq] = useState(null);
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("faq.title")}</h2>
      {faqs.map((f, i) => {
        const isOpen = fq === i;
        return (
          <div key={f.id || i} style={{
            borderBottom: "1px solid #eee",
            background: isOpen ? "#fafafa" : "transparent",
            borderLeft: isOpen ? `3px solid ${R}` : "3px solid transparent",
            borderRadius: isOpen ? 8 : 0,
            marginBottom: isOpen ? 4 : 0,
            transition: "background .2s, border-color .2s",
          }}>
            <button onClick={() => setFq(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%", textAlign: "left", padding: "16px 14px",
                background: "none", border: "none", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 14, fontWeight: isOpen ? 600 : 500, color: isOpen ? G : "#333",
                transition: "color .2s",
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "none"; }}>
              {faqText(f, "question", lang)}
              <span style={{
                color: isOpen ? R : "#999", fontSize: 20, fontWeight: 300,
                transform: isOpen ? "rotate(45deg)" : "none",
                transition: "transform .2s, color .2s",
                flexShrink: 0, marginLeft: 12,
              }}>+</span>
            </button>
            <div style={{
              display: "grid",
              gridTemplateRows: isOpen ? "1fr" : "0fr",
              transition: "grid-template-rows .25s ease",
            }}>
              <div style={{ overflow: "hidden" }}>
                <p style={{ padding: "0 14px 16px", fontSize: 13, color: "#555", lineHeight: 1.65, margin: 0 }}>
                  {faqText(f, "answer", lang)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
          {t("faq.askWhatsApp", "Have another question? Ask me directly")}
        </a>
      </div>
    </div>
  );
}
