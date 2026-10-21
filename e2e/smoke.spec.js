import { test, expect, watchConsole, visit, ROUTES, LANGS, esperarPresentacionAsentada } from './helpers.js';

test.describe('rutas públicas', () => {
  for (const route of ROUTES) {
    test(`${route} carga sin errores de consola`, async ({ page }) => {
      const console_ = watchConsole(page);
      await visit(page, route);

      // Hay contenido real, no un shell vacío.
      await expect(page.locator('nav')).toBeVisible();
      const text = await page.locator('#root').innerText();
      expect(text.length, `${route} renderizó casi nada`).toBeGreaterThan(200);

      // Ninguna clave de i18n quedó sin resolver (ej: "nav.home" literal).
      expect(text, 'hay claves de i18n sin traducir en pantalla').not.toMatch(
        /\b(nav|hero|stats|about|portfolio|faq|cta|footer)\.[a-zA-Z]+\b/
      );

      console_.assertClean();
    });
  }

  test('las 4 páginas son alcanzables desde el nav', async ({ page, isMobile }) => {
    await visit(page, '/');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();

    for (const [label, expectedPath] of [
      ['Portfolio', '/portfolio'],
      ['Reviews', '/reviews'],
    ]) {
      await page
        .getByRole('button', { name: new RegExp(`^${label}$`, 'i') })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`${expectedPath}$`));
      if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    }
  });

  test('404 cae en la home en vez de romper', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/ruta-que-no-existe');
    await expect(page.locator('nav')).toBeVisible();
    console_.assertClean();
  });
});

test.describe('i18n', () => {
  test('cambiar de idioma cambia el texto y persiste al navegar', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'el selector de idioma vive en el menú mobile');
    await visit(page, '/');

    const heroBefore = await page.locator('#root').innerText();

    await page.getByRole('button', { name: 'Deutsch' }).first().click();
    await expect
      .poll(async () => page.locator('#root').innerText(), { timeout: 5000 })
      .not.toBe(heroBefore);

    const heroDe = await page.locator('#root').innerText();

    // "Handyman" es palabra de marca: no se traduce nunca.
    expect(heroDe).toContain('Handyman');

    // El idioma sobrevive a un cambio de página.
    await page.getByRole('button', { name: /^portfolio$/i }).first().click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByRole('button', { name: 'Deutsch' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  for (const lang of LANGS) {
    test(`la home renderiza en ${lang.label} sin claves crudas`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'cubierto en desktop');
      await visit(page, '/');
      await page.getByRole('button', { name: lang.label }).first().click();
      await page.waitForTimeout(300);

      const text = await page.locator('#root').innerText();
      expect(text).not.toMatch(/\b(nav|hero|about|stats)\.[a-zA-Z]+\b/);
      expect(text).toContain('Handyman');
    });
  }

  // "Algunas cosas se traducen y otras no" (Anibal, 21/10). Lo que escribe el
  // código —no la base ni el admin— no puede quedar en inglés en otro idioma.
  // Son todas piezas que no dependen de Supabase.
  for (const lang of LANGS.filter((l) => l.code !== 'en')) {
    test(`en ${lang.label} los textos del código no quedan en inglés`, async ({ page }) => {
      await visit(page, `/?lang=${lang.code}`);
      const ingles = await page.evaluate(() => ({
        saltar: document.querySelector('a[href="#main-content"]')?.textContent,
        menu: document.querySelector('.mobile-hamburger')?.getAttribute('aria-label'),
        hero: document.querySelector('.hero-image')?.getAttribute('alt'),
        perfil: document.querySelector('.about-row img')?.getAttribute('alt'),
        zonas: document.body.innerText.includes('All around Zurich') ? 'All around Zurich' : null,
      }));
      expect(ingles.saltar).toBeTruthy();
      expect(ingles.saltar).not.toBe('Skip to main content');
      expect(ingles.menu).not.toBe('Toggle menu');
      expect(ingles.hero).not.toMatch(/^Professional handyman services/i);
      expect(ingles.perfil).not.toMatch(/^Professional handyman in Zurich/i);
      expect(ingles.zonas, 'el subtítulo de Service Areas sigue en inglés').toBeNull();
    });
  }
});

// El watermark de marca es un <img> decorativo, fijo y a pantalla completa:
// va con alt="" y aria-hidden="true" a proposito (es lo correcto en a11y) y
// tapa la pagina entera. Si lo incluyeramos, el test de alt fallaria sobre una
// imagen que esta bien y el click iria al watermark en vez de a una tarjeta.
const contentImages = (page) => page.locator('#main-content img:not([aria-hidden="true"])');

test.describe('portfolio', () => {
  test('muestra categorías y permite entrar a una', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/portfolio');

    const text = await page.locator('#root').innerText();
    expect(text.length).toBeGreaterThan(200);

    // Entrar en la primera categoria no debe romper. Se clickea la tarjeta, no su
    // <img>: encima de la foto va un degradado a inset:0 que se come el puntero
    // (es del diseno, y el click igual burbujea hasta la tarjeta).
    const cards = page.getByTestId('category-card');
    if ((await cards.count()) > 0) {
      await cards.first().click();
      await expect(cards).toHaveCount(0); // ya no estamos en el listado de categorías
    }
    console_.assertClean();
  });

  test('una categoría con playlist la muestra en la tarjeta y adentro', async ({ page }) => {
    // Recorrido completo: la columna categories.playlist_id existe desde el 31/08,
    // el admin la escribe y Portfolio.jsx la lee — pero App.jsx armaba el estado
    // con .map(c => ({ id, label, header_image })) y la tiraba en el medio. Se
    // guardaba en la base y no se veía en ningún lado. Nada lo detectaba porque
    // los dos extremos estaban bien por separado; lo que faltaba era este test.
    //
    // Depende de que haya al menos una categoría con playlist cargada. Si no hay
    // ninguna, no falla: no habría nada que mostrar y eso es correcto.
    await visit(page, '/portfolio');

    const conPlaylist = page.getByTestId('category-card')
      .filter({ has: page.getByTestId('category-playlist-badge') });
    const cuantas = await conPlaylist.count();
    test.skip(cuantas === 0, 'ninguna categoría tiene playlist cargada');

    await conPlaylist.first().click();

    // Adentro tiene que estar el link a YouTube, y tiene que ser una URL de
    // playlist de verdad: playlistUrl() ya devolvió links rotos antes.
    const link = page.getByTestId('playlist-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      'href', /^https:\/\/www\.youtube\.com\/playlist\?list=[A-Za-z0-9_-]+$/);
  });

  test('el sitio no lee work_items entero: el listado sale del resumen y las fotos por nivel', async ({ page }) => {
    // Hasta el 02/10/2026 App.jsx leía las ~1000 filas de work_items al abrir
    // cualquier ruta, la home incluida, para contar y elegir miniaturas. Ahora
    // las tarjetas salen de la vista work_items_summary y las fotos se piden al
    // entrar a una categoría o subcategoría, filtradas por ella.
    //
    // Toda lectura de work_items del sitio público tiene que estar acotada:
    // por categoría (cat=eq.) o con tope (limit=, el fallback de Recent Work).
    const lecturas = [];
    page.on('request', (req) => {
      if (/\/rest\/v1\/work_items\?/.test(req.url())) lecturas.push(req.url());
    });
    const resumen = page.waitForResponse((r) => /\/rest\/v1\/work_items_summary\?/.test(r.url()));

    await visit(page, '/');
    await visit(page, '/portfolio');

    // El resumen tiene que responder bien: si la vista no existiera en la base,
    // el portfolio quedaría vacío sin un solo error en pantalla.
    expect((await resumen).ok(), 'work_items_summary no respondió 200 — ¿se corrió portfolio-summary-migration.sql?').toBe(true);

    const cards = page.getByTestId('category-card');
    await expect(cards.first()).toBeVisible();

    const fotosDeCategoria = page.waitForRequest((r) => /\/rest\/v1\/work_items\?.*cat=eq\./.test(r.url()));
    await cards.first().click();
    await fotosDeCategoria;
    await expect(page.getByTestId('portfolio-loading')).toHaveCount(0);

    const sinAcotar = lecturas.filter((u) => !/cat=eq\.|limit=/.test(u));
    expect(sinAcotar, `lecturas de work_items sin filtro ni tope:\n${sinAcotar.join('\n')}`).toEqual([]);
  });

  test('las imágenes tienen alt (SEO + accesibilidad)', async ({ page }) => {
    await visit(page, '/portfolio');
    const imgs = contentImages(page);
    const n = await imgs.count();
    for (let i = 0; i < Math.min(n, 20); i++) {
      await expect(imgs.nth(i)).toHaveAttribute('alt', /.+/);
    }
  });
});

test.describe('admin', () => {
  test('/admin pide login y no filtra el panel', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/admin');

    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Sin sesión no debería verse ninguna pestaña de administración.
    const text = await page.locator('#root').innerText();
    expect(text).not.toMatch(/Carousels|Subcats|Config/);

    console_.assertClean();
  });
});

test.describe('happy customers', () => {
  // Miden la proporción de la foto contra su caja: necesitan la imagen de verdad.
  // Son pocas fotos; el resto del harness no baja ninguna (ver helpers.js).
  test.use({ fotosReales: true });
  // El chequeo es el que motivó el diseño: las fotos tienen que acompañar TODO
  // el scroll, no verse sólo arriba. En desktop ancho viven en los márgenes
  // (fixed) y en mobile intercaladas entre las reviews, así que se verifica
  // distinto según el viewport.
  test('las fotos acompañan el scroll, no sólo el principio', async ({ page }, testInfo) => {
    const desktop = testInfo.project.name === 'desktop';
    // Desktop Chrome trae 1280px y los rieles necesitan 1300+: sin esto el test
    // estaría midiendo el fallback de mobile creyendo que mide los rieles.
    if (desktop) await page.setViewportSize({ width: 1512, height: 900 });

    await visit(page, '/reviews');

    const photos = desktop ? page.locator('.hc-edges img') : page.locator('.hc-inline-tile img');
    // Sin fotos cargadas en la base no hay nada que mostrar, y eso es válido:
    // la sección desaparece entera en vez de dejar un hueco.
    //
    // Se pregunta por los rieles y no por los tiles: HappyCustomerRails devuelve
    // null con la lista vacía, así que .hc-edges existe exactamente cuando hay
    // fotos, en los dos viewports (en mobile el CSS los oculta, pero están en el
    // DOM). Los tiles no sirven para esto — ver el comentario de abajo.
    // Se espera a que monte: un count() al toque a veces caía sobre el HTML
    // prerenderizado, que ya trae los tiles pero todavía no los rieles.
    const hayRieles = await page.locator('.hc-edges').first()
      .waitFor({ state: 'attached', timeout: DATOS_MS }).then(() => true, () => false);
    if (!hayRieles) {
      await expect(page.locator('.hc-inline-tile')).toHaveCount(0);
      return;
    }

    if (desktop) {
      await expect(photos.first()).toHaveAttribute('alt', /.+/);
      await page.evaluate(() => window.scrollTo(0, 2000));
      // Son fixed: después de scrollear tiene que seguir habiendo fotos en
      // pantalla. Se cuentan las visibles en vez de mirar una en particular —
      // el track se desplaza, así que cuál está a la vista depende del momento
      // del ciclo, y fijarse en la primera hacía el test flaky.
      const visibles = await page.evaluate(() =>
        [...document.querySelectorAll('.hc-edges img')].filter((img) => {
          const b = img.getBoundingClientRect();
          return b.width > 0 && b.bottom > 0 && b.top < window.innerHeight;
        }).length);
      expect(visibles).toBeGreaterThan(0);
    } else {
      // Intercaladas, una cada dos reviews (era cada tres hasta el 10/10/2026).
      //
      // Este check cambió a propósito el 29/08/2026. Antes exigía que la última
      // foto cayera pasado el 60% de la página: el reparto se calculaba sobre el
      // largo de la lista para cubrir todo el scroll. Anibal decidió lo
      // contrario —"cada diez es bocha, nadie scrolea 130 reviews"— así que
      // ahora van adelante, con paso fijo, y se agotan cerca de la review 40.
      // Medir la posición de la última ya no dice nada; lo que importa es el paso.
      //
      // Los tiles se intercalan DENTRO de la grilla de reviews, y las reviews y
      // las fotos llegan de Supabase por caminos distintos: las fotos con el
      // fetch propio de useHappyCustomers, las reviews por props desde App. Con
      // las fotos ya cargadas y la grilla todavía vacía no hay ningún tile, y eso
      // no es un defecto: no hay dónde intercalarlos. Antes el test leía ese "0
      // tiles" como "0 fotos en la base" y exigía que no hubiera rieles, así que
      // fallaba cada vez que las reviews tardaban más que las fotos.
      //
      // El prerender trae la grilla llena, pero al hidratar React la vacía hasta
      // que vuelve Supabase: medir en esa ventana da 0 tiles sobre 0 reviews. Se
      // espera a que la grilla se rellene, con margen para la máquina cargada —
      // los 8s por defecto se quedaban cortos con los 8 workers corriendo.
      await expect(page.locator('.reviews-grid > *').first())
        .toBeVisible({ timeout: 20_000 });

      const pasos = await page.evaluate(() => {
        const hijos = [...document.querySelector('.reviews-grid').children];
        const idx = hijos.flatMap((el, i) => el.classList.contains('hc-inline-tile') ? [i] : []);
        return {
          primera: idx[0],
          // Con una foto cada 2 reviews, entre foto y foto hay 3 posiciones.
          saltos: idx.slice(1).map((v, i) => v - idx[i]),
          cuantas: idx.length,
          reviews: hijos.length - idx.length,
        };
      });

      // La primera foto va después de 2 reviews: con menos de 2 no entra
      // ninguna, y que la grilla no tenga tiles es lo correcto.
      if (pasos.reviews < 2) {
        expect(pasos.cuantas, 'sin 2 reviews no hay dónde meter una foto').toBe(0);
        return;
      }

      await expect(photos.first()).toHaveAttribute('alt', /.+/);
      expect(pasos.primera, 'la primera foto va después de 2 reviews').toBe(2);
      if (pasos.cuantas > 1) {
        expect([...new Set(pasos.saltos)], 'el paso tiene que ser parejo: 2 reviews y una foto')
          .toEqual([3]);
      }
    }
  });

  test('en el carrusel de reseñas de la home va una foto entre cada review', async ({ page }) => {
    // Pedido de Anibal, en todos los anchos (lo de "sólo mobile" era para
    // /reviews). Arrancó en una cada dos el 10/10 y él lo corrigió el 11/10: "no,
    // era cada una, una y una". Review, foto, review, foto.
    await visit(page, '/');
    await page.waitForFunction(() => document.querySelectorAll('.review-card').length > 1,
      null, { timeout: 20_000 });

    // Las fotos llegan por un fetch aparte de las reviews; se les da tiempo, y si
    // no hay ninguna cargada en la base el carrusel queda sólo con reseñas.
    const hayFotos = await page.waitForFunction(() => document.querySelector('.hc-carousel-tile img'),
      null, { timeout: 10_000 }).then(() => true, () => false);
    if (!hayFotos) {
      await expect(page.locator('.hc-carousel-tile')).toHaveCount(0);
      return;
    }

    const pasos = await page.evaluate(() => {
      const riel = document.querySelector('.review-card').parentElement;
      // El riel va duplicado para el loop: se mira sólo la primera mitad.
      const hijos = [...riel.children].slice(0, riel.children.length / 2);
      const idx = hijos.flatMap((el, i) => el.classList.contains('hc-carousel-tile') ? [i] : []);
      return { primera: idx[0], saltos: idx.slice(1).map((v, i) => v - idx[i]) };
    });
    expect(pasos.primera, 'la primera foto va después de la primera review').toBe(1);
    expect([...new Set(pasos.saltos)], 'tiene que alternar: una review y una foto').toEqual([2]);
    await expect(page.locator('.hc-carousel-tile img').first()).toHaveAttribute('alt', /.+/);

    // La foto no se recorta: la pieza trae texto y logo adentro.
    const recorte = await page.locator('.hc-carousel-tile img').first().evaluate((img) => {
      const b = img.getBoundingClientRect();
      return img.naturalWidth ? Math.abs(b.width / b.height - img.naturalWidth / img.naturalHeight) : 0;
    });
    expect(recorte, 'la foto del carrusel está deformada o recortada').toBeLessThan(0.02);
  });
});

test.describe('SEO / prerender', () => {
  for (const route of ROUTES) {
    test(`${route} tiene title y meta description`, async ({ page }) => {
      await visit(page, route);
      await expect(page).toHaveTitle(/.{10,}/);
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveAttribute('content', /.{20,}/);
    });

    test(`${route} se declara canónica a sí misma`, async ({ page }) => {
      // Las 4 rutas salían con canonical apuntando a la home: /portfolio,
      // /reviews y /faq le estaban pidiendo al buscador que no las indexara.
      // El sufijo tiene que ser exactamente el del sitemap: la home con barra
      // final, las internas sin ella.
      await visit(page, route);
      const esperado = route === '/' ? '/' : route;
      await expect(page.locator('link[rel="canonical"]'))
        .toHaveAttribute('href', new RegExp(`${esperado.replace('/', '\\/')}$`));
      // og:url la usan WhatsApp y LinkedIn para la previsualización del link.
      await expect(page.locator('meta[property="og:url"]'))
        .toHaveAttribute('content', new RegExp(`${esperado.replace('/', '\\/')}$`));
    });
  }
});

test.describe('velocidad de los carruseles', () => {
  // El panel para elegir la velocidad se borró: Anibal eligió "Triple" (90 px/s)
  // el 29/08/2026. Lo que se verifica ahora es que ese número sea el que corre
  // en el sitio y que el andamiaje no haya quedado colgado en ningún lado.

  test('el panel de ajuste ya no existe, ni con ?tune=1', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/');
    await expect(page.getByText('Velocidad carruseles')).toHaveCount(0);

    await visit(page, '/?tune=1');
    await expect(page.getByText('Velocidad carruseles')).toHaveCount(0);
    console_.assertClean();
  });

  test('el carrusel de reseñas de la home avanza solo y se frena con el mouse', async ({ page }) => {
    // Era el único carrusel de la home que no se movía: scroll manual con flechas.
    // Anibal pidió que corriera de derecha a izquierda, continuo y lento. Se mide
    // px por FRAME y no por segundo, igual que en el otro check de velocidad: bajo
    // carga el frame rate se desploma y medir contra el reloj lo haría flaky.
    await visit(page, '/');
    await page.mouse.move(0, 0); // lejos del carrusel, que se pausa con el mouse encima

    await page.waitForFunction(() => document.querySelectorAll('.review-card').length > 1,
      null, { timeout: 20_000 });
    // Fuera de pantalla el carrusel no se mueve a propósito (14/10/2026: animarlo
    // sin que nadie lo vea le costaba frames al scroll de la página), así que se
    // lo trae a la vista antes de medir. Con JS y no con scrollIntoViewIfNeeded,
    // que espera a que el elemento esté quieto y éste no lo está nunca.
    await page.evaluate(() => document.querySelector('.review-card').parentElement
      .scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.mouse.move(0, 0);

    const medir = () => page.evaluate(async () => {
      const riel = document.querySelector('.review-card')?.parentElement;
      if (!riel) return -1;
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      await frame();
      const desde = riel.scrollLeft;
      // 15 y no 30: con el carrusel en pantalla se decodifican fotos de ~1 MB y,
      // con 8 workers, cada frame llegó a tardar ~300 ms; dos mediciones de 30 no
      // entraban en los 30 s del test. Como se mide px POR FRAME, 15 sobran: a
      // 1.5 px/frame son 22 px contra ≤1 px de redondeo de scrollLeft.
      const FRAMES = 15;
      for (let i = 0; i < FRAMES; i++) await frame();
      return (riel.scrollLeft - desde) / FRAMES;
    });

    const pxPorFrame = await medir();
    // La velocidad se verifica en módulo y el sentido aparte: son dos decisiones
    // distintas y el sentido lo cambia una constante (REVIEWS_DIR en Reviews.jsx).
    // 0.5 (base) x 3 (velocidad global) x enX(3) = 1.5 px/frame ≈ 90 px/s.
    // Venía de 0.525, Anibal lo subió a 2x (1.0) el 02/09 y a 3x el 10/10. La
    // banda cubre el ruido de medición, no un rango de velocidades: 1.0 sería
    // quedarse en el 2x de antes.
    expect(Math.abs(pxPorFrame), 'el carrusel de reseñas no se está moviendo').toBeGreaterThan(1.2);
    expect(Math.abs(pxPorFrame), 'va más rápido que la velocidad global').toBeLessThan(1.8);
    // Hoy corre de izquierda a derecha (REVIEWS_DIR = -1), o sea que scrollLeft baja.
    expect(pxPorFrame, 'cambió el sentido de marcha del carrusel').toBeLessThan(0);

    // Con el mouse encima tiene que quedarse quieto para poder leer la reseña.
    //
    // Se apunta al CONTENEDOR del riel, que es el que escucha el mouseenter, y no
    // a una tarjeta. Dos razones, las dos aprendidas a los golpes el 02/09:
    //  - locator.hover() espera a que el elemento esté "estable" y un carrusel
    //    continuo nunca lo está. Con 0.525 px/frame el redondeo lo hacía parecer
    //    quieto de a ratos y pasaba; a 1.0 px/frame se colgaba hasta el timeout.
    //  - la primera .review-card del DOM está scrolleada fuera de pantalla (el
    //    riel arranca con scrollLeft alto), así que su boundingBox daba x negativo
    //    y el mouse aterrizaba afuera de la página, sin disparar nada.
    const contenedor = page.locator('.review-card').first()
      .locator('xpath=../..');
    await contenedor.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const caja = await contenedor.boundingBox();
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 8 });
    const conMouse = await medir();
    expect(Math.abs(conMouse), 'no se frena con el mouse encima').toBeLessThan(0.05);
  });

  test('los tres carruseles arrancan a la misma distancia de lo que tienen arriba', async ({ page }) => {
    // "la distancia de Highlights con el componente de arriba no es el mismo que
    // tienen los otros titulos de los carrouseles". Había tres huecos distintos:
    // Recent work 80 (la sección de arriba cerraba con 40 y él abría con otros 40),
    // Custom Projects 40, y Highlights 12 porque el banner naranja que lo precede
    // cerraba con 12 — se me pasó al normalizar los márgenes.
    //
    // El hueco que ve una persona es el padding de abajo de la sección anterior más
    // el de arriba de la del carrusel: entre secciones adyacentes no hay margen, así
    // que medir los rects daría 0 y no diría nada.
    await visit(page, '/');
    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );

    const huecos = await page.evaluate(() => {
      const secciones = [...document.querySelectorAll('section')];
      const tracks = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform' && d.children.length > 1);
      const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;
      return tracks.map((t) => {
        const sec = t.closest('section');
        const anterior = secciones[secciones.indexOf(sec) - 1];
        if (!sec || !anterior) return null;
        return {
          titulo: sec.querySelector('h2')?.innerText.trim() ?? '(sin título)',
          hueco: px(anterior, 'paddingBottom') + px(sec, 'paddingTop'),
        };
      }).filter(Boolean);
    });

    expect(huecos.length, 'deberían encontrarse los 3 carruseles de la home').toBeGreaterThanOrEqual(3);
    const distintos = [...new Set(huecos.map((h) => h.hueco))];
    expect(distintos, `huecos distintos arriba de cada carrusel: ${JSON.stringify(huecos)}`).toHaveLength(1);
  });

  test('los títulos de los tres carruseles se ven exactamente igual', async ({ page }) => {
    // "en los titulos de los carrouseles deberia haber el mismo tamaño, en
    // highlights se ve el peor". Highlights se configuraba por otro camino
    // (SITE_TEXTS, 17px) que los otros dos (STYLE_KEYS, 18px) y encima caía en
    // fontFamily undefined, así que heredaba la tipografía del body. Se mide lo
    // que se ve, no la config: si mañana alguien vuelve a separarlos, falla acá.
    await visit(page, '/');
    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );

    const titulos = await page.evaluate(() => {
      // El h2 que encabeza cada sección que contiene un carrusel.
      const tracks = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform' && d.children.length > 1);
      return tracks.map((track) => {
        const h2 = track.closest('section')?.querySelector('h2');
        if (!h2) return null;
        const cs = getComputedStyle(h2);
        return { texto: h2.innerText.trim(), size: cs.fontSize, family: cs.fontFamily, weight: cs.fontWeight };
      }).filter(Boolean);
    });

    expect(titulos.length, 'deberían encontrarse los 3 carruseles de la home').toBeGreaterThanOrEqual(3);
    const distintos = (campo) => [...new Set(titulos.map((t) => t[campo]))];
    expect(distintos('size'), `tamaños distintos: ${JSON.stringify(titulos)}`).toHaveLength(1);
    expect(distintos('family'), `tipografías distintas: ${JSON.stringify(titulos)}`).toHaveLength(1);
    expect(distintos('weight'), `pesos distintos: ${JSON.stringify(titulos)}`).toHaveLength(1);
  });

  test('todas las tarjetas de los carruseles miden exactamente igual', async ({ page }) => {
    // Anibal mandó una captura de Recent work con las fotos de distinto alto. La
    // causa no era la foto: la tarjeta tenía minWidth 280 / maxWidth 320 y sin un
    // ancho fijo lo decidía el contenido, así que la de título largo se estiraba a
    // 320. Como el alto de la foto es un porcentaje del ancho, esa tarjeta tenía la
    // foto más alta y —al ser el track un flex— arrastraba a las demás, que
    // quedaban con un hueco abajo. Se mide la consecuencia visible, no el CSS.
    await visit(page, '/');
    await page.mouse.move(0, 0); // con el mouse encima el carrusel se pausa

    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );
    // No hace falta esperar a que las fotos decodifiquen: la caja la define el
    // padding-top del contenedor, no la imagen. Y esperarlas colgaría el test,
    // porque las tarjetas lejos de la parte visible todavía no la pidieron.

    const medidas = await page.evaluate(() => {
      const tracks = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform' && d.children.length > 1);
      return tracks.map((track) => {
        const cards = [...track.children];
        const uno = (xs) => [...new Set(xs.map((n) => Math.round(n)))];
        return {
          anchos: uno(cards.map((c) => c.getBoundingClientRect().width)),
          // La caja de la foto y no el <img>: desde el 14/10/2026 la foto se pide
          // recién cuando la tarjeta se acerca a la parte visible, y hasta entonces
          // la tarjeta no tiene <img>. La caja (padding-top) es la que define el alto.
          altosFoto: uno(cards.map((c) => c.firstElementChild.getBoundingClientRect().height)),
          altosTarjeta: uno(cards.map((c) => c.getBoundingClientRect().height)),
        };
      });
    });

    expect(medidas.length, 'no se encontró ningún carrusel en la home').toBeGreaterThan(0);
    for (const [i, m] of medidas.entries()) {
      expect(m.anchos, `carrusel ${i}: las tarjetas tienen anchos distintos`).toHaveLength(1);
      expect(m.altosFoto, `carrusel ${i}: las fotos tienen altos distintos`).toHaveLength(1);
      expect(m.altosTarjeta, `carrusel ${i}: las tarjetas tienen altos distintos`).toHaveLength(1);
    }
  });

  test('título y cuerpo se cortan a 2 renglones con puntos suspensivos', async ({ page }) => {
    // "como mucho N renglones, si no llega se termina con ...".
    //
    // Este check pedía que la caja midiera EXACTAMENTE N renglones. Estaba mal
    // planteado: con la altura fija, una tarjeta de título corto igual reservaba el
    // lugar de todos y quedaban ~65px de aire adentro, que es lo que Anibal marcó
    // como "los espacios". El requisito real siempre fue un TECHO. Ahora se verifica
    // eso: que el recorte esté activo, que nada desborde, y que ninguna caja pase del
    // tope — que es lo que impide que un título largo agrande la fila.
    //
    // El tope bajó de 3 a 2 el 01/09: el carrusel se mueve solo y "no hay tiempo
    // fisico de leer tanto". Va acá quemado a propósito, es la decisión que se cuida.
    const RENGLONES = 2;
    await visit(page, '/');
    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );

    const cajas = await page.evaluate((RENGLONES) => {
      const track = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform')
        .sort((a, b) => b.children.length - a.children.length)[0];
      const pie = track.children[0].lastElementChild;
      return [...pie.children].map((el) => {
        const cs = getComputedStyle(el);
        return {
          clamp: cs.webkitLineClamp,
          alto: Math.round(el.getBoundingClientRect().height),
          // Alto del tope según su propia tipografía: la caja no puede pasarlo.
          tope: Math.round(parseFloat(cs.lineHeight) * RENGLONES),
          desborda: el.scrollHeight > el.clientHeight + 1,
        };
      });
    }, RENGLONES);

    expect(cajas.length, 'la tarjeta debería tener al menos el título').toBeGreaterThanOrEqual(1);
    for (const [i, c] of cajas.entries()) {
      const cual = i === 0 ? 'el título' : 'el cuerpo';
      expect(c.clamp, `${cual} no está recortado a ${RENGLONES} renglones`).toBe(String(RENGLONES));
      expect(c.alto, `${cual} pasa de ${RENGLONES} renglones: el tope no se está aplicando`)
        .toBeLessThanOrEqual(c.tope + 1);
      expect(c.desborda, `${cual} se está desbordando de su caja`).toBe(false);
    }
  });

  test('los carruseles corren a la velocidad elegida', async ({ page }) => {
    await visit(page, '/');
    await page.mouse.move(0, 0); // el carrusel se pausa con el mouse encima

    // Los carruseles con un solo item no auto-scrollean a propósito, así que se
    // usa el que más contenido tiene. Hay que esperarlo: sale de Supabase y
    // medir antes de que monte devolvía -1 de forma intermitente.
    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );

    // Se mide px por FRAME, no por segundo. El carrusel avanza sumando la
    // velocidad en cada requestAnimationFrame (Carousel.jsx), así que px/frame
    // es el número exacto que configuramos — y no depende del frame rate del
    // runner, que bajo carga se desploma y hacía flaky a la versión anterior.
    // Todo dentro del browser: ida y vuelta por CDP entre lectura y lectura
    // agregaría ruido.
    const pxPorFrame = await page.evaluate(async () => {
      const track = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform')
        .sort((a, b) => b.children.length - a.children.length)[0];
      if (!track) return -1;
      // Fuera de pantalla no se anima (ver el test de reseñas): se lo trae a la vista.
      track.scrollIntoView({ block: 'center', behavior: 'instant' });
      const leer = () => {
        const m = /translateX\((-?[0-9.]+)px\)/.exec(track.style.transform);
        return m ? parseFloat(m[1]) : 0;
      };
      const frame = () => new Promise(requestAnimationFrame);
      // Espera a que el IntersectionObserver lo dé por visible y arranque.
      const quieto = leer();
      for (let i = 0; i < 120 && leer() === quieto; i++) await frame();

      const deltas = [];
      let anterior = leer();
      for (let i = 0; i < 60; i++) {
        await frame();
        const actual = leer();
        deltas.push(Math.abs(actual - anterior));
        anterior = actual;
      }
      // El riel vuelve al principio al dar la vuelta: ese frame mide el ancho
      // entero del track y hay que descartarlo. Igual que los frames en los que
      // el rAF corrió sin que React hubiera pintado todavía (delta 0).
      const limpios = deltas.filter((d) => d > 0 && d < 10);
      if (limpios.length < 20) return -1;
      return limpios.reduce((a, b) => a + b, 0) / limpios.length;
    });

    // 1.5 px/frame = el triple de los 0.5 originales = los ~90 px/s a 60fps que
    // eligió Anibal. La banda cubre el redondeo del transform, no un rango de
    // velocidades: 1.0 sería el doble y 2.0 el cuádruple.
    expect(pxPorFrame, 'no se pudo medir el desplazamiento del carrusel').toBeGreaterThan(0);
    expect(pxPorFrame).toBeGreaterThan(1.2);
    expect(pxPorFrame).toBeLessThan(1.8);
  });

  test('los rieles de /reviews corren a 2x, más lento que la velocidad global', async ({ page }) => {
    // Este check verificaba "un tercio de la duración base", que era la velocidad
    // global aplicada a todo por igual. Desde el 31/08 estos rieles llevan factor
    // propio ("la velocidad del carrousel de reviews a la mitad, mas despacio") y
    // lo que se verifica es que ese factor llegue: más lento = más duración.
    // El 02/09 pasaron de 1.5x a 2x — "los de 1.5, custom y reviews mandale 2"—,
    // así que siguen por debajo de la global (3x) pero menos que antes.
    await visit(page, '/reviews');

    const rieles = page.locator('.hc-marquee-track');
    // Los rieles son la cara desktop (≥1300px); en mobile las fotos van
    // intercaladas y sin animación, así que no hay nada que medir.
    if (await rieles.count() === 0) {
      test.skip(true, 'los rieles verticales sólo existen en desktop');
      return;
    }

    // 40s es la duración base del riel (RAIL_SECONDS en HappyCustomers.jsx),
    // dividida por la velocidad global (3) y por su factor propio, enX(2) = 2/3:
    // 40 / (3 * 2/3) = 20s.
    const duracion = await rieles.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).animationDuration));
    expect(duracion).toBeCloseTo(40 / (3 * (2 / 3)), 1);
    // Y que siga siendo más lento que la velocidad global, no sólo un número
    // distinto: a 3x la duración sería 40/3 ≈ 13.3s.
    expect(duracion).toBeGreaterThan(40 / 3);
  });
});

test.describe('cabecera de reseñas de la home', () => {
  test('el promedio queda a la misma altura que el resto de la fila', async ({ page }) => {
    // Anibal: "el numero 4.8 lo veo desalineado, como mas arriba del resto" (01/09).
    // Estaba alineado por baseline contra un bloque de DOS líneas (estrellas +
    // "158 reviews"), así que se pegaba a la línea de las estrellas y su centro
    // quedaba 8.7px por encima del de "Reviews". El título se fue el 12/10/2026;
    // desde entonces la referencia es el número de Facebook, al otro lado de la
    // fila. Lo que se cuida es que los dos
    // extremos de la fila compartan centro, no un valor de CSS puntual: cambiar el
    // tamaño del número o agregarle un renglón al bloque no debería descolgarlo.
    await visit(page, '/');

    // El grupo del promedio es un flex de dos hijos cuyo primero es el número. Se
    // ancla ahí y no en el texto "Reviews", que también está en el pie de página.
    const BUSCAR_GRUPO = `[...document.querySelectorAll('div')].find((d) => {
      const cs = getComputedStyle(d);
      return cs.display === 'flex' && d.children.length === 2
        && /^\\d+\\.\\d$/.test(d.children[0].textContent.trim());
    })`;

    // El bloque del promedio sólo existe si hay reseñas puntuadas. Desde el 03/09
    // no hay fallback a reseñas inventadas, así que con google_reviews vacía la
    // cabecera muestra el título y el conteo y nada más — y no hay nada que
    // alinear. El test no se afloja: se saltea cuando falta su premisa, y vuelve
    // a correr solo en cuanto Anibal cargue una reseña de Google.
    const hayPromedio = await page.waitForFunction(`!!(${BUSCAR_GRUPO})`, null, { timeout: 8_000 })
      .then(() => true).catch(() => false);
    test.skip(!hayPromedio, 'no hay reseñas puntuadas, así que no hay promedio que alinear');
    await page.evaluate(`(${BUSCAR_GRUPO}).scrollIntoView({ block: 'center' })`);
    // El número entra con un contador animado que arranca en 0.0 y sólo corre
    // cuando la sección está a la vista: recién scrolleada tiene sentido esperarlo.
    await page.waitForFunction(
      `parseFloat((${BUSCAR_GRUPO}).children[0].textContent) > 0`,
      null, { timeout: 20_000 });

    const centros = await page.evaluate(`(() => {
      const grupo = ${BUSCAR_GRUPO};
      // El número de Facebook, si está; sin Facebook queda sólo el chequeo del
      // conteo centrado.
      const titulo = document.querySelector('[data-testid="home-facebook"] span');
      const centro = (el) => {
        const r = el.getBoundingClientRect();
        return (r.top + r.bottom) / 2;
      };
      // Centro del CONTENIDO y no de la caja: el conteo es un bloque que ocupa
      // todo el ancho del stack, así que su bounding box no dice dónde está el
      // texto. Un Range mide lo que realmente se dibuja.
      const centroX = (el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return (b.left + b.right) / 2;
      };
      const stack = grupo.children[1];
      return {
        numero: centro(grupo.children[0]),
        estrellas: centro(stack),
        titulo: titulo ? centro(titulo) : null,
        xEstrellas: centroX(stack.children[0]),
        xConteo: centroX(stack.children[1]),
      };
    })()`);

    expect(Math.abs(centros.numero - centros.estrellas),
      'el promedio no está a la misma altura que sus estrellas').toBeLessThanOrEqual(1);
    if (centros.titulo !== null) {
      expect(Math.abs(centros.numero - centros.titulo),
        'el promedio no está a la misma altura que el número de Facebook').toBeLessThanOrEqual(1);
    }

    // Y el conteo va centrado bajo las estrellas, no pegado a su borde izquierdo.
    // Anibal: "lo de 158 reviews deberia centrarse" (02/09). Es más angosto que la
    // fila de estrellas, así que sin textAlign se leía descolgado hacia la izquierda.
    expect(Math.abs(centros.xConteo - centros.xEstrellas),
      'el conteo de reseñas no está centrado bajo las estrellas').toBeLessThanOrEqual(1);
  });
});

/**
 * Simula valores guardados en el admin pisando la respuesta de site_config, sin tocar
 * la base. Cada clave se mezcla con lo que ya tenga guardado; si no hay fila, se crea.
 *
 * Lo pisado aparece recién cuando el sitio termina de pedir todo (App aplica los datos
 * juntos), y en la home eso compite con las fotos del mismo servidor de Supabase: hay
 * que esperar DATOS_MS, el mismo tope que el resto del suite usa para datos. Al
 * visitante no le pasa porque el prerender ya trae site_config en el HTML.
 *
 * El test que lo use termina con `page.unrouteAll({ behavior: 'wait' })`: el sitio
 * vuelve a pedir site_config y, si el test cierra la página con ese pedido a medio
 * leer, Playwright falla con "Response has been disposed".
 */
const DATOS_MS = 20_000;

async function pisarSiteConfig(page, cambios) {
  await page.route('**/rest/v1/site_config*', async (route) => {
    const res = await route.fetch();
    const filas = await res.json();
    for (const [key, extra] of Object.entries(cambios)) {
      let fila = filas.find((f) => f.key === key);
      if (!fila) filas.push(fila = { key, value: '{}' });
      const enTexto = typeof fila.value === 'string';
      let valor;
      try { valor = enTexto ? JSON.parse(fila.value) : { ...fila.value }; } catch { valor = null; }
      if (!valor || typeof valor !== 'object') valor = { text: fila.value };
      Object.assign(valor, extra);
      fila.value = enTexto ? JSON.stringify(valor) : valor;
    }
    await route.fulfill({ response: res, json: filas });
  });
}

test.describe('color de los títulos', () => {
  test('los títulos oscuros son gris oscuro, no negro', async ({ page }) => {
    // "que no sean oscuros oscuros, sino gris oscuro, lo más oscuro que se pueda
    // pero no negro" (Anibal, 21/10). Heredaban el #1a1a1a del root. Se mira todo
    // título oscuro de las 4 rutas: los blancos de las bandas de color no cuentan.
    for (const ruta of ['/', '/portfolio', '/reviews', '/faq']) {
      await visit(page, ruta);
      // "Título" es lo que se ve como tal: negrita de 18 px para arriba con texto
      // propio. En /reviews no hay <h*>; ahí los títulos son los números del puntaje.
      const oscuros = await page.evaluate(() => [...document.querySelectorAll('#main-content *')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        .map((el) => {
          const cs = getComputedStyle(el);
          return { texto: el.innerText.trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) };
        })
        .filter(({ color, size, weight }) => {
          const [r, g, b] = color.match(/\d+/g).map(Number);
          return size >= 18 && weight >= 700 && r + g + b < 3 * 100;
        }));
      // /reviews sin reseñas cargadas no muestra puntaje (igual que en los tests del
      // resumen): ahí se mira lo que haya. Las otras tres siempre tienen títulos.
      if (ruta !== '/reviews') expect(oscuros.length, `${ruta}: debería tener algún título`).toBeGreaterThan(0);
      for (const t of oscuros) expect(t.color, `${ruta} «${t.texto}»`).toBe('rgb(51, 51, 51)');
    }
  });
});

test.describe('orden de la home', () => {
  test('las tarjetas de redes tienen el mismo aire arriba y abajo', async ({ page }) => {
    // Anibal, 13/10/2026: "quedó muy ancho" entre las tarjetas y "Meet your
    // handyman" (20 px arriba contra 68 abajo en la compu).
    await visit(page, '/');
    // Que la home esté montada y la presentación quieta: medía apenas la red se
    // calmaba, y con la home más liviana (14/10/2026) eso a veces pasaba antes de
    // que existiera .stats-section, o con "Meet your handyman" a mitad del FadeIn.
    await page.locator('.social-card').first().waitFor();
    await esperarPresentacionAsentada(page);
    const r = await page.evaluate(() => {
      const franja = document.querySelector('.stats-section').getBoundingClientRect();
      const cards = [...document.querySelectorAll('.social-card')].map((c) => c.getBoundingClientRect());
      const h2 = [...document.querySelectorAll('h2')].find((h) => /Meet your handyman/i.test(h.textContent));
      const rg = document.createRange(); rg.selectNodeContents(h2);
      return {
        arriba: Math.min(...cards.map((c) => c.top)) - franja.bottom,
        abajo: rg.getBoundingClientRect().top - Math.max(...cards.map((c) => c.bottom)),
      };
    });
    expect(Math.abs(r.arriba - r.abajo), `${r.arriba}px arriba contra ${r.abajo}px abajo`).toBeLessThanOrEqual(3);
  });

  test('la franja gris dice "Works in CH" y no "Video Shows"', async ({ page }) => {
    // Pedido de Anibal del 13/10/2026.
    await visit(page, '/');
    await expect(page.locator('.stats-section')).toContainText('Works in CH');
    await expect(page.locator('.stats-section')).not.toContainText('Video Shows');
  });

  test('/faq cierra igual que /portfolio: título y botón verde de WhatsApp', async ({ page }) => {
    // Anibal, 13/10/2026: "ese botón al pie de portfolio debería ser el mismo al
    // pie de FAQs. Have another question (en negro) y abajo el coso verde 'ask me
    // directly' con el loguito y todo".
    await visit(page, '/faq');
    const cierre = page.getByTestId('faq-cierre');
    await expect(cierre).toContainText('Have another question?');
    const boton = cierre.locator('a', { hasText: 'Ask me directly' });
    await expect(boton).toHaveAttribute('href', /wa\.me|whatsapp/);
    await expect(boton.locator('svg')).toHaveCount(1);
    expect(await boton.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(37, 211, 102)');
  });

  // Filas de píxeles vacías arriba y abajo del contenido de una caja, medidas sobre
  // una foto de la caja. Medir cajas de texto no sirve: incluyen el aire invisible de
  // cada renglón, que era justamente lo que descentraba las bandas.
  const aireVisible = async (page, caja) => {
    // scale 'css': en píxeles de la página, no del dispositivo, para poder sumarlo
    // con medidas del DOM en el celu (que tiene más densidad).
    const png = (await caja.screenshot({ animations: 'disabled', scale: 'css' })).toString('base64');
    return page.evaluate(async (src) => {
      const img = new Image();
      img.src = `data:image/png;base64,${src}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      const px = (x, y) => { const i = (y * c.width + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
      const margen = Math.min(30, Math.floor(c.width / 4));
      const filas = [];
      for (let y = 0; y < c.height; y++) {
        const fondo = px(margen, y);
        for (let x = margen; x < c.width - margen; x += 2) {
          const [r, g, b] = px(x, y);
          if (Math.abs(r - fondo[0]) + Math.abs(g - fondo[1]) + Math.abs(b - fondo[2]) > 60) { filas.push(y); break; }
        }
      }
      return { arriba: filas[0], abajo: c.height - 1 - filas[filas.length - 1] };
    }, png);
  };

  // Anibal, 13/10/2026: "eso lo tenés que centrar… deberías tener la línea que te lo
  // fuerza al medio", sobre la franja gris, Service Areas, "Need something
  // specific?", "Ready to get started?" y los cierres de /faq y /portfolio. Todas
  // salvo la franja gris usan BandaCentrada. Se mide lo que se VE.
  //
  // Un test por página: juntas cargaban tres páginas y sacaban seis capturas en un
  // solo test, y con la máquina cargada no entraba en el timeout. Y la home se mide
  // recién con las reseñas en pantalla: antes React reemplaza el HTML prerenderizado
  // y la caja que se estaba midiendo se desprendía del DOM a mitad de la medición.
  // Se lleva la banda a la vista y se espera a que su FadeIn haya terminado de
  // entrar (ella y todo lo que la contiene, con opacidad 1 y sin desplazamiento):
  // medir a mitad de la entrada daba números falsos. Es la condición real, no un
  // tiempo fijo.
  const bandaQuieta = async (banda) => {
    await banda.scrollIntoViewIfNeeded();
    await expect.poll(() => banda.evaluate((el) => {
      for (let n = el; n; n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.opacity !== '1' || (c.transform !== 'none' && n !== el)) return false;
      }
      return true;
    }), { timeout: 10_000 }).toBe(true);
  };
  const bandaCentrada = async (page, nombre, banda) => {
    await bandaQuieta(banda);
    const { arriba, abajo } = await aireVisible(page, banda);
    expect(Math.abs(arriba - abajo), `${nombre}: ${arriba}px arriba contra ${abajo}px abajo`).toBeLessThanOrEqual(3);
  };

  // Un test por banda: juntas en la home (la página más pesada, con los carruseles
  // moviéndose) no entraban en el timeout con la máquina cargada. La home se mide
  // con las reseñas ya en pantalla: antes React reemplaza el HTML prerenderizado y
  // la caja que se estaba midiendo se desprendía del DOM.
  // En el celu ninguna etiqueta de la franja gris se parte: "Facebook Followers" en
  // dos renglones dejaba las otras tres pegadas arriba (19/10/2026).
  test('home: las etiquetas de la franja gris van en un solo renglón', async ({ page }) => {
    await visit(page, '/');
    const renglones = await page.locator('.stats-section').evaluate((el) => [...el.querySelectorAll('.stats-grid > div > div:last-child')]
      .map((d) => d.getClientRects().length === 1 && d.getBoundingClientRect().height < parseFloat(getComputedStyle(d).fontSize) * 1.6));
    expect(renglones, 'alguna etiqueta de la franja gris se partió en dos renglones').not.toContain(false);
  });

  for (const [nombre, banda] of [
    ['franja gris', (page) => page.locator('.stats-section')],
    ['Service Areas', (page) => page.locator('section h4', { hasText: 'Service Areas' }).locator('xpath=..')],
    ['Need something specific?', (page) => page.locator('.banda-centrada', { hasText: 'Need something specific?' })],
    ['Ready to get started?', (page) => page.locator('.banda-centrada', { hasText: 'Ready to get started?' })],
  ]) {
    test(`home: "${nombre}" tiene el contenido centrado arriba-abajo`, async ({ page }) => {
      await visit(page, '/');
      await page.waitForFunction(() => document.querySelectorAll('.review-card').length > 0, null, { timeout: 20_000 });
      await bandaCentrada(page, nombre, banda(page));
    });
  }

  test('el cierre de /faq tiene el contenido centrado arriba-abajo', async ({ page }) => {
    await visit(page, '/faq');
    await bandaCentrada(page, 'cierre de /faq', page.getByTestId('faq-cierre'));
  });

  test('el cierre de /portfolio tiene el contenido centrado arriba-abajo', async ({ page }) => {
    await visit(page, '/portfolio');
    await bandaCentrada(page, 'cierre de /portfolio', page.getByTestId('portfolio-cierre'));
  });

  test('la cabecera de reseñas de la home queda centrada entre la sección de arriba y las tarjetas', async ({ page }) => {
    // Anibal, 13/10/2026, con una captura marcada "1" arriba y "2" abajo.
    await visit(page, '/');
    const cabecera = page.locator('.rev-head');
    await cabecera.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('.review-card').length > 0, null, { timeout: 20_000 });
    await page.waitForTimeout(1500);
    const tinta = await aireVisible(page, cabecera);
    const pos = await cabecera.evaluate((h) => {
      const tarjeta = h.parentElement.querySelector('.review-card, .hc-carousel-tile');
      return {
        arriba: h.getBoundingClientRect().top - h.closest('section').getBoundingClientRect().top,
        abajo: tarjeta.getBoundingClientRect().top - h.getBoundingClientRect().bottom,
      };
    });
    const arriba = pos.arriba + tinta.arriba;
    const abajo = pos.abajo + tinta.abajo;
    expect(Math.abs(arriba - abajo), `${arriba}px arriba contra ${abajo}px abajo`).toBeLessThanOrEqual(3);
  });

  test('reseñas de la home: Facebook con su F y "100%", y en una sola fila con Google', async ({ page, isMobile }) => {
    // Anibal, 13/10/2026: "en vez de 144 gigante tiene que ir 100%", "cambiá el
    // dedito por el logo de la f" y que en el celu no se parta la fila.
    await visit(page, '/');
    const fb = page.getByTestId('home-facebook');
    await fb.scrollIntoViewIfNeeded();
    if (await fb.count() === 0) return; // sin reseñas de Facebook cargadas no hay bloque
    await expect(fb.locator('span').first()).toHaveText('100%', { timeout: 10_000 });
    // "144 Reviews", con la misma forma que el "25 Reviews" de Google.
    await expect(page.getByTestId('home-facebook-conteo')).toHaveText(/^\d+ Reviews?$/);
    const google = page.getByTestId('home-google');
    if (await google.count() === 0) return;
    const [g, f] = await Promise.all([google.boundingBox(), fb.boundingBox()]);
    expect(Math.abs((g.y + g.height / 2) - (f.y + f.height / 2)), 'Google y Facebook no quedaron en la misma fila').toBeLessThanOrEqual(4);
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(desborda, isMobile ? 'la cabecera de reseñas se sale de la pantalla del celu' : 'desborde horizontal').toBe(false);
  });

  test('tarjetas de redes: un Enter en el texto es renglón en el celu y espacio en la compu', async ({ page, isMobile }) => {
    // Anibal, 13/10/2026: "¿hay una manera de forzar dos renglones para celu?". El
    // corte lo elige él con un Enter en el admin; se simula poniendo ese texto.
    await visit(page, '/');
    const renglones = await page.locator('[data-social-card="wa"]').evaluate((el) => {
      el.textContent = 'Answer in less\nthan 24hs';
      const lh = parseFloat(getComputedStyle(el).lineHeight);
      return Math.round(el.getBoundingClientRect().height / lh);
    });
    expect(renglones, isMobile ? 'en el celu el Enter tiene que cortar el renglón' : 'en la compu tiene que ir en una línea').toBe(isMobile ? 2 : 1);
  });

  test('tarjetas de redes: Google, YouTube, WhatsApp, Facebook', async ({ page }) => {
    // Pedido de Anibal del 10/10/2026: una 4ª tarjeta de Google "como la de
    // Facebook", y ese orden. La de Google lleva a la ficha del negocio, no al
    // formulario de reseña.
    await visit(page, '/');
    const tarjetas = page.locator('.social-card');
    await expect(tarjetas).toHaveCount(4);
    const orden = await page.locator('[data-social-card]').evaluateAll(
      (els) => els.map((e) => e.getAttribute('data-social-card')));
    expect(orden).toEqual(['google', 'yt', 'wa', 'fb']);
    const google = await tarjetas.first().getAttribute('href');
    expect(google, 'la tarjeta de Google va a la ficha').toMatch(/g\.page\/r\/[^/]+$/);
    for (const el of await page.locator('[data-social-card]').all()) {
      await expect(el).not.toHaveText('');
    }
  });

  test('tamaños del hero: el del celu es aparte y sin cargar queda el de siempre', async ({ page, isMobile }) => {
    // Anibal, 13/10/2026: "cuando edito los headlines, en la compu veo los cambios,
    // pero no en el celu". El CSS de mobile fijaba los tamaños con !important. Ahora
    // el admin tiene un tamaño para el celu (--fs-m) y, vacío, valen los de antes.
    await visit(page, '/');
    const tam = (sel) => page.locator(sel).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const h1 = '.hero-section h1';
    if (isMobile) {
      const anchoChico = await page.evaluate(() => innerWidth < 360);
      if (!anchoChico) {
        // Lo cargado en el admin para el celu, y si no hay nada, el de siempre. Va
        // contra la base real: Anibal ya cargó los suyos el 13/10.
        for (const [sel, deSiempre] of [[h1, 31], ['.hero-section .hero-brand', 20], ['.hero-section .hero-subtitle', 18]]) {
          const cargado = await page.locator(sel).first().evaluate((el) => parseFloat(el.style.getPropertyValue('--fs-m')) || null);
          expect(await tam(sel), sel).toBe(cargado ?? deSiempre);
        }
      }
      await page.locator(h1).evaluate((el) => el.style.setProperty('--fs-m', '27px'));
      expect(await tam(h1), 'el tamaño del celu no se aplica en el celu').toBe(anchoChico ? 27 * 21 / 31 : 27);
    } else {
      const antes = await tam(h1);
      await page.locator(h1).evaluate((el) => el.style.setProperty('--fs-m', '27px'));
      expect(await tam(h1), 'el tamaño del celu cambió la compu').toBe(antes);
    }
  });

  test('los dos subtítulos del hero con la misma fuente se ven iguales', async ({ page }) => {
    // Anibal, 13/10/2026: los dos en Caveat desde el admin y "no son la misma,
    // comparé las t o las m". Al primero se le forzaba cursiva y el navegador
    // inclinaba una fuente que no tiene cursiva. Con la misma fuente elegida,
    // tienen que salir con el mismo estilo.
    await visit(page, '/');
    const [brand, sub] = await Promise.all(['.hero-section .hero-brand', '.hero-section .hero-subtitle'].map(
      (sel) => page.locator(sel).first().evaluate((el) => {
        const c = getComputedStyle(el);
        return { familia: c.fontFamily.split(',')[0].trim(), estilo: c.fontStyle };
      })));
    if (brand.familia === sub.familia) {
      expect(brand.estilo, 'misma fuente pero uno inclinado y el otro no').toBe(sub.estilo);
    }
  });

  test('el grosor elegido en el admin manda sobre el de siempre', async ({ page }) => {
    // Anibal, 19/10/2026: Caveat parecía dos tipografías porque el subtítulo del hero
    // iba en 400 y los títulos en 700/800. Ahora cada texto tiene "Grosor" en el
    // admin. Se simula lo guardado pisando la respuesta de site_config, sin tocar la base.
    await pisarSiteConfig(page, { hero_title: { bold: false }, hero_subtitle: { bold: true }, footer_heading_style: { bold: false } });
    await visit(page, '/');
    const peso = (sel) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontWeight);
    await expect.poll(() => peso('.hero-section h1'), { message: 'el título sigue en negrita con "Normal"', timeout: DATOS_MS }).toBe('400');
    await expect.poll(() => peso('.hero-section .hero-subtitle'), 'el subtítulo no pasó a negrita').toBe('700');
    await expect.poll(() => peso('footer >> text=/^Contact$/'), 'los títulos del footer siguen en negrita con "Normal"').toBe('400');
    await page.unrouteAll({ behavior: 'wait' });
  });

  test('Caveat sin grosor elegido sale como el subtítulo del hero: normal y sin espaciado extra', async ({ page }) => {
    // Anibal, 19/10/2026: "todos los caveats deberían ser como este". Los títulos del
    // footer traen negrita y espaciado fijos pensados para DM Sans.
    await pisarSiteConfig(page, { footer_heading_style: { fontFamily: 'Caveat' }, hero_title: { fontFamily: 'Caveat' } });
    await visit(page, '/');
    const medir = (sel) => page.locator(sel).first().evaluate((el) => {
      const c = getComputedStyle(el);
      return `${c.fontFamily.split(',')[0].trim()} ${c.fontWeight} ${c.letterSpacing}`;
    });
    await expect.poll(() => medir('footer >> text=/^Contact$/'), { message: 'el título del footer en Caveat no sale como el subtítulo', timeout: DATOS_MS }).toBe('Caveat 400 normal');
    await expect.poll(() => medir('.hero-section h1'), { message: 'el título del hero en Caveat no sale normal', timeout: DATOS_MS }).toBe('Caveat 400 normal');
    await page.unrouteAll({ behavior: 'wait' });
  });

  test('las tres líneas del hero en la misma fuente tienen el mismo espaciado', async ({ page }) => {
    // Anibal, 19/10/2026: título, marca y subtítulo en Caveat desde el admin y las "t"
    // se veían distintas en cada uno. Cada línea traía un espaciado fijo pensado para
    // su fuente de siempre (-0.02em el título, +0.02em la marca).
    const caveat = { fontFamily: 'Caveat' };
    await pisarSiteConfig(page, { hero_title: caveat, hero_brand_subtitle: caveat, hero_subtitle: caveat });
    await visit(page, '/');
    const medir = () => page.evaluate(() => ['.hero-section h1', '.hero-section .hero-brand', '.hero-section .hero-subtitle'].map((sel) => {
      const c = getComputedStyle(document.querySelector(sel));
      return { familia: c.fontFamily.split(',')[0].trim(), espaciado: c.letterSpacing, estilo: c.fontStyle, variantes: c.fontFeatureSettings };
    }));
    // Lo prerenderizado trae las fuentes de siempre; se mide cuando ya llegó lo del admin.
    await expect.poll(async () => (await medir()).map((l) => l.familia).join(), { message: 'no se aplicó Caveat en las tres líneas', timeout: DATOS_MS }).toBe('Caveat,Caveat,Caveat');
    const lineas = await medir();
    for (const l of lineas) {
      expect(l.espaciado, 'una línea conserva el espaciado de su fuente de siempre').toBe(lineas[0].espaciado);
      expect(l.estilo, 'una línea sale inclinada y las otras no').toBe(lineas[0].estilo);
      // Caveat va con sus variantes de letra, como viene: Anibal la eligió así (20/10/2026)
      // comparando con y sin ellas. Apagarlas cambia el dibujo de la "t" que le gusta.
      expect(l.variantes, 'Caveat perdió sus variantes de letra').toBe('normal');
    }
    await page.unrouteAll({ behavior: 'wait' });
  });

  test('en el celu el título del hero tiene sombra atrás aunque el texto sea más grande', async ({ page, isMobile }) => {
    // Anibal, 13/10/2026: "lo bajaste mucho". En su iPhone (tamaño de texto del
    // sistema más grande) el título salía sobre las fotos claras, por arriba de una
    // sombra que estaba fija en el 72% del hero. Ahora la sombra es el fondo del
    // bloque de texto y sube con él. Se agranda el texto un 45% para simularlo.
    test.skip(!isMobile, 'en la compu la sombra es otra y nunca tuvo el problema');
    await visit(page, '/');
    await page.waitForTimeout(2500); // las líneas del hero entran con animación
    const r = await page.evaluate(() => {
      for (const el of document.querySelectorAll('.hero-section h1, .hero-section .hero-brand, .hero-section .hero-subtitle, .hero-trust > span')) {
        el.style.setProperty('font-size', `${parseFloat(getComputedStyle(el).fontSize) * 1.45}px`, 'important');
      }
      const sombra = document.querySelector('.hero-overlay');
      return {
        fondo: getComputedStyle(sombra).backgroundImage,
        aireArribaDelTitulo: document.querySelector('.hero-section h1').getBoundingClientRect().top - sombra.getBoundingClientRect().top,
      };
    });
    expect(r.fondo, 'el bloque de texto del hero no tiene la sombra').toContain('gradient');
    expect(r.aireArribaDelTitulo, 'el título se sale por arriba de la sombra').toBeGreaterThanOrEqual(40);
  });

  test('en el celu los textos del hero van pegados abajo', async ({ page, isMobile }) => {
    // "Bajar todos los textos lo más sensatamente posible" para que se vea la
    // fila de arriba del collage (Anibal, 10/10/2026, sólo celu).
    test.skip(!isMobile, 'en la compu está como él quiere');
    await visit(page, '/');
    await page.waitForTimeout(2500); // las líneas entran con una animación de 1.5 s
    const aire = await page.evaluate(() => {
      const hero = document.querySelector('.hero-section').getBoundingClientRect();
      const ultima = document.querySelector('.hero-trust').getBoundingClientRect();
      return hero.bottom - ultima.bottom;
    });
    expect(aire, 'quedó aire de más abajo de los textos del hero').toBeLessThanOrEqual(10);
    expect(aire, 'los textos se salen del hero').toBeGreaterThanOrEqual(0);
  });

  test('Service Areas va entre los dos primeros carruseles', async ({ page }) => {
    // Pedido de Anibal del 10/10/2026: antes iba entre About y Recent Works, y
    // ahora el primer carrusel sube justo debajo de About.
    await visit(page, '/');
    await page.waitForFunction(
      () => [...document.querySelectorAll('div')].some(
        (d) => d.style.willChange === 'transform' && d.children.length > 3),
      null,
      { timeout: 20_000 },
    );
    const orden = await page.evaluate(() => {
      const y = (el) => el ? el.getBoundingClientRect().top + scrollY : NaN;
      const secciones = [...document.querySelectorAll('section')];
      const conTitulo = (re) => secciones.find((s) => re.test(s.querySelector('h2, h4')?.innerText ?? ''));
      return {
        recent: y(conTitulo(/recent/i)),
        zonas: y(secciones.find((s) => s.querySelector('h4') && /area/i.test(s.querySelector('h4').innerText))),
        custom: y(conTitulo(/custom|tailor/i)),
      };
    });
    expect(orden.recent, 'Recent Works va antes de Service Areas').toBeLessThan(orden.zonas);
    expect(orden.zonas, 'Service Areas va antes de Custom Projects').toBeLessThan(orden.custom);
  });

  test('las marcas cierran la página: después del CTA y antes del footer', async ({ page }) => {
    // Pedido de Anibal: "lo de trusted brands tiene q ir al cierre, entre
    // 'ready to get…' y el pie de página". Antes partía al medio el bloque de
    // trabajos.
    await visit(page, '/');
    // "We Work With" -> "I work with": Anibal trabaja solo y el plural sonaba a agencia.
    const marcas = page.getByText('Trusted Brands I Work With');
    await expect(marcas).toBeVisible();

    const orden = await page.evaluate(() => {
      const y = (el) => el.getBoundingClientRect().top + scrollY;
      const marcas = [...document.querySelectorAll('p')]
        .find((p) => /trusted brands/i.test(p.innerText));
      const cta = [...document.querySelectorAll('div')]
        .find((d) => d.innerText?.trim().startsWith('Ready to get started?'));
      const footer = document.querySelector('footer');
      return { marcas: y(marcas), cta: y(cta), footer: y(footer) };
    });
    expect(orden.cta, 'las marcas van después del CTA de cierre').toBeLessThan(orden.marcas);
    expect(orden.marcas, 'las marcas van antes del footer').toBeLessThan(orden.footer);
  });

  test('en la presentación el título se lee antes que la foto', async ({ page, isMobile }) => {
    test.skip(isMobile, 'en mobile lo cubre el grupo de presentación en mobile');
    await visit(page, '/');
    await esperarPresentacionAsentada(page);

    const m = await page.evaluate(() => {
      const foto = document.querySelector('.about-row img').getBoundingClientRect();
      const h2 = [...document.querySelectorAll('h2')]
        .find((h) => h.innerText.includes('Meet your handyman')).getBoundingClientRect();
      return { tituloIzquierda: h2.right <= foto.left, mismaFila: Math.abs(h2.top - foto.top) < foto.height };
    });
    expect(m.mismaFila, 'título y foto van en la misma fila').toBe(true);
    expect(m.tituloIzquierda, 'la foto va a la derecha del texto').toBe(true);
  });
});

test.describe('presentación en mobile', () => {
  // Lo que pidió el cliente: en la primera pantalla, sin scrollear, además del hero se
  // tiene que ver su foto y la bajada de "Meet your handyman". Antes no entraba.
  test('la foto y la bajada entran en la primera pantalla', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'en desktop ya entraba de sobra; el ajuste es de mobile');
    await visit(page, '/');
    await esperarPresentacionAsentada(page);

    const m = await page.evaluate(() => {
      const h2 = [...document.querySelectorAll('h2')].find(h => h.innerText.includes('Meet your handyman'));
      const foto = document.querySelector('.about-row img').getBoundingClientRect();
      const hb = h2.getBoundingClientRect();
      return { fotoEntera: foto.bottom <= innerHeight, bajadaVisible: hb.bottom <= innerHeight };
    });
    expect(m.fotoEntera, 'la foto tiene que entrar entera').toBe(true);
    expect(m.bajadaVisible, 'la bajada tiene que entrar').toBe(true);
  });

  test('el título queda pegado a su texto, no colgado del centro de la foto', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo mobile');
    await visit(page, '/');
    await esperarPresentacionAsentada(page);
    // Este check pedía la foto centrada contra el título. Eso dejaba al título
    // flotando en el medio de una fila de 88px y abajo le quedaban ~28px de aire
    // antes de la bio: Anibal lo marcó como "que no quede tanto espacio entre
    // handyman y texto". Lo que se verifica ahora es el requisito de verdad —
    // que no haya hueco— en vez del centrado, que era sólo un proxy.
    const m = await page.evaluate(() => {
      const foto = document.querySelector('.about-row img').getBoundingClientRect();
      const h2El = [...document.querySelectorAll('h2')].find(h => h.innerText.includes('Meet your handyman'));
      const h2 = h2El.getBoundingClientRect();
      const bio = document.querySelector('.about-row > div > p').getBoundingClientRect();
      // Con la foto flotando, la CAJA del h2 sigue ocupando todo el ancho aunque su
      // texto se acorte para esquivarla. Medir la caja diría que el título pisa la
      // foto cuando en pantalla no la pisa: se mide el texto renderizado.
      const textoDe = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
      return {
        hueco: bio.top - h2.bottom,
        // El título va al lado y a la izquierda: se lee antes que la foto.
        tituloAntesQueLaFoto: textoDe(h2El).right <= foto.left + 1,
        // La bio respeta la columna de la foto de arriba a abajo.
        bioEnSuColumna: bio.right <= foto.left + 1,
        // La foto va centrada contra el bloque entero de título + bio.
        desvioDelCentro: Math.abs(
          (foto.top + foto.bottom) / 2 - (h2.top + bio.bottom) / 2),
      };
    });
    expect(m.hueco, 'entre el título y su bio no debería quedar más que el row-gap').toBeLessThan(16);
    expect(m.hueco, 'pero tampoco pueden quedar encimados').toBeGreaterThanOrEqual(0);
    expect(m.tituloAntesQueLaFoto, 'el título va a la izquierda y la foto a la derecha').toBe(true);
    // Este check pedía lo contrario —"la bio va de borde a borde"— porque en su
    // momento se decidió que cruzara por debajo de la foto para no estirarse a
    // nueve renglones en 227px. Anibal lo revirtió a propósito el 31/08: quiere que
    // la foto tenga columna propia y que el texto la respete todo el recorrido, y
    // que el bloque quede más alto justamente para que "What to expect" no asome.
    expect(m.bioEnSuColumna, 'la bio se está metiendo abajo de la foto').toBe(true);
    expect(m.desvioDelCentro, 'la foto no está centrada contra el texto').toBeLessThan(8);
  });

  test('los tags de categoría van a ancho completo y centrados', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo mobile');
    await visit(page, '/');
    await esperarPresentacionAsentada(page);

    const m = await page.evaluate(() => {
      const cont = document.querySelector('.skill-tags').getBoundingClientRect();
      const foto = document.querySelector('.about-row img').getBoundingClientRect();
      const tags = [...document.querySelectorAll('.skill-tag')];
      const filas = new Set(tags.map(t => Math.round(t.getBoundingClientRect().top))).size;
      return {
        cruzaLaColumnaDeLaFoto: cont.right >= foto.right - 1,  // usa las dos columnas
        filas, cantidad: tags.length,
        // centrados: el margen sobrante a cada lado del bloque de tags es parejo
        izq: Math.round(Math.min(...tags.map(t => t.getBoundingClientRect().left)) - cont.left),
        der: Math.round(cont.right - Math.max(...tags.map(t => t.getBoundingClientRect().right))),
      };
    });
    expect(m.cantidad).toBeGreaterThan(3);
    expect(m.cruzaLaColumnaDeLaFoto, 'los tags tienen que usar todo el ancho, no la columna del texto').toBe(true);
    expect(Math.abs(m.izq - m.der), 'los tags tienen que quedar centrados').toBeLessThan(14);
    // Con los seis tags achicados no deberían desparramarse en más de cuatro líneas.
    expect(m.filas).toBeLessThanOrEqual(4);
  });

  test('las tarjetas de "What to expect" quedan para el scroll siguiente', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo mobile');
    // El hero absorbe el sobrante de la pantalla. Con una altura fija en vh crecía más
    // despacio que el viewport: en celulares altos sobraban hasta 187 px y por ahí asomaban
    // las tarjetas, que van en el scroll siguiente. Se prueba en tres alturas reales.
    //
    // No alcanza con que entren: se mide cuánto margen tienen. El cálculo del hero estuvo
    // clavado en el borde exacto (0.1 px de holgura) y el test pasaba o fallaba según el
    // redondeo sub-pixel del run. Pidiendo holgura mínima, un cambio que vuelva a dejarlo
    // al filo falla siempre en vez de fallar a veces.
    for (const height of [727, 852, 956]) {
      await page.setViewportSize({ width: 393, height });
      await visit(page, '/');
      await esperarPresentacionAsentada(page);

      const m = await page.evaluate(() => {
        const tags = [...document.querySelectorAll('.skill-tag')];
        const card = [...document.querySelectorAll('div')].find(d => d.innerText?.startsWith('What to expect'));
        return {
          // Positivo = cuánto le sobra al último tag antes del borde de la pantalla.
          holguraTags: innerHeight - tags[tags.length - 1].getBoundingClientRect().bottom,
          // Positivo = cuánto falta para que la tarjeta asome. Negativo = ya asomó.
          margenCard: card ? card.getBoundingClientRect().top - innerHeight : Infinity,
        };
      });
      expect(m.holguraTags, `los tags tienen que entrar con viewport de ${height}`).toBeGreaterThan(0);
      expect(m.holguraTags, `los tags entran raspando con viewport de ${height}: el layout quedó al filo del fold`).toBeGreaterThan(2);
      expect(m.margenCard, `las tarjetas no deberían asomar con viewport de ${height}`).toBeGreaterThan(8);
    }
  });
});

test.describe('resumen de /reviews', () => {
  test('sin título "Reviews" ni pastilla de fuentes, en /reviews ni en la home', async ({ page }) => {
    // Anibal, 10/10/2026: fuera la pastilla y la palabra "Reviews" en las dos
    // páginas. En la home la palabra volvió un día y él la marcó en rojo el 12/10.
    await visit(page, '/reviews');
    await expect(page.locator('.reviews-grid > *').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('fuentes-resenas')).toHaveCount(0);
    // "Reviews" sigue en el menú y en el pie; lo que no puede haber es un título
    // suelto arriba del resumen.
    const tituloResumen = await page.evaluate(() => {
      const resumen = document.querySelector('[data-testid^="resumen-"]');
      const bloque = resumen?.parentElement?.parentElement;
      return bloque ? [...bloque.querySelectorAll('span')].some((s) => s.textContent.trim() === 'Reviews') : false;
    });
    expect(tituloResumen, 'quedó el título "Reviews" arriba del resumen').toBe(false);

    await visit(page, '/');
    await page.waitForFunction(() => document.querySelectorAll('.review-card').length > 0,
      null, { timeout: 20_000 });
    await expect(page.getByTestId('fuentes-resenas')).toHaveCount(0);
    const tituloHome = await page.evaluate(() => {
      const fila = document.querySelector('[data-testid^="home-"]')?.parentElement;
      return fila ? [...fila.querySelectorAll('span')].some((s) => s.textContent.trim() === 'Reviews') : false;
    });
    expect(tituloHome, 'quedó el título "Reviews" en la cabecera del carrusel').toBe(false);
  });

  test('los textos del resumen: sin "Anibal" y sin "Based on N Google Reviews"', async ({ page }) => {
    // 10/10/2026: "Anibal" se sacó de los textos en los 5 idiomas. 13/10/2026: el
    // renglón "Based on N Google Reviews" se fue entero (las barras ya dicen la
    // cantidad) y el de Facebook pasó a ser una frase fija.
    await visit(page, '/reviews');
    await expect(page.locator('.reviews-grid > *').first()).toBeVisible({ timeout: 20_000 });
    const resumen = page.locator('[data-testid^="resumen-"]');
    if (await resumen.count() === 0) return;
    await expect(resumen.first().locator('xpath=..')).not.toContainText('Anibal');
    await expect(page.getByText(/Based on \d+ Google/)).toHaveCount(0);
  });

  // Lo que cuenta la columna de Google: la suma de las 5 barras. Desde el 13/10 no
  // hay renglón "Based on N", así que el conteo se lee de ahí.
  const conteoGoogle = (page) => page.locator('[data-conteo-estrellas]').evaluateAll(
    (els) => els.reduce((s, e) => s + parseInt(e.textContent, 10), 0));

  test('el resumen de /reviews no mezcla el promedio de Google con el conteo de Facebook', async ({ page }) => {
    // El 12/09 Anibal vio "5.0 ★★★★★ / basado en N reseñas" con una sola reseña
    // de Google cargada: el promedio salía de esa única reseña y el conteo sumaba
    // además las recomendaciones de Facebook, que no tienen puntaje y nunca
    // entraron en ese promedio. Eran dos escalas distintas debajo del mismo
    // número. Ahora cada fuente tiene su columna y cuenta lo suyo.
    await visit(page, '/reviews');

    const google = page.locator('[data-testid="resumen-google"]');
    const facebook = page.locator('[data-testid="resumen-facebook"]');

    // Sin reseñas cargadas no hay resumen, y eso es válido: cada columna aparece
    // sólo cuando su fuente tiene algo. Lo que no puede pasar es que no haya
    // ninguna de las dos habiendo tarjetas.
    const hayGoogle = await google.count() > 0;
    const hayFacebook = await facebook.count() > 0;
    if (!hayGoogle && !hayFacebook) {
      await expect(page.locator('.reviews-grid > *')).toHaveCount(0);
      return;
    }

    // Cada columna lleva su propio botón de dejar reseña, y sólo el suyo.
    if (hayGoogle) {
      // Cada columna cuenta las tarjetas de SU fuente, no el total. Ese era el
      // síntoma: debajo del promedio de Google aparecía el total, Facebook
      // incluido.
      const reseniasGoogle = await page.locator('.reviews-grid [data-fuente="google"]').count();
      expect(await conteoGoogle(page), 'las barras de Google no cuentan las reseñas de Google').toBe(reseniasGoogle);
      // "25 Reviews" a la izquierda, como en la home (Anibal, 13/10/2026).
      await expect(page.getByTestId('conteo-google')).toHaveText(new RegExp(`^${reseniasGoogle} Reviews?$`));
      // Por fuente y no por la URL: el link de Google es un g.page/r/... y
      // además Anibal lo puede cambiar desde el admin.
      await expect(google.locator('[data-boton-resena="google"]')).toHaveCount(1);
      await expect(google.locator('[data-boton-resena="facebook"]')).toHaveCount(0);
    }
    if (hayFacebook) {
      // La columna de Facebook ya no muestra el conteo: Anibal lo cambió el
      // 13/10/2026 por "100%" grande y la frase "Built up on mentions and
      // recommendations of real people" en el alto de las barras de Google. El
      // conteo se sigue chequeando en la home (home-facebook-conteo).
      // "…of 144 real people": el número es el de las reseñas de Facebook cargadas.
      const reseniasFb = await page.locator('.reviews-grid [data-fuente="facebook"]').count();
      await expect(facebook.getByTestId('frase-facebook')).toContainText(`Built up on mentions and recommendations of ${reseniasFb} real`);
      await expect(facebook).not.toContainText(/\d+ people recommend/);
      // "Fuente y tamaño tienen que coincidir" con el "25 Reviews" de al lado.
      if (hayGoogle) {
        const estilo = (loc) => loc.evaluate((el) => { const c = getComputedStyle(el); return [c.fontFamily, c.fontSize, c.color].join(' / '); });
        expect(await estilo(facebook.getByTestId('frase-facebook').locator('p')))
          .toBe(await estilo(page.getByTestId('conteo-google')));
      }
      await expect(facebook.locator('[data-boton-resena="facebook"]')).toHaveCount(1);
      await expect(facebook.locator('[data-boton-resena="google"]')).toHaveCount(0);
    }

    // Y que no quede texto crudo de i18n: la clave nueva tiene que existir en el
    // idioma activo.
    await expect(page.getByText(/reviews\.basedGoogle/)).toHaveCount(0);
  });
});

test.describe('peso de la home', () => {
  // El 14/10/2026 la home bajaba ~127 MB: los carruseles pedían las 120 fotos
  // originales (~3700 px, ~1 MB cada una) apenas cargaba, aunque estuvieran fuera
  // de pantalla hacia los costados — el loading="lazy" del navegador no las frenaba.
  // Ahora cada tarjeta pide su foto cuando se acerca a la parte visible
  // (Carousel.jsx), y las imágenes fijas van en WebP al tamaño en que se muestran.
  test('al abrir no baja las fotos de todos los carruseles ni imágenes fijas pesadas', async ({ page, isMobile }) => {
    const fotos = new Set();
    const fijas = [];
    page.on('response', async (res) => {
      if (res.request().resourceType() !== 'image') return;
      const url = res.url();
      if (url.includes('/storage/v1/')) { fotos.add(url); return; }
      if (new URL(url).origin !== new URL(page.url()).origin) return;
      const body = await res.body().catch(() => null);
      if (body) fijas.push({ path: new URL(url).pathname, kb: Math.round(body.length / 1024) });
    });
    await visit(page, '/');

    // Antes eran 120. Con las tarjetas visibles más el margen de los tres
    // carruseles de arriba quedan 9 en la compu y 16 en el celu.
    expect(fotos.size, `bajó ${fotos.size} fotos de Supabase sin scrollear`).toBeLessThanOrEqual(40);

    // Ninguna fija pasa los 300 KB (el hero de la compu, la más grande, pesa 258).
    const pesadas = fijas.filter((f) => f.kb > 300);
    expect(pesadas, 'imágenes fijas de más de 300 KB').toEqual([]);

    // Cada pantalla baja sólo su hero: el preload sin media le hacía bajar al celu
    // también el de la compu, que no usa.
    const heros = fijas.map((f) => f.path).filter((p) => /\/anibal\/hero/.test(p));
    expect(heros).toEqual([isMobile ? '/anibal/hero-mobile.webp' : '/anibal/hero.webp']);
  });
});

test.describe('carga de la home', () => {
  test('lo prerenderizado no se cambia por un spinner al cargar', async ({ page }) => {
    // Hasta el 14/10/2026 la app tiraba el HTML prerenderizado y mostraba un
    // spinner hasta que respondía Supabase: el hero aparecía, desaparecía ~0,8 s
    // y volvía, en cada visita. Ahora arranca con los datos que el prerender dejó
    // en el HTML (#datos-prerender) y los refresca por atrás.
    await page.addInitScript(() => {
      window.__sinHero = 0;
      window.__spinner = 0;
      new MutationObserver(() => {
        if (!document.querySelector('.hero-section') && document.querySelector('main')) window.__sinHero++;
        if ([...document.querySelectorAll('#root div')].some((d) => (d.getAttribute('style') || '').includes('spin 0.8s'))) window.__spinner++;
      }).observe(document, { childList: true, subtree: true });
    });
    await visit(page, '/');
    await expect(page.locator('#datos-prerender')).toHaveCount(1);
    const r = await page.evaluate(() => ({ sinHero: window.__sinHero, spinner: window.__spinner }));
    expect(r.spinner, 'apareció el spinner sobre la página ya armada').toBe(0);
    expect(r.sinHero, 'el hero prerenderizado desapareció mientras cargaba').toBe(0);
  });

  test('no pide tablas retiradas ni respaldos que no hacen falta', async ({ page }) => {
    // returning_customers se pedía en las 4 rutas aunque ese carrusel ya no
    // existe, y la tabla legacy de highlights también aunque el carrusel esté
    // curado. Ahora el respaldo sólo se pide si el carrusel está vacío.
    const pedidos = [];
    page.on('request', (req) => { if (req.url().includes('/rest/v1/')) pedidos.push(decodeURIComponent(req.url())); });
    await visit(page, '/');
    expect(pedidos.filter((u) => u.includes('returning_customers'))).toEqual([]);
    const curado = await page.evaluate(() =>
      JSON.parse(document.getElementById('datos-prerender')?.textContent || '{}').carouselData?.highlights?.length > 0);
    if (curado) expect(pedidos.filter((u) => /\/rest\/v1\/highlights\b/.test(u))).toEqual([]);
  });

  test('abrir una foto no rearma la home', async ({ page }) => {
    // HomePage era un componente definido adentro de App: cualquier cambio de
    // estado (abrir el Lightbox, el menú) creaba un tipo nuevo y React desmontaba
    // y volvía a montar la home entera. Ahora es JSX, como el contenido del admin.
    await visit(page, '/');
    await page.locator('[data-item-id] img').first().waitFor({ state: 'attached' });
    await page.evaluate(() => { window.__hero = document.querySelector('.hero-section'); });
    await page.evaluate(() => document.querySelector('[data-item-id]').click());
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
    expect(await page.evaluate(() => window.__hero === document.querySelector('.hero-section')),
      'el hero es otro nodo: la home se desmontó y se volvió a montar').toBe(true);
  });
});

test.describe('aire alrededor de las cajas de cierre', () => {
  // Anibal, 14/10/2026, con capturas de las tres: /faq y /portfolio tenían 40 px
  // arriba de la caja y 80 abajo hasta el footer; "Ready to get started?" en la
  // home, 80 arriba y 40 abajo hasta las marcas. Quiere el mismo aire de los dos
  // lados. /reviews tenía lo mismo (32 y 80) y apareció en una revisión de todo el
  // sitio ese mismo día. Se mide entre lo que se ve —lo de arriba, la caja, lo de abajo— con la
  // animación de entrada terminada, que mientras dura corre la caja 24 px.
  const piezas = (ruta) => {
    if (ruta === '/') {
      const caja = [...document.querySelectorAll('h3')].find((h) => /Ready to get started/i.test(h.textContent))?.closest('.banda-centrada');
      const arriba = [...document.querySelectorAll('div')].find((d) => d.style.background && /^Top Questions/i.test(d.textContent));
      const abajo = [...document.querySelectorAll('section')].find((x) => /^Trusted Brands/i.test(x.textContent.trim()));
      return { caja, arriba, abajo };
    }
    const caja = document.querySelector(`[data-testid="${ruta.slice(1)}-cierre"]`);
    return { caja, arriba: caja?.previousElementSibling, abajo: document.querySelector('footer') };
  };

  for (const ruta of ['/faq', '/portfolio', '/reviews', '/']) {
    test(`${ruta}: la caja de cierre tiene el mismo aire arriba y abajo`, async ({ page }) => {
      await visit(page, ruta);
      const fn = `(${piezas.toString()})(${JSON.stringify(ruta)})`;
      await page.waitForFunction((fn) => { const p = eval(fn); return p.caja && p.arriba && p.abajo; }, fn, { timeout: 20_000 });
      await page.evaluate((fn) => eval(fn).caja.scrollIntoView({ block: 'center', behavior: 'instant' }), fn);
      await page.waitForFunction((fn) => {
        for (let e = eval(fn).caja; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.opacity !== '1' || (cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)')) return false;
        }
        return true;
      }, fn, { timeout: 10_000 });
      const r = await page.evaluate((fn) => {
        const p = eval(fn);
        const [a, c, b] = [p.arriba, p.caja, p.abajo].map((e) => e.getBoundingClientRect());
        return { arriba: c.top - a.bottom, abajo: b.top - c.bottom };
      }, fn);
      expect(Math.abs(r.arriba - r.abajo), `${Math.round(r.arriba)} px arriba contra ${Math.round(r.abajo)} abajo`).toBeLessThanOrEqual(3);
    });
  }
});

test.describe('resumen de /reviews: clásico o tarjetas', () => {
  // 14/10/2026: estilo "tarjetas" propuesto por Gastón, elegible desde el admin
  // (site_config.reviews_summary_style) para poder volver al clásico con un click.
  // ?resumen= lo pisa para mostrarlo sin activarlo. Ver resumenResenas.js.
  // El de por defecto (tarjetas) lo cubre resumenResenas.test.js: acá
  // depende de lo que tenga guardado la base real.
  test('?resumen=clasico muestra el clásico, sin píldora', async ({ page }) => {
    await visit(page, '/reviews?resumen=clasico');
    await expect(page.locator('[data-estilo-resumen]')).toHaveAttribute('data-estilo-resumen', 'clasico');
    await expect(page.getByTestId('pildora-facebook')).toHaveCount(0);
  });

  test('tarjetas: píldora "Recommended", mismo ancho y la frase centrada entre la píldora y el botón', async ({ page }) => {
    await visit(page, '/reviews?resumen=tarjetas');
    await expect(page.locator('[data-estilo-resumen]')).toHaveAttribute('data-estilo-resumen', 'tarjetas');
    const hayFacebook = await page.getByTestId('resumen-facebook').count();
    test.skip(!hayFacebook, 'sin reseñas de Facebook no hay columna');
    await expect(page.getByTestId('pildora-facebook')).toContainText('Recommended');
    const m = await page.evaluate(() => {
      const G = document.querySelector('[data-testid="resumen-google"]'), F = document.querySelector('[data-testid="resumen-facebook"]');
      const pil = document.querySelector('[data-testid="pildora-facebook"]').getBoundingClientRect();
      const t = F.querySelector('[data-testid="frase-facebook"] p').getBoundingClientRect();
      const bt = F.querySelector('[data-boton-resena]').getBoundingClientRect();
      return { arriba: t.top - pil.bottom, abajo: bt.top - t.bottom, anchoG: G?.getBoundingClientRect().width, anchoF: F.getBoundingClientRect().width, scroll: document.documentElement.scrollWidth, vista: innerWidth };
    });
    expect(Math.abs(m.arriba - m.abajo), `${Math.round(m.arriba)} px arriba de la frase contra ${Math.round(m.abajo)} abajo`).toBeLessThanOrEqual(3);
    if (m.anchoG) expect(Math.abs(m.anchoG - m.anchoF), 'las dos tarjetas no miden lo mismo').toBeLessThanOrEqual(1);
    expect(m.scroll, 'las tarjetas desbordan la pantalla').toBeLessThanOrEqual(m.vista);
  });
});

test('/reviews: "Newest first" tiene el mismo aire arriba y abajo', async ({ page }) => {
  // Anibal, 14/10/2026: quedaba más cerca del resumen (20 px) que de las
  // reseñas (36). Se mide contra lo que se ve: el borde de abajo de las
  // columnas del resumen y el de arriba de la primera tarjeta de reseña.
  await visit(page, '/reviews');
  await page.locator('.reviews-grid > *').first().waitFor();
  const r = await page.evaluate(() => {
    const boton = document.querySelector('[data-testid="orden-resenas"] button').getBoundingClientRect();
    const columnas = [...document.querySelectorAll('[data-testid^="resumen-"]')].map((c) => c.getBoundingClientRect().bottom);
    const grilla = document.querySelector('.reviews-grid').getBoundingClientRect();
    return { arriba: boton.top - Math.max(...columnas), abajo: grilla.top - boton.bottom };
  });
  expect(Math.abs(r.arriba - r.abajo), `${Math.round(r.arriba)} px arriba contra ${Math.round(r.abajo)} abajo`).toBeLessThanOrEqual(3);
});
