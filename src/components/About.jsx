import { useTranslation } from "react-i18next";
import { R, PROFILE_IMG, parseSiteText, getHighlightField } from "../lib/constants";
import { FadeIn } from "./FadeIn";

// Fallback skill tags for when no categories exist yet (fresh install / Supabase down).
const FALLBACK_SKILLS = ["electricity", "plumbing", "assembly", "fixings", "gardening", "wallMounting"];

// El gradiente del banner de Service Areas (CTA.jsx:51), acotado a su mitad naranja: ese
// gradiente termina en gris, y en una pastilla de ~34px de alto el tramo gris la ensucia.
const NARANJA_OSCURO = "#B5621A";
const TAG_FONDO = `linear-gradient(180deg, ${R} 0%, ${NARANJA_OSCURO} 100%)`;

// La forma sale de los chips de zonas de ese mismo banner —radius 8, padding 8x16, peso
// 600—: el sitio no usa pastillas de radius 16 en ningún otro lado. Y el hover que sube y
// tiñe la sombra de naranja es el de las tarjetas de categoría del Portfolio, que son este
// mismo contenido en la otra página; así el tag se comporta como la tarjeta a la que lleva.
const TAG_SOMBRA_HOVER = "0 8px 28px rgba(212,120,31,0.28)";

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
      {/* La foto va después del texto, a la derecha. Pedido de Anibal: "primero
          lees 'meet your handyman', y tu cerebro está listo para que cuando
          abren la puerta, pum, este es el gato". El título planta el contexto y
          recién ahí aparece la cara. En mobile el grid de constants.js hace lo
          mismo con las columnas. */}
      <div className="about-row" style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
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
          <div className="skill-tags" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {tags.map(tag => (
              <button key={tag.key} className="skill-tag" onClick={() => navToCategory ? navToCategory(tag.target) : nav("portfolio")}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "transform .2s, box-shadow .2s, filter .2s",
                  background: TAG_FONDO, color: "#fff", border: "1px solid transparent",
                }}
                // Se oscurece con filter y no cambiando el fondo: CSS no sabe interpolar de
                // un gradiente a un color plano, así que al asignarlo se borraba el degradado
                // y por un frame se veía el blanco de la página detrás.
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = TAG_SOMBRA_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>
        <img src={PROFILE_IMG} alt="Professional handyman in Zurich - specialist for home repairs" style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>
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
