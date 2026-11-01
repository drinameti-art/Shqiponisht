import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { AUDIO } from '@/data/audio.generated';

import { makeClipLookup } from './clips';
import { speakable } from './speakable';

const clipFor = makeClipLookup(AUDIO);

let player: AudioPlayer | null = null;
let finished: (() => void) | undefined;
let lastText = '';
let lastAt = 0;

function getPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null);
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        const done = finished;
        finished = undefined;
        done?.();
      }
    });
  }
  return player;
}

/** True when the text has a bundled recording (native speaker or neural voice). */
export function hasRecording(text: string): boolean {
  return clipFor(text) !== undefined;
}

/**
 * Says Japanese text. Plays the bundled recording when there is one — a
 * native Tokyo-accent speaker (Tofugu/WaniKani) or a neural voice (Style-Bert-VITS2 / Kokoro) — and
 * otherwise falls back to the phone's built-in Japanese voice. Tapping the
 * same text again within 4 seconds plays it more slowly.
 */
export function speakJapanese(text: string, onDone?: () => void): void {
  const now = Date.now();
  const slow = text === lastText && now - lastAt < 4000;
  lastText = text;
  lastAt = now;
  void Speech.stop();
  const previous = finished;
  finished = undefined;
  previous?.();

  const clip = clipFor(text);
  if (clip !== undefined) {
    try {
      const p = getPlayer();
      p.pause();
      p.replace(clip);
      p.setPlaybackRate(slow ? 0.7 : 1, 'high');
      finished = onDone;
      p.play();
      return;
    } catch {
      finished = undefined;
      // Fall through to the phone's voice.
    }
  }
  Speech.speak(speakable(text), {
    language: 'ja-JP',
    rate: slow ? 0.6 : 0.9,
    onDone,
    onStopped: onDone,
    onError: () => onDone?.(),
  });
}
