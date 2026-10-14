import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, svgP, SECTION_PAD, SECTION_Y } from "../lib/constants";
import { FadeIn } from "./FadeIn";
import BandaCentrada from "./BandaCentrada";

function faqText(f, field, lang) {
  if (lang !== "en") {
    const translated = f[`${field}_${lang}`];
    if (translated) return translated;
  }
  return field === "question" ? f.q : f.a;
}

// Quick FAQs on home page
export function FAQHome({ faqs, nav, siteConfig = {} }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  return (
    <FadeIn>
    <section style={{ padding: SECTION_PAD }}>
      <div style={{ maxWidth: 600, margin: "0 auto", background: "#fafafa", borderRadius: 14, padding: "28px 24px", border: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, textAlign: "center", color: "#222" }}>{t("faq.common")}</h2>
        {faqs.slice(0, 3).map((f, i) => (
          <div key={f.id || i} style={{ borderBottom: i < 2 ? "1px solid #e8e8e8" : "none", padding: "14px 0", borderLeft: `3px solid ${R}`, paddingLeft: 14, marginBottom: i < 2 ? 0 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#333" }}>{faqText(f, "question", lang)}</div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>{faqText(f, "answer", lang)}</div>
          </div>
        ))}
        {/* Sin el atajo verde a WhatsApp: en la home el cliente lo pidió fuera y
            queda sólo el paso a la página de preguntas. En /faq sí sobrevive, pero
            en naranja — ver FAQPage. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 18 }}>
          <button onClick={() => nav("faq")} style={{ background: "none", border: "none", color: R, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{t("faq.viewAll")}</button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

// Full FAQ page
export function FAQPage({ faqs, siteConfig = {} }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  const [fq, setFq] = useState(null);
  return (
    // Cierra con SECTION_Y y no con 80: la caja de "Have another question?" tiene
    // SECTION_Y arriba, y Anibal pidió el mismo aire arriba y abajo (14/10/2026).
    <div style={{ maxWidth: 600, margin: "0 auto", padding: `32px 24px ${SECTION_Y}px` }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("faq.title")}</h1>
      {faqs.map((f, i) => {
        const isOpen = fq === i;
        return (
          // El palito naranja va siempre, abierta o cerrada, para que la página se
          // lea como el bloque de "top questions" de la home, donde las tres
          // preguntas lo tienen fijo. Lo que marca el hover es la sombra.
          <div key={f.id || i} style={{
            borderBottom: "1px solid #eee",
            background: isOpen ? "#fafafa" : "transparent",
            borderLeft: `3px solid ${R}`,
            borderRadius: 8,
            marginBottom: 4,
            transition: "background .2s, box-shadow .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,120,31,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
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
      {/* El mismo cierre que el de /portfolio: título en negro y el botón verde de
          WhatsApp con su logo. Antes era un link naranja chico de una línea. Pedido
          de Anibal (13/10/2026): "ese botón al pie de portfolio debería ser el mismo
          al pie de FAQs". */}
      <BandaCentrada data-testid="faq-cierre" py={24} px={20} style={{ marginTop: SECTION_Y, background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: G, marginBottom: 10 }}>{t("faq.anotherQuestion")}</p>
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("faq.askDirectly")}
        </a>
      </BandaCentrada>
    </div>
  );
}
