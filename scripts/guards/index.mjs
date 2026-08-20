#!/usr/bin/env node
// Corre todos los guards estáticos. Sale con código 1 si hay errores.
import { checkI18n } from './i18n.mjs';
import { checkConventions } from './conventions.mjs';

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const guards = [
  ['i18n', checkI18n],
  ['convenciones', checkConventions],
];

let totalErrors = 0;
let totalWarnings = 0;

for (const [name, fn] of guards) {
  let errors = [];
  let warnings = [];
  try {
    ({ errors, warnings } = fn());
  } catch (e) {
    errors = [`el guard explotó: ${e.stack}`];
  }
  totalErrors += errors.length;
  totalWarnings += warnings.length;

  const status = errors.length
    ? c.red('FAIL')
    : warnings.length
      ? c.yellow('WARN')
      : c.green('OK');
  console.log(`${status}  ${name}`);
  for (const e of errors) console.log(`      ${c.red('✗')} ${e}`);
  for (const w of warnings) console.log(`      ${c.yellow('!')} ${c.dim(w)}`);
}

console.log('');
if (totalErrors) {
  console.log(c.red(`${totalErrors} error(es), ${totalWarnings} aviso(s)`));
  process.exit(1);
}
console.log(c.green(`Guards OK`) + c.dim(` (${totalWarnings} aviso(s))`));
