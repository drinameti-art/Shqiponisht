import { describe, expect, it } from 'vitest';

import { VOCAB_LESSONS } from '@/data/lessons';
import { answerCard, decks, isFinished, remaining, sessionAnswers, startSession } from '@/lib/flashcards';
import { seededRng } from '@/lib/quiz';
import { recordAnswers } from '@/lib/review';

const greetings = VOCAB_LESSONS.find((l) => l.id === 'pershendetjet')!.words.slice(0, 3);

describe('flashcards', () => {
  it('keeps Plus words out of "all" until the learner has Plus', () => {
    const free = decks({}, false).find((d) => d.id === 'all')!.words.length;
    const plus = decks({}, true).find((d) => d.id === 'all')!.words.length;
    expect(plus).toBeGreaterThan(free);
    expect(decks({}, false).find((d) => d.id === 'restoranti')!.premium).toBe(true);
  });

  it('builds a "hard words" deck from the words the learner missed', () => {
    const review = recordAnswers(
      {},
      [
        { item: 'word:ねこ', correct: false },
        { item: 'word:いぬ', correct: true },
      ],
      '2026-10-31',
    );
    const reviewed = recordAnswers(review, [{ item: 'word:いぬ', correct: true }], '2026-11-01');
    expect(
      decks(reviewed, false)
        .find((d) => d.id === 'hard')!
        .words.map((w) => w.jp),
    ).toEqual(['ねこ']);
  });

  it('does not count a word answered right the first time as hard', () => {
    const once = recordAnswers({}, [{ item: 'word:ねこ', correct: true }], '2026-10-31');
    expect(decks(once, false).find((d) => d.id === 'hard')!.words).toEqual([]);
  });

  it('brings an unknown card back until it is known, and scores the first try', () => {
    let s = startSession(greetings, seededRng(1));
    expect(remaining(s)).toBe(3);
    const missed = s.queue[0];
    s = answerCard(s, false);
    s = answerCard(s, true);
    s = answerCard(s, true);
    expect(isFinished(s)).toBe(false);
    expect(s.queue[s.pos]).toBe(missed);
    expect(remaining(s)).toBe(1);
    s = answerCard(s, true);
    expect(isFinished(s)).toBe(true);
    const answers = sessionAnswers(s);
    expect(answers).toHaveLength(3);
    expect(answers.find((a) => a.item === `word:${missed}`)!.correct).toBe(false);
  });

  it('limits a session to the deck size', () => {
    const all = decks({}, true).find((d) => d.id === 'all')!.words;
    expect(startSession(all, seededRng(2)).queue).toHaveLength(20);
  });
});
