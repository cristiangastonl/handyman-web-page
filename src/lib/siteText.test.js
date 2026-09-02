import { describe, it, expect } from "vitest";
import { textoVigente, payloadSiteText } from "./siteText";

const DEF = { defaultText: "Always pleased to help both the local community.", defaultFontSize: 12, defaultFontFamily: "DM Sans" };

describe("textoVigente", () => {
  it("sin nada guardado trae el default, para que se pueda editar", () => {
    // El bug de Anibal: el campo arrancaba vacío y el texto iba de placeholder,
    // así que se veía pero no se podía tocar. Ahora viene cargado de verdad.
    expect(textoVigente(undefined, DEF)).toBe(DEF.defaultText);
    expect(textoVigente(null, DEF)).toBe(DEF.defaultText);
  });

  it("con algo guardado trae lo guardado", () => {
    expect(textoVigente(JSON.stringify({ text: "Otra cosa" }), DEF)).toBe("Otra cosa");
  });

  it("con sólo estilo guardado igual trae el default", () => {
    expect(textoVigente(JSON.stringify({ fontSize: 13 }), DEF)).toBe(DEF.defaultText);
  });
});

describe("payloadSiteText", () => {
  it("no guarda el texto si quedó igual al default", () => {
    // Lo guardado le gana a la traducción. Si al tocar sólo el tamaño de letra se
    // grabara el texto en inglés, los otros 4 idiomas perderían el suyo.
    const val = payloadSiteText({ text: DEF.defaultText, fontSize: 14 }, DEF);
    expect(val).toEqual({ fontSize: 14 });
    expect(val).not.toHaveProperty("text");
  });

  it("ignora espacios de más al comparar contra el default", () => {
    expect(payloadSiteText({ text: `  ${DEF.defaultText}  ` }, DEF)).toEqual({});
  });

  it("guarda el texto cuando sí lo cambió", () => {
    expect(payloadSiteText({ text: "Always delighted to help." }, DEF))
      .toEqual({ text: "Always delighted to help." });
  });

  it("guarda texto y estilo juntos", () => {
    expect(payloadSiteText({ text: "Nuevo", fontSize: "13", fontFamily: "Inter" }, DEF))
      .toEqual({ text: "Nuevo", fontSize: 13, fontFamily: "Inter" });
  });

  it("fontSize viaja como número, no como el string del input", () => {
    expect(payloadSiteText({ text: "Nuevo", fontSize: "13" }, DEF).fontSize).toBe(13);
  });

  it("un campo vaciado a mano tampoco guarda texto: vuelve a la traducción", () => {
    expect(payloadSiteText({ text: "", fontSize: 12 }, DEF)).toEqual({ fontSize: 12 });
  });
});
