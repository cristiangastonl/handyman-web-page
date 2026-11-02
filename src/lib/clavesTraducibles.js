// src/lib/clavesTraducibles.js
//
// Qué textos de site_config se traducen y cuáles van siempre en inglés. Una sola
// lista para `npm run traducciones` (scripts/traducciones.mjs) y para el aviso que
// muestra el admin abajo de cada texto (SiteTextsTab.jsx): el aviso decía "este
// texto se va a ver igual en los 5 idiomas", que dejó de ser cierto con las
// corridas de traducción del 21/10/2026, y "cada idioma muestra su traducción"
// abajo de la marca, que no se traduce nunca (Gastón, 27/10/2026).

// Se traducen por corridas. No van: el teléfono, las zonas (nombres de lugares),
// unidades de los contadores, URLs y el horario (el pie va entero en inglés).
export const CLAVES_TRADUCIBLES = [
  'hero_subtitle', 'hero_trust', 'about_title', 'bio_text',
  'about_highlight1_title', 'about_highlight1_text', 'about_highlight2_title',
  'about_highlight2_text', 'about_highlight3_title', 'about_highlight3_text',
  'highlights_section_title', 'social_card_google', 'social_card_yt',
  'social_card_wa', 'social_card_fb',
  'cierre_faq_titulo', 'cierre_faq_boton', 'cierre_portfolio_titulo', 'cierre_portfolio_subtitulo',
  'cierre_portfolio_boton', 'cierre_reviews_titulo', 'cierre_reviews_subtitulo',
];

// Siempre en inglés, editados o no: el nombre del negocio ("Handyman Services in
// Zurich", título del hero) y la marca ("Specialist Technician At Domestic Matters").
export const SIEMPRE_EN_INGLES = ['hero_title', 'hero_brand_subtitle'];

/** El aviso del admin para un texto, según se traduzca o no y esté editado o no. */
export function avisoDeIdioma(key, editado) {
  if (SIEMPRE_EN_INGLES.includes(key)) return "Va siempre en inglés, en los 5 idiomas.";
  if (!editado) return "Sin cambios: cada idioma muestra su traducción.";
  return "Editado: los otros idiomas lo van a mostrar en inglés hasta la próxima traducción.";
}
