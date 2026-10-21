/**
 * Traducción del contenido que Anibal escribe en el admin: textos del sitio
 * (hero, bio, tarjetas de redes), FAQs, categorías y subcategorías. Lo que sube
 * con las fotos (título y descripción de cada trabajo) queda como lo escribe, y
 * el pie va siempre en inglés.
 *
 * Ese contenido vive en la base en un solo idioma (inglés) y no se traduce solo:
 * las traducciones se generan en una "corrida" (`npm run traducciones`, ver
 * scripts/traducciones.mjs) y quedan en src/locales/contenido/{de,it,fr,es}.json,
 * como un diccionario { "texto en inglés tal cual": "traducción" }.
 *
 * La clave es el texto mismo, a propósito: si Anibal cambia un texto, la clave
 * deja de coincidir y se muestra el inglés nuevo hasta la próxima corrida. Nunca
 * se ve la traducción vieja de un texto que ya cambió.
 *
 * Se traduce al mostrar, no al cargar los datos: el admin tiene que seguir viendo
 * y editando el inglés, y About busca categorías por su label.
 *
 * Cada diccionario se baja sólo si el visitante está en ese idioma.
 */
import { useCallback, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";

const cargadores = import.meta.glob("../locales/contenido/*.json", { import: "default" });
const diccionarios = {};
const avisar = new Set();

function cargar(lang) {
  if (diccionarios[lang] !== undefined) return;
  const cargador = cargadores[`../locales/contenido/${lang}.json`];
  if (!cargador) { diccionarios[lang] = null; return; }
  diccionarios[lang] = null; // en camino: no pedirlo dos veces
  cargador().then((dic) => {
    diccionarios[lang] = dic;
    avisar.forEach((f) => f());
  }).catch(() => { delete diccionarios[lang]; });
}

/** Para tests y para el prerender: deja un diccionario ya cargado. */
export function precargarContenido(lang, dic) {
  diccionarios[lang] = dic;
  avisar.forEach((f) => f());
}

/** Traduce con un diccionario dado. Sin traducción, devuelve el texto tal cual. */
export function traducirCon(dic, texto) {
  if (typeof texto !== "string" || !dic) return texto;
  return dic[texto.trim()] ?? texto;
}

/**
 * Hook: devuelve tc(texto). En inglés, o mientras el diccionario está llegando,
 * devuelve el texto original; cuando llega, el componente se vuelve a pintar.
 */
export function useContenido() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "en").slice(0, 2);
  const [, repintar] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    avisar.add(repintar);
    return () => { avisar.delete(repintar); };
  }, []);
  useEffect(() => { if (lang !== "en") cargar(lang); }, [lang]);

  const dic = lang === "en" ? null : diccionarios[lang];
  return useCallback((texto) => traducirCon(dic, texto), [dic]);
}
