/**
 * Las direcciones del portfolio: qué URL tiene cada nivel y qué nivel es cada URL.
 *
 *   /portfolio                                   todas las categorías
 *   /portfolio/all-about-lights                  una categoría
 *   /portfolio/all-about-lights/above-the-dinner-table   una subcategoría
 *   ...?tab=videos                               la pestaña de videos
 *   ...?foto=1275                                una foto (o video) abierta
 *
 * Existe porque Anibal no podía mandarle a un cliente el link de un trabajo puntual
 * y seguía compartiendo álbumes de Facebook (06/09/2026): todo el portfolio vivía en
 * un useState y la dirección era siempre /portfolio. De paso, el "atrás" del celu se
 * iba del sitio en vez de subir un nivel.
 *
 * Sin React ni nada del browser: lo usan la app y la función de vista previa
 * (api/vista-previa.js), y las dos tienen que entender exactamente las mismas URLs.
 */

/** "Above the dinner table" → "above-the-dinner-table"; "-all-about-lights-" → "all-about-lights". */
export function slug(texto) {
  return String(texto ?? "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Las categorías se identifican por su id, que ya es casi un slug pero arrastra
// guiones de más ("-all-about-lights-", "baby--kids--their-world"). Las
// subcategorías tienen un uuid como id, así que van por su nombre.
const slugCategoria = (cat) => slug(cat.id);
const slugSubcategoria = (sub) => slug(sub.name);

/**
 * La URL de un nivel del portfolio.
 * @param vista "categories" | { cat, subcat?, tab? }
 * @param foto  id de la foto abierta, o nada
 */
export function rutaPortfolio(vista, cats = [], subcats = [], foto = null) {
  let ruta = "/portfolio";
  const params = new URLSearchParams();
  if (vista && typeof vista === "object" && vista.cat) {
    const cat = cats.find((c) => c.id === vista.cat);
    if (cat) {
      ruta += `/${slugCategoria(cat)}`;
      const sub = vista.subcat && subcats.find((s) => s.id === vista.subcat);
      if (sub) ruta += `/${slugSubcategoria(sub)}`;
    }
    if (vista.tab === "videos") params.set("tab", "videos");
  }
  if (foto != null && foto !== "") params.set("foto", String(foto));
  const query = params.toString();
  return query ? `${ruta}?${query}` : ruta;
}

/**
 * El nivel que muestra una URL. Si una parte no existe (una subcategoría que
 * Anibal renombró, un link viejo), se queda en el último nivel que sí existe en
 * vez de mostrar una página vacía.
 *
 * @returns {{ vista: "categories" | { cat, subcat?, tab }, foto: string | null,
 *             cat: object | null, subcat: object | null }}
 */
export function leerRutaPortfolio(pathname, search = "", cats = [], subcats = []) {
  const params = new URLSearchParams(search);
  const foto = params.get("foto") || null;
  const tab = params.get("tab") === "videos" ? "videos" : "photos";
  const [, , slugCat, slugSub] = String(pathname).replace(/\/+$/, "").split("/");

  const cat = slugCat ? cats.find((c) => c.id !== "all" && slugCategoria(c) === slugCat) : null;
  if (!cat) return { vista: "categories", foto: null, cat: null, subcat: null };

  const subcat = slugSub
    ? subcats.find((s) => s.category_id === cat.id && slugSubcategoria(s) === slugSub) || null
    : null;
  const vista = subcat ? { cat: cat.id, subcat: subcat.id, tab } : { cat: cat.id, tab };
  return { vista, foto, cat, subcat };
}
