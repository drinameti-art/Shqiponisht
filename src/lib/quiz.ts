import { isCombined, KANA, KANA_TIPS, type Kana, type Script } from '@/data/kana';
import { KANJI, type Kanji, type KanjiExample } from '@/data/kanji';
import { VOCAB_LESSONS, type Lesson, type Word } from '@/data/lessons';

import { spellsDifferently } from './albanian';
import { wordSay } from './sayables';

export type Option = { label: string; hint?: string };

export type Question = {
  /** The learnable item this question tests, for spaced review. */
  item: ItemKey;
  /** Japanese text to pronounce for this question (speaker button). */
  speak: string;
  /** Listening question: the prompt is heard, not shown. Needs sound. */
  listen?: boolean;
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
  if (spellsDifferently(k.romaji))
    return `${base} — në romaji „${k.romaji}“. ${KANA_TIPS[k.romaji] ?? KANA_TIPS[k.row] ?? ''}`.trim();
  return `${base}. ${KANA_TIPS[k.romaji] ?? KANA_TIPS[k.row] ?? ''}`.trim();
}

/** Review keys identify one learnable item: a kana glyph, a word, or a kanji. */
export type ItemKey = `kana:${string}` | `word:${string}` | `kanji:${string}`;

const ALL_WORDS: Word[] = VOCAB_LESSONS.flatMap((l) => l.words);

function kanaItemQuestions(k: Kana, script: Script, pool: Kana[], rng: Rng): Question[] {
  const glyph = k[script];
  const bySound = (x: Kana) => x.sq;
  const item: ItemKey = `kana:${glyph}`;
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
      item,
      speak: glyph,
      instruction: 'Si lexohet kjo shkronjë?',
      prompt: glyph,
      promptIsJapanese: true,
      ...readQ,
      explanation: kanaExplanation(k, glyph),
    },
    {
      item,
      speak: glyph,
      instruction: `Cila shkronjë lexohet „${k.sq}“?`,
      prompt: k.sq,
      promptIsJapanese: false,
      ...writeQ,
      explanation: kanaExplanation(k, glyph),
    },
    {
      item,
      speak: glyph,
      listen: true,
      instruction: 'Dëgjo: cilën shkronjë dëgjon?',
      prompt: '',
      promptIsJapanese: false,
      ...choose(k, pool, (x) => ({ label: x[script] }), bySound, rng),
      explanation: kanaExplanation(k, glyph),
    },
  ];
}

function vocabItemQuestions(w: Word, pool: Word[], rng: Rng): Question[] {
  const written = w.kanji ? `${w.kanji} (${w.jp})` : w.jp;
  const explanation = `${written} — „${w.sq}“ = ${w.meaning}.`;
  const item: ItemKey = `word:${w.jp}`;
  return [
    {
      item,
      speak: wordSay(w),
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
      item,
      speak: wordSay(w),
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
    {
      item,
      speak: wordSay(w),
      listen: true,
      instruction: 'Dëgjo: çfarë do të thotë?',
      prompt: '',
      promptIsJapanese: false,
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
}

function kanjiReadings(k: Kanji): string {
  return `on: ${k.on.kana} (${k.on.sq}) · kun: ${k.kun.kana} (${k.kun.sq})`;
}

function kanjiItemQuestions(k: Kanji, pool: Kanji[], examplePool: KanjiExample[], rng: Rng): Question[] {
  const about = `${k.char} = ${k.meaning}. ${kanjiReadings(k)}.`;
  const item: ItemKey = `kanji:${k.char}`;
  const word = k.examples[Math.floor(rng() * k.examples.length)];
  return [
    {
      item,
      speak: k.examples[0].jp,
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
      item,
      speak: k.examples[0].jp,
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
    {
      item,
      speak: word.jp,
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
    },
  ];
}

/** Puts the given items first, then the rest of `all` shuffled, as a distractor pool. */
function poolWith<T>(first: readonly T[], all: readonly T[], rng: Rng): T[] {
  return [
    ...first,
    ...shuffle(
      all.filter((x) => !first.includes(x)),
      rng,
    ),
  ];
}

export const QUESTIONS_PER_LESSON = 10;

export type QuizOptions = {
  /** Include listening questions (only when the learner has sound on). Default true. */
  listening?: boolean;
};

export function buildQuiz(
  lesson: Lesson,
  rng: Rng,
  count = QUESTIONS_PER_LESSON,
  { listening = true }: QuizOptions = {},
): Question[] {
  let all: Question[];
  if (lesson.kind === 'kana') {
    // Distractors come from kana of the same kind: single characters for basic
    // rows, combined sounds (きゃ…) for yōon lessons, so beginners never see
    // sounds they haven't met as wrong answers.
    const combined = isCombined(lesson.kana[0]);
    const pool = poolWith(
      lesson.kana,
      KANA.filter((k) => isCombined(k) === combined),
      rng,
    );
    all = lesson.kana.flatMap((k) => kanaItemQuestions(k, lesson.script, pool, rng));
  } else if (lesson.kind === 'kanji') {
    const pool = poolWith(lesson.kanji, KANJI, rng);
    const examples = pool.flatMap((k) => k.examples);
    all = lesson.kanji.flatMap((k) => kanjiItemQuestions(k, pool, examples, rng));
  } else {
    const pool = poolWith(lesson.words, ALL_WORDS, rng);
    all = lesson.words.flatMap((w) => vocabItemQuestions(w, pool, rng));
  }
  if (!listening) all = all.filter((q) => !q.listen);
  return shuffle(all, rng).slice(0, count);
}

/**
 * One question per review item, in the given order. Unknown keys (e.g. from
 * content that was renamed in an update) are skipped.
 */
export function buildReviewQuiz(
  items: readonly string[],
  rng: Rng,
  { listening = true }: QuizOptions = {},
): Question[] {
  const examples = KANJI.flatMap((k) => k.examples);
  const out: Question[] = [];
  for (const key of items) {
    const sep = key.indexOf(':');
    const type = key.slice(0, sep);
    const id = key.slice(sep + 1);
    let options: Question[] = [];
    if (type === 'kana') {
      const k = KANA.find((x) => x.hiragana === id || x.katakana === id);
      if (k) options = kanaItemQuestions(k, k.hiragana === id ? 'hiragana' : 'katakana', shuffle(KANA, rng), rng);
    } else if (type === 'word') {
      const w = ALL_WORDS.find((x) => x.jp === id);
      if (w) options = vocabItemQuestions(w, shuffle(ALL_WORDS, rng), rng);
    } else if (type === 'kanji') {
      const k = KANJI.find((x) => x.char === id);
      if (k) options = kanjiItemQuestions(k, shuffle(KANJI, rng), examples, rng);
    }
    if (!listening) options = options.filter((q) => !q.listen);
    if (options.length) out.push(options[Math.floor(rng() * options.length)]);
  }
  return out;
}
