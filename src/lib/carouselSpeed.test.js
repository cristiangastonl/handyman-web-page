import { describe, it, expect } from "vitest";
import {
  BASE_SPEED, SPEED_MULTIPLIER, CAROUSEL_SPEED, SPEED_FACTORS, enX,
  useCarouselSpeed, useAnimationDuration, toPixelsPerSecond,
} from "./carouselSpeed";

// El slider en vivo se borró: Anibal eligió "Triple" el 29/08/2026. Lo que
// queda por verificar ya no es el rango de un control, sino que el número que
// eligió sea el que efectivamente llega a los carruseles.

describe("velocidad elegida por el cliente", () => {
  it("es el triple de la original", () => {
    expect(SPEED_MULTIPLIER).toBe(3);
  });

  it("son ~90 px/s", () => {
    expect(toPixelsPerSecond()).toBe(90);
    expect(CAROUSEL_SPEED).toBe(BASE_SPEED * 3);
  });

  it("es la que reciben los carruseles de la home", () => {
    // Los hooks no tienen estado: son constantes con forma de hook para no
    // tocar los componentes que ya los usaban.
    expect(useCarouselSpeed()).toBe(CAROUSEL_SPEED);
  });
});

describe("duración de las animaciones de CSS", () => {
  // Los rieles de /reviews y el strip de marcas se mueven con animation, no
  // con rAF: acelerarlos es acortarles la duración.
  it("acorta la duración en la misma proporción", () => {
    expect(useAnimationDuration(40)).toBe("13.33s");
    expect(useAnimationDuration(30)).toBe("10.00s");
  });

  it("devuelve un string listo para animationDuration", () => {
    expect(useAnimationDuration(9)).toMatch(/^[0-9.]+s$/);
  });
});

// Ronda del 31/08: el número global dejó de aplicarse a todo por igual. Lo que
// se verifica acá es que "la mitad" sea efectivamente la mitad y que quien no
// pide factor propio siga corriendo a la velocidad que el cliente ya había
// elegido — el riesgo real es que agregar un factor mueva de más.
describe("velocidad por carrusel", () => {
  it("sin factor, nada cambia respecto de la velocidad global", () => {
    expect(useCarouselSpeed()).toBe(CAROUSEL_SPEED);
    expect(useAnimationDuration(40)).toBe("13.33s");
  });

  // enX() es lo que mantiene el archivo legible: el cliente pide "2x", no 0.667.
  it("enX traduce los múltiplos que pide el cliente", () => {
    expect(enX(SPEED_MULTIPLIER)).toBe(1);          // 3x = la global
    expect(useCarouselSpeed(enX(3))).toBe(CAROUSEL_SPEED);
    expect(useCarouselSpeed(enX(1.5))).toBe(CAROUSEL_SPEED / 2);
  });

  it("todo lo que no va a la global va a 2x (60 px/s)", () => {
    // "Los de 3 dejalos en 3. Los de 1.5, custom y reviews mandale 2" (02/09).
    // Custom Projects venía de 1.5x, los rieles de 1.5x y el de reseñas de la home
    // de 1.05x, que era lo más lento del sitio. Después de esa ronda no queda nada
    // en 1.5: o va a la global o va a 2x.
    for (const clave of ["tailorJobs", "homeReviews", "happyRails"]) {
      expect(SPEED_FACTORS[clave], clave).toBe(enX(2));
      expect(Math.round(useCarouselSpeed(SPEED_FACTORS[clave]) * 60), clave).toBe(60);
    }
  });

  it("los rieles siguen por debajo de la global, no igualados", () => {
    // Son animación de CSS: más lento es MÁS duración. Lo que se cuida es que 2x
    // no se haya convertido sin querer en "lo mismo que el resto".
    expect(useAnimationDuration(40, SPEED_FACTORS.happyRails)).toBe("20.00s");
    expect(parseFloat(useAnimationDuration(40, SPEED_FACTORS.happyRails)))
      .toBeGreaterThan(parseFloat(useAnimationDuration(40)));
  });

  it("un factor de 1 es exactamente no tocar nada", () => {
    expect(useCarouselSpeed(SPEED_FACTORS.default)).toBe(useCarouselSpeed());
    expect(useAnimationDuration(40, SPEED_FACTORS.default)).toBe(useAnimationDuration(40));
  });
});
