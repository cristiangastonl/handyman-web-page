/**
 * Chequeo de salud del sitio publicado: ¿lo que ve un visitante está entero?
 *
 * Por qué existe: los problemas que tuvo el sitio en producción no los vio nadie
 * a tiempo. El 21/10/2026 Supabase cortó la org (402) y el sitio quedó sin fotos
 * hasta que alguien entró a mirar; antes, Vercel sirvió una cáscara vacía sin
 * prerender durante días. Desde noviembre de 2026 el monitoreo es parte del abono
 * de Anibal: este script es ese monitoreo.
 *
 * Corre cada hora desde .github/workflows/salud.yml, que abre un issue en GitHub
 * cuando algo falla y lo cierra cuando vuelve (un mail al caer, otro al volver;
 * no uno por hora). A mano: `npm run verify:salud`.
 *
 * Es liviano a propósito, porque corre 24 veces por día: un GET a la home, uno a
 * la vista previa, uno a la base, un HEAD a una foto (no la baja: no gasta
 * egress). Nada de pollear: la protección anti-bot de Vercel responde con una
 * página "Security Checkpoint" que parece el sitio, y acá se distingue aparte.
 *
 * Tokens opcionales: SUPABASE_ACCESS_TOKEN (estado del proyecto en Supabase) y
 * GITHUB_TOKEN (estado del último deploy). Sin ellos esos chequeos se saltean.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import tls from 'tls';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = (process.env.SITE_URL || 'https://www.handymanservicesinzurich.ch').replace(/\/$/, '');
const APEX = 'https://handymanservicesinzurich.ch';
const PROYECTO = process.env.SUPABASE_PROJECT_REF || 'hjviylxrqgplcrpjodsa';
const REPO = process.env.GITHUB_REPOSITORY || 'cristiangastonl/handyman-web-page';
// Let's Encrypt renueva solo a los 30 días del vencimiento; con menos de 14 la
// renovación automática ya falló al menos dos semanas seguidas.
const CERT_DIAS_MIN = 14;
const TIMEOUT_MS = 20_000;

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;
const gris = (s) => `\x1b[2m${s}\x1b[0m`;

function leerEnv(archivo) {
  const f = join(root, archivo);
  if (!existsSync(f)) return {};
  return Object.fromEntries(
    readFileSync(f, 'utf8').split('\n')
      .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
  );
}
const E = { ...leerEnv('.env'), ...leerEnv('.env.supabase'), ...process.env };

const pedir = (url, opts = {}) => fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), ...opts });
const esCheckpoint = (html) => /<title>\s*Vercel Security Checkpoint/i.test(html);

class Salteado extends Error {}

// Cada chequeo devuelve un texto corto si está bien, o tira con lo que encontró.
const CHEQUEOS = [
  ['El sitio responde y viene prerenderizado', async () => {
    const res = await pedir(`${SITE}/`, { headers: { 'Cache-Control': 'no-cache' } });
    const html = await res.text();
    if (esCheckpoint(html)) throw new Salteado('Vercel respondió con su "Security Checkpoint" anti-bot; no se pudo ver el sitio');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const root_ = /<div id="root"[^>]*>([\s\S]*?)<\/div>/.exec(html);
    if (!root_ || !root_[1].trim()) throw new Error('el <div id="root"> llega vacío: se sirve la cáscara sin prerender');
    const js = /src="(\/assets\/[^"]+\.js)"/.exec(html)?.[1];
    if (!js) throw new Error('el HTML no referencia ningún /assets/*.js');
    const bundle = await pedir(`${SITE}${js}`, { method: 'HEAD' });
    if (!bundle.ok) throw new Error(`el bundle ${js} da HTTP ${bundle.status}: el deploy quedó a medias`);
    return `${Math.round(html.length / 1024)} KB de HTML, bundle ${js.split('/').pop()} OK`;
  }],

  ['El dominio sin www redirige al sitio', async () => {
    const res = await pedir(`${APEX}/`, { method: 'HEAD', redirect: 'manual' });
    const destino = res.headers.get('location') || '';
    if (res.status < 300 || res.status > 399 || !destino.startsWith(SITE))
      throw new Error(`HTTP ${res.status} → "${destino}" (se esperaba una redirección a ${SITE})`);
    return `${res.status} → ${destino}`;
  }],

  ['El certificado HTTPS no está por vencer', async () => {
    const host = new URL(SITE).hostname;
    const vence = await new Promise((ok, mal) => {
      const s = tls.connect({ host, port: 443, servername: host, timeout: TIMEOUT_MS }, () => {
        const c = s.getPeerCertificate(); s.end(); ok(new Date(c.valid_to));
      });
      s.on('error', mal); s.on('timeout', () => { s.destroy(); mal(new Error('timeout')); });
    });
    const dias = Math.floor((vence - Date.now()) / 86_400_000);
    if (dias < CERT_DIAS_MIN) throw new Error(`vence en ${dias} días (${vence.toISOString().slice(0, 10)}): la renovación automática no está andando`);
    return `vence en ${dias} días`;
  }],

  ['La base de datos responde', async () => {
    const url = (E.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = E.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
    const res = await pedir(`${url}/rest/v1/site_config?select=key&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 150)}`);
    const filas = await res.json();
    if (!filas.length) throw new Error('site_config vino vacía: el sitio mostraría los textos por defecto');
    return 'site_config OK';
  }],

  ['Las fotos se pueden ver', async () => {
    const url = (E.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = E.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
    // La última que subió Anibal: si el bucket está cortado o lo nuevo no se guarda, salta acá.
    const res = await pedir(`${url}/rest/v1/work_items?select=src&src=not.is.null&order=id.desc&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`no se pudo leer work_items: HTTP ${res.status}`);
    const [item] = await res.json();
    if (!item) throw new Error('work_items no tiene ninguna foto');
    // HEAD: confirma que la foto está sin bajarla (no gasta egress).
    const foto = await pedir(item.src, { method: 'HEAD' });
    const tipo = foto.headers.get('content-type') || '';
    if (foto.status === 402) throw new Error('HTTP 402: Supabase cortó el storage por cuota (como el 21/10/2026)');
    if (!foto.ok || !tipo.startsWith('image/')) throw new Error(`HTTP ${foto.status} (${tipo || 'sin tipo'}) en ${item.src}`);
    return `${item.src.split('/').pop()} → ${foto.status} ${tipo}`;
  }],

  ['La vista previa de WhatsApp arma la tarjeta', async () => {
    const res = await pedir(`${SITE}/portfolio/mounting`, { headers: { 'User-Agent': 'WhatsApp/2.24.1 A' } });
    const html = await res.text();
    if (esCheckpoint(html)) throw new Salteado('Vercel respondió con su "Security Checkpoint"');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const img = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
    if (!img) throw new Error('la respuesta no trae og:image: el link de un trabajo llega a WhatsApp sin foto');
    return 'og:image OK';
  }],

  ['El proyecto de Supabase está activo', async () => {
    const tok = E.SUPABASE_ACCESS_TOKEN;
    if (!tok) throw new Salteado('sin SUPABASE_ACCESS_TOKEN');
    const res = await pedir(`https://api.supabase.com/v1/projects/${PROYECTO}`, { headers: { Authorization: `Bearer ${tok}` } });
    if (!res.ok) throw new Error(`Management API: HTTP ${res.status}`);
    const { status } = await res.json();
    if (status !== 'ACTIVE_HEALTHY') throw new Error(`estado "${status}" (pausado, restaurando o con problemas)`);
    return status;
  }],

  ['El último deploy salió bien', async () => {
    const tok = E.GITHUB_TOKEN || E.GH_TOKEN;
    if (!tok) throw new Salteado('sin GITHUB_TOKEN');
    const gh = (p) => pedir(`https://api.github.com/repos/${REPO}${p}`, { headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json' } }).then((r) => r.json());
    const [dep] = await gh('/deployments?environment=Production&per_page=1');
    if (!dep) throw new Salteado('GitHub no tiene deploys de Production');
    const [estado] = await gh(`/deployments/${dep.id}/statuses?per_page=1`);
    const s = estado?.state || 'sin estado';
    const desde = Math.round((Date.now() - new Date(dep.created_at)) / 60_000);
    // Un deploy recién lanzado está en curso; recién preocupa si sigue así una hora después.
    if (['pending', 'in_progress', 'queued'].includes(s) && desde < 60) return `${dep.sha.slice(0, 7)} en curso`;
    if (s !== 'success') throw new Error(`${dep.sha.slice(0, 7)} quedó en "${s}": producción sigue con la versión anterior`);
    return `${dep.sha.slice(0, 7)} success`;
  }],
];

async function main() {
  console.log(`\nSalud de ${SITE}\n`);
  const res = [];
  for (const [nombre, fn] of CHEQUEOS) {
    try {
      res.push({ nombre, estado: 'ok', detalle: await fn() });
    } catch (err) {
      const salteado = err instanceof Salteado;
      const detalle = err.name === 'TimeoutError' ? `no respondió en ${TIMEOUT_MS / 1000} s` : err.message;
      res.push({ nombre, estado: salteado ? 'salteado' : 'falla', detalle });
    }
    const r = res.at(-1);
    const marca = r.estado === 'ok' ? verde('OK  ') : r.estado === 'falla' ? rojo('FAIL') : amarillo('SKIP');
    console.log(`${marca}  ${r.nombre.padEnd(44)} ${gris(r.detalle)}`);
  }

  const fallas = res.filter((r) => r.estado === 'falla');
  // Para el issue que abre el workflow.
  if (E.SALUD_REPORTE) {
    const lineas = res.map((r) => `- ${r.estado === 'ok' ? '✅' : r.estado === 'falla' ? '❌' : '⏭️'} **${r.nombre}** — ${r.detalle}`);
    writeFileSync(E.SALUD_REPORTE, lineas.join('\n') + '\n');
  }
  console.log('');
  if (fallas.length) {
    console.log(rojo(`FAIL — ${fallas.length} chequeo(s) en rojo.`));
    process.exit(1);
  }
  console.log(verde('PASS — el sitio está sano.'));
}

main().catch((err) => { console.error(rojo(err.stack || err.message)); process.exit(1); });
