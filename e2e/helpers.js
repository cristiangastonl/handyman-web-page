import { expect } from '@playwright/test';

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
