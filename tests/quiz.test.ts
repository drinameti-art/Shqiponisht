import { describe, expect, it } from 'vitest';

import { KANA } from '@/data/kana';
import { LESSONS } from '@/data/lessons';
import { buildQuiz, QUESTIONS_PER_LESSON, seededRng } from '@/lib/quiz';

describe('buildQuiz', () => {
  it.each(LESSONS.map((l) => [l.id, l] as const))(
    '%s: every question has 4 distinct options and exactly one right answer',
    (_id, lesson) => {
      for (let seed = 1; seed <= 25; seed++) {
        const quiz = buildQuiz(lesson, seededRng(seed));
        expect(quiz.length).toBe(QUESTIONS_PER_LESSON);
        for (const q of quiz) {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(4);
        }
      }
    },
  );

  it('never offers お and を as rival answers for the sound „o“', () => {
    const lesson = LESSONS.find((l) => l.id === 'hira-yrw')!;
    const o = KANA.find((k) => k.romaji === 'o')!;
    for (let seed = 1; seed <= 200; seed++) {
      for (const q of buildQuiz(lesson, seededRng(seed), 100)) {
        const labels = q.options.map((x) => x.label);
        if (q.prompt === 'o') expect(labels).not.toContain(o.hiragana);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    expect(buildQuiz(LESSONS[0], seededRng(7))).toEqual(buildQuiz(LESSONS[0], seededRng(7)));
  });
});
