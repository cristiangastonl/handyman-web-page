import zlib from 'node:zlib';
import { test as base, expect } from '@playwright/test';

export { expect };

// La foto que reciben los tests en lugar de las del bucket: un PNG gris de 800×600
// (~1 KB). Tiene tamaño de foto a propósito: con una de 1×1 px las columnas de
// Happy Customers de los márgenes se encogían, entraban decenas en pantalla y la
// home pedía 54 fotos en vez de ~9 — el layout tiene que ser el de verdad.
function pngGris(ancho, alto) {
  const crc = (buf) => {
    let c = ~0;
    for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); }
    return ~c >>> 0;
  };
  const bloque = (tipo, datos) => {
    const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length);
    const cuerpo = Buffer.concat([Buffer.from(tipo), datos]);
    const suma = Buffer.alloc(4); suma.writeUInt32BE(crc(cuerpo));
    return Buffer.concat([largo, cuerpo, suma]);
  };
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0); cabecera.writeUInt32BE(alto, 4);
  cabecera[8] = 8; cabecera[9] = 0; // 8 bits, escala de grises
  const fila = Buffer.concat([Buffer.from([0]), Buffer.alloc(ancho, 0xcc)]);
  const pixeles = zlib.deflateSync(Buffer.concat(Array(alto).fill(fila)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera), bloque('IDAT', pixeles), bloque('IEND', Buffer.alloc(0)),
  ]);
}
const FOTO_FALSA = pngGris(800, 600);

/**
 * Las fotos de Supabase Storage no se bajan en los tests: se responden con FOTO_FALSA.
 *
 * El 21/10/2026 Supabase cortó el proyecto (402, exceed_cached_egress_quota): se
 * habían ido los 250 GB del plan Pro, y casi todo lo había gastado este harness.
 * Cada verify corre ~150 tests con el navegador sin caché contra el bucket de
 * producción, y las fotos son originales de ~1 MB: el 19/10, con 6 commits, hubo
 * 116.000 pedidos al storage contra ~1.000 de un día sin commits.
 *
 * Al navegador le llega igual el pedido y una respuesta 200, así que lo que se mide
 * de los pedidos (cuántas fotos pide la home) sigue valiendo. Un test que necesite
 * la foto de verdad (su proporción, por ejemplo) declara `test.use({ fotosReales: true })`.
 */
export const test = base.extend({
  fotosReales: [false, { option: true }],
  page: async ({ page, fotosReales }, use) => {
    if (!fotosReales) {
      await page.route('**/storage/v1/object/**', (route) =>
        route.request().resourceType() === 'image'
          ? route.fulfill({ status: 200, contentType: 'image/png', body: FOTO_FALSA })
          : route.continue());
    }
    await use(page);
  },
});

// Ruido conocido que no queremos que rompa el harness.
const IGNORED = [
  /favicon/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /Failed to load resource.*youtube/i,
  /googletagmanager|google-analytics/i,
  /Download the React DevTools/i,
];

/**
 * Engancha la consola y los errores de página. Devuelve un objeto con los
 * mensajes acumulados y un assert que se llama al final del test.
 */
export function watchConsole(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!IGNORED.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (err) => {
    if (!IGNORED.some((r) => r.test(err.message))) errors.push(err.message);
  });
  return {
    errors,
    assertClean() {
      expect(errors, `errores de consola:\n${errors.join('\n')}`).toEqual([]);
    },
  };
}

// Las fotos de obra salen de Supabase Storage y son pesadas: en /portfolio la red
// no queda quieta en varios segundos. Sin timeout explicito este wait hereda el
// del test (30s) y se lo come entero, que es justo lo contrario de lo que el
// .catch() pretende. Lo dejamos como un "asentar si asienta rapido": lo que de
// verdad importa lo esperan los expect(), que ya reintentan solos.
const SETTLE_MS = 3_000;

/** Navega y espera a que React haya montado contenido real. */
export async function visit(page, path) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#root')).not.toBeEmpty();
  await page.waitForLoadState('networkidle', { timeout: SETTLE_MS }).catch(() => {});
}

/**
 * Espera a que la presentación ("Meet your handyman") esté quieta.
 *
 * FadeIn la monta 24px más abajo con una transición de 0.7s (FadeIn.jsx). Los tests que
 * miden contra el borde de la pantalla —si los tags entran, si las tarjetas asoman— tienen
 * que medir el layout en reposo, que es el único que una persona llega a evaluar: durante
 * esos 0.7s el bloque entero está corrido y las medidas dan 24px de más. Con la máquina
 * libre la animación termina antes de que el test mida y no se nota; con ocho workers
 * peleando por CPU, no, y el test fallaba de a ratos.
 *
 * No es un sleep: se espera la condición concreta —transform en reposo y opacidad 1— así
 * que en cuanto asienta sigue.
 */
export async function esperarPresentacionAsentada(page) {
  await page.waitForSelector('.about-row img', { state: 'attached' });
  await page.waitForFunction(() => {
    const wrapper = document.querySelector('.about-row')?.closest('section')?.parentElement;
    if (!wrapper) return false;
    const cs = getComputedStyle(wrapper);
    const enReposo = cs.transform === 'none' || cs.transform === 'matrix(1, 0, 0, 1, 0, 0)';
    return enReposo && cs.opacity === '1';
  }, null, { timeout: 10_000 });
}

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

export const ROUTES = ['/', '/portfolio', '/reviews', '/faq'];
