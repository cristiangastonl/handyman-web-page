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

  // Los links de redes salen del admin, no de las constantes.
  //
  // Los campos Facebook URL / YouTube URL / WhatsApp URL existían en el panel y
  // guardaban bien, pero ningún componente los leía: todo salía de WA_LINK y de
  // socialUrls, hardcodeados. El cliente podía cambiar de cuenta, editar el campo,
  // ver el toast, y el sitio seguía apuntando a la vieja sin avisarle. Lo peor del
  // caso es que no fallaba: guardaba de verdad, sólo que nadie miraba el valor.
  //
  // Las constantes siguen existiendo como fallback, pero se leen desde
  // getSocialUrls(siteConfig) en src/lib/constants.js, no directo.
  for (const file of files) {
    const rel = relative(root, file);
    if (!rel.startsWith('src/components')) continue;
    const code = readFileSync(file, 'utf8');
    code.split('\n').forEach((line, i) => {
      if (/\b(WA_LINK|socialUrls)\b/.test(line) && !/getSocialUrls|getYtPlaylistsUrl|getFbReviewsUrl/.test(line))
        errors.push(
          `${rel}:${i + 1}: usa ${line.match(/\b(WA_LINK|socialUrls)\b/)[0]} directo — los links de redes salen de getSocialUrls(siteConfig), si no lo que el cliente cargue en el admin no se ve`
        );
      // Y ninguna CUENTA de red escrita a mano. Así estuvo el link para dejar
      // reseña en Google: apuntaba a una búsqueda de Maps tipeada acá, que llevaba
      // a la ficha en vez de al formulario, y no había forma de cambiarla sin
      // deployar.
      //
      // No entran los endpoints de protocolo, que no son cuentas de nadie y no
      // cambian nunca: los embeds de YouTube (/embed/<videoId>) y los intents de
      // compartir (facebook.com/sharer, wa.me sin número). Esos sí van inline.
      const esCuenta =
        /["'`]https?:\/\/(www\.)?(facebook|youtube|google|g\.page|wa\.me|instagram)\b/.test(line) &&
        !/\/embed\//.test(line) &&
        !/sharer/.test(line) &&
        !/wa\.me\/\?/.test(line);
      if (esCuenta)
        errors.push(
          `${rel}:${i + 1}: cuenta de red escrita a mano — va en constants.js con su getter, para que el cliente pueda cambiarla desde el admin`
        );
    });
  }

  // Todo estilo configurable tiene que tener su control en el admin.
  //
  // Anibal no pide "cambiá el 4.8 a 26px", pide "no queda desproporcionada? es algo
  // q puedo cambiar yo y probar?". Una clave en STYLE_KEYS que no esté cableada a un
  // StyleControl es una perilla que existe en el código y no en su pantalla: él la
  // pide de vuelta por WhatsApp y hay que tocar el JSX otra vez.
  const constantes = readFileSync(join(srcDir, 'lib', 'constants.js'), 'utf8');
  const bloque = constantes.match(/export const STYLE_KEYS = \{([\s\S]*?)\n\};/);
  if (!bloque) {
    errors.push('src/lib/constants.js: no se encontró el bloque STYLE_KEYS');
  } else {
    // Las que a propósito no tienen control. Están en STYLE_KEYS igual porque
    // KNOWN_KEYS sale de ahí: sacarlas haría aparecer los valores viejos que el
    // cliente ya tenga guardados en la lista "Other Settings" del admin.
    const SIN_CONTROL = new Map([
      // Legacy: el estilo de los highlights del About ahora viaja adentro del JSON
      // de about_highlightN_title/_text (ver getHighlightField). Estas claves sólo
      // sobreviven como fallback de lo que el cliente guardó antes del cambio.
      ['about_highlight1_title_style', 'legacy, reemplazada por about_highlight1_title'],
      ['about_highlight1_text_style', 'legacy, reemplazada por about_highlight1_text'],
      ['about_highlight2_title_style', 'legacy, reemplazada por about_highlight2_title'],
      ['about_highlight2_text_style', 'legacy, reemplazada por about_highlight2_text'],
      ['about_highlight3_title_style', 'legacy, reemplazada por about_highlight3_title'],
      ['about_highlight3_text_style', 'legacy, reemplazada por about_highlight3_text'],
      // El carrusel Returning Customers salió del sitio y del admin (App.jsx:107).
      ['carousel_returning_customers_title_style', 'el carrusel está retirado'],
    ]);
    const claves = [...bloque[1].matchAll(/^\s{2}([a-z0-9_]+):/gm)]
      .map((m) => m[1])
      .filter((k) => !SIN_CONTROL.has(k));
    const tab = readFileSync(join(srcDir, 'components', 'Admin', 'SiteTextsTab.jsx'), 'utf8');
    const expuestas = new Set(
      [...tab.matchAll(/configKey="([a-z0-9_]+)"/g)].map((m) => m[1])
    );
    for (const k of claves) {
      if (!expuestas.has(k))
        errors.push(
          `src/lib/constants.js: STYLE_KEYS.${k} no tiene <StyleControl configKey="${k}"> en SiteTextsTab.jsx — el cliente no puede editarlo`
        );
    }
  }

  // El origen del sitio dice lo mismo en los tres lugares donde aparece.
  //
  // SITE_ORIGIN en constants.js alimenta el canonical y el og:url, pero
  // robots.txt y sitemap.xml son archivos estáticos que no pueden importarlo. Si
  // se separan, el buscador recibe dos respuestas distintas para la misma página
  // y reparte la autoridad entre las dos. El día que se cambie el dominio, esto
  // obliga a cambiar los tres o el harness no deja commitear.
  const cts = readFileSync(join(srcDir, 'lib', 'constants.js'), 'utf8');
  const mOrigen = cts.match(/export const SITE_ORIGIN = "([^"]+)"/);
  if (!mOrigen) {
    errors.push('src/lib/constants.js: no se encontró SITE_ORIGIN');
  } else {
    const origen = mOrigen[1];
    if (origen.endsWith('/'))
      errors.push(`src/lib/constants.js: SITE_ORIGIN termina en barra ("${origen}") — el canonical la agrega, quedaría duplicada`);

    // vercel.json es el quinto lugar donde puede aparecer el dominio: el redirect
    // que manda el .vercel.app al dominio propio lleva la URL entera en su
    // destination. Si el dominio cambia y ese destino se queda viejo, el redirect
    // sigue existiendo y manda a los visitantes a una dirección que ya no es la
    // del sitio — peor que no tener redirect.
    const rutaVercel = join(root, 'vercel.json');
    if (existsSync(rutaVercel)) {
      let cfg;
      try {
        cfg = JSON.parse(readFileSync(rutaVercel, 'utf8'));
      } catch (e) {
        errors.push(`vercel.json: JSON inválido — ${e.message}`);
      }
      for (const r of cfg?.redirects || []) {
        const destino = String(r.destination || '');
        if (/^https?:\/\//.test(destino) && !destino.startsWith(origen))
          errors.push(
            `vercel.json: un redirect manda a ${destino} pero SITE_ORIGIN es ${origen} — el destino tiene que ser el dominio del sitio`
          );
      }
    }

    // index.html es el sexto lugar, y el más cargado: 11 apariciones entre el
    // canonical estático, los 6 hreflang, og:url, og:image, twitter:image y el url
    // del JSON-LD. El guard no lo cubría y por eso sobrevivió al cambio de dominio
    // del 03/09: Seo.jsx reescribe el canonical y el og:url en runtime, así que
    // esos dos se veían bien, pero el og:image no lo toca nadie y quedó apuntando
    // al .vercel.app. Es la imagen que se ve al compartir el link por WhatsApp, que
    // es justo como Anibal reparte su sitio.
    //
    // Se miran sólo los atributos que declaran una URL del sitio; las externas
    // (fuentes de Google, schema.org, las redes) no se tocan.
    const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
    const propias = [
      ...indexHtml.matchAll(/(?:href|content)="(https?:\/\/[^"]+)"/g),
    ].map((m) => m[1]);
    const EXTERNAS = /^https?:\/\/(fonts\.(googleapis|gstatic)\.com|schema\.org|wa\.me|www\.(facebook|youtube)\.com)/;
    for (const u of new Set(propias.filter((u) => !EXTERNAS.test(u) && !u.startsWith(origen))))
      errors.push(`index.html: declara ${u} pero SITE_ORIGIN es ${origen} — tienen que decir lo mismo`);

    // Sólo las URLs que son del sitio: las <loc> del sitemap y la línea Sitemap:
    // de robots. El xmlns del sitemap (http://www.sitemaps.org/...) es el
    // namespace del formato, no una dirección nuestra, y no se toca nunca.
    const declaradas = [
      ['public/robots.txt', /^Sitemap:\s*(\S+)/gim],
      ['public/sitemap.xml', /<loc>([^<]+)<\/loc>/gi],
    ];
    for (const [rel, patron] of declaradas) {
      const ruta = join(root, rel);
      if (!existsSync(ruta)) { errors.push(`falta ${rel}`); continue; }
      const urls = [...readFileSync(ruta, 'utf8').matchAll(patron)].map((m) => m[1]);
      if (urls.length === 0) { errors.push(`${rel}: no declara ninguna URL del sitio`); continue; }
      for (const u of new Set(urls.filter((u) => !u.startsWith(origen))))
        errors.push(`${rel}: declara ${u} pero SITE_ORIGIN es ${origen} — tienen que decir lo mismo`);
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
