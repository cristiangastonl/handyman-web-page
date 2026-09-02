import { describe, it, expect } from "vitest";
import { escribir, sinFilas } from "./dbWrite";

// El query builder de supabase-js, en chiquito: lo único que nos importa es que
// escribir() le encadene .select() y lea lo que devuelve.
const query = (respuesta) => ({
  select: () => Promise.resolve(respuesta),
});

describe("escribir", () => {
  it("una escritura bloqueada por RLS NO pasa como éxito", async () => {
    // Este es el bug entero: PostgREST contesta 200 con cero filas y sin error
    // cuando RLS descarta la fila. Antes eso llegaba como error null y el admin
    // festejaba. Así se perdió la playlist de Assembly el 01/09.
    await expect(escribir(query({ data: [], error: null }), "actualizar la categoría"))
      .rejects.toThrow(/no cambió ninguna fila/);
  });

  it("el mensaje dice qué se estaba haciendo y por dónde buscar", async () => {
    // Sin esto el admin muestra "Error" pelado y no hay forma de saber si fue RLS
    // o la sesión vencida, que son las dos causas reales.
    await expect(escribir(query({ data: [], error: null }), "actualizar la categoría"))
      .rejects.toThrow(/actualizar la categoría/);
    expect(sinFilas("x")).toMatch(/RLS/);
    expect(sinFilas("x")).toMatch(/sesión/);
  });

  it("data null se trata igual que cero filas", async () => {
    await expect(escribir(query({ data: null, error: null }), "borrar la FAQ"))
      .rejects.toThrow(/no cambió ninguna fila/);
  });

  it("cuando sí tocó filas, las devuelve", async () => {
    const filas = [{ id: "assembly" }];
    await expect(escribir(query({ data: filas, error: null }), "actualizar la categoría"))
      .resolves.toEqual(filas);
  });

  it("un error de la base se propaga tal cual, no se disfraza", async () => {
    const err = new Error("duplicate key");
    await expect(escribir(query({ data: null, error: err }), "actualizar la categoría"))
      .rejects.toBe(err);
  });
});
