import { test, expect } from '@playwright/test';
import { watchConsole, visit, ROUTES, LANGS, esperarPresentacionAsentada } from './helpers.js';

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
    const n = await photos.count();
    // Sin fotos cargadas en la base no hay nada que mostrar, y eso es válido:
    // la sección desaparece entera en vez de dejar un hueco.
    if (n === 0) {
      await expect(page.locator('.hc-edges')).toHaveCount(0);
      return;
    }

    await expect(photos.first()).toHaveAttribute('alt', /.+/);

    if (desktop) {
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
      // Intercaladas, una cada tres reviews.
      //
      // Este check cambió a propósito el 29/08/2026. Antes exigía que la última
      // foto cayera pasado el 60% de la página: el reparto se calculaba sobre el
      // largo de la lista para cubrir todo el scroll. Anibal decidió lo
      // contrario —"cada diez es bocha, nadie scrolea 130 reviews"— así que
      // ahora van adelante, con paso fijo, y se agotan cerca de la review 40.
      // Medir la posición de la última ya no dice nada; lo que importa es el paso.
      const pasos = await page.evaluate(() => {
        const tile = document.querySelector('.hc-inline-tile');
        const hijos = [...tile.parentElement.children];
        const idx = hijos.flatMap((el, i) => el.classList.contains('hc-inline-tile') ? [i] : []);
        return {
          primera: idx[0],
          // Con una foto cada 3 reviews, entre foto y foto hay 4 posiciones.
          saltos: idx.slice(1).map((v, i) => v - idx[i]),
          cuantas: idx.length,
        };
      });
      expect(pasos.primera, 'la primera foto va después de 3 reviews').toBe(3);
      if (pasos.cuantas > 1) {
        expect([...new Set(pasos.saltos)], 'el paso tiene que ser parejo: 3 reviews y una foto')
          .toEqual([4]);
      }
    }
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
      const leer = () => {
        const m = /translateX\((-?[0-9.]+)px\)/.exec(track.style.transform);
        return m ? parseFloat(m[1]) : 0;
      };
      const frame = () => new Promise(requestAnimationFrame);

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

  test('los rieles de /reviews corren a un tercio de la duración base', async ({ page }) => {
    // Anibal reflotó lo de la velocidad justo después de elogiar los carruseles
    // de reviews, así que el número elegido tiene que alcanzarlos a ellos también.
    await visit(page, '/reviews');

    const rieles = page.locator('.hc-marquee-track');
    // Los rieles son la cara desktop (≥1300px); en mobile las fotos van
    // intercaladas y sin animación, así que no hay nada que medir.
    if (await rieles.count() === 0) {
      test.skip(true, 'los rieles verticales sólo existen en desktop');
      return;
    }

    // 40s es la duración base del riel (RAIL_SECONDS en HappyCustomers.jsx).
    const duracion = await rieles.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).animationDuration));
    expect(duracion).toBeCloseTo(40 / 3, 1);
  });
});

test.describe('orden de la home', () => {
  test('las marcas cierran la página: después del CTA y antes del footer', async ({ page }) => {
    // Pedido de Anibal: "lo de trusted brands tiene q ir al cierre, entre
    // 'ready to get…' y el pie de página". Antes partía al medio el bloque de
    // trabajos.
    await visit(page, '/');
    const marcas = page.getByText('Trusted Brands We Work With');
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

  test('la foto va centrada verticalmente contra el título', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo mobile');
    await visit(page, '/');
    await esperarPresentacionAsentada(page);
    // Contra el título y no contra título+bio: con un bloque tan alto la foto termina
    // arrastrada al final y se ve descolgada.
    const m = await page.evaluate(() => {
      const foto = document.querySelector('.about-row img').getBoundingClientRect();
      const h2 = [...document.querySelectorAll('h2')].find(h => h.innerText.includes('Meet your handyman')).getBoundingClientRect();
      const bio = document.querySelector('.about-row > div > p').getBoundingClientRect();
      return {
        desvio: Math.abs((foto.top + foto.bottom) / 2 - (h2.top + h2.bottom) / 2),
        // El título va al lado y a la izquierda: se lee antes que la foto.
        tituloAntesQueLaFoto: h2.right <= foto.left,
        bioAnchoCompleto: bio.right > foto.left,   // la bio cruza la columna de la foto
      };
    });
    expect(m.desvio, 'la foto debería estar centrada contra el título').toBeLessThan(12);
    expect(m.tituloAntesQueLaFoto, 'el título va a la izquierda y la foto a la derecha').toBe(true);
    expect(m.bioAnchoCompleto, 'la bio va de borde a borde, no en la columna del texto').toBe(true);
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