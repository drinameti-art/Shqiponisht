import type { DayKey } from './progress';

/** Spaced-review state of one item (Leitner boxes). */
export type Card = {
  /** 0 = just missed; higher boxes come back less often. */
  box: number;
  /** First day the item is due again. */
  due: DayKey;
  seen: number;
  lapses: number;
};

/** Days until the next review after reaching box n (index = box). */
export const INTERVALS = [0, 1, 3, 7, 14, 30, 60] as const;
export const MAX_BOX = INTERVALS.length - 1;
export const REVIEW_SIZE = 12;

export function addDays(day: DayKey, n: number): DayKey {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Records one session (a lesson or a review). Each item is judged once for
 * the session: if it was answered right every time it moves up a box and is
 * scheduled further out; if it was missed even once it drops to box 0, due
 * today, so today's mistakes come back in today's review.
 */
export function recordAnswers(
  cards: Record<string, Card>,
  answers: readonly { item: string; correct: boolean }[],
  today: DayKey,
): Record<string, Card> {
  const session = new Map<string, { correct: boolean; count: number }>();
  for (const { item, correct } of answers) {
    const s = session.get(item);
    session.set(item, { correct: (s?.correct ?? true) && correct, count: (s?.count ?? 0) + 1 });
  }
  const next = { ...cards };
  for (const [item, { correct, count }] of session) {
    const prev = next[item];
    const box = correct ? Math.min(MAX_BOX, (prev?.box ?? 0) + 1) : 0;
    next[item] = {
      box,
      due: addDays(today, INTERVALS[box]),
      seen: (prev?.seen ?? 0) + count,
      lapses: (prev?.lapses ?? 0) + (correct ? 0 : 1),
    };
  }
  return next;
}

/** Items due today or earlier: most overdue first, then the weakest (lowest box). */
export function dueItems(cards: Record<string, Card>, today: DayKey, limit = REVIEW_SIZE): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.due <= today)
    .sort(([, a], [, b]) => (a.due === b.due ? a.box - b.box : a.due < b.due ? -1 : 1))
    .slice(0, limit)
    .map(([item]) => item);
}

export function dueCount(cards: Record<string, Card>, today: DayKey): number {
  return Object.values(cards).filter((c) => c.due <= today).length;
}

/** Items in the top boxes count as learned for the profile stats. */
export function learnedCount(cards: Record<string, Card>): number {
  return Object.values(cards).filter((c) => c.box >= 3).length;
}
