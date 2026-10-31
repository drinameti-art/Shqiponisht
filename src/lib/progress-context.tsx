import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { completeLesson, dayKey, hasPlus, INITIAL_PROGRESS, type Progress } from './progress';
import { loadProgress, saveProgress } from './storage';
import { playSound, type SoundName } from './sounds';
import { subscription } from './subscription';

type ProgressApi = {
  progress: Progress;
  ready: boolean;
  today: string;
  /** True when the learner has Shqiponisht Plus (or the web demo of it). */
  plus: boolean;
  /** Plays a sound effect, unless the learner turned sounds off. */
  sfx: (name: SoundName) => void;
  update: (fn: (p: Progress) => Progress) => void;
  finishLesson: (lessonId: string, correct: number, total: number) => number;
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

  const finishLesson = useCallback(
    (lessonId: string, correct: number, total: number) => {
      const { state, xpEarned } = completeLesson(latest.current, { lessonId, correct, total }, dayKey(new Date()));
      commit(state);
      return xpEarned;
    },
    [commit],
  );

  // A reset clears learning progress but keeps the subscription status.
  const sfx = useCallback((name: SoundName) => {
    if (latest.current.sound) playSound(name);
  }, []);

  const reset = useCallback(
    () => commit({ ...INITIAL_PROGRESS, plus: latest.current.plus, sound: latest.current.sound }),
    [commit],
  );

  const api = useMemo(
    () => ({ progress, ready, today, plus: hasPlus(progress), sfx, update, finishLesson, reset }),
    [progress, ready, today, sfx, update, finishLesson, reset],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
