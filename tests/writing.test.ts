import { describe, expect, it } from 'vitest';

import { gradeStroke, pointsToPath, strokesFor, type Point } from '@/lib/writing';

/** A straight line from a to b, sampled like a finger drag. */
function line(a: Point, b: Point, steps = 10): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => [
    a[0] + ((b[0] - a[0]) * i) / steps,
    a[1] + ((b[1] - a[1]) * i) / steps,
  ]);
}

describe('gradeStroke', () => {
  const [first] = strokesFor('一');

  it('accepts a stroke drawn from the right start to the right end', () => {
    expect(gradeStroke(line(first.start, first.end), first)).toBe('ok');
  });

  it('tolerates a slightly imprecise finger', () => {
    const s: Point = [first.start[0] + 8, first.start[1] - 6];
    const e: Point = [first.end[0] - 7, first.end[1] + 9];
    expect(gradeStroke(line(s, e), first)).toBe('ok');
  });

  it('spots a stroke drawn backwards', () => {
    expect(gradeStroke(line(first.end, first.start), first)).toBe('reversed');
  });

  it('rejects a stroke in the wrong place', () => {
    expect(gradeStroke(line([10, 100], [100, 100]), first)).toBe('off');
    expect(gradeStroke([], first)).toBe('off');
  });

  it('teaches the real stroke order: 十 is horizontal first, then vertical', () => {
    const [h, v] = strokesFor('十');
    expect(Math.abs(h.end[0] - h.start[0])).toBeGreaterThan(Math.abs(h.end[1] - h.start[1]));
    expect(Math.abs(v.end[1] - v.start[1])).toBeGreaterThan(Math.abs(v.end[0] - v.start[0]));
  });
});

describe('pointsToPath', () => {
  it('draws a dot for a single tap and a polyline otherwise', () => {
    expect(pointsToPath([[5, 5]])).toBe('M5,5 l0.1,0.1');
    expect(
      pointsToPath([
        [0, 0],
        [1, 2],
      ]),
    ).toBe('M0,0 L1,2');
  });
});
