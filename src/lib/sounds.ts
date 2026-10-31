import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  correct: require('@/assets/sounds/correct.wav'),
  wrong: require('@/assets/sounds/wrong.wav'),
  complete: require('@/assets/sounds/complete.wav'),
  retry: require('@/assets/sounds/retry.wav'),
  stroke: require('@/assets/sounds/stroke.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

/**
 * One player per effect, created on first use and kept for the app's whole
 * life (they are tiny), so a replay starts instantly.
 */
const players = new Map<SoundName, AudioPlayer>();
let configured = false;

function player(name: SoundName): AudioPlayer {
  let p = players.get(name);
  if (!p) {
    p = createAudioPlayer(SOURCES[name]);
    p.volume = name === 'stroke' ? 0.5 : 0.8;
    players.set(name, p);
  }
  return p;
}

/**
 * Plays a short effect. Effects mix with the learner's own music instead of
 * stopping it, and stay quiet when the phone is on silent. Audio errors are
 * swallowed: a missing sound must never break a lesson.
 */
export function playSound(name: SoundName): void {
  try {
    if (!configured) {
      configured = true;
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    const p = player(name);
    void p.seekTo(0);
    p.play();
  } catch {
    // Ignore: sound is a nice-to-have.
  }
}
