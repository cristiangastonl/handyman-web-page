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

export function useCarouselSpeed() {
  return CAROUSEL_SPEED;
}

// Para lo que se mueve con animation de CSS (los rieles de /reviews, el strip
// de marcas) en vez de rAF: más rápido = menos duración.
// Se devuelve listo para pisar animationDuration inline.
export function useAnimationDuration(baseSeconds) {
  return `${(baseSeconds / SPEED_MULTIPLIER).toFixed(2)}s`;
}

// px/s aproximados, que es como lo lee una persona.
export const toPixelsPerSecond = (m = SPEED_MULTIPLIER) => Math.round(BASE_SPEED * m * 60);
