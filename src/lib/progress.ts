import { LESSONS } from '@/data/lessons';

import type { Card } from './review';

/** A calendar day in the learner's local time, formatted YYYY-MM-DD. */
export type DayKey = string;

export type LessonRecord = { best: number; total: number; completions: number };

export type Progress = {
  version: 1;
  onboarded: boolean;
  name: string;
  dailyGoal: number;
  xp: number;
  today: { day: DayKey; xp: number };
  streak: { count: number; lastDay: DayKey | null };
  lessons: Record<string, LessonRecord>;
  /** Last known Shqiponisht Plus status from the store (kept for offline use). */
  plus: boolean;
  /** Plus turned on as a demo in the web preview; never set in store builds. */
  demoPlus: boolean;
  /** Sound effects on or off. */
  sound: boolean;
  /** Spaced-review cards, keyed by item (see quiz ItemKey). */
  review: Record<string, Card>;
  /** Daily practice reminder (local notification). */
  reminder: { enabled: boolean; hour: number; minute: number };
  /** How much Japanese the learner said they knew at the start (see LEVELS); null if not asked. */
  level: string | null;
  /** The placement test was taken or declined, so it is no longer offered on Sot. */
  placementDone: boolean;
};

export const DAILY_GOALS = [10, 20, 30, 50] as const;

export const INITIAL_PROGRESS: Progress = {
  version: 1,
  onboarded: false,
  name: '',
  dailyGoal: 20,
  xp: 0,
  today: { day: '', xp: 0 },
  streak: { count: 0, lastDay: null },
  lessons: {},
  plus: false,
  demoPlus: false,
  sound: true,
  review: {},
  reminder: { enabled: false, hour: 19, minute: 0 },
  level: null,
  placementDone: false,
};

export function hasPlus(state: Progress): boolean {
  return state.plus || state.demoPlus;
}

export function dayKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The day before `day`, computed on the calendar (safe across DST and month ends). */
export function previousDay(day: DayKey): DayKey {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

/** XP for a finished lesson: 2 per correct answer, +5 for a perfect run. */
export function lessonXp(correct: number, total: number): number {
  return correct * 2 + (total > 0 && correct === total ? 5 : 0);
}

/** Adds practice XP for today and keeps the streak going (shared by lessons and reviews). */
function practise(state: Progress, xpEarned: number, today: DayKey): Progress {
  let streak = state.streak;
  if (streak.lastDay !== today) {
    const continues = streak.lastDay === previousDay(today);
    streak = { count: continues ? streak.count + 1 : 1, lastDay: today };
  }
  const todayXp = state.today.day === today ? state.today.xp : 0;
  return { ...state, xp: state.xp + xpEarned, today: { day: today, xp: todayXp + xpEarned }, streak };
}

/**
 * Records a finished lesson. The streak grows by one on the first practice of
 * a day that directly follows the last practice day, and restarts at 1 after
 * a missed day.
 */
export function completeLesson(
  state: Progress,
  result: { lessonId: string; correct: number; total: number },
  today: DayKey,
): { state: Progress; xpEarned: number } {
  const xpEarned = lessonXp(result.correct, result.total);
  const prev = state.lessons[result.lessonId];
  const next = practise(state, xpEarned, today);
  return {
    xpEarned,
    state: {
      ...next,
      lessons: {
        ...state.lessons,
        [result.lessonId]: {
          best: Math.max(prev?.best ?? 0, result.correct),
          total: result.total,
          completions: (prev?.completions ?? 0) + 1,
        },
      },
    },
  };
}

/** Records a finished review session: 1 XP per right answer, and it counts for the streak. */
export function completeReview(state: Progress, correct: number, today: DayKey): { state: Progress; xpEarned: number } {
  const xpEarned = correct;
  return { xpEarned, state: practise(state, xpEarned, today) };
}

/** The streak as it should be shown today: it lapses once a whole day is missed. */
export function currentStreak(state: Progress, today: DayKey): number {
  const { lastDay, count } = state.streak;
  return lastDay === today || lastDay === previousDay(today) ? count : 0;
}

export function xpToday(state: Progress, today: DayKey): number {
  return state.today.day === today ? state.today.xp : 0;
}

/** Share of correct answers needed to pass a lesson and unlock the next one. */
export const PASS_RATIO = 0.6;

export function passes(correct: number, total: number): boolean {
  return total > 0 && correct / total >= PASS_RATIO;
}

function passed(record: LessonRecord | undefined): boolean {
  return !!record && passes(record.best, record.total);
}

export type LessonStatus = 'done' | 'current' | 'locked' | 'premium';

/**
 * Lessons unlock in order: a lesson is open once the one before it has been
 * passed (best score ≥ PASS_RATIO). The first open lesson not yet passed is
 * "current". Plus lessons show as "premium" until the learner has Plus.
 */
export function lessonStatuses(state: Progress): Record<string, LessonStatus> {
  const out: Record<string, LessonStatus> = {};
  let unlocked = true;
  let currentAssigned = false;
  for (const lesson of LESSONS) {
    const done = passed(state.lessons[lesson.id]);
    if (lesson.premium && !hasPlus(state)) out[lesson.id] = 'premium';
    else if (done) out[lesson.id] = 'done';
    else if (unlocked && !currentAssigned) {
      out[lesson.id] = 'current';
      currentAssigned = true;
    } else out[lesson.id] = 'locked';
    unlocked = done;
  }
  return out;
}

export function completedCount(state: Progress): number {
  return LESSONS.filter((l) => passed(state.lessons[l.id])).length;
}

/** Accepts stored JSON from an older or corrupted save and returns a valid Progress. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return INITIAL_PROGRESS;
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    if (data?.version !== 1) return INITIAL_PROGRESS;
    return { ...INITIAL_PROGRESS, ...data, reminder: { ...INITIAL_PROGRESS.reminder, ...data.reminder } };
  } catch {
    return INITIAL_PROGRESS;
  }
}
