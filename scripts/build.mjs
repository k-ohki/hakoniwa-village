// src/ から index.html を生成する。
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bundle, root } from './bundle.mjs';

const html = bundle();
writeFileSync(join(root, 'index.html'), html);
console.log(`index.html を生成しました (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
