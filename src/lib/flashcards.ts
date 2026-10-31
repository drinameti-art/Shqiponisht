import { VOCAB_LESSONS, type Word } from '@/data/lessons';

import type { Card } from './review';
import { shuffle, type Rng } from './quiz';

export type Deck = { id: string; title: string; words: Word[]; premium: boolean };

export const DECK_SIZE = 20;

/**
 * The decks a learner can study: every word they have access to, the words
 * they keep missing, and one deck per vocabulary lesson. Plus lessons are
 * listed (so learners can see them) but only included in "all" with Plus.
 */
export function decks(review: Record<string, Card>, plus: boolean): Deck[] {
  const open = VOCAB_LESSONS.filter((l) => plus || !l.premium);
  const all = open.flatMap((l) => l.words);
  const hard = all.filter((w) => {
    const c = review[`word:${w.jp}`];
    // Missed last time, or missed before and not yet solidly learned (box 3+ = learned).
    return !!c && (c.box === 0 || (c.lapses > 0 && c.box < 3));
  });
  return [
    { id: 'all', title: 'Të gjitha fjalët', words: all, premium: false },
    { id: 'hard', title: 'Fjalët e vështira', words: hard, premium: false },
    ...VOCAB_LESSONS.map((l) => ({ id: l.id, title: l.title, words: l.words, premium: !!l.premium })),
  ];
}

export type Session = {
  /** Words still to show, by `jp`; a missed card is appended again. */
  queue: string[];
  pos: number;
  /** Whether each card was known the first time it was shown. */
  firstTry: Record<string, boolean>;
};

export function startSession(words: readonly Word[], rng: Rng, limit = DECK_SIZE): Session {
  return {
    queue: shuffle(words, rng)
      .slice(0, limit)
      .map((w) => w.jp),
    pos: 0,
    firstTry: {},
  };
}

/**
 * Moves past the current card. A card the learner didn't know goes to the
 * back of the queue, so the session only ends once every card is known.
 */
export function answerCard(s: Session, knew: boolean): Session {
  const jp = s.queue[s.pos];
  if (jp === undefined) return s;
  return {
    queue: knew ? s.queue : [...s.queue, jp],
    pos: s.pos + 1,
    firstTry: jp in s.firstTry ? s.firstTry : { ...s.firstTry, [jp]: knew },
  };
}

export function isFinished(s: Session): boolean {
  return s.pos >= s.queue.length;
}

/** Remaining distinct cards (for the progress bar). */
export function remaining(s: Session): number {
  return new Set(s.queue.slice(s.pos)).size;
}

/** Results for spaced review: one answer per card, judged on the first try. */
export function sessionAnswers(s: Session): { item: string; correct: boolean }[] {
  return Object.entries(s.firstTry).map(([jp, correct]) => ({ item: `word:${jp}`, correct }));
}
