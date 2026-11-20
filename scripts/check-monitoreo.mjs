// ¿Está corriendo el chequeo de salud? Falla si salud.yml no corrió en las últimas
// 2 horas.
//
// salud.yml lo dispara cada hora un Worker de Cloudflare (monitoreo/disparador), con el
// cron de GitHub de respaldo, que sólo corre cada 5 a 8 horas. Si el Worker deja de
// andar (token de GitHub vencido, Worker borrado, cuenta de Cloudflare) nadie se
// enteraría: el monitoreo seguiría "verde", pero con medio día de atraso. Este chequeo
// corre en el diario y, si falla, llega el mail de "Run failed".
//
// Necesita GITHUB_TOKEN (en Actions es el del workflow) o el `gh` logueado.
import { execFileSync } from "node:child_process";

const REPO = process.env.GITHUB_REPOSITORY || "cristiangastonl/handyman-web-page";
const MAX_HORAS = 2;

async function ultimaCorrida() {
  const ruta = `repos/${REPO}/actions/workflows/salud.yml/runs?per_page=1`;
  if (process.env.GITHUB_TOKEN) {
    const res = await fetch(`https://api.github.com/${ruta}`, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "User-Agent": "handyman-monitoreo" },
    });
    if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
    return (await res.json()).workflow_runs[0];
  }
  return JSON.parse(execFileSync("gh", ["api", ruta], { encoding: "utf8" })).workflow_runs[0];
}

const corrida = await ultimaCorrida();
if (!corrida) {
  console.error("✗ salud.yml no corrió nunca.");
  process.exit(1);
}
const horas = (Date.now() - new Date(corrida.created_at)) / 36e5;
const detalle = `última corrida hace ${horas.toFixed(1)} h (${corrida.event}, ${corrida.created_at})`;
if (horas > MAX_HORAS) {
  console.error(`✗ El chequeo de salud no está corriendo cada hora: ${detalle}.`);
  console.error("  Revisar el Worker de Cloudflare (monitoreo/disparador) y su GITHUB_TOKEN.");
  process.exit(1);
}
console.log(`✓ El chequeo de salud corre: ${detalle}.`);
