import * as Speech from 'expo-speech';

import { speakable } from './speakable';

let lastText = '';
let lastAt = 0;

/**
 * Says Japanese text with the phone's built-in Japanese voice. Tapping the
 * same text again within 4 seconds repeats it more slowly, so a learner can
 * catch every sound.
 */
export function speakJapanese(text: string, onDone?: () => void): void {
  const now = Date.now();
  const slow = text === lastText && now - lastAt < 4000;
  lastText = text;
  lastAt = now;
  void Speech.stop();
  Speech.speak(speakable(text), {
    language: 'ja-JP',
    rate: slow ? 0.6 : 0.9,
    onDone,
    onStopped: onDone,
    onError: () => onDone?.(),
  });
}
