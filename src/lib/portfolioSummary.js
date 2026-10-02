/**
 * Lo que el listado del portfolio necesita saber sin bajar las fotos.
 *
 * Hasta el 02/10/2026 el sitio leía work_items entero al abrir cualquier ruta
 * —la home incluida— y contaba en el navegador. Ahora las tarjetas salen de la
 * vista `work_items_summary` (portfolio-summary-migration.sql), una fila por
 * (categoría, subcategoría), y las fotos se piden al entrar a cada nivel.
 *
 * `first` es el primer ítem del grupo en el orden del sitio (sort_order, id):
 * la miniatura de respaldo cuando no hay header_image. Tiene la forma de un
 * work item para que `itemThumb()` lo entienda igual.
 */

const VACIO = { total: 0, photos: 0, videos: 0, first: null };

const antes = (a, b) =>
  !b || a.sort_order < b.sort_order || (a.sort_order === b.sort_order && a.id < b.id);

function sumar(acc, fila) {
  const first = fila.first && antes(fila.first, acc.first) ? fila.first : acc.first;
  return {
    total: acc.total + fila.total,
    photos: acc.photos + fila.photos,
    videos: acc.videos + fila.videos,
    first,
  };
}

/** Una fila de la vista → { cat, subcategory_id, total, photos, videos, first } */
export function normalizeSummaryRow(r) {
  return {
    cat: r.cat,
    subcategory_id: r.subcategory_id || null,
    // count(*) llega como número, pero bigint puede venir como string según el driver.
    total: Number(r.total) || 0,
    photos: Number(r.photos) || 0,
    videos: Number(r.videos) || 0,
    first: r.first_id == null ? null : {
      id: r.first_id,
      sort_order: r.first_sort_order ?? 0,
      type: r.first_type,
      src: r.first_src,
      thumb: r.first_thumb,
      videoId: r.first_video_id,
    },
  };
}

/**
 * @param rows filas ya normalizadas (normalizeSummaryRow)
 * @returns {{
 *   byCat: Record<string, {total, photos, videos, first}>,   todo lo de la categoría
 *   loose: Record<string, {total, photos, videos, first}>,   sólo lo que no tiene subcategoría
 *   bySubcat: Record<string, {total, photos, videos, first}>,
 *   totals: {total, photos, videos, first},
 * }}
 */
export function buildPortfolioSummary(rows = []) {
  const byCat = {}, loose = {}, bySubcat = {};
  let totals = VACIO;
  for (const fila of rows) {
    byCat[fila.cat] = sumar(byCat[fila.cat] || VACIO, fila);
    if (fila.subcategory_id) bySubcat[fila.subcategory_id] = sumar(bySubcat[fila.subcategory_id] || VACIO, fila);
    else loose[fila.cat] = sumar(loose[fila.cat] || VACIO, fila);
    totals = sumar(totals, fila);
  }
  return { byCat, loose, bySubcat, totals };
}

/** Para leer sin chequear undefined en cada tarjeta. */
export const countsOf = (mapa, key) => mapa[key] || VACIO;
