import { describe, expect, it } from 'vitest';

import { DRAWINGS } from '@/data/drawings';
import { pathLength } from '@/lib/path-length';
import { hasStrokes } from '@/lib/writing';

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

  it('gives every drawing a usable length for each line', () => {
    for (const [char, d] of Object.entries(DRAWINGS)) {
      expect(hasStrokes(char)).toBe(true);
      for (const p of d.paths) expect(pathLength(p.d), `${char}: ${p.d}`).toBeGreaterThan(5);
    }
  });
});
