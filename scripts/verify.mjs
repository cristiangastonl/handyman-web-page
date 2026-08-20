#!/usr/bin/env node
/**
 * Harness de verificación.
 *
 *   npm run verify                  guards + unit + build + e2e  (ciclo completo)
 *   npm run verify:fast             guards + unit                (~5s)
 *   npm run verify:scope            elige las etapas según qué archivos tocaste
 *   npm run verify -- --stage=e2e   una sola etapa
 *
 * Sale con código 1 en la primera etapa que falla, así el agente
 * (o vos) tiene una señal binaria de "esto está bien / esto está roto".
 */
import { spawn, execSync } from 'child_process';
import { performance } from 'perf_hooks';

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const ALL_STAGES = [
  {
    name: 'guards',
    desc: 'i18n, convenciones, env',
    cmd: ['node', ['scripts/guards/index.mjs']],
    fast: true,
  },
  {
    name: 'unit',
    desc: 'vitest',
    cmd: ['npx', ['vitest', 'run', '--reporter=dot']],
    fast: true,
  },
  {
    name: 'build',
    desc: 'vite build + prerender',
    cmd: ['npm', ['run', 'build']],
  },
  {
    name: 'e2e',
    desc: 'playwright sobre el build',
    cmd: ['npx', ['playwright', 'test']],
  },
];

/**
 * Qué etapas hacen falta según los archivos tocados.
 * La idea: no pagar 2 minutos de e2e por cambiar un JSON de traducciones,
 * pero tampoco dejar pasar un cambio de componente sin abrir el navegador.
 */
function scopedStages() {
  let changed = [];
  try {
    const out = [
      execSync('git diff HEAD --name-only', { encoding: 'utf8' }),
      execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }),
    ].join('\n');
    changed = out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return { stages: ALL_STAGES, reason: 'sin git: corro todo' };
  }

  if (!changed.length)
    return { stages: ALL_STAGES.filter((s) => s.fast), reason: 'sin cambios' };

  const touches = (re) => changed.some((f) => re.test(f));

  // Cualquier cosa que llegue al navegador pide el ciclo completo.
  const needsBrowser =
    touches(/^src\/(components|lib|hooks)\//) ||
    touches(/^src\/(App|main)\.jsx$/) ||
    touches(/^src\/i18n\.js$/) ||
    touches(/^(index\.html|vite\.config\.js|playwright\.config\.js)$/) ||
    touches(/^e2e\//) ||
    touches(/^public\//) ||
    touches(/^scripts\/prerender\.mjs$/);

  if (needsBrowser)
    return {
      stages: ALL_STAGES,
      reason: `cambios que llegan al navegador (${changed.length} archivo(s))`,
    };

  return {
    stages: ALL_STAGES.filter((s) => s.fast),
    reason: `solo cambios que no tocan el render (${changed.length} archivo(s))`,
  };
}

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--stage='))?.split('=')[1];
const fastMode = args.includes('--fast');
const scopeMode = args.includes('--scope');

let stages = ALL_STAGES;
let scopeReason = null;
if (only) stages = ALL_STAGES.filter((s) => s.name === only);
else if (fastMode) stages = ALL_STAGES.filter((s) => s.fast);
else if (scopeMode) ({ stages, reason: scopeReason } = scopedStages());

if (!stages.length) {
  console.error(
    `Etapa desconocida: ${only}. Opciones: ${ALL_STAGES.map((s) => s.name).join(', ')}`
  );
  process.exit(2);
}

if (scopeReason)
  console.log(
    c.dim(`scope: ${scopeReason} → ${stages.map((s) => s.name).join(', ')}`)
  );

const run = (cmd, cmdArgs) =>
  new Promise((resolve) => {
    const p = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    p.on('close', (code) => resolve(code ?? 1));
    p.on('error', () => resolve(1));
  });

const results = [];
let failed = null;

for (const stage of stages) {
  console.log(
    `\n${c.cyan('▶')} ${c.bold(stage.name)} ${c.dim(`— ${stage.desc}`)}`
  );
  const t0 = performance.now();
  const code = await run(...stage.cmd);
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  results.push({ ...stage, code, secs });

  if (code !== 0) {
    failed = stage.name;
    break;
  }
}

console.log(`\n${c.bold('─'.repeat(48))}`);
for (const r of results) {
  const mark = r.code === 0 ? c.green('PASS') : c.red('FAIL');
  console.log(`  ${mark}  ${r.name.padEnd(8)} ${c.dim(`${r.secs}s`)}`);
}
const skipped = stages.slice(results.length);
for (const s of skipped) console.log(`  ${c.dim('SKIP')}  ${c.dim(s.name)}`);
console.log(c.bold('─'.repeat(48)));

if (failed) {
  console.log(
    c.red(`\n✗ Falló en "${failed}". Arreglá eso y volvé a correr npm run verify.\n`)
  );
  process.exit(1);
}
console.log(c.green('\n✓ Todo verde. El cambio está sano.\n'));
