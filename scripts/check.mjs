// 公開前の静的チェック。問題があれば終了コード 1。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
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
  // 例外は Claude API のみ（利用者が自分のキーを入れた時だけ呼ぶ）
  [/https?:\/\/(?!www\.w3\.org\/|api\.anthropic\.com\/)/i, '外部 URL を含めないでください'],
];
for (const [re, msg] of banned) {
  const m = expected.match(re);
  if (m) errors.push(`${msg}: "${m[0]}"`);
}

// 2. 秘密情報（API キーなど）がリポジトリにないか。現在のファイルと全履歴を調べる
const SECRET = /sk-ant-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
try {
  for (const file of git('ls-files').split('\n').filter(Boolean)) {
    let text;
    try { text = readFileSync(join(root, file), 'utf8'); } catch { continue; }
    const m = text.match(SECRET);
    if (m) errors.push(`${file}: 秘密情報らしき文字列があります (${m[0].slice(0, 12)}…)`);
  }
  const m = git('log', '--all', '-p', '--no-color').match(SECRET);
  if (m) errors.push(`git 履歴に秘密情報らしき文字列があります (${m[0].slice(0, 12)}…)。履歴の書き換えとキーの無効化が必要です`);
} catch (e) {
  errors.push(`秘密情報の検査に失敗しました: ${e.message}`);
}

// 3. JS 構文
try {
  new vm.Script(scriptOf(expected), { filename: 'index.html <script>' });
} catch (e) {
  errors.push(`JS 構文エラー: ${e.message}`);
}

// 4. index.html が src/ からの生成結果と一致するか
if (built !== expected) errors.push('index.html が src/ と一致しません。npm run build を実行してください');

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('チェック OK');
