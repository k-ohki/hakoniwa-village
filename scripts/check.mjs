// 公開前の静的チェック。問題があれば終了コード 1。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { bundle, root, scriptOf } from './bundle.mjs';

const errors = [];
const built = readFileSync(join(root, 'index.html'), 'utf8');
const expected = bundle();

// 1. 外部リソース禁止。Google Fonts は絶対禁止（フォントはシステムフォントのみ）
const banned = [
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, 'Google Fonts は禁止です'],
  [/@font-face|@import/i, 'Web フォント・外部 CSS は禁止です'],
  [/<link\b/i, '<link> は禁止です（CSS はインライン）'],
  [/<script[^>]*\ssrc=/i, '外部スクリプトは禁止です'],
  [/https?:\/\/(?!www\.w3\.org\/)/i, '外部 URL を含めないでください'],
];
for (const [re, msg] of banned) {
  const m = expected.match(re);
  if (m) errors.push(`${msg}: "${m[0]}"`);
}

// 2. JS 構文
try {
  new vm.Script(scriptOf(expected), { filename: 'index.html <script>' });
} catch (e) {
  errors.push(`JS 構文エラー: ${e.message}`);
}

// 3. index.html が src/ からの生成結果と一致するか
if (built !== expected) errors.push('index.html が src/ と一致しません。npm run build を実行してください');

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('チェック OK');
