// Guard: convenciones del proyecto (ver CLAUDE.md) + errores comunes.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const srcDir = join(root, 'src');

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

export function checkConventions() {
  const errors = [];
  const warnings = [];

  const files = walk(srcDir).filter((f) => /\.(jsx?|mjs)$/.test(f));

  for (const file of files) {
    const rel = relative(root, file);
    const code = readFileSync(file, 'utf8');
    const lines = code.split('\n');

    lines.forEach((line, i) => {
      const at = `${rel}:${i + 1}`;

      // Inline styles only — nada de CSS externo ni Tailwind.
      if (/^\s*import\s+["'].*\.css["']/.test(line))
        errors.push(`${at}: import de CSS — el proyecto usa estilos inline`);
      const cls = line.match(/className=["']([^"']+)["']/);
      if (cls) {
        // Se compara token por token: "stats-grid" es una clase propia, "grid" sería Tailwind.
        const tw = cls[1]
          .split(/\s+/)
          .filter((t) =>
            /^(flex|grid|block|hidden|container|(p|m|px|py|mx|my|gap|w|h)-\d+|(text|bg|border)-(\w+)-\d{2,3})$/.test(t)
          );
        if (tw.length)
          errors.push(
            `${at}: clase de Tailwind "${tw.join(' ')}" — el proyecto usa estilos inline`
          );
      }

      // Claves de Supabase hardcodeadas.
      if (/eyJ[A-Za-z0-9_-]{20,}\./.test(line))
        errors.push(`${at}: hay un JWT hardcodeado — usá variables de entorno`);
      if (/https:\/\/[a-z0-9]{20}\.supabase\.co/.test(line) && !/import\.meta\.env/.test(line))
        errors.push(`${at}: URL de Supabase hardcodeada — usá VITE_SUPABASE_URL`);

      // Restos de debug.
      if (/^\s*(describe|it|test)\.only\(/.test(line))
        errors.push(`${at}: test marcado con .only`);
      if (/\bdebugger\b/.test(line))
        errors.push(`${at}: quedó un debugger`);
      if (/localhost:\d+/.test(line) && !rel.includes('scripts'))
        warnings.push(`${at}: URL de localhost hardcodeada`);
    });

    // Texto visible en duro en componentes (debería ir por i18n).
    if (rel.startsWith('src/components') && !rel.includes('Admin')) {
      const hardcoded = code.match(/>\s*[A-Z][a-zA-Z]{3,}(\s+[a-zA-Z]+){2,}\s*</g);
      if (hardcoded && hardcoded.length > 3)
        warnings.push(
          `${rel}: ${hardcoded.length} textos que parecen hardcodeados — revisá si deberían ir por t()`
        );
    }
  }

  // Variables de entorno: las de Supabase son obligatorias, el resto opcionales.
  const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const examplePath = join(root, '.env.example');
  const envPath = join(root, '.env');
  if (existsSync(examplePath) && existsSync(envPath)) {
    const keysOf = (p) =>
      readFileSync(p, 'utf8')
        .split('\n')
        .map((l) => l.split('=')[0].trim())
        .filter((k) => k && !k.startsWith('#'));
    const env = keysOf(envPath);
    for (const k of keysOf(examplePath)) {
      if (env.includes(k)) continue;
      if (REQUIRED_ENV.includes(k)) errors.push(`.env: falta la variable ${k}`);
      else warnings.push(`.env: falta ${k} (opcional, está en .env.example)`);
    }
  } else if (!existsSync(envPath)) {
    warnings.push('.env no existe — el build va a correr sin Supabase');
  }

  return { errors, warnings };
}
