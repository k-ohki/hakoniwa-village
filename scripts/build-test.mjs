// 神の声の建物（設計図）まわりのテスト: 検査・配置・中を歩けるか・2階建て・撤去・おかしな入力。
// 使い方: node scripts/build-test.mjs [スクリーンショットの保存先]
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shotDir = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message + '\n' + (e.stack || '').split('\n').slice(1, 4).join('\n')));
// 以前の形式（v1）で保存された神の声の建物も読めること
const LEGACY = [{ id: 'b1', x: 3, y: 9, spec: { name_en: 'fountain', name_ja: '噴水', footprint: [2, 2], walkable: false, near: 'plaza',
  parts: [{ shape: 'cylinder', lo: [0.1, 0.1, 0], hi: [1.9, 1.9, 0.3], color: [182, 164, 214], top: [136, 194, 226], pattern: 'bricks', topPattern: 'water' }],
  activity: { label_en: 'resting by the fountain', label_ja: '噴水のそばで休憩', use_en: 'Rest', use_ja: '休む', phrase_en: '', phrase_ja: '', gain: { fun: 0.3 } } } }];
await page.addInitScript((legacy) => {
  try { localStorage.clear(); localStorage.setItem('hakoniwa-builds', JSON.stringify(legacy)); } catch {}
  window.__HAKONIWA_TEST__ = { freeze: true };
}, LEGACY);
await page.goto(pathToFileURL(process.env.HTML || join(root, 'index.html')).href);
await page.waitForFunction(() => window.__HAKONIWA_TEST__ && window.__HAKONIWA_TEST__.api);

const LIBRARY = {
  name_en: 'library', name_ja: '図書館', enterable: true, floors: 2, footprint: [3, 3], near: 'east',
  style: { wall: '#e2e2ce', roof: '#78aab4', roofShape: 'flat' }, door: { side: 'py', at: 2 },
  rooms: [{ name_en: 'reading room', name_ja: '閲覧室', floor: 1, from: [0, 0], to: [2, 2], floorStyle: 'carpet', color: '#d8c8e8' }],
  partitions: [{ floor: 0, x: 2, y: [0, 1] }],
  stairs: [{ at: [0, 2], dir: 'px', floor: 0 }],
  furniture: [
    { type: 'shelf', at: [0, 0], face: 'py' }, { type: 'counter', at: [2, 0], face: 'py' },
    { type: 'shelf', at: [0, 0], floor: 1, face: 'py', use: 'read' }, { type: 'shelf', at: [1, 0], floor: 1, face: 'py', use: 'read' },
    { type: 'desk', at: [2, 2], floor: 1, face: 'ny', use: 'read' }, { type: 'nonsense', at: [2, 1] },
  ],
  activities: [{ key: 'read', label_en: 'reading at the library', label_ja: '図書館で本を読む', gain: { fun: 0.3, energy: 0.1 }, hours: [9, 18] }],
};

const result = await page.evaluate((LIBRARY) => {
  const api = window.__HAKONIWA_TEST__.api, out = { problems: [] };
  const bad = (m) => out.problems.push(m);
  // 1. おかしな入力でも落ちない
  for (const x of [null, 'x', 1, [], {}, { parts: 'x' }, { enterable: true, footprint: [999, -3], floors: 99, furniture: [{ type: 'bed', at: ['a'] }] }, { parts: [{ from: [0, 0, 0], to: [1e9, NaN, 1] }] }]) {
    try { api.sanitizeSpec(x); } catch (e) { bad('sanitizeSpec が例外: ' + e.message); }
  }
  const old = api.buildings.find((b) => b.id === 'b1');
  if (!old) bad('以前の形式の建物が読み込まれていません');
  else if (!(api.SPOTS['g_b1'] || []).length) bad('以前の形式の建物の行動場所がありません');
  const big = api.sanitizeSpec({ enterable: true, footprint: [999, -3], floors: 99 });
  if (!big || big.footprint[0] > 12 || big.floors > 3) bad('大きすぎる設計図が制限されていません');
  // 2. 2階建ての図書館
  const spec = api.sanitizeSpec(LIBRARY);
  if (!spec) { bad('図書館の設計図が無効になりました'); return out; }
  if (spec.furniture.some((f) => f.type === 'nonsense')) bad('不明な家具が残っています');
  const pos = api.findSpot(spec);
  if (!pos) { bad('図書館を置く場所が見つかりません'); return out; }
  const n0 = api.tiles.length;
  const b = api.placeBuilding(spec, pos, null, false);
  out.library = { at: [pos.x, pos.y], floors: b.floors, tiles: b.tiles.length };
  const readId = b.acts[0];
  const spots = api.SPOTS[readId] || [];
  if (spots.length !== 3) bad(`読書の場所が3つではありません (${spots.length})`);
  if (!spots.every((t) => t.level === 1)) bad('読書の場所が2階にありません');
  const outside = api.tiles.find((t) => t.pos[0] === b.door[1][0] && t.pos[1] === b.door[1][1] && !t.bld);
  if (!outside) bad('入口の前に地面がありません');
  else for (const t of spots) if (!api.bfs(outside, t)) bad(`2階の読書の場所 (${t.pos}) に入口から行けません`);
  // 住人が実際に2階へ行って読書する
  const w = api.walkers.find((x) => x.kind === 'person');
  w.tile = outside; w.link = null; w.path = []; w.act = null; w.wait = 0; w.forced = null;
  if (!api.setPlan(w, { goal: { id: readId, dur: [0.5, 0.6] }, target: spots[0] })) bad('読書への道を作れません');
  else out.pathLen = w.path.length;
  // 3. 撤去すると地面に戻る
  out.cleanup = () => {};
  return out;
}, LIBRARY);

if (shotDir) {
  mkdirSync(shotDir, { recursive: true });
  for (const [name, view] of [['lib-1f', { interior: true, floor: 0 }], ['lib-2f', { interior: true, floor: 1 }], ['lib-out', { interior: false }]]) {
    await page.evaluate((v) => { const api = window.__HAKONIWA_TEST__.api; api.setView({ ...v, az: Math.PI / 4, el: Math.asin(1 / Math.sqrt(3)), zoom: 1.6 }); api.cam.follow = api.buildings[api.buildings.length - 1].tiles[0] && null; api.step(60, 1 / 60); }, view);
    await page.locator('#scene').screenshot({ path: join(shotDir, `${name}.png`) });
  }
}

// 住人を動かして2階で読書できるか
const walked = await page.evaluate(() => {
  const api = window.__HAKONIWA_TEST__.api;
  window.__HAKONIWA_TEST__.freeze = false;
  api.clock.speed = 1;
  const b = api.buildings[api.buildings.length - 1], id = b.acts[0];
  const w = api.walkers.find((x) => x.kind === 'person');
  for (let i = 0; i < 1500 && !(w.act && w.act.id === id); i++) api.step(1, 1 / 30);
  const reached = !!(w.act && w.act.id === id && w.tile.level === 1);
  window.__HAKONIWA_TEST__.freeze = true;
  const n = api.tiles.length;
  const removed = api.removeBuilding(b.id);
  const back = removed && b.cells.every(([x, y]) => api.tiles.some((t) => t.pos[0] === x && t.pos[1] === y && t.tag === 'ground'));
  return { reached, removed: !!removed, back, gone: !api.ACTS[id] };
});
await browser.close();
const problems = result.problems.slice();
if (!walked.reached) problems.push('住人が2階で読書を始めませんでした');
if (!walked.removed || !walked.back) problems.push('撤去後に地面へ戻りません');
if (!walked.gone) problems.push('撤去後も行動が残っています');
console.log('図書館:', JSON.stringify(result.library), '経路の長さ:', result.pathLen);
if (errors.length) problems.push(...errors.slice(0, 5));
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('建物テスト OK');
