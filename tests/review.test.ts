import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/data/lessons';
import { completeReview, INITIAL_PROGRESS, parseProgress } from '@/lib/progress';
import { buildQuiz, buildReviewQuiz, seededRng } from '@/lib/quiz';
import { addDays, dueCount, dueItems, learnedCount, recordAnswers } from '@/lib/review';

const day = '2026-10-31';

describe('spaced review', () => {
  it('pushes an item further out each time it is answered right', () => {
    let cards = {};
    const dues: string[] = [];
    let today = day;
    for (let i = 0; i < 4; i++) {
      cards = recordAnswers(cards, [{ item: 'kana:あ', correct: true }], today);
      today = (cards as Record<string, { due: string }>)['kana:あ'].due;
      dues.push(today);
    }
    expect(dues).toEqual([addDays(day, 1), addDays(dues[0], 3), addDays(dues[1], 7), addDays(dues[2], 14)]);
  });

  it('brings a mistake back the same day, in box 0', () => {
    const cards = recordAnswers(
      {},
      [
        { item: 'word:ねこ', correct: true },
        { item: 'word:ねこ', correct: false },
      ],
      day,
    );
    expect(cards['word:ねこ']).toEqual({ box: 0, due: day, seen: 2, lapses: 1 });
    expect(dueItems(cards, day)).toEqual(['word:ねこ']);
  });

  it('still brings an item back today when it was missed once and then answered right in the same lesson', () => {
    const cards = recordAnswers(
      {},
      [
        { item: 'kana:い', correct: false },
        { item: 'kana:い', correct: true },
      ],
      day,
    );
    expect(cards['kana:い']).toMatchObject({ box: 0, due: day, seen: 2, lapses: 1 });
  });

  it('lists overdue items first, then the weakest, up to the limit', () => {
    const cards = {
      a: { box: 3, due: '2026-10-29', seen: 3, lapses: 0 },
      b: { box: 0, due: '2026-10-31', seen: 1, lapses: 1 },
      c: { box: 2, due: '2026-10-31', seen: 2, lapses: 0 },
      d: { box: 4, due: '2026-11-05', seen: 4, lapses: 0 },
    };
    expect(dueItems(cards, day)).toEqual(['a', 'b', 'c']);
    expect(dueItems(cards, day, 2)).toEqual(['a', 'b']);
    expect(dueCount(cards, day)).toBe(3);
    expect(learnedCount(cards)).toBe(2);
  });

  it('builds a review question for every kind of item a lesson can produce', () => {
    const items = [...new Set(LESSONS.flatMap((l) => buildQuiz(l, seededRng(1), 100).map((q) => q.item)))];
    const quiz = buildReviewQuiz(items, seededRng(2));
    expect(quiz).toHaveLength(items.length);
    quiz.forEach((q, i) => {
      expect(q.item).toBe(items[i]);
      expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
      expect(q.speak.length).toBeGreaterThan(0);
    });
  });

  it('skips review items whose content no longer exists', () => {
    expect(buildReviewQuiz(['kana:あ', 'word:zzz', 'kanji:山'], seededRng(3)).map((q) => q.item)).toEqual([
      'kana:あ',
      'kanji:山',
    ]);
  });

  it('counts a review for XP and the streak', () => {
    const s = completeReview(INITIAL_PROGRESS, 7, day).state;
    expect(s.xp).toBe(7);
    expect(s.streak).toEqual({ count: 1, lastDay: day });
  });

  it('upgrades old saves with empty review cards and reminders off', () => {
    const s = parseProgress(JSON.stringify({ version: 1, name: 'Arta' }));
    expect(s.review).toEqual({});
    expect(s.reminder.enabled).toBe(false);
  });
});
