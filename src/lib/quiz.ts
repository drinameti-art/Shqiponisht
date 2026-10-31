import { KANA, KANA_TIPS, type Kana } from '@/data/kana';
import { KANJI, type Kanji, type KanjiExample } from '@/data/kanji';
import { VOCAB_LESSONS, type Lesson, type Word } from '@/data/lessons';

import { spellsDifferently } from './albanian';

export type Option = { label: string; hint?: string };

export type Question = {
  /** Instruction shown above the prompt, in Albanian. */
  instruction: string;
  /** The thing being asked about (a kana glyph, a word, or a meaning). */
  prompt: string;
  /** True when the prompt is Japanese text (rendered large). */
  promptIsJapanese: boolean;
  options: Option[];
  answer: number;
  /** Explanation shown after checking, in Albanian. */
  explanation: string;
};

export type Rng = () => number;

/** Small deterministic PRNG (mulberry32) so quizzes are testable. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds a multiple-choice question with exactly one right answer: the
 * correct option plus up to three distractors. A distractor is skipped when
 * its label repeats another option's, or when it shares the correct item's
 * `sameAnswer` key (e.g. お and を are both read „o“, so neither may appear
 * as a distractor for the other).
 */
function choose<T>(
  correct: T,
  pool: readonly T[],
  toOption: (item: T) => Option,
  sameAnswer: (item: T) => string,
  rng: Rng,
): { options: Option[]; answer: number } {
  const correctOption = toOption(correct);
  const correctKey = sameAnswer(correct);
  const seen = new Set([correctOption.label]);
  const distractors: Option[] = [];
  for (const item of shuffle(pool, rng)) {
    if (sameAnswer(item) === correctKey) continue;
    const option = toOption(item);
    if (seen.has(option.label)) continue;
    seen.add(option.label);
    distractors.push(option);
    if (distractors.length === 3) break;
  }
  const options = shuffle([correctOption, ...distractors], rng);
  return { options, answer: options.findIndex((o) => o.label === correctOption.label) };
}

function kanaExplanation(k: Kana, glyph: string): string {
  const base = `${glyph} lexohet „${k.sq}“`;
  if (spellsDifferently(k.romaji)) return `${base} — në romaji „${k.romaji}“. ${KANA_TIPS[k.romaji] ?? ''}`.trim();
  return `${base}. ${KANA_TIPS[k.romaji] ?? ''}`.trim();
}

function kanaQuestions(lesson: Extract<Lesson, { kind: 'kana' }>, rng: Rng): Question[] {
  const { script } = lesson;
  // Distractors come from the lesson first, then from the whole syllabary.
  const pool = [
    ...lesson.kana,
    ...shuffle(
      KANA.filter((k) => !lesson.kana.includes(k)),
      rng,
    ),
  ];
  return lesson.kana.flatMap((k): Question[] => {
    const glyph = k[script];
    const bySound = (x: Kana) => x.sq;
    const readQ = choose(
      k,
      pool,
      (x) => ({ label: x.sq, hint: x.sq === x.romaji ? undefined : `romaji: ${x.romaji}` }),
      bySound,
      rng,
    );
    const writeQ = choose(k, pool, (x) => ({ label: x[script] }), bySound, rng);
    return [
      {
        instruction: 'Si lexohet kjo shkronjë?',
        prompt: glyph,
        promptIsJapanese: true,
        ...readQ,
        explanation: kanaExplanation(k, glyph),
      },
      {
        instruction: `Cila shkronjë lexohet „${k.sq}“?`,
        prompt: k.sq,
        promptIsJapanese: false,
        ...writeQ,
        explanation: kanaExplanation(k, glyph),
      },
    ];
  });
}

function vocabQuestions(lesson: Extract<Lesson, { kind: 'vocab' }>, rng: Rng): Question[] {
  const others = VOCAB_LESSONS.filter((l) => l.id !== lesson.id).flatMap((l) => l.words);
  const pool: Word[] = [...lesson.words, ...shuffle(others, rng)];
  return lesson.words.flatMap((w): Question[] => {
    const explanation = `${w.jp} (${w.sq}) = ${w.meaning}.`;
    return [
      {
        instruction: 'Si thuhet në japonisht?',
        prompt: w.meaning,
        promptIsJapanese: false,
        ...choose(
          w,
          pool,
          (x) => ({ label: x.jp, hint: x.sq }),
          (x) => x.meaning,
          rng,
        ),
        explanation,
      },
      {
        instruction: 'Çfarë do të thotë?',
        prompt: w.jp,
        promptIsJapanese: true,
        ...choose(
          w,
          pool,
          (x) => ({ label: x.meaning }),
          (x) => x.jp,
          rng,
        ),
        explanation,
      },
    ];
  });
}

function kanjiReadings(k: Kanji): string {
  return `on: ${k.on.kana} (${k.on.sq}) · kun: ${k.kun.kana} (${k.kun.sq})`;
}

function kanjiQuestions(lesson: Extract<Lesson, { kind: 'kanji' }>, rng: Rng): Question[] {
  const pool = [
    ...lesson.kanji,
    ...shuffle(
      KANJI.filter((k) => !lesson.kanji.includes(k)),
      rng,
    ),
  ];
  const examplePool: KanjiExample[] = pool.flatMap((k) => k.examples);
  return lesson.kanji.flatMap((k): Question[] => {
    const about = `${k.char} = ${k.meaning}. ${kanjiReadings(k)}.`;
    const questions: Question[] = [
      {
        instruction: 'Çfarë do të thotë ky kanji?',
        prompt: k.char,
        promptIsJapanese: true,
        ...choose(
          k,
          pool,
          (x) => ({ label: x.meaning }),
          (x) => x.meaning,
          rng,
        ),
        explanation: about,
      },
      {
        instruction: `Cili kanji do të thotë „${k.meaning}“?`,
        prompt: k.meaning,
        promptIsJapanese: false,
        ...choose(
          k,
          pool,
          (x) => ({ label: x.char }),
          (x) => x.meaning,
          rng,
        ),
        explanation: about,
      },
    ];
    const word = k.examples[Math.floor(rng() * k.examples.length)];
    questions.push({
      instruction: 'Si lexohet kjo fjalë?',
      prompt: word.jp,
      promptIsJapanese: true,
      ...choose(
        word,
        examplePool,
        (x) => ({ label: x.sq, hint: x.kana }),
        (x) => x.sq,
        rng,
      ),
      explanation: `${word.jp} lexohet ${word.kana} („${word.sq}“) dhe do të thotë „${word.meaning}“.`,
    });
    return questions;
  });
}

export const QUESTIONS_PER_LESSON = 10;

export function buildQuiz(lesson: Lesson, rng: Rng, count = QUESTIONS_PER_LESSON): Question[] {
  const all =
    lesson.kind === 'kana'
      ? kanaQuestions(lesson, rng)
      : lesson.kind === 'kanji'
        ? kanjiQuestions(lesson, rng)
        : vocabQuestions(lesson, rng);
  return shuffle(all, rng).slice(0, count);
}
