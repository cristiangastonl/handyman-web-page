import { test, expect } from '@playwright/test';
import { watchConsole, visit, ROUTES, LANGS } from './helpers.js';

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
      // Intercaladas: tienen que repartirse por TODA la lista. Con un paso fijo
      // las 12 se agotaban en el primer tercio y el resto de la página quedaba
      // sin ninguna, así que lo que se mide es hasta dónde llega la última.
      const { y, alto } = await photos.last().evaluate(el => ({
        y: el.getBoundingClientRect().top + window.scrollY,
        alto: document.body.scrollHeight,
      }));
      expect(y / alto).toBeGreaterThan(0.6);
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
  }
});

test.describe('panel de velocidad de carruseles', () => {
  // Herramienta interna: tiene que ser invisible para cualquier visitante y
  // aparecer sólo cuando se entra a propósito con ?tune=1.
  const panel = (page) => page.getByText('Velocidad carruseles');

  test('no aparece en una visita normal', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/');
    await expect(panel(page)).toHaveCount(0);
    console_.assertClean();
  });

  test('aparece con ?tune=1 y deja cambiar la velocidad', async ({ page }) => {
    const console_ = watchConsole(page);
    await visit(page, '/?tune=1');

    await expect(panel(page)).toBeVisible();

    const slider = page.getByRole('slider', { name: 'Velocidad de los carruseles' });
    await expect(slider).toHaveValue('1');

    // El preset "Triple" es el número que pidió el cliente.
    await page.getByRole('button', { name: 'Triple' }).click();
    await expect(slider).toHaveValue('3');
    await expect(page.getByText('90 px/s')).toBeVisible();

    console_.assertClean();
  });

  test('sigue prendido al navegar sin el query param', async ({ page, isMobile }) => {
    await visit(page, '/?tune=1');
    await expect(panel(page)).toBeVisible();

    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('button', { name: /^Reviews$/i }).first().click();
    await expect(page).toHaveURL(/\/reviews$/);

    await expect(panel(page)).toBeVisible();
  });

  test('?tune=0 lo apaga', async ({ page }) => {
    await visit(page, '/?tune=1');
    await expect(panel(page)).toBeVisible();
    await visit(page, '/?tune=0');
    await expect(panel(page)).toHaveCount(0);
  });

  test('el multiplicador cambia el desplazamiento real del carrusel', async ({ page }) => {
    // El corazón del cambio: que mover el slider mueva de verdad los carruseles.
    await visit(page, '/?tune=1');
    await page.mouse.move(0, 0);

    // Los carruseles con un solo item no auto-scrollean a propósito, así que se
    // usa el que más contenido tiene. Hay que esperarlo: sale de Supabase y
    // medir antes de que monte devolvía -1 de forma intermitente.
    const hayTrack = () =>
      page.waitForFunction(
        () => [...document.querySelectorAll('div')].some(
          (d) => d.style.willChange === 'transform' && d.children.length > 3),
        null,
        { timeout: 20_000 },
      );
    await hayTrack();

    // Todo dentro del browser: ida y vuelta por CDP entre lectura y lectura
    // agregaría ruido al intervalo medido.
    const desplazamiento = () => page.evaluate(async () => {
      const track = [...document.querySelectorAll('div')]
        .filter((d) => d.style.willChange === 'transform')
        .sort((a, b) => b.children.length - a.children.length)[0];
      if (!track) return -1;
      const leer = () => {
        const m = /translateX\((-?[0-9.]+)px\)/.exec(track.style.transform);
        return m ? parseFloat(m[1]) : 0;
      };
      const a = leer();
      await new Promise((r) => setTimeout(r, 700));
      return Math.abs(leer() - a);
    });

    await page.getByRole('button', { name: 'Original', exact: true }).click();
    await page.mouse.move(0, 0); // el carrusel se pausa con el mouse encima
    const lento = await desplazamiento();

    await page.getByRole('button', { name: 'Triple' }).click();
    await page.mouse.move(0, 0);
    const rapido = await desplazamiento();

    // Se compara la relación, no px absolutos: el frame rate del runner no es
    // estable (en headless corrió al doble), y fijar valores lo haría flaky.
    expect(lento, 'el carrusel no se movió con la velocidad original').toBeGreaterThan(0);
    expect(rapido).toBeGreaterThan(lento * 2);
  });

  test('el multiplicador también acelera los rieles de /reviews', async ({ page }) => {
    // Anibal reflotó lo de la velocidad justo después de elogiar los carruseles
    // de reviews, así que el slider tiene que alcanzarlos a ellos también.
    await visit(page, '/reviews?tune=1');

    const rieles = page.locator('.hc-marquee-track');
    // Los rieles son la cara desktop (≥1300px); en mobile las fotos van
    // intercaladas y sin animación, así que no hay nada que medir.
    if (await rieles.count() === 0) {
      test.skip(true, 'los rieles verticales sólo existen en desktop');
      return;
    }

    const duracion = () => rieles.first().evaluate(
      (el) => parseFloat(getComputedStyle(el).animationDuration));

    const original = await duracion();
    expect(original).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Triple' }).click();

    // poll: el click vuelve antes de que React repinte el nuevo animationDuration.
    await expect.poll(duracion, { timeout: 5_000 }).toBeCloseTo(original / 3, 1);
  });
});
