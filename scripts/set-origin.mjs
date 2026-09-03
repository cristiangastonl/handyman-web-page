// Cambia el origen del sitio en los tres lugares donde vive, de una.
//
//   npm run set-origin -- https://handymanservicesinzurich.ch
//
// Los tres son: SITE_ORIGIN en src/lib/constants.js (de donde salen el canonical
// y el og:url), la línea Sitemap: de public/robots.txt, y las <loc> de
// public/sitemap.xml. Tienen que decir exactamente lo mismo: si el canonical
// declara un origen y el sitemap otro, el buscador recibe dos respuestas para la
// misma página y reparte la autoridad entre las dos.
//
// Existe para que el día del cambio de dominio no sea un editar-tres-archivos-y-
// ojalá-no-me-olvide-de-uno. El guard de conventions.mjs lo verifica igual, así
// que un olvido no llega a producción — pero mejor no depender de eso.

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const nuevo = process.argv[2];
if (!nuevo) {
  console.error('Falta el origen.\n\n  npm run set-origin -- https://ejemplo.ch\n');
  process.exit(1);
}
if (!/^https:\/\/[^\s/]+$/.test(nuevo)) {
  console.error(
    `"${nuevo}" no sirve como origen.\n\n` +
    'Tiene que ser https, sin barra final y sin ruta. Ejemplo:\n' +
    '  https://handymanservicesinzurich.ch\n'
  );
  process.exit(1);
}

const archivo = (rel) => join(root, rel);
const CONSTANTS = 'src/lib/constants.js';

const cts = readFileSync(archivo(CONSTANTS), 'utf8');
const m = cts.match(/export const SITE_ORIGIN = "([^"]+)"/);
if (!m) {
  console.error(`No encontré SITE_ORIGIN en ${CONSTANTS}.`);
  process.exit(1);
}
const viejo = m[1];

if (viejo === nuevo) {
  console.log(`El origen ya es ${nuevo}. No hay nada que cambiar.`);
  process.exit(0);
}

const cambios = [];
for (const rel of [CONSTANTS, 'public/robots.txt', 'public/sitemap.xml']) {
  const antes = readFileSync(archivo(rel), 'utf8');
  const despues = antes.split(viejo).join(nuevo);
  const n = antes.split(viejo).length - 1;
  if (n > 0) writeFileSync(archivo(rel), despues);
  cambios.push([rel, n]);
}

console.log(`\n  ${viejo}\n  → ${nuevo}\n`);
for (const [rel, n] of cambios) console.log(`  ${String(n).padStart(2)}x  ${rel}`);
console.log(
  '\nAhora:\n' +
  '  npm run verify                              (el guard verifica que los tres coincidan)\n' +
  `  SITE_URL=${nuevo} npm run verify:prod   (después de deployar)\n`
);
