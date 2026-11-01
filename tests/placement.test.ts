import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/data/lessons';
import {
  applyPlacement,
  buildPlacement,
  offerPlacement,
  placedLessons,
  placementFinished,
  placementStages,
  QUESTIONS_PER_STAGE,
  stagesPassed,
} from '@/lib/placement';
import { INITIAL_PROGRESS, lessonStatuses } from '@/lib/progress';
import { seededRng } from '@/lib/quiz';

describe('placement test', () => {
  it('covers the whole free path, in order, with no gaps', () => {
    const stages = placementStages();
    expect(stages).toHaveLength(6);
    const covered = stages.flatMap((s) => s.lessons.map((l) => l.id));
    expect(covered).toEqual(LESSONS.filter((l) => !l.premium).map((l) => l.id));
  });

  it('asks four different questions per stage, all answerable, without listening', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { questions, stageOf } = buildPlacement(seededRng(seed));
      expect(questions).toHaveLength(6 * QUESTIONS_PER_STAGE);
      for (let s = 0; s < 6; s++) {
        const items = questions.filter((_, i) => stageOf[i] === s).map((q) => q.item);
        expect(new Set(items).size).toBe(QUESTIONS_PER_STAGE);
      }
      for (const q of questions) {
        expect(q.listen).toBeFalsy();
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it('passes stages with 3 of 4 right and stops at the first failed stage', () => {
    const stageOf = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
    const ok = [true, true, true, false];
    const bad = [true, false, false, true];
    expect(stagesPassed([...ok, ...ok], stageOf)).toBe(2);
    expect(stagesPassed([...ok, ...bad, ...ok], stageOf)).toBe(1);
    expect(stagesPassed(bad, stageOf)).toBe(0);
    // Mid-stage: not finished; end of a passed stage: continue; end of a failed stage: stop.
    expect(placementFinished([true, true], stageOf)).toBe(false);
    expect(placementFinished(ok, stageOf)).toBe(false);
    expect(placementFinished([...ok, ...bad], stageOf)).toBe(true);
    expect(placementFinished([...ok, ...ok, ...ok], stageOf)).toBe(true);
  });

  it('unlocks the passed lessons and makes the next one current', () => {
    const placed = placedLessons(3);
    const state = applyPlacement({ ...INITIAL_PROGRESS, level: 'kana' }, placed);
    const statuses = lessonStatuses(state);
    for (const l of placed) expect(statuses[l.id]).toBe('done');
    const next = LESSONS[placed.length];
    expect(statuses[next.id]).toBe('current');
    expect(state.placementDone).toBe(true);
    expect(state.lessons[placed[0].id].completions).toBe(0);
  });

  it('never lowers a lesson already passed', () => {
    const start = { ...INITIAL_PROGRESS, lessons: { 'hira-a': { best: 10, total: 10, completions: 2 } } };
    expect(applyPlacement(start, placedLessons(1)).lessons['hira-a']).toEqual(start.lessons['hira-a']);
  });

  it('is offered only to learners who know some Japanese and have not started', () => {
    expect(offerPlacement({ ...INITIAL_PROGRESS, level: 'kana' })).toBe(true);
    expect(offerPlacement({ ...INITIAL_PROGRESS, level: 'new' })).toBe(false);
    expect(offerPlacement({ ...INITIAL_PROGRESS, level: null })).toBe(false);
    expect(offerPlacement({ ...INITIAL_PROGRESS, level: 'kana', placementDone: true })).toBe(false);
    expect(
      offerPlacement({
        ...INITIAL_PROGRESS,
        level: 'kana',
        lessons: { 'hira-a': { best: 9, total: 10, completions: 1 } },
      }),
    ).toBe(false);
  });
});
