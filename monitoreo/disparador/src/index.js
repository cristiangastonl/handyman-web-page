// Dispara el chequeo de salud (.github/workflows/salud.yml) cada hora, en punto.
//
// Por qué existe: salud.yml tiene su propio cron de GitHub ('17 * * * *'), pero
// GitHub no garantiza los horarios programados. Entre el 03/11 y el 20/11/2026 corrió
// 59 veces en vez de ~400, cada 5 a 8 horas: una caída podía tardar medio día en
// avisarse. El cron de Cloudflare sí sale a horario. El de GitHub queda como respaldo.
//
// Lo único que hace es pedirle a GitHub que corra el workflow; el chequeo y los
// avisos (issue con la etiqueta "salud") siguen siendo los de salud.yml. Si esto deja
// de andar (token vencido, Worker borrado), lo detecta scripts/check-monitoreo.mjs
// en el diario y llega el mail de "Run failed".

export const REPO = "cristiangastonl/handyman-web-page";
export const WORKFLOW = "salud.yml";

export async function dispararSalud(env, hacerFetch = fetch) {
  if (!env.GITHUB_TOKEN) throw new Error("Falta el secret GITHUB_TOKEN");
  const res = await hacerFetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // GitHub rechaza los pedidos sin User-Agent.
        "User-Agent": "handyman-monitoreo",
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );
  // 204 = aceptado. Cualquier otra cosa se tira como error para que la corrida
  // figure como fallida en el panel de Cloudflare.
  if (res.status !== 204) {
    throw new Error(`GitHub respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

export default {
  async scheduled(_evento, env, ctx) {
    ctx.waitUntil(dispararSalud(env));
  },
};
