import { describe, it, expect } from "vitest";
import { itemThumb, ytId, fbEmbedUrl, getWALink, svgP, playlistUrl, CAROUSEL_TITLE, STYLE_KEYS, SITE_TEXTS, getStyleConfig } from "./constants";

describe("itemThumb", () => {
  // Regression: this is the bug that white-screened /portfolio in production.
  // Categories with subcategories but no direct items had catItems[0] === undefined,
  // and itemThumb(undefined) crashed reading .thumb on undefined.
  it("returns empty string when item is undefined", () => {
    expect(itemThumb(undefined)).toBe("");
  });

  it("returns empty string when item is null", () => {
    expect(itemThumb(null)).toBe("");
  });

  it("returns thumb when present", () => {
    expect(itemThumb({ thumb: "https://example.com/x.jpg", type: "image", src: "ignored" })).toBe("https://example.com/x.jpg");
  });

  it("derives YouTube thumbnail from videoId for video items", () => {
    expect(itemThumb({ type: "video", videoId: "dQw4w9WgXcQ" })).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("derives YouTube thumbnail from full URL videoId", () => {
    expect(itemThumb({ type: "video", videoId: "https://youtu.be/dQw4w9WgXcQ" })).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns empty string for video item without videoId", () => {
    expect(itemThumb({ type: "video" })).toBe("");
  });

  it("falls back to facebook icon for facebook items without thumb", () => {
    expect(itemThumb({ type: "facebook" })).toBe("/anibal/facebook_icon.jpeg");
  });

  it("returns src for image items without thumb", () => {
    expect(itemThumb({ type: "image", src: "https://example.com/photo.jpg" })).toBe("https://example.com/photo.jpg");
  });
});

describe("ytId", () => {
  it("extracts ID from youtu.be short URL", () => {
    expect(ytId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtube.com/watch URL", () => {
    expect(ytId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtube.com/shorts URL", () => {
    expect(ytId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns input as-is when already a bare ID", () => {
    expect(ytId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns falsy input unchanged", () => {
    expect(ytId("")).toBe("");
    expect(ytId(null)).toBe(null);
    expect(ytId(undefined)).toBe(undefined);
  });
});

describe("fbEmbedUrl", () => {
  it("URL-encodes the input video URL", () => {
    expect(fbEmbedUrl("https://www.facebook.com/video/123")).toBe(
      "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fvideo%2F123&show_text=false"
    );
  });
});

describe("getWALink", () => {
  it("uses English message by default", () => {
    expect(getWALink()).toContain("Hi%2C%20I%20need");
  });

  it("uses Spanish message when lang=es", () => {
    expect(getWALink("es")).toContain("Hola");
  });

  it("falls back to English for unknown language", () => {
    expect(getWALink("zz")).toContain("Hi%2C%20I%20need");
  });
});

describe("svgP", () => {
  // El badge "Recommends" de Facebook dibuja svgP.thumbsUp. Si el path desaparece,
  // React renderiza <path d={undefined}> sin tirar error de consola: el icono se va
  // en silencio y ni el E2E ni el build lo notan. Por eso se chequea acá.
  it.each(["fb", "yt", "wa", "thumbsUp"])("%s es un path SVG usable", (key) => {
    expect(svgP[key]).toBeTruthy();
    expect(svgP[key]).toMatch(/^M/);
  });
});

// Anibal reportó playlists con la URL duplicada. El campo del admin pide el ID,
// pero pegar la URL entera es lo natural y nadie lee la etiqueta: concatenarla
// contra el prefijo daba .../playlist?list=https://.../playlist?list=XXX.
describe("playlistUrl", () => {
  const ID = "PLO8avQ6ndCk9B1qC4DTjggn9AlvwCtkLi";
  const URL = `https://www.youtube.com/playlist?list=${ID}`;

  it("arma la URL cuando le dan sólo el ID", () => {
    expect(playlistUrl(ID)).toBe(URL);
  });

  it("no duplica el prefijo cuando le pegan la URL entera", () => {
    expect(playlistUrl(URL)).toBe(URL);
    expect(playlistUrl(URL)).not.toContain("list=https");
  });

  it("aguanta parámetros extra y espacios de más", () => {
    expect(playlistUrl(`  ${URL}&index=2  `)).toBe(URL);
  });

  it("devuelve null si no hay nada cargado", () => {
    expect(playlistUrl("")).toBeNull();
    expect(playlistUrl(null)).toBeNull();
    expect(playlistUrl(undefined)).toBeNull();
  });
});

// Los tres carruseles de la home muestran el mismo título visual pero se
// configuran por dos caminos distintos: Recent Work y Custom Projects por
// STYLE_KEYS, y Highlights por SITE_TEXTS porque además su texto es editable.
// Habían quedado en 18 y 17. Se ata el default de los dos sistemas al mismo
// objeto para que no puedan volver a separarse sin que esto falle.
describe("título de los carruseles de la home", () => {
  const CLAVES = [
    "carousel_recent_work_title_style",
    "carousel_highlights_title_style",
    "carousel_tailor_jobs_title_style",
  ];

  it("los tres se configuran por el mismo camino y con el mismo default", () => {
    for (const key of CLAVES) expect(STYLE_KEYS[key], key).toEqual(CAROUSEL_TITLE);
  });

  it("sin nada guardado en el admin, los tres resuelven al mismo estilo", () => {
    const estilos = CLAVES.map((k) => getStyleConfig({}, k));
    for (const e of estilos) expect(e).toEqual(estilos[0]);
  });

  it("el texto de Highlights sigue siendo editable, pero ya no trae estilo propio", () => {
    // Su fontSize guardado (17) le ganaba al default y lo desalineaba. Ahora el
    // estilo sale de su StyleControl, así que un valor viejo acá no puede afectarlo.
    expect(SITE_TEXTS.highlights_section_title.defaultText).toBe("Highlights");
    expect(getStyleConfig({ highlights_section_title: '{"text":"Highlights","fontSize":17}' },
      "carousel_highlights_title_style").fontSize).toBe(CAROUSEL_TITLE.fontSize);
  });
});

// El promedio de reseñas de la home ("4.8"). Estaba quemado en 36px al lado de un
// título de 14 y Anibal lo marcó como desproporcionado el 01/09, pero lo que pidió
// no fue un número: fue "es algo q puedo cambiar yo y probar?". Lo que se cuida acá
// es que siga saliendo de la configuración y no vuelva al JSX.
describe("promedio de reseñas de la home", () => {
  it("tiene default propio y más chico que el titular de /reviews (56)", () => {
    expect(STYLE_KEYS.reviews_score_style).toBeDefined();
    expect(STYLE_KEYS.reviews_score_style.fontSize).toBeLessThan(56);
  });

  it("lo que el cliente guarda en el admin le gana al default", () => {
    expect(getStyleConfig({ reviews_score_style: '{"fontSize":32}' }, "reviews_score_style"))
      .toEqual({ fontSize: 32, fontFamily: STYLE_KEYS.reviews_score_style.fontFamily });
  });

  it("un valor roto en la base no rompe la home, cae al default", () => {
    expect(getStyleConfig({ reviews_score_style: "no-json" }, "reviews_score_style"))
      .toEqual(STYLE_KEYS.reviews_score_style);
  });
});
