import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const ROUTES = ['/', '/portfolio', '/reviews', '/faq'];
const PORT = 4173;

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
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });

      // Wait for React to render content
      await page.waitForSelector('main', { timeout: 10000 });

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
