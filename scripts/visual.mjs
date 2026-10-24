// 見た目の回帰チェック用に、決まった視点のスクリーンショットを撮る。
// 使い方: node scripts/visual.mjs <html> <出力ディレクトリ> [比較先ディレクトリ]
// 比較先を渡すと画素の差分率を表示し、しきい値を超えたら終了コード 1。
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const [html, outDir, baseDir] = process.argv.slice(2);
if (!html || !outDir) {
  console.error('usage: node scripts/visual.mjs <html> <outDir> [baseDir]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const AZ = Math.PI / 4;
const VIEWS = [
  ...[0, 1, 2, 3].map((k) => ({ name: `in-${k}`, interior: true, az: AZ + (k * Math.PI) / 2 })),
  ...[0, 2].map((k) => ({ name: `out-${k}`, interior: false, az: AZ + (k * Math.PI) / 2 })),
  { name: 'in-3.5', interior: true, az: 3.5 },
  { name: 'in-zoom', interior: true, az: AZ, zoom: 2.2 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => {
  let seed = 12345;
  Math.random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  let t = 0;
  performance.now = () => (t += 16);
  try { localStorage.clear(); } catch {}
  window.__HAKONIWA_TEST__ = { freeze: true };
});
await page.goto(pathToFileURL(resolve(html)).href);
await page.waitForFunction(() => window.__HAKONIWA_TEST__ && window.__HAKONIWA_TEST__.api);
const shots = {};
for (const v of VIEWS) {
  await page.evaluate((v) => {
    const api = window.__HAKONIWA_TEST__.api;
    api.setView({ interior: v.interior, az: v.az, el: Math.asin(1 / Math.sqrt(3)), zoom: v.zoom || 1 });
    api.step(90, 1 / 60);
  }, v);
  const file = join(outDir, `${v.name}.png`);
  await page.locator('#scene').screenshot({ path: file });
  shots[v.name] = file;
}

let failed = false;
if (baseDir) {
  for (const v of VIEWS) {
    const a = join(baseDir, `${v.name}.png`);
    if (!existsSync(a)) continue;
    const diff = await page.evaluate(
      async ([x, y]) => {
        const load = (b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64; });
        const [ia, ib] = await Promise.all([load(x), load(y)]);
        const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
        const g = c.getContext('2d');
        g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
        g.clearRect(0, 0, c.width, c.height); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 48) n++;
        return n / (da.length / 4);
      },
      [readFileSync(a).toString('base64'), readFileSync(shots[v.name]).toString('base64')],
    );
    const pct = (diff * 100).toFixed(2);
    console.log(`${v.name}: ${pct}% の画素が違います`);
    if (diff > 0.01) failed = true;
  }
}
await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
process.exit(failed ? 1 : 0);
