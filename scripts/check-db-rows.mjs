/**
 * Avisa ANTES de que una tabla cruce el techo de filas de PostgREST.
 *
 * Por qué existe: `db-max-rows` (1000 en Supabase) recorta la respuesta sin
 * devolver error. Una tabla que crece no rompe nada el día que pasa el techo —
 * simplemente empieza a devolver menos filas de las que tiene, y la app muestra
 * una lista completa a la que le faltan cosas.
 *
 * Eso pasó el 01/10/2026: work_items llegó a 1018 filas y las fotos que Anibal
 * subía a "IKEA Lights" dejaron de aparecer. Nada falló, nada loggeó, el admin
 * decía "Work item added". Se arregló paginando la lectura (src/lib/dbRead.js),
 * pero las otras tablas siguen leyéndose de una sola vez porque hoy son chicas.
 * Este check es el que va a avisar cuando alguna deje de serlo.
 *
 * No corre dentro de `verify` porque necesita red y las credenciales reales:
 * se corre a mano, igual que verify:prod.
 *
 * Uso:  npm run verify:db
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Tablas que se leen enteras de una sola vez. Cuando una pase el umbral hay que
// paginarla con traerTodas() y sacarla de acá, no subir el umbral.
const TABLAS = [
  'categories', 'subcategories', 'carousel_items', 'faqs',
  'facebook_reviews', 'google_reviews', 'site_config', 'happy_customers',
];
// Ya paginadas: se chequean igual, pero acá un número alto es normal.
const PAGINADAS = ['work_items'];

const TECHO = 1000;
const UMBRAL = 900; // margen para enterarse antes y no después

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;
const gris = (s) => `\x1b[2m${s}\x1b[0m`;

function env() {
  const f = join(root, '.env');
  if (!existsSync(f)) return {};
  return Object.fromEntries(
    readFileSync(f, 'utf8')
      .split('\n')
      .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]])
  );
}

async function contar(url, key, tabla) {
  const res = await fetch(`${url}/rest/v1/${tabla}?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const rango = res.headers.get('content-range') || '';
  const total = Number(rango.split('/')[1]);
  if (!Number.isFinite(total)) throw new Error(`content-range inesperado: "${rango}"`);
  return total;
}

async function main() {
  const e = { ...env(), ...process.env };
  const url = (e.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = e.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(rojo('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env o entorno).'));
    process.exit(1);
  }

  console.log(gris(`Techo de PostgREST: ${TECHO} filas. Aviso a partir de ${UMBRAL}.\n`));
  let fallo = false;

  for (const tabla of [...PAGINADAS, ...TABLAS]) {
    const paginada = PAGINADAS.includes(tabla);
    let n;
    try {
      n = await contar(url, key, tabla);
    } catch (err) {
      console.log(`${rojo('FAIL')}  ${tabla.padEnd(20)} ${err.message}`);
      fallo = true;
      continue;
    }
    const etiqueta = paginada ? gris(' (paginada)') : '';
    if (!paginada && n >= UMBRAL) {
      fallo = true;
      console.log(
        `${rojo('FAIL')}  ${tabla.padEnd(20)} ${n} filas — se lee de una sola vez y el techo es ${TECHO}.\n` +
          `        Pasala por traerTodas() en src/lib/supabase.js y sacala de TABLAS acá.`
      );
    } else if (!paginada && n >= UMBRAL * 0.8) {
      console.log(`${amarillo('WARN')}  ${tabla.padEnd(20)} ${n} filas — se está acercando.`);
    } else {
      console.log(`${verde('OK')}    ${tabla.padEnd(20)} ${n} filas${etiqueta}`);
    }
  }

  console.log('');
  if (fallo) {
    console.log(rojo('FAIL — hay una tabla que se lee entera y está por pasar el techo.'));
    process.exit(1);
  }
  console.log(verde('PASS — ninguna tabla sin paginar está cerca del techo.'));
}

main().catch((err) => {
  console.error(rojo(`Error: ${err.message}`));
  process.exit(1);
});
