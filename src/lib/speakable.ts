/** Strips learner spacing and turns full stops into pauses, so voices don't read them aloud. */
export function speakable(text: string): string {
  return text
    .replace(/[\s　]+/g, '')
    .replace(/。/g, '、')
    .replace(/、$/, '');
}
