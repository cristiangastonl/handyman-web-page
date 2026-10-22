import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { datosVistaPrevia, htmlVistaPrevia, imagenOptimizada, IMAGEN_SITIO, ANCHO_IMAGEN, CALIDAD_IMAGEN } from "./vistaPrevia";

const cat = { id: "-all-about-lights-", label: "All About Lighting", header_image: "https://x.supabase.co/storage/v1/object/public/images/cat.jpg" };
const subcat = { id: "a1", name: "Above the dinner table", category_id: cat.id, header_image: null };
const foto = { id: 1275, type: "image", src: "https://x.supabase.co/storage/v1/object/public/images/1275.jpg", title: "Pendant lights", description: "Three bubble lamps" };
const url = "https://www.handymanservicesinzurich.ch/portfolio/all-about-lights/above-the-dinner-table?foto=1275";

describe("datosVistaPrevia", () => {
  it("el link de una foto muestra esa foto, su título y dónde está", () => {
    const d = datosVistaPrevia({ cat, subcat, item: foto, url });
    expect(d.titulo).toBe("Pendant lights · Handyman Services in Zurich");
    expect(d.descripcion).toBe("Three bubble lamps · Portfolio › All About Lighting › Above the dinner table");
    expect(d.imagen).toContain(encodeURIComponent(foto.src));
    expect(d.url).toBe(url);
  });

  it("la foto va achicada por el optimizador de Vercel: las originales pesan megas y WhatsApp no las muestra", () => {
    const img = datosVistaPrevia({ cat, subcat, item: foto, url }).imagen;
    expect(img).toMatch(/^https:\/\/www\.handymanservicesinzurich\.ch\/_vercel\/image\?url=.+&w=1200&q=75$/);
  });

  it("el link de una subcategoría sin cabecera usa una foto de adentro", () => {
    const d = datosVistaPrevia({ cat, subcat, primera: foto, url });
    expect(d.titulo).toBe("Above the dinner table · Handyman Services in Zurich");
    expect(d.imagen).toContain(encodeURIComponent(foto.src));
  });

  it("el link de una categoría usa su imagen de cabecera", () => {
    const d = datosVistaPrevia({ cat, url });
    expect(d.titulo).toBe("All About Lighting · Handyman Services in Zurich");
    expect(d.imagen).toContain(encodeURIComponent(cat.header_image));
  });

  it("un video usa su miniatura de YouTube", () => {
    const video = { id: 9, type: "video", video_id: "dQw4w9WgXcQ", title: "TV mount" };
    expect(datosVistaPrevia({ cat, item: video, url }).imagen)
      .toContain(encodeURIComponent("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"));
  });

  it("sin nada que mostrar (link roto) cae en la imagen del sitio, nunca en una vista vacía", () => {
    expect(datosVistaPrevia({ url }).imagen).toBe(IMAGEN_SITIO);
    expect(imagenOptimizada("")).toBe(IMAGEN_SITIO);
  });
});

describe("htmlVistaPrevia", () => {
  it("escapa lo que escribe Anibal: comillas o < no rompen las etiquetas", () => {
    const html = htmlVistaPrevia({ titulo: 'Bunk bed "pirates" <3', descripcion: "a & b", imagen: IMAGEN_SITIO, url });
    expect(html).toContain('<meta property="og:title" content="Bunk bed &quot;pirates&quot; &lt;3">');
    expect(html).toContain('content="a &amp; b"');
    expect(html).toContain('<meta name="robots" content="noindex">');
  });

  it("declara el ancho de la imagen: sin og:image:width WhatsApp dejaba la tarjeta pelada", () => {
    // 22/10/2026: la función respondía bien y WhatsApp bajaba la foto, pero la
    // tarjeta salía sin foto ni título. Con og:image:width/secure_url apareció.
    const html = htmlVistaPrevia({ titulo: "x", descripcion: "y", imagen: IMAGEN_SITIO, url });
    expect(html).toContain(`<meta property="og:image:width" content="${ANCHO_IMAGEN}">`);
    expect(html).toContain(`<meta property="og:image:secure_url" content="${IMAGEN_SITIO}">`);
  });
});

describe("vercel.json acompaña a la vista previa", () => {
  // Se lee el archivo real: si alguien cambia el ancho o la calidad acá y no allá,
  // el optimizador de Vercel responde error y WhatsApp muestra el link sin foto.
  const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));

  it("el optimizador acepta el ancho y la calidad que pide la vista previa", () => {
    expect(config.images.sizes).toContain(ANCHO_IMAGEN);
    expect(config.images.qualities).toContain(CALIDAD_IMAGEN);
  });

  it("los robots van a la función antes que el portfolio, y el portfolio antes que la home", () => {
    const fuentes = config.rewrites.map((r) => `${r.source} → ${r.destination}`);
    const robots = config.rewrites.findIndex((r) => r.destination.startsWith("/api/vista-previa"));
    const portfolio = fuentes.indexOf("/portfolio/:path+ → /portfolio/index.html");
    const home = fuentes.indexOf("/(.*) → /index.html");
    expect(robots).toBeGreaterThanOrEqual(0);
    expect(config.rewrites[robots].has[0].value).toMatch(/WhatsApp/);
    // En la parte de parámetros, "+" es un espacio: con "?ruta=:path+" la función
    // recibía "above-the-dinner-table " y no encontraba la subcategoría (21/10/2026).
    expect(config.rewrites[robots].destination.split("?")[1]).not.toContain("+");
    expect(robots).toBeLessThan(portfolio);
    expect(portfolio).toBeLessThan(home);
  });
});
