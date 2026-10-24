// src/ を単一の HTML 文字列にまとめる（build と check で共用）。
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => join(root, 'src', p);
const read = (p) => readFileSync(src(p), 'utf8').replace(/\n$/, '');

// `/*@inline styles.css*/` はファイル、`/*@inline js/*/` はディレクトリ内の .js を名前順に連結する。
export function bundle() {
  return readFileSync(src('index.template.html'), 'utf8').replace(/\/\*@inline ([\w./-]+)\*\//g, (_, name) =>
    name.endsWith('/')
      ? readdirSync(src(name)).filter((f) => f.endsWith('.js')).sort().map((f) => read(name + f)).join('\n')
      : read(name),
  );
}

// 生成 HTML から <script> の中身を取り出す。
export const scriptOf = (html) => html.match(/<script>\n([\s\S]*?)<\/script>/)[1];
