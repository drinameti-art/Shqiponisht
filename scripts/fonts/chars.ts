/// <reference types="node" />
// Prints every Japanese character the app's content uses (for subsetting Noto Sans JP).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', 'src');
const files: string[] = [];
const walk = (d: string) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx|json)$/.test(e.name) && !e.name.endsWith('.generated.ts') && e.name !== 'strokes.json') files.push(p);
  }
};
walk(root);
const set = new Set<string>();
// All hiragana, katakana and Japanese punctuation, plus every CJK character found in the sources.
for (let c = 0x3000; c <= 0x30ff; c++) set.add(String.fromCodePoint(c));
for (let c = 0xff01; c <= 0xff5e; c++) set.add(String.fromCodePoint(c));
for (const f of files) {
  for (const ch of readFileSync(f, 'utf8')) {
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) set.add(ch);
  }
}
process.stdout.write([...set].join(''));
