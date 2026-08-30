import { describe, it, expect } from "vitest";
import { urlCanonica } from "../components/Seo";

// Regresión: las 4 rutas salían con canonical apuntando a la home, o sea que
// /portfolio, /reviews y /faq le pedían al buscador que no las indexara.

describe("URL canónica por ruta", () => {
  it("cada ruta indexable se apunta a sí misma", () => {
    expect(urlCanonica("/portfolio")).toBe("https://handyman-web-page.vercel.app/portfolio");
    expect(urlCanonica("/reviews")).toBe("https://handyman-web-page.vercel.app/reviews");
    expect(urlCanonica("/faq")).toBe("https://handyman-web-page.vercel.app/faq");
  });

  it("la home lleva barra final, igual que en sitemap.xml", () => {
    expect(urlCanonica("/")).toBe("https://handyman-web-page.vercel.app/");
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
    expect(urlCanonica("/admin")).toBe("https://handyman-web-page.vercel.app/");
    expect(urlCanonica("/ruta-que-no-existe")).toBe("https://handyman-web-page.vercel.app/");
  });
});
