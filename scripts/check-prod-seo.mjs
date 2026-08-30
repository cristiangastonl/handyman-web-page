/**
 * Verifica que lo que sirve producción esté prerenderizado de verdad.
 *
 * Por qué existe: el harness tenía tests de "SEO / prerender" que corrían contra
 * `npm run build` local, pero Vercel buildeaba con `build:fast` (sin prerender).
 * Los tests daban verde mientras producción servía 8 KB de cáscara vacía. Un
 * check que mira el build local no puede detectar eso: hay que preguntarle al
 * sitio publicado.
 *
 * Uso:  npm run verify:prod            (usa la URL de producción)
 *       SITE_URL=https://... npm run verify:prod
 */

const SITE = (process.env.SITE_URL || 'https://handyman-web-page.vercel.app').replace(/\/$/, '');
const ROUTES = ['/', '/portfolio', '/reviews', '/faq'];

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const gris = (s) => `\x1b[2m${s}\x1b[0m`;

/** El shell sin renderizar tiene <div id="root"></div> vacío. */
function rootVacio(html) {
  const m = /<div id="root"[^>]*>([\s\S]*?)<\/div>/.exec(html);
  if (!m) return true;
  return m[1].trim().length === 0;
}

const texto = (html, re) => (re.exec(html)?.[1] || '').trim();

async function main() {
  console.log(`\nVerificando el prerender en ${SITE}\n`);
  const fallas = [];

  for (const route of ROUTES) {
    const url = `${SITE}${route}`;
    let html;
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) { fallas.push(`${route}: HTTP ${res.status}`); continue; }
      html = await res.text();
    } catch (err) {
      fallas.push(`${route}: no respondió (${err.message})`);
      continue;
    }

    const kb = (html.length / 1024).toFixed(0);
    const title = texto(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const desc = texto(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const problemas = [];

    // El corazón del check: si el root viene vacío, lo que se publicó es el
    // shell y el contenido sólo existe después de que el visitante ejecute JS.
    if (rootVacio(html)) problemas.push('el <div id="root"> viene vacío: NO está prerenderizado');
    if (title.length < 10) problemas.push(`title demasiado corto (${title.length} chars)`);
    if (desc.length < 20) problemas.push(`meta description demasiado corta (${desc.length} chars)`);

    if (problemas.length) {
      console.log(`${rojo('✗')} ${route.padEnd(11)} ${gris(`${kb} KB`)}`);
      problemas.forEach((p) => { console.log(`    ${rojo('!')} ${p}`); fallas.push(`${route}: ${p}`); });
    } else {
      console.log(`${verde('✓')} ${route.padEnd(11)} ${gris(`${kb} KB · "${title.slice(0, 45)}"`)}`);
    }
  }

  if (fallas.length) {
    console.log(rojo(`\n✗ ${fallas.length} problema(s). Producción no está sirviendo el HTML prerenderizado.`));
    console.log(gris('  Revisá que el buildCommand de vercel.json corra `npm run build` (con prerender)'));
    console.log(gris('  y que el deploy nuevo esté promovido a producción.\n'));
    process.exit(1);
  }
  console.log(verde('\n✓ Producción sirve el HTML prerenderizado en las 4 rutas.\n'));
}

main();
