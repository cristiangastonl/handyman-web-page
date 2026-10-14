import { describe, it, expect } from "vitest";
import { estiloResumen } from "./resumenResenas";

describe("estiloResumen", () => {
  it("sin nada elegido van las tarjetas", () => {
    expect(estiloResumen({}, "")).toBe("tarjetas");
    expect(estiloResumen(undefined, undefined)).toBe("tarjetas");
  });

  it("usa lo que se eligió en el admin: así se vuelve al clásico", () => {
    expect(estiloResumen({ reviews_summary_style: "clasico" }, "")).toBe("clasico");
  });

  it("el parámetro de la URL pisa al admin, para mostrarlo antes de activarlo", () => {
    expect(estiloResumen({}, "?resumen=tarjetas")).toBe("tarjetas");
    expect(estiloResumen({ reviews_summary_style: "tarjetas" }, "?resumen=clasico")).toBe("clasico");
  });

  it("un valor desconocido no rompe: cae en el de por defecto", () => {
    expect(estiloResumen({ reviews_summary_style: "otro" }, "?resumen=xx")).toBe("tarjetas");
  });
});
