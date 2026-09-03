import { describe, it, expect } from "vitest";
import { urlCanonica } from "../components/Seo";
import { SITE_ORIGIN } from "./constants";

// Regresión: las 4 rutas salían con canonical apuntando a la home, o sea que
// /portfolio, /reviews y /faq le pedían al buscador que no las indexara.
//
// Las URLs se arman con SITE_ORIGIN y no se escriben a mano. El dominio del sitio
// cambia —el 03/09/2026 pasó del .vercel.app al propio— y este archivo era el
// CUARTO lugar donde estaba escrito, además de los tres que cuida el guard. Se
// descubrió porque el harness se puso rojo al cambiarlo. Lo que hay que verificar
// es la FORMA —cada ruta apuntándose a sí misma, la home con barra final, las
// internas sin— y eso no depende de cuál sea el dominio.

describe("URL canónica por ruta", () => {
  it("cada ruta indexable se apunta a sí misma", () => {
    expect(urlCanonica("/portfolio")).toBe(`${SITE_ORIGIN}/portfolio`);
    expect(urlCanonica("/reviews")).toBe(`${SITE_ORIGIN}/reviews`);
    expect(urlCanonica("/faq")).toBe(`${SITE_ORIGIN}/faq`);
  });

  it("la home lleva barra final, igual que en sitemap.xml", () => {
    expect(urlCanonica("/")).toBe(`${SITE_ORIGIN}/`);
  });

  it("las internas NO llevan barra final, igual que en sitemap.xml", () => {
    // Si el canonical y el sitemap difieren, el buscador recibe dos respuestas
    // distintas para la misma pregunta.
    expect(urlCanonica("/portfolio")).not.toMatch(/\/$/);
  });

  it("una barra final de más no genera una URL distinta", () => {
    expect(urlCanonica("/portfolio/")).toBe(urlCanonica("/portfolio"));
  });

  it("lo que no está en el sitemap cae a la home", () => {
    // /admin y los 404 muestran la home o el panel: no son páginas indexables
    // con identidad propia, así que no reclaman canonical propio.
    expect(urlCanonica("/admin")).toBe(`${SITE_ORIGIN}/`);
    expect(urlCanonica("/ruta-que-no-existe")).toBe(`${SITE_ORIGIN}/`);
  });
});
