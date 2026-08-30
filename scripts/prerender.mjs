import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const ROUTES = ['/', '/portfolio', '/reviews', '/faq'];
const PORT = 4173;

// Las fotos de obra viven en Supabase Storage y son pesadas: en /portfolio hay
// decenas y siguen bajando mucho despues de que React ya pinto todo. Esperar a
// `networkidle0` significaba esperar a ESAS imagenes y el prerender moria por
// timeout. Para el HTML de SEO las imagenes no aportan nada: lo que si tiene que
// estar listo son los fetch de datos, asi que contamos solo los pedidos que no
// son imagen/video/fuente.
const IGNORED_RESOURCES = new Set(['image', 'media', 'font']);

function trackDataRequests(page) {
  let inflight = 0;
  page.on('request', (r) => {
    if (!IGNORED_RESOURCES.has(r.resourceType())) inflight++;
  });
  const settle = (r) => {
    if (!IGNORED_RESOURCES.has(r.resourceType())) inflight--;
  };
  page.on('requestfinished', settle);
  page.on('requestfailed', settle);
  return () => inflight;
}

async function waitForDataIdle(inflight, { idleMs = 500, timeout = 15000 } = {}) {
  const start = Date.now();
  let idleSince = null;
  while (Date.now() - start < timeout) {
    if (inflight() <= 0) {
      idleSince ??= Date.now();
      if (Date.now() - idleSince >= idleMs) return;
    } else {
      idleSince = null;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn(`  ! datos sin estabilizar tras ${timeout}ms, sigo igual`);
}

async function prerender() {
  console.log('Starting pre-render...');

  // Start preview server
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: root,
    stdio: 'pipe',
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Local')) resolve();
    });
    setTimeout(resolve, 3000);
  });

  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ headless: true });

    for (const route of ROUTES) {
      console.log(`  Pre-rendering ${route}...`);
      const page = await browser.newPage();
      const inflight = trackDataRequests(page);
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for React to render content
      await page.waitForSelector('main', { timeout: 10000 });
      await waitForDataIdle(inflight);

      const html = await page.content();

      // Write to dist
      const filePath = route === '/'
        ? join(dist, 'index.html')
        : join(dist, route.slice(1), 'index.html');

      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, html);
      console.log(`  ✓ ${filePath}`);

      await page.close();
    }

    await browser.close();
    console.log(`\nPre-rendered ${ROUTES.length} routes successfully.`);
  } finally {
    server.kill();
  }
}

prerender().catch((err) => {
  console.error('Pre-render failed:', err);
  process.exit(1);
});
