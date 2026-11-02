import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { R, PROFILE_IMG, parseSiteText, getHighlightField, pesoLetra, SECTION_X, SECTION_Y, ABOUT_TOP, TITLE_COLOR } from "../lib/constants";
import { FadeIn } from "./FadeIn";
import { useContenido } from "../lib/contenido";

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

// En el celu la foto flota y la bio la rodea. Anibal la quiere en el medio del
// párrafo, con renglones a lo ancho arriba y abajo ("los 4 renglones que quedaron
// abajo, pueden quedar dos arriba, dos abajo… y así la foto quedaría centrada",
// 28/10/2026). Un float no se puede ubicar a mitad de un texto, así que antes de la
// foto flota un separador de ancho 0 (.about-empuje) y la foto se apila debajo con
// clear: los renglones que pasan al lado del separador usan todo el ancho. Su alto
// sale de medir la bio, porque Anibal la edita desde el admin. Se repite la medida
// porque bajar la foto cambia dónde corta cada renglón; a la tercera ya no se mueve.
function useFotoCentrada(filaRef, deps) {
  useLayoutEffect(() => {
    const fila = filaRef.current;
    if (!fila || typeof window === "undefined" || !window.matchMedia) return;
    const celu = window.matchMedia("(max-width: 640px)");
    const medir = () => {
      const foto = fila.querySelector(":scope > img");
      const bio = fila.querySelector(":scope > div > p");
      if (!celu.matches || !foto || !bio) { fila.style.removeProperty("--empuje"); return; }
      // Alto de un renglón de la bio: el pie de la foto se alinea con el corte entre
      // dos renglones. Si cae a mitad de uno, ese renglón pasa al lado de la foto y
      // corta corto aunque la foto ya casi terminó (en el iPhone 17 Pro Max quedaba
      // así "live in, so … and get", 28/10/2026).
      const renglon = parseFloat(getComputedStyle(bio).lineHeight) || 0;
      let empuje = 0;
      for (let i = 0; i < 3; i++) {
        fila.style.setProperty("--empuje", `${empuje}px`);
        const arriba = fila.getBoundingClientRect().top;
        const b = bio.getBoundingClientRect();
        const alto = foto.offsetHeight;
        // El pie de la foto, centrada contra la bio, medido desde el arriba de la bio.
        let pie = (b.height + alto) / 2;
        if (renglon) pie = Math.round(pie / renglon) * renglon;
        empuje = Math.max(0, Math.round(b.top - arriba + pie - alto));
      }
      fila.style.setProperty("--empuje", `${empuje}px`);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(fila);
    document.fonts?.ready.then(medir);
    celu.addEventListener?.("change", medir);
    return () => { ro.disconnect(); celu.removeEventListener?.("change", medir); };
  }, deps);
}

export default function About({ nav, navToCategory, cats = [], siteConfig = {} }) {
  const { t } = useTranslation();
  const tc = useContenido();
  const filaRef = useRef(null);
  useFotoCentrada(filaRef, [siteConfig.bio_text, siteConfig.about_title]);
  // Tags mirror the real Portfolio categories the client uploads, not a hardcoded list.
  const realCats = cats.filter(c => c.id !== "all");
  const tags = realCats.length > 0
    ? realCats.map(c => ({ key: c.id, label: c.label, target: c.id }))
    : FALLBACK_SKILLS.map(s => ({ key: s, label: t(`about.skills.${s}`), target: s }));
  return (
    <FadeIn>
    <section style={{ padding: `${ABOUT_TOP}px ${SECTION_X}px ${SECTION_Y}px`, maxWidth: 940, margin: "0 auto" }}>
      {/* La foto va después del texto, a la derecha. Pedido de Anibal: "primero
          lees 'meet your handyman', y tu cerebro está listo para que cuando
          abren la puerta, pum, este es el gato". El título planta el contexto y
          recién ahí aparece la cara. En mobile el grid de constants.js hace lo
          mismo con las columnas. */}
      {/* La foto va PRIMERA en el DOM y no última: en mobile flota y el texto la
          envuelve, y un float sólo envuelve lo que viene después de él. En desktop
          el order la manda de vuelta a la derecha, así que se sigue leyendo el
          título antes que la cara, que es como lo quería Anibal. */}
      <div ref={filaRef} className="about-row" style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        {/* Sólo en el celu (constants.js): un float sin ancho que baja la foto hasta
            el medio de la bio. Ver useFotoCentrada. */}
        <span className="about-empuje" aria-hidden="true" style={{ display: "none" }}/>
        <img src={PROFILE_IMG} alt={t("alt.profile")} width={150} height={150} decoding="async" style={{ order: 2, width: 150, height: 150, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>
        <div style={{ order: 1, flex: 1, minWidth: 240 }}>
          {/* El fontFamily va explícito y no heredado del root: Anibal lo quiere
              atado a la misma familia que los títulos de las 3 tarjetas de abajo
              ("todo en DM Sans"), y heredarlo lo dejaba a merced de cualquier
              cambio futuro en la fuente base. */}
          {(() => { const titulo = parseSiteText(siteConfig.about_title); return (
          <h2 style={{
            fontSize: titulo?.fontSize ? `${titulo.fontSize}px` : 20,
            fontFamily: `'${titulo?.fontFamily || "DM Sans"}', sans-serif`,
            fontWeight: pesoLetra(titulo, 700), marginBottom: 6, color: TITLE_COLOR,
          }}>{tc(titulo?.text) || t("about.title")}</h2>); })()}
          {(() => { const bio = parseSiteText(siteConfig.bio_text); return (
          <p style={{
            fontSize: bio?.fontSize ? `${bio.fontSize}px` : 14,
            fontFamily: bio?.fontFamily ? `'${bio.fontFamily}', sans-serif` : undefined,
            fontWeight: pesoLetra(bio),
            color: "#555", lineHeight: 1.6, marginBottom: 6
          }}>
            {tc(bio?.text) || t("about.bio")}
          </p>); })()}
          <div className="skill-tags" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {tags.map(tag => (
              <button key={tag.key} className="skill-tag" onClick={() => navToCategory ? navToCategory(tag.target) : nav("portfolio")}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "transform .2s, box-shadow .2s, filter .2s",
                  // Delineado naranja oscuro, igual que PASTILLA en ui.jsx (26/10/2026).
                  background: TAG_FONDO, color: "#fff", border: `1px solid ${NARANJA_OSCURO}`,
                }}
                // Se oscurece con filter y no cambiando el fondo: CSS no sabe interpolar de
                // un gradiente a un color plano, así que al asignarlo se borraba el degradado
                // y por un frame se veía el blanco de la página detrás.
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = TAG_SOMBRA_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                {tc(tag.label)}
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
          <div key={n} data-testid="highlight-card" style={{ padding: "16px 18px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0", borderLeft: "3px solid #D4781F" }}>
            <div style={{ fontSize: title.fontSize, fontFamily: `'${title.fontFamily}', sans-serif`, fontWeight: pesoLetra(title, 700), color: TITLE_COLOR, marginBottom: 4, whiteSpace: "pre-line" }}>{tc(title.text)}</div>
            <div style={{ fontSize: body.fontSize, fontFamily: `'${body.fontFamily}', sans-serif`, fontWeight: pesoLetra(body), color: "#555", lineHeight: 1.55, whiteSpace: "pre-line" }}>{tc(body.text)}</div>
          </div>
          );
        })}
      </div>
    </section>
    </FadeIn>
  );
}
