// 住人を数日分動かして、実行時エラーがなく、生活の行動が一通り起きることを確かめる。
// 使い方: node scripts/sim.mjs [日数]
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const days = Number(process.argv[2] || 3);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message + '\n' + (e.stack || '').split('\n').slice(1, 4).join('\n')));
await page.addInitScript(() => {
  try { localStorage.clear(); } catch {}
  let seed = 4242;
  Math.random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  window.__HAKONIWA_TEST__ = {};
});
await page.goto(pathToFileURL(process.env.HTML || join(root, 'index.html')).href);
await page.waitForFunction(() => window.__HAKONIWA_TEST__ && window.__HAKONIWA_TEST__.api);
const seen = await page.evaluate((days) => {
  const api = window.__HAKONIWA_TEST__.api, seen = {};
  api.clock.speed = 8;
  const frames = Math.ceil((days * 300) / (8 / 30));
  for (let i = 0; i < frames; i++) {
    api.step(1, 1 / 30);
    for (const w of api.walkers) if (w.act && !w.link) seen[w.act.id] = (seen[w.act.id] || 0) + 1;
  }
  return seen;
}, days);
await browser.close();
const want = ['sleep', 'eat', 'cook', 'toilet', 'chat', 'school.study', 'school.teach', 'school.lunch', 'store.work'];
const missing = want.filter((k) => !seen[k]);
console.log('行動:', Object.keys(seen).sort().join(', '));
if (errors.length) console.error(errors.slice(0, 5).join('\n'));
if (missing.length) console.error('起きなかった行動:', missing.join(', '));
process.exit(errors.length || missing.length ? 1 : 0);
