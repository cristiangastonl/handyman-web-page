/**
 * La "corrida" de traducciones del contenido que Anibal escribe en el admin.
 *
 * Ese contenido (textos del sitio, FAQs, categorías y subcategorías) vive en la base
 * en inglés. Lo que Anibal sube con las fotos (título y descripción de cada trabajo,
 * alt de Happy Customers) NO se traduce, a propósito: queda tal cual lo escribe
 * (Gastón, 21/10/2026: cada foto nueva esperaría una corrida). Las traducciones viven en
 * src/locales/contenido/{de,it,fr,es}.json con el texto en inglés como clave (ver
 * src/lib/contenido.js). Cuando Anibal cambia o agrega un texto, la clave nueva no
 * está en los diccionarios y el sitio la muestra en inglés hasta la próxima corrida.
 *
 * Uso:
 *   npm run traducciones                     lista lo que falta y lo deja en
 *                                            traducciones-pendientes.json
 *   npm run traducciones -- --aplicar <archivo.json>
 *                                            suma las traducciones de un archivo
 *                                            { "de": { "texto": "Übersetzung" }, ... }
 *   npm run traducciones -- --limpiar        saca de los diccionarios los textos que
 *                                            ya no están en la base
 *   npm run traducciones -- --check          sale con 1 si falta algo (para CI)
 *
 * Quién traduce: Claude, en una sesión, a partir de traducciones-pendientes.json.
 * No hay API de traducción con key en el bundle (ver memoria project-idiomas).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const IDIOMAS = ['de', 'it', 'fr', 'es'];
const PENDIENTES = join(root, 'traducciones-pendientes.json');
const dicPath = (l) => join(root, 'src', 'locales', 'contenido', `${l}.json`);

// Textos de site_config que se muestran y se traducen. No van: el teléfono, las
// zonas (nombres de lugares), unidades de los contadores, URLs, el subtítulo de
// marca ("Specialist Technician At Domestic Matters", siempre en inglés), el título
// del hero ("Handyman Services in Zurich" es el nombre del negocio) y el horario:
// el pie va entero en inglés (Footer.jsx).
const CLAVES_CONFIG = [
  'hero_subtitle', 'hero_trust', 'about_title', 'bio_text',
  'about_highlight1_title', 'about_highlight1_text', 'about_highlight2_title',
  'about_highlight2_text', 'about_highlight3_title', 'about_highlight3_text',
  'highlights_section_title', 'social_card_google', 'social_card_yt',
  'social_card_wa', 'social_card_fb',
];
// Textos fijos que no vienen de la base pero se muestran con tc().
const FIJOS = ['All'];

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;
const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const gris = (s) => `\x1b[2m${s}\x1b[0m`;

function env() {
  const f = join(root, '.env');
  const desdeArchivo = existsSync(f)
    ? Object.fromEntries(readFileSync(f, 'utf8').split('\n')
      .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]))
    : {};
  return { ...desdeArchivo, ...process.env };
}

async function leerTabla(url, key, consulta) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const res = await fetch(`${url}/rest/v1/${consulta}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${desde}-${desde + 999}` },
    });
    if (!res.ok) throw new Error(`${consulta}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const pagina = await res.json();
    filas.push(...pagina);
    if (pagina.length < 1000) return filas;
  }
}

function textoDeConfig(valor) {
  let v = valor;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return v; } }
  if (v && typeof v === 'object') return v.text;
  return typeof v === 'string' ? v : null;
}

/** Todos los textos traducibles de la base, con de dónde salen (para el reporte). */
async function textosDeLaBase() {
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = env();
  if (!url || !key) throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env)');
  const [config, faqs, cats, subcats] = await Promise.all([
    leerTabla(url, key, 'site_config?select=key,value'),
    leerTabla(url, key, 'faqs?select=question,answer'),
    leerTabla(url, key, 'categories?select=label'),
    leerTabla(url, key, 'subcategories?select=name'),
  ]);
  const textos = new Map(); // texto → origen
  const sumar = (t, origen) => {
    if (typeof t !== 'string') return;
    const limpio = t.trim();
    if (!limpio || /^https?:\/\//.test(limpio) || !/\p{L}/u.test(limpio)) return;
    if (!textos.has(limpio)) textos.set(limpio, origen);
  };
  for (const f of config) if (CLAVES_CONFIG.includes(f.key)) sumar(textoDeConfig(f.value), `admin: ${f.key}`);
  for (const f of faqs) { sumar(f.question, 'FAQ'); sumar(f.answer, 'FAQ'); }
  for (const c of cats) sumar(c.label, 'categoría');
  for (const s of subcats) sumar(s.name, 'subcategoría');
  for (const t of FIJOS) sumar(t, 'fijo');
  return textos;
}

const leerDic = (l) => (existsSync(dicPath(l)) ? JSON.parse(readFileSync(dicPath(l), 'utf8')) : {});
const escribirDic = (l, dic) => {
  const ordenado = Object.fromEntries(Object.entries(dic).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(dicPath(l), JSON.stringify(ordenado, null, 2) + '\n');
};

function aplicar(archivo) {
  const nuevas = JSON.parse(readFileSync(archivo, 'utf8'));
  for (const l of IDIOMAS) {
    const dic = leerDic(l);
    let n = 0;
    for (const [en, tr] of Object.entries(nuevas[l] || {})) {
      if (typeof tr === 'string' && tr.trim()) { dic[en.trim()] = tr; n++; }
    }
    escribirDic(l, dic);
    console.log(`  ${l}: ${n} traducciones sumadas (${Object.keys(dic).length} en total)`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--aplicar') {
    if (!args[1]) throw new Error('Uso: npm run traducciones -- --aplicar <archivo.json>');
    aplicar(args[1]);
  }

  const textos = await textosDeLaBase();
  const dics = Object.fromEntries(IDIOMAS.map((l) => [l, leerDic(l)]));

  const pendientes = [...textos.keys()].filter((t) => IDIOMAS.some((l) => !dics[l][t]));
  const sobrantes = [...new Set(IDIOMAS.flatMap((l) => Object.keys(dics[l])))].filter((t) => !textos.has(t));

  if (args.includes('--limpiar') && sobrantes.length) {
    for (const l of IDIOMAS) {
      for (const t of sobrantes) delete dics[l][t];
      escribirDic(l, dics[l]);
    }
    console.log(`  Sacados ${sobrantes.length} textos que ya no están en la base.`);
  }

  console.log(`\nContenido traducible en la base: ${textos.size} textos`);
  for (const l of IDIOMAS) {
    const faltan = [...textos.keys()].filter((t) => !dics[l][t]).length;
    console.log(`  ${l}: ${textos.size - faltan} traducidos, ${faltan ? amarillo(`${faltan} faltan`) : verde('0 faltan')}`);
  }

  if (pendientes.length) {
    const porOrigen = {};
    for (const t of pendientes) { const o = textos.get(t).replace(/:.*/, ''); porOrigen[o] = (porOrigen[o] || 0) + 1; }
    console.log(amarillo(`\n${pendientes.length} textos nuevos o cambiados sin traducir:`));
    for (const [o, n] of Object.entries(porOrigen)) console.log(`  ${o}: ${n}`);
    writeFileSync(PENDIENTES, JSON.stringify(pendientes.map((t) => ({ texto: t, origen: textos.get(t) })), null, 2) + '\n');
    console.log(gris(`\n  Lista en traducciones-pendientes.json. Pedirle a Claude que la traduzca y aplicarla con\n  npm run traducciones -- --aplicar <archivo>.\n`));
  } else {
    if (existsSync(PENDIENTES)) writeFileSync(PENDIENTES, '[]\n');
    console.log(verde('\n✓ Todo el contenido está traducido en los 4 idiomas.\n'));
  }
  if (!args.includes('--limpiar') && sobrantes.length)
    console.log(gris(`  ${sobrantes.length} traducciones de textos que ya no están en la base (--limpiar las saca).\n`));

  if (args.includes('--check') && pendientes.length) process.exit(1);
}

main().catch((e) => { console.error(rojo(`✗ ${e.message}`)); process.exit(1); });
