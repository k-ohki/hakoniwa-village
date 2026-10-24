// ヘッドレス Chromium で index.html を開いて確認する。
// 1. 実行時エラーがなく、キー未設定なら外部通信がなく、描画されること
// 2. API キーを入れると Claude API へ正しく送り、返答が村に反映されること（API はモック）
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.anthropic.com/v1/messages';
const FAKE_KEY = 'test-key-not-real';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
const problems = [];
const apiCalls = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
page.on('request', (r) => {
  const url = r.url();
  if (url === API) apiCalls.push(r);
  else if (!url.startsWith('file:') && !url.startsWith('data:')) problems.push(`外部リクエスト: ${url}`);
});
await page.route(API, (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"narration_en":"Mock reply","narration_ja":"モックの返事"}' }] }),
  }),
);

await page.goto(pathToFileURL(join(root, 'index.html')).href);
await page.waitForTimeout(3000);
const painted = await page.evaluate(() => {
  const c = document.getElementById('scene');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  for (let i = 3; i < d.length; i += 4000) if (d[i]) return true;
  return false;
});
if (!painted) problems.push('キャンバスに描画されていません');
if (apiCalls.length) problems.push('キー未設定なのに Claude API を呼びました');

// API キーを設定して神の声を送る
await page.click('#townBtn');
if (await page.isHidden('#apiBox')) problems.push('API キー欄が表示されていません');
await page.fill('#apiKey', FAKE_KEY);
await page.click('#apiSave');
if ((await page.inputValue('#apiKey')) !== '') problems.push('保存後も入力欄にキーが残っています');
await page.click('#townClose');
await page.fill('#godInput', 'みんなで踊ろう');
await page.click('#godSend');
await page.waitForTimeout(1000);
if (apiCalls.length !== 1) problems.push(`Claude API の呼び出し回数が想定外です (${apiCalls.length})`);
else {
  const h = apiCalls[0].headers();
  if (h['x-api-key'] !== FAKE_KEY) problems.push('x-api-key が送られていません');
  if (!h['anthropic-version']) problems.push('anthropic-version がありません');
  if (!JSON.parse(apiCalls[0].postData()).model) problems.push('model がありません');
}
const logText = await page.evaluate(() => document.body.innerText);
// 一人称モード（WebGL）に入って少し歩き、戻る
await page.click('#roster button');
await page.click('#cPlay');
await page.waitForTimeout(300);
await page.keyboard.down('w');
await page.waitForTimeout(600);
await page.keyboard.up('w');
if (await page.isHidden('#fpv')) problems.push('一人称モードに入れません');
await page.click('#fpvExit');
if (!logText.includes('モックの返事') && !logText.includes('Mock reply')) problems.push('API の返答が村に反映されていません');

await browser.close();
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('スモークテスト OK');
