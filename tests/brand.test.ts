import { describe, expect, it } from 'vitest';

import { DRAWINGS, drawingFor } from '@/data/drawings';
import { KANJI } from '@/data/kanji';
import { VOCAB_LESSONS } from '@/data/lessons';
import { pathLength } from '@/lib/path-length';

describe('pathLength', () => {
  it('measures lines, relative moves and closed shapes', () => {
    expect(pathLength('M0 0 L3 4')).toBeCloseTo(5);
    expect(pathLength('M0 0 l3 4 h-3 z')).toBeCloseTo(12);
    expect(pathLength('M0 0 H10 V10 H0 Z')).toBeCloseTo(40);
  });

  it('measures curves accurately', () => {
    // A quarter circle of radius 100 drawn as a cubic: length ≈ 157.08.
    expect(pathLength('M100 0 C100 55.23 55.23 100 0 100')).toBeCloseTo(157.08, 0);
    // A straight quadratic is just its chord.
    expect(pathLength('M0 0 Q5 0 10 0')).toBeCloseTo(10);
  });

  it('only draws kanji and words the app shows, each line long enough to animate', () => {
    const shown = new Set<string>([
      ...KANJI.map((k) => k.char),
      ...VOCAB_LESSONS.flatMap((l) => l.words.flatMap((w) => [w.jp, w.kanji ?? w.jp])),
    ]);
    for (const [key, d] of Object.entries(DRAWINGS)) {
      expect(shown.has(key), `${key} is not a kanji or word in the app`).toBe(true);
      for (const p of d.paths) expect(pathLength(p.d), `${key}: ${p.d}`).toBeGreaterThan(1);
    }
  });

  it('finds drawings by kanji spelling first, then kana', () => {
    expect(drawingFor('猫', 'ねこ')).toBe(DRAWINGS['猫']);
    expect(drawingFor(undefined, 'りんご')).toBe(DRAWINGS['りんご']);
    expect(drawingFor('食べます', 'たべます')).toBeUndefined();
  });
});
