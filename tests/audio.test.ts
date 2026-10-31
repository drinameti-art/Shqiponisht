/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/data/lessons';
import { makeClipLookup } from '@/lib/clips';
import { buildQuiz, seededRng } from '@/lib/quiz';
import { allSayables } from '@/lib/sayables';

const root = fileURLToPath(new URL('..', import.meta.url));
// Read the generated manifest as text: it uses require() for the mp3 assets, which only the app bundler resolves.
const manifest = readFileSync(join(root, 'src/data/audio.generated.ts'), 'utf8');
const clips: Record<string, string> = Object.fromEntries(
  [...manifest.matchAll(/^ {2}("(?:[^"\\]|\\.)*"): require\('\.\.\/\.\.\/assets\/audio\/([^']+)'\),$/gm)].map((m) => [
    JSON.parse(m[1]) as string,
    m[2],
  ]),
);

describe('bundled pronunciation audio', () => {
  it('has a recording for everything the app can say, and every file exists', () => {
    const missing = allSayables().filter((s) => !(s.text in clips));
    expect(missing.map((s) => s.text)).toEqual([]);
    for (const file of Object.values(clips)) expect(existsSync(join(root, 'assets/audio', file)), file).toBe(true);
  });

  it('finds a recording for every quiz question, including katakana and kana readings', () => {
    const find = makeClipLookup(clips);
    for (const lesson of LESSONS) {
      for (const q of buildQuiz(lesson, seededRng(5), 200))
        expect(find(q.speak), `${lesson.id}: ${q.speak}`).toBeDefined();
    }
    expect(find('ア')).toBe(find('あ'));
    expect(find('みず')).toBe(find('水'));
  });

  it('credits each clip to a source', () => {
    const sources = JSON.parse(readFileSync(join(root, 'scripts/audio/sources.json'), 'utf8')) as { source: string }[];
    expect(sources).toHaveLength(Object.keys(clips).length);
    expect(new Set(sources.map((s) => s.source.split(' ')[0]))).toEqual(new Set(['tofugu', 'voicevox']));
  });
});
