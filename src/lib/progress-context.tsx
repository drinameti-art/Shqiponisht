import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { completeLesson, dayKey, INITIAL_PROGRESS, type Progress } from './progress';
import { loadProgress, saveProgress } from './storage';

type ProgressApi = {
  progress: Progress;
  ready: boolean;
  today: string;
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

  useEffect(() => {
    let alive = true;
    loadProgress().then((p) => {
      if (!alive) return;
      latest.current = p;
      setProgress(p);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback((next: Progress) => {
    latest.current = next;
    setProgress(next);
    void saveProgress(next);
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => commit(fn(latest.current)), [commit]);

  const finishLesson = useCallback(
    (lessonId: string, correct: number, total: number) => {
      const { state, xpEarned } = completeLesson(latest.current, { lessonId, correct, total }, dayKey(new Date()));
      commit(state);
      return xpEarned;
    },
    [commit],
  );

  const reset = useCallback(() => commit({ ...INITIAL_PROGRESS }), [commit]);

  const api = useMemo(
    () => ({ progress, ready, today, update, finishLesson, reset }),
    [progress, ready, today, update, finishLesson, reset],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
