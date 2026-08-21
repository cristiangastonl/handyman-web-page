import { useTranslation } from "react-i18next";
import { R, PROFILE_IMG, parseSiteText, getHighlightField } from "../lib/constants";
import { FadeIn } from "./FadeIn";

// Fallback skill tags for when no categories exist yet (fresh install / Supabase down).
const FALLBACK_SKILLS = ["electricity", "plumbing", "assembly", "fixings", "gardening", "wallMounting"];

// El naranja de marca oscurecido. El #D4781F puro no llega al contraste mínimo
// de accesibilidad para texto chico; sobre este sí se lee bien el blanco.
const NARANJA_OSCURO = "#B5641A";

export default function About({ nav, navToCategory, cats = [], siteConfig = {} }) {
  const { t } = useTranslation();
  // Tags mirror the real Portfolio categories the client uploads, not a hardcoded list.
  const realCats = cats.filter(c => c.id !== "all");
  const tags = realCats.length > 0
    ? realCats.map(c => ({ key: c.id, label: c.label, target: c.id }))
    : FALLBACK_SKILLS.map(s => ({ key: s, label: t(`about.skills.${s}`), target: s }));
  return (
    <FadeIn>
    <section style={{ padding: "40px 24px", maxWidth: 940, margin: "0 auto" }}>
      <div className="about-row" style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <img src={PROFILE_IMG} alt="Professional handyman in Zurich - specialist for home repairs" style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{t("about.title")}</h2>
          {(() => { const bio = parseSiteText(siteConfig.bio_text); return (
          <p style={{
            fontSize: bio?.fontSize ? `${bio.fontSize}px` : 14,
            fontFamily: bio?.fontFamily ? `'${bio.fontFamily}', sans-serif` : undefined,
            color: "#555", lineHeight: 1.6, marginBottom: 6
          }}>
            {bio?.text || t("about.bio")}
          </p>); })()}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {tags.map(tag => (
              <button key={tag.key} className="skill-tag" onClick={() => navToCategory ? navToCategory(tag.target) : nav("portfolio")}
                style={{
                  padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "background .2s, border-color .2s",
                  background: R, color: "#fff", border: `1px solid ${R}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = NARANJA_OSCURO; e.currentTarget.style.borderColor = NARANJA_OSCURO; }}
                onMouseLeave={e => { e.currentTarget.style.background = R; e.currentTarget.style.borderColor = R; }}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Highlight cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 28 }}>
        {[1, 2, 3].map(n => {
          const title = getHighlightField(siteConfig, `about_highlight${n}_title`, t(`about.highlight${n}.title`));
          const body = getHighlightField(siteConfig, `about_highlight${n}_text`, t(`about.highlight${n}.text`));
          return (
          <div key={n} style={{ padding: "16px 18px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0", borderLeft: "3px solid #D4781F" }}>
            <div style={{ fontSize: title.fontSize, fontFamily: `'${title.fontFamily}', sans-serif`, fontWeight: 700, color: "#333", marginBottom: 4, whiteSpace: "pre-line" }}>{title.text}</div>
            <div style={{ fontSize: body.fontSize, fontFamily: `'${body.fontFamily}', sans-serif`, color: "#555", lineHeight: 1.55, whiteSpace: "pre-line" }}>{body.text}</div>
          </div>
          );
        })}
      </div>
    </section>
    </FadeIn>
  );
}
