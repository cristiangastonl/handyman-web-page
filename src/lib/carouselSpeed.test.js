import { describe, it, expect } from "vitest";
import {
  BASE_SPEED, SPEED_MULTIPLIER, CAROUSEL_SPEED,
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
