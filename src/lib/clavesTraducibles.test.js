import { describe, it, expect } from "vitest";
import { CLAVES_TRADUCIBLES, SIEMPRE_EN_INGLES, avisoDeIdioma } from "./clavesTraducibles";
import { SITE_TEXTS } from "./constants";

describe("clavesTraducibles", () => {
  // Cada texto editable del admin tiene que estar en una de las dos listas: si no,
  // `npm run traducciones` no lo ve y el admin le muestra un aviso equivocado.
  it("cada texto del admin está clasificado: se traduce o va siempre en inglés", () => {
    const sinClasificar = Object.keys(SITE_TEXTS)
      .filter((k) => !CLAVES_TRADUCIBLES.includes(k) && !SIEMPRE_EN_INGLES.includes(k));
    expect(sinClasificar).toEqual([]);
  });

  it("ninguna clave está en las dos listas", () => {
    expect(CLAVES_TRADUCIBLES.filter((k) => SIEMPRE_EN_INGLES.includes(k))).toEqual([]);
  });

  it("la marca y el nombre del negocio avisan que van siempre en inglés, editados o no", () => {
    for (const k of SIEMPRE_EN_INGLES) {
      expect(avisoDeIdioma(k, false)).toMatch(/siempre en inglés/);
      expect(avisoDeIdioma(k, true)).toMatch(/siempre en inglés/);
    }
  });

  it("un texto traducible editado avisa que se ve en inglés hasta la próxima traducción", () => {
    expect(avisoDeIdioma("hero_subtitle", false)).toMatch(/cada idioma muestra su traducción/);
    expect(avisoDeIdioma("hero_subtitle", true)).toMatch(/hasta la próxima traducción/);
    expect(avisoDeIdioma("hero_subtitle", true)).not.toMatch(/igual en los 5 idiomas/);
  });
});
