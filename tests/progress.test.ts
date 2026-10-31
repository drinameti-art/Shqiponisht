import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/data/lessons';
import {
  completeLesson,
  currentStreak,
  INITIAL_PROGRESS,
  lessonStatuses,
  lessonXp,
  parseProgress,
  previousDay,
  xpToday,
} from '@/lib/progress';

const first = LESSONS[0].id;

describe('progress', () => {
  it('computes the previous calendar day across month and year ends', () => {
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2027-01-01')).toBe('2026-12-31');
  });

  it('awards 2 XP per correct answer plus 5 for a perfect lesson', () => {
    expect(lessonXp(7, 10)).toBe(14);
    expect(lessonXp(10, 10)).toBe(25);
  });

  it('grows the streak on consecutive days and resets after a gap', () => {
    let s = completeLesson(INITIAL_PROGRESS, { lessonId: first, correct: 8, total: 10 }, '2026-10-30').state;
    expect(s.streak.count).toBe(1);
    s = completeLesson(s, { lessonId: first, correct: 8, total: 10 }, '2026-10-30').state;
    expect(s.streak.count).toBe(1);
    s = completeLesson(s, { lessonId: first, correct: 8, total: 10 }, '2026-10-31').state;
    expect(s.streak.count).toBe(2);
    expect(currentStreak(s, '2026-11-01')).toBe(2);
    expect(currentStreak(s, '2026-11-02')).toBe(0);
    s = completeLesson(s, { lessonId: first, correct: 8, total: 10 }, '2026-11-03').state;
    expect(s.streak.count).toBe(1);
  });

  it('resets daily XP on a new day', () => {
    const s = completeLesson(INITIAL_PROGRESS, { lessonId: first, correct: 10, total: 10 }, '2026-10-30').state;
    expect(xpToday(s, '2026-10-30')).toBe(25);
    expect(xpToday(s, '2026-10-31')).toBe(0);
    expect(s.xp).toBe(25);
  });

  it('unlocks the next lesson only after a passing score (6/10)', () => {
    expect(lessonStatuses(INITIAL_PROGRESS)[LESSONS[0].id]).toBe('current');
    expect(lessonStatuses(INITIAL_PROGRESS)[LESSONS[1].id]).toBe('locked');
    const failed = completeLesson(INITIAL_PROGRESS, { lessonId: first, correct: 5, total: 10 }, '2026-10-30').state;
    expect(lessonStatuses(failed)[LESSONS[0].id]).toBe('current');
    expect(lessonStatuses(failed)[LESSONS[1].id]).toBe('locked');
    const s = completeLesson(failed, { lessonId: first, correct: 6, total: 10 }, '2026-10-30').state;
    const st = lessonStatuses(s);
    expect(st[LESSONS[0].id]).toBe('done');
    expect(st[LESSONS[1].id]).toBe('current');
    expect(st[LESSONS[2].id]).toBe('locked');
  });

  it('keeps Plus lessons behind the subscription, then unlocks them in order', () => {
    const firstPlus = LESSONS.findIndex((l) => l.premium);
    expect(firstPlus).toBeGreaterThan(0);
    let s = INITIAL_PROGRESS;
    for (const l of LESSONS.slice(0, firstPlus)) {
      s = completeLesson(s, { lessonId: l.id, correct: 10, total: 10 }, '2026-10-30').state;
    }
    const free = lessonStatuses(s);
    expect(LESSONS.filter((l) => l.premium).every((l) => free[l.id] === 'premium')).toBe(true);
    expect(LESSONS.filter((l) => !l.premium).every((l) => free[l.id] === 'done')).toBe(true);
    const plus = lessonStatuses({ ...s, plus: true });
    expect(plus[LESSONS[firstPlus].id]).toBe('current');
    expect(plus[LESSONS[firstPlus + 1].id]).toBe('locked');
    expect(lessonStatuses({ ...s, demoPlus: true })[LESSONS[firstPlus].id]).toBe('current');
  });

  it('keeps the best score across retries', () => {
    let s = completeLesson(INITIAL_PROGRESS, { lessonId: first, correct: 9, total: 10 }, '2026-10-30').state;
    s = completeLesson(s, { lessonId: first, correct: 4, total: 10 }, '2026-10-30').state;
    expect(s.lessons[first]).toEqual({ best: 9, total: 10, completions: 2 });
  });

  it('falls back to a fresh state for missing or corrupt saves', () => {
    expect(parseProgress(null)).toBe(INITIAL_PROGRESS);
    expect(parseProgress('{not json')).toBe(INITIAL_PROGRESS);
    expect(parseProgress(JSON.stringify({ version: 1, name: 'Arta', onboarded: true })).name).toBe('Arta');
  });
});
