// Los diccionarios del contenido que escribe Anibal (src/locales/contenido/*.json,
// ver src/lib/contenido.js y scripts/traducciones.mjs). No se puede chequear acá si
// están completos —eso depende de la base y lo dice `npm run traducciones`—, pero sí
// que estén sanos: los mismos textos en los 4 idiomas, sin valores vacíos, alemán
// suizo (ss, no ß) y las palabras de marca sin traducir.
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDIOMAS = ['de', 'it', 'fr', 'es'];
const MARCAS = ['Handyman', 'Highlights', 'Specialist Technician At Domestic Matters', 'Handyman Services in Zurich'];

export function checkContenido() {
  const errors = [];
  const warnings = [];
  const dics = {};
  for (const l of IDIOMAS) {
    const f = join(root, 'src', 'locales', 'contenido', `${l}.json`);
    if (!existsSync(f)) { errors.push(`falta src/locales/contenido/${l}.json`); continue; }
    try { dics[l] = JSON.parse(readFileSync(f, 'utf8')); }
    catch (e) { errors.push(`src/locales/contenido/${l}.json no es JSON válido: ${e.message}`); }
  }
  if (errors.length) return { errors, warnings };

  const todas = new Set(IDIOMAS.flatMap((l) => Object.keys(dics[l])));
  for (const l of IDIOMAS) {
    const faltan = [...todas].filter((k) => !(k in dics[l]));
    if (faltan.length) errors.push(`contenido/${l}.json: le faltan ${faltan.length} textos que los otros idiomas tienen (ej. «${faltan[0].slice(0, 50)}»)`);
    for (const [en, tr] of Object.entries(dics[l])) {
      const corto = en.slice(0, 50);
      if (typeof tr !== 'string' || !tr.trim()) { errors.push(`contenido/${l}.json: «${corto}» está vacío`); continue; }
      if (en !== en.trim()) errors.push(`contenido/${l}.json: la clave «${corto}» tiene espacios en los bordes (tc() busca el texto recortado)`);
      if (l === 'de' && tr.includes('ß')) errors.push(`contenido/de.json: «${corto}» usa ß — el sitio va en alemán suizo (ss)`);
      for (const m of MARCAS) if (en.includes(m) && !tr.includes(m)) errors.push(`contenido/${l}.json: «${corto}» tradujo la palabra de marca "${m}"`);
    }
  }
  return { errors, warnings };
}
