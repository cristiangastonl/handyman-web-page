import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R } from "../lib/constants";
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
    <section style={{ padding: "40px 24px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#777", marginBottom: 12, textAlign: "center" }}>{t("faq.common")}</div>
      {faqs.slice(0, 3).map((f, i) => (
        <div key={f.id || i} style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{faqText(f, "question", lang)}</div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{faqText(f, "answer", lang)}</div>
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={() => nav("faq")} style={{ background: "none", border: "none", color: R, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{t("faq.viewAll")}</button>
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
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("faq.title")}</h2>
      {faqs.map((f, i) => (
        <div key={f.id || i} style={{ borderBottom: "1px solid #f0f0f0" }}>
          <button onClick={() => setFq(fq === i ? null : i)}
            style={{ width: "100%", textAlign: "left", padding: "14px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, color: "#222" }}>
            {faqText(f, "question", lang)}
            <span style={{ color: "#ccc", fontSize: 16, transform: fq === i ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
          </button>
          {fq === i && <p style={{ padding: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6, margin: 0 }}>{faqText(f, "answer", lang)}</p>}
        </div>
      ))}
    </div>
  );
}
