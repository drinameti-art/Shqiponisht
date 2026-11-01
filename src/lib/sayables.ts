import { KANA } from '@/data/kana';
import { KANJI } from '@/data/kanji';
import { VOCAB_LESSONS } from '@/data/lessons';
import { NOTES } from '@/data/notes';

/** Something the app can pronounce: the text the speaker button passes, and its kana reading. */
export type Sayable = { text: string; reading: string; kind: 'kana' | 'word' | 'example' };

/** Katakana → hiragana (same sounds), for looking up a reading written in katakana. */
export function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** What the speaker button says for a vocabulary word: its usual written form. */
export function wordSay(w: { jp: string; kanji?: string }): string {
  return w.kanji ?? w.jp;
}

/**
 * Every distinct thing the app can pronounce. Used to build the bundled
 * audio (scripts/audio) and to check that every item has a clip.
 */
export function allSayables(): Sayable[] {
  const out = new Map<string, Sayable>();
  const add = (s: Sayable) => {
    if (!out.has(s.text)) out.set(s.text, s);
  };
  // Hiragana and katakana each have their own clip (voices C and D, scripts/audio/build.py).
  for (const k of KANA) add({ text: k.hiragana, reading: k.hiragana, kind: 'kana' });
  for (const k of KANA) add({ text: k.katakana, reading: k.katakana, kind: 'kana' });
  for (const w of VOCAB_LESSONS.flatMap((l) => l.words)) add({ text: wordSay(w), reading: w.jp, kind: 'word' });
  for (const e of KANJI.flatMap((k) => k.examples)) add({ text: e.jp, reading: e.kana, kind: 'example' });
  for (const e of Object.values(NOTES).flatMap((n) => n.examples))
    add({ text: e.jp, reading: e.kana, kind: 'example' });
  return [...out.values()];
}
