// 場面の会話のテスト: 定番の会話の再生、相手がいない時の表示、Claude での生成（モデル・キャッシュ・毎回違うプロンプト）、保存と使い回し。
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.anthropic.com/v1/messages';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
const problems = [];
const bad = (m) => problems.push(m);
page.on('pageerror', (e) => bad('pageerror: ' + e.message));
const calls = [];
let n = 0;
await page.route(API, (route) => {
  const body = JSON.parse(route.request().postData());
  calls.push({ body, headers: route.request().headers() });
  n++;
  const text = body.model.includes('haiku')
    ? JSON.stringify({ lines: [{ who: 0, en: `Hello, may I help you? (${n})`, ja: 'いらっしゃいませ。' }, { who: 1, en: 'Yes, where is the bread?', ja: 'はい、パンはどこですか？' }, { who: 0, en: 'It is by the door.', ja: '入口のそばです。' }, { who: 1, en: 'Thank you!', ja: 'ありがとう！' }], key: { en: 'Where is ...?', ja: '場所をたずねる' } })
    : JSON.stringify({ name_en: 'tower', name_ja: '塔', footprint: [2, 2], near: 'vacant', parts: [{ shape: 'box', from: [0, 0, 0], to: [2, 2, 2], color: '#f6d6be' }] });
  route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ stop_reason: 'end_turn', content: [{ type: 'text', text }] }) });
});
await page.addInitScript(() => {
  try { localStorage.clear(); } catch {}
  window.__HAKONIWA_TEST__ = { freeze: true };
});
await page.goto(pathToFileURL(join(root, 'index.html')).href);
await page.waitForFunction(() => window.__HAKONIWA_TEST__ && window.__HAKONIWA_TEST__.api);

// 店員がレジにいる時・いない時の会話（オフライン）
const offline = await page.evaluate(async () => {
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const a = window.__HAKONIWA_TEST__.api, out = {};
  const store = a.buildings.find((b) => b.id === 'store');
  const people = a.walkers.filter((w) => w.kind === 'person');
  const cust = people.find((w) => w.name === 'ハナ'), clerk = people.find((w) => w.name === 'マコト');
  const spot = a.SPOTS['store.buy_food'][0], work = a.SPOTS['store.work'][0];
  Object.assign(cust, { tile: spot, link: null, path: [], act: { id: 'store.buy_food' }, wait: 99 });
  Object.assign(clerk, { tile: work, link: null, path: [], act: { id: 'store.work' }, wait: 99 });
  a.cam.follow = cust;
  out.started = a.maybeDialog(cust, 'store.buy_food', { force: true });
  out.partner = a.dlg.cur && a.dlg.cur.c.sp[0] && a.dlg.cur.c.sp[0].name;
  await tick();
  const said = new Set();
  for (let i = 0; i < 60 * 30; i++) { a.step(1, 1 / 30); for (const w of [cust, clerk]) if (w.say && w.say.until > a.S.time) said.add(w.name); if (!a.dlg.cur) break; }
  out.said = [...said];
  out.lines = document.querySelectorAll('#dList li').length;
  out.key = !document.getElementById('dKey').hidden;
  out.card = !document.getElementById('dlg').hidden;
  // 店員がいない時: 役名つきで客の吹き出しに出る
  clerk.act = null; a.dlg.lastEnd = -99;
  a.maybeDialog(cust, 'store.buy_food', { force: true });
  await tick();
  out.noPartner = a.dlg.cur && a.dlg.cur.c.sp[0] === null;
  let tagged = false;
  for (let i = 0; i < 30 * 30 && a.dlg.cur; i++) { a.step(1, 1 / 30); if (cust.say && /^(Clerk:|店員：)/.test(cust.say.ja || '') ) tagged = true; if (cust.say && /^(Clerk:|店員：)/.test(cust.say.en || '')) tagged = true; }
  out.tagged = tagged;
  return out;
});
if (!offline.started) bad('会話が始まりません');
if (offline.partner !== 'マコト') bad(`レジの店員が相手になっていません (${offline.partner})`);
if (!offline.said.includes('マコト') || !offline.said.includes('ハナ')) bad(`二人とも話していません (${offline.said})`);
if (offline.lines < 4) bad(`カードの行が少なすぎます (${offline.lines})`);
if (!offline.key) bad('覚えたい表現が出ていません');
if (!offline.noPartner || !offline.tagged) bad('店員がいない時に役名つきで表示されていません');
if (calls.length) bad('API キーが無いのに Claude を呼びました');

// API キーを入れて、Claude で会話を作る（Haiku）。2回目は違うプロンプトになる
await page.evaluate(() => { localStorage.setItem('hakoniwa-api-key', 'test-key-not-real'); });
await page.click('#townBtn');
await page.fill('#apiKey', 'test-key-not-real');
await page.click('#apiSave');
await page.click('#townClose');
const gen = await page.evaluate(async () => {
  const a = window.__HAKONIWA_TEST__.api;
  const cust = a.walkers.find((w) => w.name === 'ハナ');
  const run = async () => { a.dlg.lastEnd = -99; a.dlg.genLast = -99; a.dlg.cur = null; a.maybeDialog(cust, 'store.buy_food', { force: true }); for (let i = 0; i < 100 && a.dlg.cur && a.dlg.cur.pending; i++) await new Promise((r) => setTimeout(r, 20)); const first = a.dlg.cur && a.dlg.cur.lines && a.dlg.cur.lines[0][1]; a.dlg.cur = null; return first; };
  const f1 = await run(), f2 = await run();
  const saved = JSON.parse(localStorage.getItem('hakoniwa-dialogs') || '{}');
  return { f1, f2, saved: (saved['store.buy_food'] || []).length };
});
const haiku = calls.filter((c) => c.body.model === 'claude-haiku-5-5');
if (haiku.length !== 2) bad(`会話の生成が Haiku で2回呼ばれていません (${calls.map((c) => c.body.model)})`);
else {
  const [a, b] = haiku;
  if (!a.body.system[0].cache_control) bad('会話の固定の指示がキャッシュ指定されていません');
  if (a.body.system[0].text !== b.body.system[0].text) bad('固定の指示が毎回同じではありません（キャッシュが効かない）');
  if (a.body.messages[0].content === b.body.messages[0].content) bad('2回の会話生成のプロンプトが同じです');
  if (!b.body.messages[0].content.includes('Hello, may I help you? (1)')) bad('使用済みの出だしがプロンプトに入っていません');
  if (a.body.fallbacks) bad('Haiku に fallbacks を付けています');
}
if (!gen.f1 || !gen.f1.startsWith('Hello') || gen.saved !== 2) bad(`生成した会話が使われていない・保存されていません (${JSON.stringify(gen)})`);

// 建物の設計は Sonnet
await page.evaluate(() => window.__HAKONIWA_TEST__.api.buildFromVoice('a tower', '塔を建てて'));
await page.waitForTimeout(300);
const build = calls.find((c) => c.body.model === 'claude-sonnet-5-5');
if (!build) bad(`建物の設計が Sonnet で呼ばれていません (${calls.map((c) => c.body.model)})`);

await browser.close();
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('会話テスト OK', JSON.stringify({ partner: offline.partner, lines: offline.lines, calls: calls.map((c) => c.body.model) }));
