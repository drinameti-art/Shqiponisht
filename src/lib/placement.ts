import { LESSONS, type Lesson } from '@/data/lessons';

import type { Progress } from './progress';
import { buildQuiz, shuffle, type Question, type Rng } from './quiz';

/**
 * The placement test walks the free lesson path in stages. Each stage ends at
 * one of these lessons and covers every lesson since the previous stage.
 */
const STAGE_ENDS = ['hira-ta', 'hira-ha', 'hira-yoon', 'kata-2', 'te-gjata', 'kanji-shkolla'] as const;

export const QUESTIONS_PER_STAGE = 4;
/** Right answers needed in a stage to skip its lessons. */
export const STAGE_PASS = 3;

export type Stage = { title: string; lessons: Lesson[] };

const STAGE_TITLES = ['Hiragana 1', 'Hiragana 2', 'Hiragana 3', 'Katakana 1', 'Katakana 2', 'Kanji dhe fjalë'];

/** The stages, in path order, built from LESSONS so they follow any change to the path. */
export function placementStages(): Stage[] {
  const free = LESSONS.filter((l) => !l.premium);
  const stages: Stage[] = [];
  let start = 0;
  STAGE_ENDS.forEach((endId, i) => {
    const end = free.findIndex((l) => l.id === endId);
    if (end < start) return;
    stages.push({ title: STAGE_TITLES[i], lessons: free.slice(start, end + 1) });
    start = end + 1;
  });
  return stages;
}

export type PlacementQuiz = { questions: Question[]; stageOf: number[] };

/** Four questions per stage, spread over the stage's lessons. No listening questions: it must work without sound. */
export function buildPlacement(rng: Rng): PlacementQuiz {
  const questions: Question[] = [];
  const stageOf: number[] = [];
  placementStages().forEach((stage, s) => {
    const lessons = shuffle(stage.lessons, rng).slice(0, QUESTIONS_PER_STAGE);
    const picked: Question[] = [];
    for (let i = 0; picked.length < QUESTIONS_PER_STAGE && i < QUESTIONS_PER_STAGE * 3; i++) {
      const lesson = lessons[i % lessons.length];
      const [q] = buildQuiz(lesson, rng, 1, { listening: false });
      if (q && !picked.some((p) => p.item === q.item)) picked.push(q);
    }
    for (const q of picked) {
      questions.push(q);
      stageOf.push(s);
    }
  });
  return { questions, stageOf };
}

/** Number of stages passed in a row from the start, given right/wrong per answered question. */
export function stagesPassed(correct: boolean[], stageOf: number[]): number {
  let passed = 0;
  for (let s = 0; ; s++) {
    const idx = stageOf.flatMap((st, i) => (st === s ? [i] : []));
    if (idx.length === 0 || idx.some((i) => i >= correct.length)) return passed;
    if (idx.filter((i) => correct[i]).length < Math.min(STAGE_PASS, idx.length)) return passed;
    passed++;
  }
}

/**
 * True when the test can end after `answered` questions: either every
 * question is done, or the stage just finished was failed (later stages are
 * harder, so there is no point asking them).
 */
export function placementFinished(correct: boolean[], stageOf: number[]): boolean {
  const n = correct.length;
  if (n >= stageOf.length) return true;
  const lastStage = stageOf[n - 1];
  const stageComplete = stageOf[n] !== lastStage;
  return stageComplete && stagesPassed(correct, stageOf) <= lastStage;
}

/** Lessons unlocked by passing the first `passed` stages. */
export function placedLessons(passed: number): Lesson[] {
  return placementStages()
    .slice(0, passed)
    .flatMap((s) => s.lessons);
}

/**
 * Marks the placed lessons as passed (without counting them as completions,
 * so the learner can still take them) and closes the placement offer.
 */
export function applyPlacement(state: Progress, lessons: Lesson[]): Progress {
  const records = { ...state.lessons };
  for (const l of lessons) {
    const prev = records[l.id];
    if (prev && prev.best / (prev.total || 1) >= 0.6) continue;
    records[l.id] = { best: 8, total: 10, completions: prev?.completions ?? 0 };
  }
  return { ...state, lessons: records, placementDone: true };
}

/** The placement test is offered on Sot to learners who know some Japanese and haven't started yet. */
export function offerPlacement(state: Progress): boolean {
  return !state.placementDone && !!state.level && state.level !== 'new' && Object.keys(state.lessons).length === 0;
}
