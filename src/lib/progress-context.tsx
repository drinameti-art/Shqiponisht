import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Lesson } from '@/data/lessons';

import { applyPlacement, placedLessons, stagesPassed } from './placement';
import { completeLesson, completeReview, dayKey, hasPlus, INITIAL_PROGRESS, type Progress } from './progress';
import { syncReminders } from './reminders';
import { recordAnswers } from './review';
import { loadProgress, saveProgress } from './storage';
import { playSound, type SoundName } from './sounds';
import { subscription } from './subscription';

export type Answer = { item: string; correct: boolean };

type ProgressApi = {
  progress: Progress;
  ready: boolean;
  today: string;
  /** True when the learner has Shqiponisht Plus (or the web demo of it). */
  plus: boolean;
  /** Plays a sound effect, unless the learner turned sounds off. */
  sfx: (name: SoundName) => void;
  update: (fn: (p: Progress) => Progress) => void;
  /** Records a finished lesson and feeds every answer into spaced review. Returns XP earned. */
  finishLesson: (lessonId: string, answers: Answer[]) => number;
  /** Records a finished review session. Returns XP earned. */
  finishReview: (answers: Answer[]) => number;
  /** Records the placement test: unlocks the lessons of every stage passed. */
  finishPlacement: (answers: Answer[], stageOf: number[]) => { xp: number; placed: Lesson[] };
  reset: () => void;
};

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [ready, setReady] = useState(false);
  const latest = useRef(progress);
  const today = dayKey(new Date());

  const commit = useCallback((next: Progress) => {
    latest.current = next;
    setProgress(next);
    void saveProgress(next);
  }, []);

  useEffect(() => {
    let alive = true;
    loadProgress().then((p) => {
      if (!alive) return;
      latest.current = p;
      setProgress(p);
      setReady(true);
      void subscription.init((active) => {
        if (latest.current.plus !== active) commit({ ...latest.current, plus: active });
      });
    });
    return () => {
      alive = false;
    };
  }, [commit]);

  const update = useCallback((fn: (p: Progress) => Progress) => commit(fn(latest.current)), [commit]);

  // Keep scheduled reminders in step with practice and settings (skips days already practised).
  useEffect(() => {
    if (ready) void syncReminders(progress, today);
  }, [ready, progress, today]);

  const finishLesson = useCallback(
    (lessonId: string, answers: Answer[]) => {
      const day = dayKey(new Date());
      const correct = answers.filter((a) => a.correct).length;
      const { state, xpEarned } = completeLesson(latest.current, { lessonId, correct, total: answers.length }, day);
      commit({ ...state, review: recordAnswers(state.review, answers, day) });
      return xpEarned;
    },
    [commit],
  );

  const finishReview = useCallback(
    (answers: Answer[]) => {
      const day = dayKey(new Date());
      const { state, xpEarned } = completeReview(latest.current, answers.filter((a) => a.correct).length, day);
      commit({ ...state, review: recordAnswers(state.review, answers, day) });
      return xpEarned;
    },
    [commit],
  );

  const finishPlacement = useCallback(
    (answers: Answer[], stageOf: number[]) => {
      const day = dayKey(new Date());
      const placed = placedLessons(
        stagesPassed(
          answers.map((a) => a.correct),
          stageOf,
        ),
      );
      const { state, xpEarned } = completeReview(latest.current, answers.filter((a) => a.correct).length, day);
      commit({ ...applyPlacement(state, placed), review: recordAnswers(state.review, answers, day) });
      return { xp: xpEarned, placed };
    },
    [commit],
  );

  const sfx = useCallback((name: SoundName) => {
    if (latest.current.sound) playSound(name);
  }, []);

  // A reset clears learning progress but keeps the subscription and settings.
  const reset = useCallback(
    () =>
      commit({
        ...INITIAL_PROGRESS,
        plus: latest.current.plus,
        sound: latest.current.sound,
        reminder: latest.current.reminder,
      }),
    [commit],
  );

  const api = useMemo(
    () => ({
      progress,
      ready,
      today,
      plus: hasPlus(progress),
      sfx,
      update,
      finishLesson,
      finishReview,
      finishPlacement,
      reset,
    }),
    [progress, ready, today, sfx, update, finishLesson, finishReview, finishPlacement, reset],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
