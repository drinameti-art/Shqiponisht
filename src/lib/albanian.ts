/**
 * Respells Hepburn romaji the way an Albanian reader would write the sound.
 *
 * Albanian spelling is phonetic, so most romaji already reads correctly.
 * The rules below cover the letters that an Albanian speaker would
 * otherwise pronounce wrongly:
 *
 *   chi → çi    tsu → cu    ji → xhi    ya/yu/yo → ja/ju/jo
 *   wa → ua     wo → o      ō → oo      (long vowels are doubled)
 *
 * Input is lowercase Hepburn with macrons for long vowels (arigatō).
 */
const LONG_VOWELS: Record<string, string> = {
  ā: 'aa',
  ī: 'ii',
  ū: 'uu',
  ē: 'ee',
  ō: 'oo',
};

export function romajiToAlbanian(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/[āīūēō]/g, (v) => LONG_VOWELS[v])
    .replace(/n'/g, 'n')
    .replace(/tch/g, 'tç')
    .replace(/ch/g, 'ç')
    .replace(/ts/g, 'c')
    .replace(/j/g, 'xh')
    .replace(/wo/g, 'o')
    .replace(/w/g, 'u')
    .replace(/y/g, 'j');
}

/** True when the Albanian respelling differs from the romaji (ignoring long-vowel marks). */
export function spellsDifferently(romaji: string): boolean {
  const plain = romaji.toLowerCase().replace(/[āīūēō]/g, (v) => LONG_VOWELS[v]);
  return romajiToAlbanian(romaji) !== plain;
}
