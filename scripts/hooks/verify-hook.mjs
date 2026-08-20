#!/usr/bin/env node
/**
 * El motor del ciclo automático. Es el puente entre los hooks de Claude Code
 * y el harness: convierte "el harness falló" en "no puedo terminar todavía".
 *
 *   node scripts/hooks/verify-hook.mjs guards      PostToolUse — tras cada edición (~0.1s)
 *   node scripts/hooks/verify-hook.mjs gate        Stop — antes de dar algo por terminado
 *   node scripts/hooks/verify-hook.mjs precommit   PreToolUse — antes de commit/push/deploy
 *
 * Salir con código 2 es la señal de Claude Code para "bloqueá y pasale
 * el stderr al agente". Ese rebote es el que arma el loop: falla → el
 * agente ve el error → arregla → el hook vuelve a correr → hasta verde.
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mode = process.argv[2] || 'guards';

// Cuántas vueltas de "fallá y arreglá" antes de rendirse y pedir ayuda humana.
// Sin tope, un error que el agente no sabe arreglar deja la sesión girando.
const MAX_ATTEMPTS = Number(process.env.HARNESS_MAX_ATTEMPTS || 4);

const stateDir = join(root, 'node_modules', '.cache', 'harness');
const statePath = join(stateDir, 'attempts.json');

const readState = () => {
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'));
  } catch {
    return { attempts: 0 };
  }
};
const writeState = (s) => {
  try {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(statePath, JSON.stringify(s));
  } catch {
    /* si no se puede persistir, el loop igual funciona (sin tope) */
  }
};

// Claude Code manda el payload del hook por stdin.
let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  /* sin payload: se está corriendo a mano */
}

const runHarness = (args) => {
  const res = spawnSync('node', ['scripts/verify.mjs', ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10 * 60 * 1000,
  });
  return {
    ok: res.status === 0,
    output: `${res.stdout || ''}${res.stderr || ''}`.trim(),
  };
};

const block = (message) => {
  process.stderr.write(`\n${message}\n`);
  process.exit(2);
};

// ── PostToolUse: checks estáticos tras cada edición ────────────────────────
if (mode === 'guards') {
  const res = spawnSync('node', ['scripts/guards/index.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (res.status === 0) process.exit(0);
  block(
    `Los guards fallaron por esta edición. Arreglalo ahora, antes de seguir con otra cosa:\n\n` +
      `${res.stdout || ''}${res.stderr || ''}`
  );
}

// ── PreToolUse: nada se commitea ni se deploya en rojo ─────────────────────
if (mode === 'precommit') {
  const cmd = payload?.tool_input?.command || '';
  const isRelease = /git\s+(commit|push)|vercel\s+(deploy|--prod)|npm\s+run\s+deploy/.test(cmd);
  if (!isRelease) process.exit(0);

  const { ok, output } = runHarness([]); // ciclo completo, sin atajos
  if (ok) {
    writeState({ attempts: 0 });
    process.exit(0);
  }
  block(
    `Bloqueado: "${cmd.slice(0, 60)}" con el harness en rojo.\n` +
      `Un commit o un deploy sale solo con verify completo en verde.\n\n${output}`
  );
}

// ── Stop: no se declara nada terminado sin harness verde ───────────────────
if (mode === 'gate') {
  const state = readState();

  if (state.attempts >= MAX_ATTEMPTS) {
    writeState({ attempts: 0 });
    process.stderr.write(
      `\nEl harness sigue en rojo después de ${MAX_ATTEMPTS} intentos. ` +
        `Te dejo cerrar, pero NO digas que esto funciona: explicá qué queda roto ` +
        `y qué probaste.\n`
    );
    process.exit(0);
  }

  const { ok, output } = runHarness(['--scope']);
  if (ok) {
    writeState({ attempts: 0 });
    process.exit(0);
  }

  const attempts = state.attempts + 1;
  writeState({ attempts });
  block(
    `No termines todavía — el harness está en rojo (intento ${attempts}/${MAX_ATTEMPTS}).\n\n` +
      `${output}\n\n` +
      `Arreglá la causa de raíz, no el síntoma: no toques el test para que pase, ` +
      `no agregues waits ni try/catch para tapar el error, no borres el check. ` +
      `Si el test está mal planteado, decilo explícitamente en vez de aflojarlo.`
  );
}

console.error(`Modo desconocido: ${mode}. Usá: guards | gate | precommit`);
process.exit(1);
