import STROKES from '@/data/strokes.json';

export type Point = [x: number, y: number];

/** One stroke from KanjiVG, in a 109×109 coordinate box. */
export type Stroke = { d: string; start: Point; end: Point; label: Point; len: number };

export const BOX = 109;

const DATA = STROKES as unknown as Record<string, Stroke[]>;

export function strokesFor(char: string): Stroke[] {
  return DATA[char] ?? [];
}

export function hasStrokes(char: string): boolean {
  return char in DATA;
}

/** How close (in the 109-unit box) a drawn stroke's ends must be to the model's. */
export const TOLERANCE = 24;

export type StrokeGrade = 'ok' | 'reversed' | 'off';

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Compares a stroke drawn by the learner with the model stroke. It is right
 * when it starts and ends near the model's start and end; drawn backwards
 * (from the model's end to its start) it is "reversed"; anything else is
 * "off". Very short strokes (dots like the ゛ marks) are judged by start
 * point alone, because a finger can't reliably place both ends of a dot.
 */
export function gradeStroke(drawn: Point[], model: Stroke): StrokeGrade {
  if (drawn.length === 0) return 'off';
  const first = drawn[0];
  const last = drawn[drawn.length - 1];
  if (model.len < 14) return dist(first, model.start) <= TOLERANCE ? 'ok' : 'off';
  if (dist(first, model.start) <= TOLERANCE && dist(last, model.end) <= TOLERANCE) return 'ok';
  if (dist(first, model.end) <= TOLERANCE && dist(last, model.start) <= TOLERANCE) return 'reversed';
  return 'off';
}

/** SVG path data for a freehand stroke. */
export function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  const [h, ...rest] = points;
  if (rest.length === 0) return `M${h[0]},${h[1]} l0.1,0.1`;
  return `M${h[0]},${h[1]}` + rest.map(([x, y]) => ` L${x},${y}`).join('');
}
