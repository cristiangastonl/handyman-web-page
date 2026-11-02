// src/components/Cierre.jsx
//
// La caja de cierre de /faq y /portfolio: una pregunta y el botón verde de
// WhatsApp. Antes cada página tenía la suya copiada a mano; Anibal pidió que
// "tienen que ser el mismo componente, con tipografía" y que los dos textos se
// editen desde el admin (26/10/2026). La pregunta sale en Caveat por defecto.
// El 02/11/2026 sumó un subtítulo en DM Sans (como "Ready to get started?") para
// /portfolio y /reviews, y el cierre de /reviews volvió: en vez del botón de
// WhatsApp lleva los dos de "Leave a review", que le pasa la página como children.

import { useTranslation } from "react-i18next";
import { svgP, getSocialUrls, parseSiteText, pesoLetra, SITE_TEXTS, SECTION_Y, G, BORDE_PASTILLA } from "../lib/constants";
import { useContenido } from "../lib/contenido";
import BandaCentrada from "./BandaCentrada";

// Texto de site_config con su tipografía; sin editar, la traducción de cada idioma
// y el tamaño y la fuente por defecto de SITE_TEXTS.
function useTexto(siteConfig, key, i18nKey, pesoDeSiempre = 600) {
  const { t } = useTranslation();
  const tc = useContenido();
  const def = SITE_TEXTS[key];
  if (!def) return null;
  const p = parseSiteText(siteConfig[key]) || {};
  const familia = p.fontFamily || def.defaultFontFamily;
  return {
    text: p.text ? tc(p.text) : t(i18nKey),
    style: {
      fontSize: `${p.fontSize || def.defaultFontSize}px`,
      fontFamily: `'${familia}', sans-serif`,
      fontWeight: pesoLetra({ ...p, fontFamily: familia }, pesoDeSiempre),
    },
  };
}

export default function Cierre({ cual, siteConfig = {}, children }) {
  const titulo = useTexto(siteConfig, `cierre_${cual}_titulo`, `cierre.${cual}.titulo`);
  const subtitulo = useTexto(siteConfig, `cierre_${cual}_subtitulo`, `cierre.${cual}.subtitulo`, 400);
  const boton = useTexto(siteConfig, `cierre_${cual}_boton`, `cierre.${cual}.boton`);
  return (
    <BandaCentrada data-testid={`${cual}-cierre`} py={24} px={20} style={{ marginTop: SECTION_Y, background: "#fafafa", borderRadius: 12, border: BORDE_PASTILLA }}>
      {/* BandaCentrada recorta el aire invisible de cada renglón, así que las colas
          de Caveat (la "y", la "p") cuelgan fuera de la caja del título: con 6 px
          pisaban el subtítulo. 14 deja aire visible entre los dos. */}
      <p data-cierre="titulo" style={{ ...titulo.style, color: G, marginBottom: subtitulo ? 14 : 10 }}>{titulo.text}</p>
      {subtitulo && (
        <p data-cierre="subtitulo" style={{ ...subtitulo.style, color: "#666", lineHeight: 1.55, maxWidth: 640, margin: "0 auto 16px" }}>{subtitulo.text}</p>
      )}
      {boton && (
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 10, textDecoration: "none", transition: "transform .2s", ...boton.style }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {boton.text}
        </a>
      )}
      {children}
    </BandaCentrada>
  );
}
