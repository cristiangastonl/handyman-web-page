import { describe, it, expect } from "vitest";
import {
  BASE_SPEED, SPEED_MULTIPLIER, CAROUSEL_SPEED, SPEED_FACTORS,
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

  it("Custom Projects va a la mitad", () => {
    expect(SPEED_FACTORS.tailorJobs).toBe(0.5);
    expect(useCarouselSpeed(SPEED_FACTORS.tailorJobs)).toBe(CAROUSEL_SPEED / 2);
  });

  it("los rieles de Happy Customers van a la mitad", () => {
    expect(SPEED_FACTORS.happyRails).toBe(0.5);
    // Mitad de velocidad en una animación de CSS es el doble de duración.
    expect(useAnimationDuration(40, SPEED_FACTORS.happyRails)).toBe("26.67s");
  });

  it("un factor de 1 es exactamente no tocar nada", () => {
    expect(useCarouselSpeed(SPEED_FACTORS.default)).toBe(useCarouselSpeed());
    expect(useAnimationDuration(40, SPEED_FACTORS.default)).toBe(useAnimationDuration(40));
  });
});
