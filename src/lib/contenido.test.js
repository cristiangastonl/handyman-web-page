import { describe, it, expect } from "vitest";
import { traducirCon } from "./contenido";

describe("traducirCon", () => {
  const dic = { "Mounting": "Montage", "Answer  in \nless than 24hs": "Antwort in \nunter 24 Std." };

  it("traduce un texto que está en el diccionario", () => {
    expect(traducirCon(dic, "Mounting")).toBe("Montage");
  });

  it("si Anibal cambió el texto, muestra el inglés nuevo y no la traducción vieja", () => {
    // La clave es el texto entero: cualquier cambio deja de coincidir, y hasta la
    // próxima corrida se ve el inglés recién escrito.
    expect(traducirCon(dic, "Mounting & Assembly")).toBe("Mounting & Assembly");
  });

  it("encuentra el texto aunque venga con espacios en los bordes", () => {
    expect(traducirCon(dic, "  Mounting \n")).toBe("Montage");
  });

  it("respeta los espacios y saltos de adentro del texto", () => {
    expect(traducirCon(dic, "Answer  in \nless than 24hs")).toBe("Antwort in \nunter 24 Std.");
  });

  it("sin diccionario (inglés, o todavía cargando) o sin texto, devuelve lo mismo", () => {
    expect(traducirCon(null, "Mounting")).toBe("Mounting");
    expect(traducirCon(dic, undefined)).toBe(undefined);
    expect(traducirCon(dic, "")).toBe("");
  });
});
