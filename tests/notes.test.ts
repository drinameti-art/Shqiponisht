import { describe, expect, it } from 'vitest';

import { LESSONS } from '@/data/lessons';
import { NOTES } from '@/data/notes';

const HIRAGANA = /^[぀-ゟ]+$/;

describe('grammar notes', () => {
  it('belong to lessons that exist', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    for (const id of Object.keys(NOTES)) expect(ids.has(id), id).toBe(true);
  });

  it('come before the first kana, katakana, kanji, verb and sentence lessons', () => {
    for (const id of ['hira-a', 'kata-1', 'kanji-numrat', 'hira-yoon', 'te-gjata', 'foljet', 'fjalite']) {
      expect(NOTES[id], id).toBeDefined();
    }
  });

  it('have points, and examples with a hiragana reading and an Albanian respelling', () => {
    for (const [id, n] of Object.entries(NOTES)) {
      expect(n.points.length, id).toBeGreaterThan(0);
      for (const e of n.examples) {
        expect(e.kana, `${id}: ${e.jp}`).toMatch(HIRAGANA);
        expect(e.sq.length).toBeGreaterThan(0);
        expect(e.meaning.length).toBeGreaterThan(0);
      }
    }
  });
});
