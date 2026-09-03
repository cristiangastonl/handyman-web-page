import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_ORIGIN } from "../lib/constants";

/**
 * Canonical y og:url por ruta.
 *
 * Todo el <head> vive estático en index.html, y el prerender captura el DOM tal
 * cual: las 4 rutas salían con `canonical` apuntando a la home. Un canonical es
 * la forma de decirle a un buscador "la versión buena de esta página es esta
 * otra", así que /portfolio, /reviews y /faq se estaban declarando duplicados
 * de / y pidiendo no ser indexadas. Justo después de conseguir que el contenido
 * prerenderizado llegara a producción.
 *
 * No hace falta react-helmet para esto: es escribir dos atributos cuando cambia
 * la ruta. El prerender abre cada ruta en un browser real, así que se lleva el
 * valor ya corregido.
 *
 * Los títulos y descriptions siguen siendo los mismos en las 4 — falta definir
 * el copy con el cliente. Cuando esté, va acá.
 */

// El origen vive en constants.js y lo cuida un guard: acá, robots.txt y
// sitemap.xml tienen que decir lo mismo.
const ORIGEN = SITE_ORIGIN;

// Las mismas rutas que lista sitemap.xml, con el mismo formato: la home con
// barra final y el resto sin ella. Si el canonical y el sitemap no coinciden
// exactamente, el buscador recibe dos respuestas distintas para la misma
// pregunta.
const RUTAS_INDEXABLES = new Set(["/", "/portfolio", "/reviews", "/faq"]);

export function urlCanonica(pathname) {
  const limpio = pathname.replace(/\/+$/, "") || "/";
  // Lo que no está en el sitemap (/admin, un 404 que cae en la home) no tiene
  // canonical propio: apunta a la home, que es lo que efectivamente muestra.
  if (!RUTAS_INDEXABLES.has(limpio)) return `${ORIGEN}/`;
  return limpio === "/" ? `${ORIGEN}/` : `${ORIGEN}${limpio}`;
}

function fijarAtributo(selector, atributo, valor) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(atributo, valor);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = urlCanonica(pathname);
    fijarAtributo('link[rel="canonical"]', "href", url);
    // og:url va junto: es la URL que WhatsApp y LinkedIn muestran en la
    // previsualización cuando Anibal pega el link de una página interna.
    fijarAtributo('meta[property="og:url"]', "content", url);
  }, [pathname]);

  return null;
}
