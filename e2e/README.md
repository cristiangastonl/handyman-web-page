# Harness

Dos mitades de la misma cosa:

- **Los checks** (`scripts/guards/`, `e2e/`, vitest) — el juez: dicen si el cambio está sano.
- **El loop** (`.claude/settings.json` + `scripts/hooks/verify-hook.mjs`) — quien
  llama al juez, sin que haya que acordarse.

Sin el loop, los checks son un comando que nadie corre.

```bash
npm run verify        # guards + unit + build + e2e
npm run verify:scope  # elige las etapas según el git diff
npm run verify:fast   # guards + unit  (~5s, para iterar)
npm run guards        # solo checks estáticos (~0.1s)
```

## El loop automático

| Momento | Hook | Qué corre | Si falla |
|---|---|---|---|
| Después de cada edición | `PostToolUse` | `guards` (~0.1s) | bloquea y le pasa el error al agente |
| Antes de dar algo por terminado | `Stop` | `verify --scope` | bloquea, el agente arregla y reintenta (hasta 4 vueltas) |
| Antes de `git commit`/`push`/`vercel deploy` | `PreToolUse` | `verify` completo | bloquea el comando |

Las 4 vueltas son el tope para que un error que el agente no sabe arreglar no
deje la sesión girando. Al llegar al tope te deja cerrar, pero con la
instrucción explícita de decir qué quedó roto en vez de declarar que funciona.

Ajustable: `HARNESS_MAX_ATTEMPTS=6 claude`.
Para desactivarlo un rato: renombrá `.claude/settings.json`.

## Setup

```bash
npm install
npx playwright install chromium
```

## Etapas

| Etapa | Qué corre | Falla cuando |
|---|---|---|
| `guards` | `scripts/guards/` | falta una traducción, se coló Tailwind/CSS, hay una key de Supabase hardcodeada, falta una env var |
| `unit` | `vitest run` | rompe un test unitario |
| `build` | `vite build` + prerender | el build no compila o el prerender no puede renderizar una ruta |
| `e2e` | `playwright test` | una ruta tira error de consola, se rompe el nav, el i18n no persiste, `/admin` no pide login |

Corré una sola: `npm run verify -- --stage=e2e`

## Debug de E2E

```bash
npm run e2e:ui        # modo interactivo, ves el navegador
npm run e2e:report    # reporte HTML del último run
```

Los tests que fallan dejan screenshot y trace en `test-results/`.

## Agregar cobertura

- Regla estática (convención, config, datos) → `scripts/guards/`.
  Exportá una función que devuelva `{ errors, warnings }` y sumala al array de
  `scripts/guards/index.mjs`.
- Comportamiento visible (una pantalla, un flujo) → `e2e/*.spec.js`.
  Usá `visit()` y `watchConsole()` de `e2e/helpers.js` para no repetir el setup.

Regla: feature nueva, check nuevo, en el mismo commit.

## Ruido de consola

Si un error de consola es esperado (un embed de YouTube, un bloqueador),
sumalo a `IGNORED` en `e2e/helpers.js` con un comentario de por qué.
No lo silencies test por test.
