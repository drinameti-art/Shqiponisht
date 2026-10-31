import { allSayables, toHiragana } from './sayables';

/**
 * Finds the bundled recording for a piece of Japanese text. Looks up the
 * written form first (水, 食べます), then katakana as hiragana (ア → あ, same
 * sound), then the kana reading, so callers that pass a reading still get a clip.
 */
export function makeClipLookup<T>(clips: Record<string, T>): (text: string) => T | undefined {
  const byReading = new Map<string, T>();
  for (const s of allSayables()) {
    const clip = clips[s.text];
    if (clip !== undefined && !byReading.has(s.reading)) byReading.set(s.reading, clip);
  }
  return (text) => clips[text] ?? clips[toHiragana(text)] ?? byReading.get(text) ?? byReading.get(toHiragana(text));
}
