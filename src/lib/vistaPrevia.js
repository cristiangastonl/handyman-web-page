/**
 * La vista previa que muestran WhatsApp, Facebook, Telegram, iMessage… cuando
 * Anibal pega el link de un trabajo: foto, título y de qué parte del portfolio es.
 *
 * Esos robots no ejecutan JavaScript: leen el <head> del HTML. Como el sitio es una
 * SPA con un solo <head> estático, vercel.json les manda los pedidos de
 * /portfolio/... a api/vista-previa.js, que arma este HTML con los datos del link.
 * Los visitantes reciben el sitio normal. Sin esto el link andaba, pero en WhatsApp
 * se veía igual de genérico que el de la home, y para Anibal no cambiaba nada.
 *
 * Funciones puras: la API busca los datos y esto arma el resultado (y se testea).
 */
import { itemThumb, SITE_ORIGIN } from "./constants.js";

export const NOMBRE_SITIO = "Handyman Services in Zurich";
export const IMAGEN_SITIO = `${SITE_ORIGIN}/images/og-image.jpeg`;
// Ancho y calidad con que se pide la foto al optimizador de Vercel. Tienen que
// figurar en "images" de vercel.json o el optimizador responde error. Las fotos
// originales pesan 1–5 MB y WhatsApp no muestra imágenes tan pesadas.
export const ANCHO_IMAGEN = 1200;
export const CALIDAD_IMAGEN = 75;

/** La URL que devuelve la foto achicada por el optimizador de imágenes de Vercel. */
export function imagenOptimizada(src) {
  if (!src) return IMAGEN_SITIO;
  if (src.startsWith("/")) return `${SITE_ORIGIN}${src}`; // las del propio sitio ya son livianas
  return `${SITE_ORIGIN}/_vercel/image?url=${encodeURIComponent(src)}&w=${ANCHO_IMAGEN}&q=${CALIDAD_IMAGEN}`;
}

const fotoDe = (w) => (w ? (w.type === "image" ? w.src : itemThumb({ ...w, videoId: w.video_id })) : "");

/**
 * @param cat, subcat  la categoría y subcategoría del link (o null)
 * @param item         la fila de work_items de ?foto= (o null)
 * @param primera      una foto del nivel, si no hay item ni imagen de cabecera
 * @param url          la URL completa del link
 */
export function datosVistaPrevia({ cat = null, subcat = null, item = null, primera = null, url }) {
  const migas = ["Portfolio", cat?.label, subcat?.name].filter(Boolean).join(" › ");
  const titulo = item?.title?.trim() || subcat?.name || cat?.label || "Portfolio";
  const descripcion = [item?.description?.trim(), migas].filter(Boolean).join(" · ");
  const foto = fotoDe(item) || subcat?.header_image || (!subcat && cat?.header_image) || fotoDe(primera);
  return {
    titulo: `${titulo} · ${NOMBRE_SITIO}`,
    descripcion,
    imagen: imagenOptimizada(foto),
    url,
  };
}

const escapar = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** El HTML que leen los robots de vista previa. No se indexa. */
export function htmlVistaPrevia({ titulo, descripcion, imagen, url }) {
  const [t, d, i, u] = [titulo, descripcion, imagen, url].map(escapar);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${t}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${d}">
<link rel="canonical" href="${u}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapar(NOMBRE_SITIO)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${i}">
<meta property="og:image:secure_url" content="${i}">
<meta property="og:image:width" content="${ANCHO_IMAGEN}">
<meta property="og:image:alt" content="${t}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${i}">
</head>
<body><p><a href="${u}">${t}</a></p></body>
</html>
`;
}
