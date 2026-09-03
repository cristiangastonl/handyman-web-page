// Copia local de todo lo que vive en Supabase.
//
//   npm run backup
//
// Supabase no es "la base de datos" de este proyecto: es también la biblioteca
// entera de fotos y miniaturas del portfolio, en un plan de 10 GB. Si ese
// proyecto se pausa por un pago fallido o alguien lo borra, el sitio no se rompe
// —cae a los defaults— pero se queda sin portfolio, y no hay ninguna otra copia.
// Eso era tolerable mientras hubiera mantenimiento; sin mantenimiento, no.
//
// Qué NO cubre, para que no dé una falsa sensación de completo:
//   · Los videos de YouTube. Viven en el canal de Anibal, que es su propia copia.
//     Acá sólo se guardan las miniaturas que estén en el bucket.
//   · La cuenta de Supabase en sí: usuarios del admin, políticas de RLS, claves.
//     Eso se reconstruye con los .sql del repo.
//
// Es incremental: un archivo que ya está bajado y pesa lo mismo no se vuelve a
// bajar, así que se puede correr seguido y tarda segundos.

import { mkdirSync, writeFileSync, existsSync, statSync, createWriteStream } from 'fs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(root, 'backup');

// ── Credenciales, del mismo .env que usa el sitio ──
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const URL_BASE = env.VITE_SUPABASE_URL;
const CLAVE = env.VITE_SUPABASE_ANON_KEY;
if (!URL_BASE || !CLAVE) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

// Las tablas que tienen contenido del cliente. Las legacy van igual: son filas
// que ya no se muestran pero que nadie decidió borrar.
const TABLAS = [
  'categories', 'subcategories', 'work_items', 'faqs', 'carousel_items',
  'facebook_reviews', 'google_reviews', 'site_config', 'happy_customers',
  'highlights', 'returning_customers',
];

const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` };

/**
 * PostgREST corta en 1000 filas por defecto y work_items ya está en 971: sin
 * paginar, el backup se vería completo y estaría silenciosamente recortado el
 * día que crucen ese número.
 */
async function traerTabla(tabla) {
  const filas = [];
  const PASO = 500;
  for (let desde = 0; ; desde += PASO) {
    const res = await fetch(`${URL_BASE}/rest/v1/${tabla}?select=*`, {
      headers: { ...cabeceras, Range: `${desde}-${desde + PASO - 1}` },
    });
    if (!res.ok) throw new Error(`${tabla}: HTTP ${res.status}`);
    const lote = await res.json();
    filas.push(...lote);
    if (lote.length < PASO) break;
  }
  return filas;
}

/** La ruta dentro del bucket, para reproducir la misma estructura en disco. */
function rutaEnBucket(url) {
  const m = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function bajar(url, destino) {
  if (existsSync(destino)) {
    // Ya está: se compara el peso contra el servidor para detectar una descarga
    // que quedó cortada por la mitad en una corrida anterior.
    const head = await fetch(url, { method: 'HEAD' });
    const esperado = Number(head.headers.get('content-length') || 0);
    if (esperado > 0 && statSync(destino).size === esperado) return { estado: 'ya-estaba', bytes: 0 };
  }
  const res = await fetch(url);
  if (!res.ok) return { estado: 'falló', error: `HTTP ${res.status}` };
  mkdirSync(dirname(destino), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destino));
  return { estado: 'bajado', bytes: statSync(destino).size };
}

/** De a 6 en paralelo: alcanza para que sea rápido sin castigar al servidor. */
async function enTandas(items, n, fn) {
  const salida = [];
  for (let i = 0; i < items.length; i += n) {
    salida.push(...(await Promise.all(items.slice(i, i + n).map(fn))));
  }
  return salida;
}

const mb = (b) => (b / 1048576).toFixed(1);

console.log(`\nCopia de ${URL_BASE.replace(/https:\/\//, '')}\n`);

// ── 1. Las tablas ──
mkdirSync(join(DESTINO, 'datos'), { recursive: true });
const conteos = {};
for (const tabla of TABLAS) {
  try {
    const filas = await traerTabla(tabla);
    writeFileSync(join(DESTINO, 'datos', `${tabla}.json`), JSON.stringify(filas, null, 2));
    conteos[tabla] = filas.length;
    console.log(`  ${String(filas.length).padStart(5)}  ${tabla}`);
  } catch (e) {
    conteos[tabla] = `error: ${e.message}`;
    console.log(`  ERROR  ${tabla} — ${e.message}`);
  }
}

// ── 2. Los archivos del bucket ──
// Las URLs salen del contenido, no de listar el bucket: la clave anónima no
// puede listarlo, y de paso esto garantiza que se baje todo lo que el sitio
// efectivamente usa. Un archivo huérfano en el bucket no lo necesita nadie.
const urls = new Set();
for (const tabla of ['work_items', 'categories', 'subcategories', 'carousel_items', 'happy_customers', 'highlights']) {
  const ruta = join(DESTINO, 'datos', `${tabla}.json`);
  if (!existsSync(ruta)) continue;
  for (const fila of JSON.parse(readFileSync(ruta, 'utf8'))) {
    for (const v of Object.values(fila)) {
      if (typeof v === 'string' && v.includes('/storage/v1/object/public/')) urls.add(v);
    }
  }
}

console.log(`\n  ${urls.size} archivos en el bucket\n`);

let bajados = 0, yaEstaban = 0, bytes = 0;
const fallos = [];
const listado = [...urls];

const resultados = await enTandas(listado, 6, async (url) => {
  const rel = rutaEnBucket(url);
  if (!rel) return { estado: 'falló', url, error: 'no pude leer la ruta del bucket' };
  const r = await bajar(url, join(DESTINO, 'media', rel));
  return { ...r, url };
});

for (const r of resultados) {
  if (r.estado === 'bajado') { bajados++; bytes += r.bytes; }
  else if (r.estado === 'ya-estaba') yaEstaban++;
  else fallos.push({ url: r.url, error: r.error });
  const hechos = bajados + yaEstaban + fallos.length;
  if (hechos % 50 === 0) process.stdout.write(`  ${hechos}/${listado.length}\r`);
}

// ── 3. El manifiesto ──
const manifiesto = {
  fecha: new Date().toISOString(),
  origen: URL_BASE,
  tablas: conteos,
  archivos: { total: listado.length, bajadosAhora: bajados, yaEstaban, fallidos: fallos.length },
  megasBajadosAhora: Number(mb(bytes)),
  fallos,
};
writeFileSync(join(DESTINO, 'MANIFIESTO.json'), JSON.stringify(manifiesto, null, 2));

console.log(`  ${listado.length}/${listado.length}          `);
console.log(`\n  bajados ahora : ${bajados} (${mb(bytes)} MB)`);
console.log(`  ya estaban    : ${yaEstaban}`);
console.log(`  fallidos      : ${fallos.length}`);
for (const f of fallos.slice(0, 10)) console.log(`      ${f.error}  ${f.url.slice(-60)}`);
console.log(`\n  → ${DESTINO}\n`);

// Un backup incompleto que dice que salió bien es peor que uno que falla.
if (fallos.length > 0) process.exit(1);
