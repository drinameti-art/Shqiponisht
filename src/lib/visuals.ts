import { drawingFor, type Drawing } from '@/data/drawings';
import { VOCAB_LESSONS } from '@/data/lessons';

const WORD_BY_JP = new Map(VOCAB_LESSONS.flatMap((l) => l.words).map((w) => [w.jp, w]));

/** The drawing for a quiz/review item key ("word:ねこ", "kanji:山"), if it has one. */
export function drawingForItem(item: string): Drawing | undefined {
  const sep = item.indexOf(':');
  const type = item.slice(0, sep);
  const id = item.slice(sep + 1);
  if (type === 'kanji') return drawingFor(id);
  if (type === 'word') {
    const w = WORD_BY_JP.get(id);
    return w ? drawingFor(w.kanji, w.jp) : undefined;
  }
  return undefined;
}
