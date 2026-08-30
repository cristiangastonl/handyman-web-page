import { describe, it, expect } from "vitest";
import { carouselSource, FALLBACK_LIMIT } from "./carouselItems";

const lista = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

describe("fuente de un carrusel de la home", () => {
  // Regresión: Recent Work cortaba en 10 fijo. Anibal curó 21 en el admin y el
  // lightbox le decía "2 / 10" (WhatsApp, 29/08/2026).
  it("muestra los 21 ítems que el cliente curó, no los primeros 10", () => {
    const { items, curated } = carouselSource(lista(21), lista(60));
    expect(items).toHaveLength(21);
    expect(curated).toBe(true);
  });

  it("no le pone tope a la lista curada, sea del largo que sea", () => {
    expect(carouselSource(lista(40), []).items).toHaveLength(40);
  });

  it("respeta el orden en que el cliente los dejó", () => {
    const curados = [{ id: "c" }, { id: "a" }, { id: "b" }];
    expect(carouselSource(curados, []).items.map(i => i.id)).toEqual(["c", "a", "b"]);
  });

  it("sin curaduría cae al portfolio y ahí sí corta", () => {
    const { items, curated } = carouselSource([], lista(60));
    expect(items).toHaveLength(FALLBACK_LIMIT);
    expect(curated).toBe(false);
  });

  it("el fallback corto se muestra entero", () => {
    expect(carouselSource([], lista(3)).items).toHaveLength(3);
  });

  it("aguanta que no haya nada de nada", () => {
    expect(carouselSource().items).toEqual([]);
    expect(carouselSource([], []).items).toEqual([]);
  });
});
