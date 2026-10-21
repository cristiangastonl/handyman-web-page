/**
 * Avisa cuando el tráfico a Supabase se dispara, antes de que se coma la cuota.
 *
 * Por qué existe: el 21/10/2026 Supabase cortó la organización entera (402,
 * exceed_cached_egress_quota): se habían ido los 250 GB de egress del plan Pro.
 * Nadie se enteró hasta que el sitio quedó sin fotos. Casi todo lo había gastado
 * el propio harness corriendo e2e contra el bucket de producción — el 19/10 hubo
 * 116.000 pedidos al storage, contra 300–1.200 de un día normal.
 *
 * La Management API no da los GB de egress, pero sí los pedidos por día, y esa
 * es justo la señal que se habría visto venir: cada pedido al storage es una foto
 * original de ~1 MB. Se mira la organización entera porque la cuota es de la org:
 * HandyMan comparte los 250 GB con los otros proyectos que viven ahí.
 *
 * Corre todos los días desde .github/workflows/uso-supabase.yml (si falla, GitHub
 * manda un mail) y a mano con `npm run verify:uso`. No va dentro de `verify`
 * porque necesita red y un token de la cuenta.
 *
 * Token: SUPABASE_ACCESS_TOKEN del entorno, o el de .env.supabase.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// El ref no es secreto: va en el bundle público del sitio.
const PROYECTO = process.env.SUPABASE_PROJECT_REF || 'hjviylxrqgplcrpjodsa';

// Pedidos por día, sumando todos los proyectos de la organización. Un día normal
// del sitio: ~300–1.200 al storage y ~150–700 a la base. El corte del 21/10 vino
// de días con 49.000 y 116.000 al storage.
const UMBRAL_STORAGE = 20_000; // ~20 GB en fotos originales: 250 GB se van en 12 días así
const UMBRAL_REST = 40_000;

const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const gris = (s) => `\x1b[2m${s}\x1b[0m`;

function token() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN.trim();
  const f = join(root, '.env.supabase');
  if (!existsSync(f)) return null;
  const m = readFileSync(f, 'utf8').match(/^\s*SUPABASE_ACCESS_TOKEN\s*=\s*(.*?)\s*$/m);
  return m ? m[1].replace(/^["']|["']$/g, '') : null;
}

async function api(tok, path) {
  const res = await fetch(`https://api.supabase.com${path}`, { headers: { Authorization: `Bearer ${tok}` } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function main() {
  const tok = token();
  if (!tok) {
    console.error(rojo('Falta SUPABASE_ACCESS_TOKEN (variable de entorno o .env.supabase).'));
    process.exit(1);
  }

  const proyecto = await api(tok, `/v1/projects/${PROYECTO}`);
  const todos = await api(tok, '/v1/projects');
  const deLaOrg = todos.filter((p) => p.organization_id === proyecto.organization_id);

  // Por día: { '2026-10-19': { storage, rest, porProyecto: { nombre: storage } } }
  const dias = {};
  for (const p of deLaOrg) {
    const { result = [] } = await api(tok, `/v1/projects/${p.id}/analytics/endpoints/usage.api-counts?interval=7day`);
    for (const d of result) {
      const dia = d.timestamp.slice(0, 10);
      const acc = (dias[dia] ||= { storage: 0, rest: 0, porProyecto: {} });
      acc.storage += d.total_storage_requests || 0;
      acc.rest += d.total_rest_requests || 0;
      acc.porProyecto[p.name] = (acc.porProyecto[p.name] || 0) + (d.total_storage_requests || 0);
    }
  }

  const orden = Object.keys(dias).sort();
  console.log(`\nPedidos por día a Supabase — org de "${proyecto.name}" (${deLaOrg.map((p) => p.name).join(', ')})\n`);
  for (const dia of orden) {
    const { storage, rest } = dias[dia];
    const alto = storage > UMBRAL_STORAGE || rest > UMBRAL_REST;
    const linea = `  ${dia}  storage ${String(storage).padStart(7)}   rest ${String(rest).padStart(7)}`;
    console.log(alto ? rojo(linea) : linea);
  }

  // Se juzgan el último día completo y el de hoy: los anteriores ya se avisaron.
  const fallas = [];
  for (const dia of orden.slice(-2)) {
    const { storage, rest, porProyecto } = dias[dia];
    const culpable = Object.entries(porProyecto).sort((a, b) => b[1] - a[1])[0];
    if (storage > UMBRAL_STORAGE)
      fallas.push(`${dia}: ${storage} pedidos al storage (umbral ${UMBRAL_STORAGE}); el que más pidió: ${culpable[0]} (${culpable[1]})`);
    if (rest > UMBRAL_REST)
      fallas.push(`${dia}: ${rest} pedidos a la base (umbral ${UMBRAL_REST})`);
  }

  if (fallas.length) {
    console.log(rojo('\n✗ Tráfico fuera de lo normal:'));
    for (const f of fallas) console.log(rojo(`  - ${f}`));
    console.log(gris('\n  Cada pedido al storage es una foto de ~1 MB. Mirar el egress en GB en el dashboard'));
    console.log(gris('  (Organization → Usage). Primer sospechoso: e2e corriendo contra el bucket de producción.\n'));
    process.exit(1);
  }
  console.log(verde('\n✓ Tráfico normal.\n'));
}

main().catch((e) => {
  console.error(rojo(`✗ ${e.message}`));
  process.exit(1);
});
