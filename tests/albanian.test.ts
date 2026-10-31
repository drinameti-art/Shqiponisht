import { describe, expect, it } from 'vitest';

import { romajiToAlbanian, spellsDifferently } from '@/lib/albanian';

describe('romajiToAlbanian', () => {
  it.each([
    ['konnichiwa', 'konniçiua'],
    ['arigatō', 'arigatoo'],
    ['ohayō gozaimasu', 'ohajoo gozaimasu'],
    ['sayōnara', 'sajoonara'],
    ['tsuki', 'cuki'],
    ['chizu', 'çizu'],
    ['jū', 'xhuu'],
    ['kyū', 'kjuu'],
    ['matcha', 'matça'],
    ['gyūnyū', 'gjuunjuu'],
    ['wo', 'o'],
    ['shi', 'shi'],
    ['kosobo-jin', 'kosobo-xhin'],
  ])('%s → %s', (romaji, sq) => {
    expect(romajiToAlbanian(romaji)).toBe(sq);
  });

  it('flags only spellings that change beyond long vowels', () => {
    expect(spellsDifferently('chi')).toBe(true);
    expect(spellsDifferently('arigatō')).toBe(false);
    expect(spellsDifferently('ka')).toBe(false);
  });
});

describe('speakable', () => {
  it('removes the learner spacing and trailing full stop before speaking', async () => {
    const { speakable } = await import('@/lib/speakable');
    expect(speakable('これは ほんです。')).toBe('これはほんです');
    expect(speakable('わたしは がくせいです。 はい。')).toBe('わたしはがくせいです、はい');
  });
});
