// ヘッドレス Chromium で index.html を開き、実行時エラーと外部リクエストがないことを確認する。
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) problems.push(`外部リクエスト: ${r.url()}`); });
await page.goto(pathToFileURL(join(root, 'index.html')).href);
await page.waitForTimeout(3000);
const painted = await page.evaluate(() => { const c = document.getElementById('scene'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4000) n += d[i] ? 1 : 0; return n > 0; });
if (!painted) problems.push('キャンバスに描画されていません');
await browser.close();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('スモークテスト OK');
