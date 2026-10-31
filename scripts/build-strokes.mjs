#!/usr/bin/env node
/**
 * Builds src/data/strokes.json from KanjiVG (https://kanjivg.tagaini.net),
 * © Ulrich Apel, licensed CC BY-SA 3.0.
 *
 * For every kana and kanji the app teaches it stores, in stroke order:
 *   d      the SVG path of the stroke (109×109 viewBox)
 *   start  the point where the brush goes down
 *   end    the point where the brush lifts
 *   label  where KanjiVG places the stroke number
 *   len    approximate path length, for the drawing animation
 *
 * Usage: node scripts/build-strokes.mjs   (needs curl and network access)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const chars = new Set();
for (const m of read('src/data/kana.ts').matchAll(/\['(.)', '(.)', '[a-z]+'\]/g)) {
  chars.add(m[1]);
  chars.add(m[2]);
}
for (const m of read('src/data/kanji.ts').matchAll(/^\s*\['(.)', '/gm)) chars.add(m[1]);

/**
 * Follows an SVG path (M, C, S, L in absolute or relative form) and returns
 * its first and last points and its approximate length (curves sampled).
 */
function measure(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let start = null;
  let length = 0;
  let lastCtrl = null; // second control point of the previous cubic, for S
  const num = () => parseFloat(tokens[i++]);
  const arity = { m: 2, l: 2, c: 6, s: 4 };
  const cubicLength = (p0, p1, p2, p3) => {
    let len = 0;
    let prev = p0;
    for (let k = 1; k <= 16; k++) {
      const t = k / 16;
      const u = 1 - t;
      const pt = [0, 1].map(
        (j) => u * u * u * p0[j] + 3 * u * u * t * p1[j] + 3 * u * t * t * p2[j] + t * t * t * p3[j],
      );
      len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
      prev = pt;
    }
    return len;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const lower = cmd.toLowerCase();
    const n = arity[lower];
    if (!n) throw new Error(`Unsupported path command ${cmd} in ${d}`);
    const a = Array.from({ length: n }, num);
    const rel = cmd === lower;
    const abs = (px, py) => (rel ? [x + px, y + py] : [px, py]);
    const p0 = [x, y];
    if (lower === 'm') {
      [x, y] = abs(a[0], a[1]);
      start ??= [x, y];
      lastCtrl = null;
      cmd = rel ? 'l' : 'L';
      continue;
    }
    if (lower === 'l') {
      const p1 = abs(a[0], a[1]);
      length += Math.hypot(p1[0] - x, p1[1] - y);
      [x, y] = p1;
      lastCtrl = null;
      continue;
    }
    let c1;
    let c2;
    let p3;
    if (lower === 'c') {
      c1 = abs(a[0], a[1]);
      c2 = abs(a[2], a[3]);
      p3 = abs(a[4], a[5]);
    } else {
      c1 = lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y];
      c2 = abs(a[0], a[1]);
      p3 = abs(a[2], a[3]);
    }
    length += cubicLength(p0, c1, c2, p3);
    lastCtrl = c2;
    [x, y] = p3;
  }
  return { start, end: [x, y], length };
}

const round = (p) => p.map((v) => Math.round(v * 10) / 10);
const out = {};

for (const ch of [...chars].sort()) {
  const hex = ch.codePointAt(0).toString(16).padStart(5, '0');
  const svg = execFileSync('curl', ['-sSf', `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`], {
    encoding: 'utf8',
  });
  const paths = [...svg.matchAll(/<path id="kvg:[^"]*-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .map((m) => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n);
  const labels = [...svg.matchAll(/<text transform="matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)">(\d+)<\/text>/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
  if (paths.length === 0) throw new Error(`No strokes for ${ch}`);
  out[ch] = paths.map(({ d }, i) => {
    const { start, end, length } = measure(d);
    return { d, start: round(start), end: round(end), label: labels[i] ?? round(start), len: Math.ceil(length) };
  });
  process.stdout.write(`${ch}${paths.length} `);
}

writeFileSync(join(root, 'src/data/strokes.json'), JSON.stringify(out) + '\n');
console.log(`\nWrote ${Object.keys(out).length} characters to src/data/strokes.json`);
