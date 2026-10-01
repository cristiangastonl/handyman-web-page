import { describe, it, expect } from "vitest";
import { traerTodas, seCorto, TAMANO_PAGINA } from "./dbRead";

// Una tabla de mentira que se comporta como PostgREST: respeta el rango pedido,
// pero nunca devuelve más de `techo` filas de una.
const tabla = (filas, techo = TAMANO_PAGINA) => {
  const llamadas = [];
  const hacerQuery = (desde, hasta) => {
    llamadas.push([desde, hasta]);
    const pedidas = hasta - desde + 1;
    return Promise.resolve({
      data: filas.slice(desde, desde + Math.min(pedidas, techo)),
      error: null,
    });
  };
  return { hacerQuery, llamadas };
};

const filasFalsas = (n) => Array.from({ length: n }, (_, i) => ({ id: i }));

describe("traerTodas", () => {
  it("una tabla más grande que el techo NO vuelve truncada", async () => {
    // Este es el bug entero: work_items tenía 1018 filas, PostgREST devolvía
    // 1000 sin error, y las 18 fotos de IKEA Lights que Anibal subió el 01/10
    // no existían para la app aunque estaban guardadas.
    const { hacerQuery } = tabla(filasFalsas(1018));
    const filas = await traerTodas(hacerQuery);
    expect(filas).toHaveLength(1018);
    expect(filas.at(-1).id).toBe(1017);
  });

  it("no repite ni se saltea filas entre páginas", async () => {
    const { hacerQuery } = tabla(filasFalsas(2500));
    const filas = await traerTodas(hacerQuery);
    expect(filas.map((f) => f.id)).toEqual(filasFalsas(2500).map((f) => f.id));
  });

  it("sigue paginando aunque el techo del server sea menor al tamaño de página", async () => {
    // Si el corte fuera "vino una página incompleta, listo", un techo de 500
    // con páginas de 1000 daría la lectura por terminada en la primera vuelta.
    // Volveríamos a truncar en silencio, que es justo lo que esto arregla.
    const { hacerQuery } = tabla(filasFalsas(1600), 500);
    const filas = await traerTodas(hacerQuery);
    expect(filas).toHaveLength(1600);
  });

  it("una tabla que entra en una página se lee con una sola vuelta de más", async () => {
    // La segunda llamada es la que confirma que no hay más; sin ella no habría
    // forma de distinguir "terminó justo" de "me cortaron".
    const { hacerQuery, llamadas } = tabla(filasFalsas(6));
    expect(await traerTodas(hacerQuery)).toHaveLength(6);
    expect(llamadas).toEqual([[0, 999], [6, 1005]]);
  });

  it("una tabla vacía devuelve lista vacía, no null", async () => {
    const { hacerQuery } = tabla([]);
    expect(await traerTodas(hacerQuery)).toEqual([]);
  });

  it("un error de la base se propaga tal cual, no se disfraza", async () => {
    const err = new Error("JWT expired");
    await expect(traerTodas(() => Promise.resolve({ data: null, error: err })))
      .rejects.toThrow(err);
  });

  it("si el server ignora el rango, corta en vez de colgarse", async () => {
    // Página siempre llena y siempre la misma: sin tope esto pide páginas para
    // siempre y se come la memoria del navegador del cliente.
    const siempreLlena = () => Promise.resolve({ data: filasFalsas(TAMANO_PAGINA), error: null });
    await expect(traerTodas(siempreLlena)).rejects.toThrow(/se cortó por las dudas/);
    expect(seCorto(50000)).toMatch(/ignorando el rango/);
  });
});
