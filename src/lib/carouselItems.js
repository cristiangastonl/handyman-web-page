// Cuántos ítems muestra un carrusel de la home.
//
// Recent Work cortaba en 10 fijo. Anibal curó 21 desde el admin y en el sitio
// veía 10: abría el lightbox y le decía "2 / 10". Un tope fijo tiene sentido
// para el fallback —"lo último que subió", que puede ser todo el portfolio—
// pero no para una lista que el cliente armó a mano: ahí el número lo eligió
// él y el sitio tiene que respetarlo.

// Tope del fallback. Sólo aplica cuando el carrusel no está curado y toma
// prestado el portfolio entero.
export const FALLBACK_LIMIT = 12;

/**
 * @param {Array} curated   lo que el cliente eligió en el admin (carousel_items)
 * @param {Array} fallback  de dónde sale el contenido si no curó nada
 * @returns {{ items: Array, curated: boolean }}
 */
export function carouselSource(curated = [], fallback = []) {
  if (curated.length > 0) return { items: curated, curated: true };
  return { items: fallback.slice(0, FALLBACK_LIMIT), curated: false };
}
