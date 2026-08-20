// Guard: consistencia de traducciones entre los 5 idiomas.
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const localesDir = join(root, 'src', 'locales');

// Palabras de marca: nunca se traducen, deben aparecer igual en todos los idiomas.
const BRAND_WORDS = [
  'Handyman',
  'Highlights',
  'Specialist Technician At Domestic Matters',
];

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v, key)
      : [[key, v]];
  });

const placeholders = (s) =>
  typeof s === 'string' ? (s.match(/\{\{\s*[\w.]+\s*\}\}/g) || []).sort() : [];

export function checkI18n() {
  const errors = [];
  const warnings = [];

  const files = readdirSync(localesDir).filter((f) => f.endsWith('.json'));
  const locales = {};
  for (const f of files) {
    const lang = f.replace('.json', '');
    try {
      locales[lang] = Object.fromEntries(
        flatten(JSON.parse(readFileSync(join(localesDir, f), 'utf8')))
      );
    } catch (e) {
      errors.push(`${f}: JSON inválido — ${e.message}`);
    }
  }

  const base = 'en';
  if (!locales[base]) {
    errors.push(`Falta el locale base ${base}.json`);
    return { errors, warnings };
  }
  const baseKeys = Object.keys(locales[base]);

  for (const [lang, entries] of Object.entries(locales)) {
    if (lang === base) continue;
    const keys = Object.keys(entries);

    const missing = baseKeys.filter((k) => !(k in entries));
    const extra = keys.filter((k) => !(k in locales[base]));
    if (missing.length)
      errors.push(
        `${lang}.json: faltan ${missing.length} claves → ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' …' : ''}`
      );
    if (extra.length)
      warnings.push(
        `${lang}.json: ${extra.length} claves que no existen en ${base} → ${extra.slice(0, 8).join(', ')}`
      );

    for (const k of baseKeys) {
      const v = entries[k];
      if (v === undefined) continue;
      if (typeof v === 'string' && v.trim() === '')
        errors.push(`${lang}.json: "${k}" está vacío`);

      const a = placeholders(locales[base][k]);
      const b = placeholders(v);
      if (a.join('|') !== b.join('|'))
        errors.push(
          `${lang}.json: "${k}" tiene placeholders distintos a ${base} (${a.join(',') || '∅'} vs ${b.join(',') || '∅'})`
        );
    }
  }

  // Palabras de marca: si aparecen en EN, deben aparecer en el resto.
  for (const word of BRAND_WORDS) {
    const inBase = baseKeys.filter((k) =>
      String(locales[base][k]).includes(word)
    );
    for (const [lang, entries] of Object.entries(locales)) {
      if (lang === base) continue;
      for (const k of inBase) {
        if (entries[k] !== undefined && !String(entries[k]).includes(word))
          errors.push(
            `${lang}.json: "${k}" perdió la palabra de marca "${word}" (no se traduce)`
          );
      }
    }
  }

  return { errors, warnings };
}
