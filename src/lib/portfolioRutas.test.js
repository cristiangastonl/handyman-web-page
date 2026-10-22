import { describe, it, expect } from "vitest";
import { slug, rutaPortfolio, leerRutaPortfolio } from "./portfolioRutas";

// Los ids y nombres tal como están en la base (21/10/2026).
const cats = [
  { id: "all", label: "All" },
  { id: "-all-about-lights-", label: "All About Lighting" },
  { id: "baby--kids--their-world", label: "Baby • Kids • Their World" },
  { id: "mounting", label: "Mounting" },
];
const subcats = [
  { id: "a1", name: "Above the dinner table", category_id: "-all-about-lights-" },
  { id: "b2", name: "Shelves • Racks", category_id: "mounting" },
  { id: "c3", name: "Shelves", category_id: "baby--kids--their-world" },
];

describe("slug", () => {
  it("limpia los ids de categoría con guiones de más", () => {
    expect(slug("-all-about-lights-")).toBe("all-about-lights");
    expect(slug("baby--kids--their-world")).toBe("baby-kids-their-world");
  });
  it("pasa nombres con símbolos y acentos a algo que se lee en un link", () => {
    expect(slug("Shelves • Racks")).toBe("shelves-racks");
    expect(slug("Kids/Babies Room")).toBe("kids-babies-room");
    expect(slug("Zürich Décor")).toBe("zurich-decor");
  });
});

describe("rutaPortfolio", () => {
  it("arma la URL de cada nivel", () => {
    expect(rutaPortfolio("categories", cats, subcats)).toBe("/portfolio");
    expect(rutaPortfolio({ cat: "-all-about-lights-" }, cats, subcats)).toBe("/portfolio/all-about-lights");
    expect(rutaPortfolio({ cat: "-all-about-lights-", subcat: "a1" }, cats, subcats))
      .toBe("/portfolio/all-about-lights/above-the-dinner-table");
  });
  it("suma la pestaña de videos y la foto abierta", () => {
    expect(rutaPortfolio({ cat: "mounting", subcat: "b2", tab: "videos" }, cats, subcats, 1275))
      .toBe("/portfolio/mounting/shelves-racks?tab=videos&foto=1275");
    expect(rutaPortfolio({ cat: "mounting", tab: "photos" }, cats, subcats)).toBe("/portfolio/mounting");
  });
});

describe("leerRutaPortfolio", () => {
  it("es el camino inverso de rutaPortfolio", () => {
    for (const vista of [
      { cat: "-all-about-lights-", tab: "photos" },
      { cat: "-all-about-lights-", subcat: "a1", tab: "photos" },
      { cat: "mounting", subcat: "b2", tab: "videos" },
    ]) {
      const url = new URL(rutaPortfolio(vista, cats, subcats, 7), "https://x.ch");
      const leida = leerRutaPortfolio(url.pathname, url.search, cats, subcats);
      expect(leida.vista).toEqual(vista);
      expect(leida.foto).toBe("7");
    }
  });

  it("dos subcategorías con el mismo nombre en categorías distintas no se confunden", () => {
    // "Shelves" existe en Baby y "Shelves • Racks" en Mounting.
    const { subcat } = leerRutaPortfolio("/portfolio/baby-kids-their-world/shelves", "", cats, subcats);
    expect(subcat.id).toBe("c3");
  });

  it("un link viejo cae en el último nivel que existe, no en una página vacía", () => {
    // Anibal renombró la subcategoría: queda la categoría.
    expect(leerRutaPortfolio("/portfolio/mounting/no-existe", "", cats, subcats).vista)
      .toEqual({ cat: "mounting", tab: "photos" });
    // La categoría tampoco existe: todas las categorías.
    expect(leerRutaPortfolio("/portfolio/no-existe/nada", "?foto=3", cats, subcats))
      .toEqual({ vista: "categories", foto: null, cat: null, subcat: null });
  });

  it("acepta la barra final y la categoría sintética All no es una dirección", () => {
    expect(leerRutaPortfolio("/portfolio/mounting/", "", cats, subcats).vista).toEqual({ cat: "mounting", tab: "photos" });
    expect(leerRutaPortfolio("/portfolio/all", "", cats, subcats).vista).toBe("categories");
  });
});
