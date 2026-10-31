import { Appearance, Platform } from 'react-native';

/**
 * True when the phone is in dark mode at launch. The palette is chosen once
 * at start-up (StyleSheets are created from it), so switching the system
 * setting takes effect the next time the app opens.
 */
export const isDark = Appearance.getColorScheme() === 'dark';

/** Brand colors, taken from the Shqiponisht logo (red, black, cream). */
const LIGHT = {
  red: '#e41e20',
  /** Bottom edge of red buttons. */
  redEdge: '#a5141a',
  /** Red text on light-red backgrounds (wrong-answer feedback, errors). */
  redText: '#a5141a',
  redSoft: '#fde3e1',
  /** Primary text. */
  ink: '#151515',
  /** Screen background. */
  cream: '#f7f1e5',
  /** Cards, inputs, tab bar. */
  paper: '#fffdf8',
  /** Segmented controls and quiet fills. */
  card: '#f1e9da',
  line: '#e6dccb',
  muted: '#756d64',
  /** Dark detail cards (kana, kanji, Plus banner) and selected segments. */
  panel: '#151515',
  /** Text on `panel`. */
  onPanel: '#f7f1e5',
  green: '#2f8f5b',
  greenEdge: '#1f6640',
  greenText: '#1f6640',
  greenSoft: '#dcf2e4',
  greenLine: '#bfe3cc',
  gold: '#e2a72e',
  goldSoft: '#fff1d6',
  goldLine: '#f1d79a',
  goldText: '#a8690a',
  /** Progress-bar track. */
  track: '#e9e0cf',
  /** Faint model strokes on the writing pad. */
  guide: '#e9dfcd',
  /** Selected (not yet checked) quiz option. */
  selectBg: '#eef3fe',
  selectLine: '#5b8def',
  /** Back of a flashcard. */
  cardBack: '#fff8f2',
  white: '#ffffff',
};

const DARK: typeof LIGHT = {
  red: '#ef3537',
  redEdge: '#9c1418',
  redText: '#ff9b9c',
  redSoft: '#3d1a1b',
  ink: '#f3ece0',
  cream: '#141210',
  paper: '#1f1c19',
  card: '#2a2622',
  line: '#3a342e',
  muted: '#a79d92',
  panel: '#2e2925',
  onPanel: '#f7f1e5',
  green: '#3aa36a',
  greenEdge: '#1f6640',
  greenText: '#86d6a6',
  greenSoft: '#173022',
  greenLine: '#2b5a3d',
  gold: '#e2a72e',
  goldSoft: '#33290f',
  goldLine: '#5c4718',
  goldText: '#f0c463',
  track: '#332e29',
  guide: '#3a342e',
  selectBg: '#1b2740',
  selectLine: '#6d9cf5',
  cardBack: '#26201c',
  white: '#ffffff',
};

export const C = isDark ? DARK : LIGHT;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const R = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const F = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
} as const;
