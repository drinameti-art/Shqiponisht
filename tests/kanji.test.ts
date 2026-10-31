import { describe, expect, it } from 'vitest';

import { KANJI, KANJI_GROUPS } from '@/data/kanji';
import { KANJI_LESSONS, LESSONS } from '@/data/lessons';
import { buildQuiz, seededRng } from '@/lib/quiz';

const HIRAGANA = /^[぀-ゟ]+$/;
const KATAKANA = /^[゠-ヿ]+$/;

describe('kanji data', () => {
  it('has unique characters and unique Albanian meanings', () => {
    expect(new Set(KANJI.map((k) => k.char)).size).toBe(KANJI.length);
    expect(new Set(KANJI.map((k) => k.meaning)).size).toBe(KANJI.length);
  });

  it('writes on readings in katakana and kun readings in hiragana', () => {
    for (const k of KANJI) {
      expect(k.on.kana, k.char).toMatch(KATAKANA);
      expect(k.kun.kana, k.char).toMatch(HIRAGANA);
    }
  });

  it('gives every kanji a stroke count and an example word that contains it', () => {
    for (const k of KANJI) {
      expect(k.strokes, k.char).toBeGreaterThan(0);
      expect(k.examples.length, k.char).toBeGreaterThan(0);
      for (const e of k.examples) {
        expect(e.jp, k.char).toContain(k.char);
        expect(e.kana, e.jp).toMatch(HIRAGANA);
      }
    }
  });

  it('has one lesson per group in the path', () => {
    expect(KANJI_LESSONS.map((l) => l.id)).toEqual(KANJI_GROUPS.map((g) => `kanji-${g.id}`));
    expect(LESSONS.filter((l) => l.kind === 'kanji')).toHaveLength(KANJI_GROUPS.length);
  });

  it('asks about the kanji of the lesson being studied', () => {
    for (const lesson of KANJI_LESSONS) {
      const chars = new Set(lesson.kanji.map((k) => k.char));
      for (const q of buildQuiz(lesson, seededRng(3))) {
        const mentioned = [...chars].some((c) => q.prompt.includes(c) || q.explanation.includes(c));
        expect(mentioned, `${lesson.id}: ${q.prompt}`).toBe(true);
      }
    }
  });
});

describe('stroke data', () => {
  it('has stroke paths for every kana and kanji, matching the stroke counts', async () => {
    const strokes = (await import('@/data/strokes.json')).default as Record<string, unknown[]>;
    const { KANA } = await import('@/data/kana');
    // Combined sounds (きゃ) are two characters; each character has its own strokes.
    for (const k of KANA.filter((x) => x.hiragana.length === 1)) {
      expect(strokes[k.hiragana], k.hiragana).toBeDefined();
      expect(strokes[k.katakana], k.katakana).toBeDefined();
    }
    for (const k of KANJI) expect(strokes[k.char]?.length, k.char).toBe(k.strokes);
  });
});
