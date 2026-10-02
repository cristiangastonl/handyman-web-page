import { describe, it, expect } from "vitest";
import { normalizeSummaryRow, buildPortfolioSummary, countsOf } from "./portfolioSummary";

const fila = (cat, sub, { total, photos, videos = 0, firstId, sort = 0, type = "image" }) =>
  normalizeSummaryRow({
    cat, subcategory_id: sub, total, photos, videos,
    first_id: firstId, first_sort_order: sort, first_type: type,
    first_src: `src-${firstId}`, first_thumb: null, first_video_id: null,
  });

describe("resumen del portfolio", () => {
  const filas = [
    fila("lighting", null, { total: 3, photos: 2, videos: 1, firstId: 10, sort: 5 }),
    fila("lighting", "ikea", { total: 18, photos: 18, firstId: 4, sort: 2 }),
    fila("lighting", "spots", { total: 2, photos: 2, firstId: 7, sort: 2 }),
    fila("doors", null, { total: 1, photos: 0, videos: 1, firstId: 1, sort: 0, type: "video" }),
  ];
  const s = buildPortfolioSummary(filas);

  it("la categoría cuenta sus sueltos más los de todas sus subcategorías", () => {
    expect(s.byCat.lighting).toMatchObject({ total: 23, photos: 22, videos: 1 });
  });

  it("los sueltos se cuentan aparte, para la grilla 'General'", () => {
    expect(s.loose.lighting).toMatchObject({ total: 3, photos: 2, videos: 1 });
    expect(countsOf(s.loose, "nada")).toMatchObject({ total: 0, photos: 0, videos: 0, first: null });
  });

  it("la miniatura de la categoría es el primer ítem en el orden del sitio (sort_order, id)", () => {
    // ikea (sort 2, id 4) y spots (sort 2, id 7) empatan en sort_order: desempata el id.
    expect(s.byCat.lighting.first.id).toBe(4);
  });

  it("cada subcategoría tiene su propio conteo y miniatura", () => {
    expect(s.bySubcat.ikea).toMatchObject({ total: 18, photos: 18 });
    expect(s.bySubcat.spots.first.src).toBe("src-7");
  });

  it("los totales del encabezado suman todo", () => {
    expect(s.totals).toMatchObject({ total: 24, photos: 22, videos: 2 });
  });

  it("el first queda con la forma de un work item, para itemThumb()", () => {
    expect(s.byCat.doors.first).toEqual({
      id: 1, sort_order: 0, type: "video", src: "src-1", thumb: null, videoId: null,
    });
  });

  it("los conteos que lleguen como string (bigint) se suman como números", () => {
    const r = normalizeSummaryRow({ cat: "x", subcategory_id: null, total: "1018", photos: "1000", videos: "18", first_id: null });
    expect(r).toMatchObject({ total: 1018, photos: 1000, videos: 18, first: null });
  });

  it("sin filas no rompe", () => {
    expect(buildPortfolioSummary().totals.total).toBe(0);
  });
});
