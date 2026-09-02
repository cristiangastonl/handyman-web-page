import { describe, it, expect } from "vitest";
import { itemThumb, ytId, fbEmbedUrl, getWALink, svgP, playlistUrl, CAROUSEL_TITLE, STYLE_KEYS, SITE_TEXTS, getStyleConfig, parseSiteText, getHighlightField, socialUrls, YT_PLAYLISTS_URL } from "./constants";

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

  // Anibal pega lo que tiene a mano. Desde YouTube Studio la barra del navegador da
  // .../playlist/ID/videos, que no lleva ?list= y antes se concatenaba entera: la
  // subcategoría "Wicker Shades" tenía ese link roto en producción.
  it("acepta la URL de YouTube Studio, que no tiene ?list=", () => {
    expect(playlistUrl("https://studio.youtube.com/playlist/PLO8avQ6ndCk-hkG2ZTcHvcKD4xmJhb_us/videos"))
      .toBe("https://www.youtube.com/playlist?list=PLO8avQ6ndCk-hkG2ZTcHvcKD4xmJhb_us");
  });

  it("no arma un link cuando no hay ningún ID adentro", () => {
    // Antes devolvía .../playlist?list=<basura> y la tarjeta llevaba a un 404.
    // Sin ID no se renderiza nada, que es más honesto que un link muerto.
    expect(playlistUrl("mañana la cargo")).toBeNull();
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

// Guardar sólo la tipografía de un texto del sitio produce {"fontSize":13}, sin
// clave "text". parseSiteText pedía "text" para reconocerlo como configuración,
// así que ese JSON caía en la rama de "texto plano heredado" y la página
// mostraba {"fontSize":13} en pantalla. Estaba tapado porque el admin siempre
// guardaba text:"" aunque el campo estuviera vacío; dejó de estarlo cuando el
// campo pasó a omitir el texto que no se cambió (ver siteText.js).
describe("parseSiteText con configuración sin texto", () => {
  it("reconoce el JSON aunque sólo traiga estilo", () => {
    expect(parseSiteText('{"fontSize":13}')).toEqual({ fontSize: 13 });
    expect(parseSiteText('{"fontFamily":"Inter"}')).toEqual({ fontFamily: "Inter" });
  });

  it("sin texto guardado, el sitio cae a la traducción y no al JSON crudo", () => {
    const campo = getHighlightField({ about_highlight3_text: '{"fontSize":13}' },
      "about_highlight3_text", "Always pleased to help.");
    expect(campo.text).toBe("Always pleased to help.");
    expect(campo.fontSize).toBe(13);
  });

  it("el texto plano heredado sigue funcionando", () => {
    expect(parseSiteText("un texto viejo sin JSON")).toEqual({ text: "un texto viejo sin JSON" });
  });
});

// La tarjeta "44 Playlists" va a la solapa de playlists del canal, no a su
// portada: es lo que promete su texto (pedido de Anibal, 02/09). La trampa es
// dónde vive esa URL — ui.jsx dibuja un ícono de red por CADA clave de
// socialUrls, así que agregarla ahí metería un ícono de YouTube de más en el nav
// y en el pie. Por eso es una constante aparte, y eso es lo que se cuida acá.
describe("link a las playlists de YouTube", () => {
  it("apunta a la solapa de playlists y no a la portada del canal", () => {
    expect(YT_PLAYLISTS_URL).toBe("https://www.youtube.com/@HandymanServicesinZurich/playlists");
    expect(YT_PLAYLISTS_URL.startsWith(socialUrls.yt)).toBe(true);
    expect(YT_PLAYLISTS_URL).not.toBe(socialUrls.yt);
  });

  it("no vive adentro de socialUrls: sumaría un ícono de más en el nav y el pie", () => {
    expect(Object.keys(socialUrls).sort()).toEqual(["fb", "wa", "yt"]);
    expect(Object.values(socialUrls)).not.toContain(YT_PLAYLISTS_URL);
  });

  it("los íconos de redes siguen yendo a la portada del canal", () => {
    expect(socialUrls.yt).toBe("https://www.youtube.com/@HandymanServicesinZurich");
  });
});
