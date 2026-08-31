// Velocidad de los carruseles de la home y de los rieles de /reviews.
//
// Anibal pidió "más velocidad, tipo el triple" pero no sabía qué número quería
// hasta verlo, así que durante unos días esto salió de un slider en vivo. Ya
// eligió —"Triple, es la mejor" (29/08/2026)— y el panel se borró: acá queda
// el número que eligió, quemado.

// px por frame a 60fps. 0.5 ≈ 30 px/s era la velocidad original.
export const BASE_SPEED = 0.5;

// El triple de la original: 1.5 px/frame ≈ 90 px/s.
export const SPEED_MULTIPLIER = 3;

// px/frame ya multiplicados, para lo que se mueve con requestAnimationFrame
// (los carruseles de la home).
export const CAROUSEL_SPEED = BASE_SPEED * SPEED_MULTIPLIER;

// Hasta el 30/08 todo lo que se movía usaba el mismo número. En la ronda del
// 31/08 Anibal pidió velocidades distintas por carrusel ("Custom Project más
// lento, quizá la mitad" / "la velocidad del carrousel de reviews a la mitad"),
// así que el multiplicador global pasa a ser el default y cada carrusel puede
// correrse de ahí con un factor propio.
export const SPEED_FACTORS = {
  default: 1,
  // "9 Cambiar la velocidad de Custom Project, mas lento -> quizá la mitad."
  tailorJobs: 0.5,
  // "Cambiar la velocidad del carrousel de reviews a la mitad, mas despacio."
  // Son los rieles de Happy Customers de /reviews: es lo único de reseñas que
  // se mueve solo (el carrusel de tarjetas de la home se scrollea a mano).
  happyRails: 0.5,
  // El carrusel de reseñas de la home. Hasta el 31/08 era el único de la home que
  // no se movía solo: scroll manual con flechas. Va más lento que los rieles de
  // fotos a propósito —son tarjetas de texto y la gente las está leyendo mientras
  // se mueven—, cerca de la velocidad base original de 30 px/s.
  homeReviews: 0.35,
};

export function useCarouselSpeed(factor = SPEED_FACTORS.default) {
  return CAROUSEL_SPEED * factor;
}

// Para lo que se mueve con animation de CSS (los rieles de /reviews, el strip
// de marcas) en vez de rAF: más rápido = menos duración.
// Se devuelve listo para pisar animationDuration inline.
export function useAnimationDuration(baseSeconds, factor = SPEED_FACTORS.default) {
  return `${(baseSeconds / (SPEED_MULTIPLIER * factor)).toFixed(2)}s`;
}

// px/s aproximados, que es como lo lee una persona.
export const toPixelsPerSecond = (m = SPEED_MULTIPLIER) => Math.round(BASE_SPEED * m * 60);
