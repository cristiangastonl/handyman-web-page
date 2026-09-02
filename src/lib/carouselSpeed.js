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
/**
 * Traduce "equis" a factor.
 *
 * El cliente habla en múltiplos de la velocidad original: "el triple", "la
 * mitad", "2x". El código, en cambio, guarda un factor relativo al multiplicador
 * global, así que 2x se escribe 0.667 y de ahí a un año nadie se acuerda de
 * dónde salió ese número. Con enX(2) el archivo dice lo mismo que el WhatsApp.
 *
 *   enX(3) === 1        (la velocidad global, sin correrse)
 *   enX(2) ≈ 0.667      (60 px/s)
 *   enX(1.5) === 0.5    (45 px/s)
 */
export const enX = (x) => x / SPEED_MULTIPLIER;

export const SPEED_FACTORS = {
  default: 1,
  // Arrancó en la mitad (1.5x) el 31/08 —"Custom Project mas lento, quizá la
  // mitad"— y subió a 2x el 02/09, ya viéndolo andar.
  tailorJobs: enX(2),
  // Estuvo en 1.5x desde el 31/08 —"la velocidad del carrousel de reviews a la
  // mitad, mas despacio"— y subió a 2x el 02/09 con el resto: "los de 1.5, custom
  // y reviews mandale 2". Son los rieles de Happy Customers de /reviews.
  happyRails: enX(2),
  // El carrusel de tarjetas de reseñas de la home. Hasta el 31/08 era el único de
  // la home que no se movía solo: scroll manual con flechas. Estuvo en 1.05x, lo
  // más lento de todo, porque son tarjetas de texto que se leen mientras se
  // mueven; el 02/09 Anibal lo subió a 2x junto con Custom Projects.
  homeReviews: enX(2),
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
