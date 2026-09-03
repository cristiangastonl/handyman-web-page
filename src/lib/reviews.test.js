import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { starAverage, fuentesDeReseñas } from "../components/Reviews";

// El 03/09/2026 el sitio de un negocio real publicó reseñas inventadas.
//
// google_reviews quedó vacía —Anibal borró las suyas desde el admin— y el código
// tenía un fallback: si no había reseñas, mostraba 12 de relleno escritas a mano
// ("Anna M.", "Thomas K.", "Sarah L."...). Peor todavía, el promedio de estrellas
// se calculaba sobre ellas: /reviews mostraba 4.3 estrellas fabricadas.
//
// No es un bug cosmético. Son testimonios y una calificación falsos en la página
// de un negocio, y en Suiza y la UE eso es sancionable. Estos tests existen para
// que no vuelva por descuido.

describe("promedio de estrellas", () => {
  const g = (r) => ({ source: "google", r });
  const fb = () => ({ source: "facebook", r: null, recommends: true });

  it("sin reseñas puntuadas devuelve null, no cero", () => {
    // "0.0" en una página de reseñas se lee como "tiene cero estrellas", que es
    // lo contrario de la verdad: no hay ninguna cargada todavía.
    expect(starAverage([])).toBeNull();
    expect(starAverage([fb(), fb(), fb()])).toBeNull();
  });

  it("las de Facebook no cuentan: son pulgar arriba, no puntaje", () => {
    expect(starAverage([fb(), fb(), g(4)])).toBe("4.0");
  });

  it("promedia sólo las puntuadas", () => {
    expect(starAverage([g(5), g(4)])).toBe("4.5");
    expect(starAverage([g(5), g(5), g(4), fb()])).toBe("4.7");
  });

  it("una reseña sin puntaje no arrastra el promedio a la baja", () => {
    // r: null entraba como 0 si se sumaba sin filtrar.
    expect(starAverage([g(5), g(null), g(5)])).toBe("5.0");
  });
});

describe("no hay reseñas de relleno en el código", () => {
  const constants = readFileSync(new URL("./constants.js", import.meta.url), "utf8");
  const reviews = readFileSync(new URL("../components/Reviews.jsx", import.meta.url), "utf8");

  it("las constantes con reseñas hardcodeadas ya no existen", () => {
    expect(constants).not.toMatch(/export const REVIEWS\s*=/);
    expect(constants).not.toMatch(/export const DEFAULT_FB_REVIEWS\s*=/);
  });

  it("no quedó ninguno de los nombres inventados", () => {
    // Se miran las líneas de código, no los comentarios: el comentario que dejó
    // el borrado nombra a "Anna M." y "Thomas K." justamente para que se entienda
    // qué pasó, y eso tiene que poder quedar escrito.
    const codigo = constants
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
      .join("\n");
    for (const nombre of ["Anna M.", "Thomas K.", "Sarah L.", "Marco R.", "Lisa W.", "Peter H."]) {
      expect(codigo, `"${nombre}" volvió al código`).not.toContain(nombre);
    }
  });

  it("Reviews.jsx no tiene un fallback cuando no hay reseñas de Google", () => {
    // La forma exacta del bug: googleReviews.length > 0 ? (las reales) : (las falsas).
    expect(reviews).not.toMatch(/googleReviews\.length\s*>\s*0\s*\n?\s*\?/);
  });
});

// La pastilla de fuentes anunciaba "Google + Facebook" siempre, aunque no
// hubiera ni una reseña de Google. Quedaba incoherente con el bloque de al lado,
// que ya mostraba recomendaciones justamente porque sabía que no había puntajes.
// Ahora las dos cosas salen de la misma función.
describe("qué fuentes de reseñas hay", () => {
  const g = { source: "google", r: 5 };
  const fb = { source: "facebook", r: null };

  it("sin reseñas no hay ninguna fuente, y la pastilla no se dibuja", () => {
    expect(fuentesDeReseñas([])).toEqual({ google: false, facebook: false });
    expect(fuentesDeReseñas()).toEqual({ google: false, facebook: false });
  });

  it("sólo Facebook: no anuncia Google", () => {
    expect(fuentesDeReseñas([fb, fb])).toEqual({ google: false, facebook: true });
  });

  it("sólo Google: no anuncia Facebook", () => {
    expect(fuentesDeReseñas([g])).toEqual({ google: true, facebook: false });
  });

  it("las dos, que es cuando el + tiene sentido", () => {
    expect(fuentesDeReseñas([g, fb])).toEqual({ google: true, facebook: true });
  });

  it("una reseña de Google sin puntaje igual cuenta como fuente", () => {
    // La pastilla dice de dónde salen las reseñas; las estrellas dependen de que
    // además tengan puntaje. Son dos preguntas distintas sobre el mismo dato.
    const sinPuntaje = { source: "google", r: null };
    expect(fuentesDeReseñas([sinPuntaje]).google).toBe(true);
    expect(starAverage([sinPuntaje])).toBeNull();
  });
});
