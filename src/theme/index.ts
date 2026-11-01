import { Appearance, Platform } from 'react-native';

/**
 * True when the phone is in dark mode at launch. The palette is chosen once
 * at start-up (StyleSheets are created from it), so switching the system
 * setting takes effect the next time the app opens.
 */
export const isDark = Appearance.getColorScheme() === 'dark';

/** Brand colors from docs/BRAND.md (Shqiponisht Instagram): cream, ink, Shqiponisht red, warm grey. */
const LIGHT = {
  red: '#E42020',
  /** Pressed / darker edge of red buttons. */
  redEdge: '#B3161A',
  /** Red for small text on light backgrounds (wrong-answer feedback, errors). */
  redText: '#BF1A1C',
  redSoft: '#FBE1DC',
  /** Primary text (ink). */
  ink: '#141414',
  /** Screen background (cream). */
  cream: '#F8F0E4',
  /** Cards and inputs: a touch lighter than the cream, framed by `line`. */
  paper: '#FCF8F1',
  /** Segmented controls and quiet fills. */
  card: '#EFE6D8',
  /** Thin card frames, dividers, inactive items (warm grey). */
  line: '#D0C8BC',
  /** Secondary text. */
  muted: '#756C62',
  /** Faded hiragana and the first, light-grey state of revealed text. */
  faint: '#D0C8BC',
  /** Dark detail cards (kana, kanji, comparisons, Plus banner) and selected segments. */
  panel: '#141414',
  /** Text on `panel`. */
  onPanel: '#F8F0E4',
  green: '#2F8F5B',
  greenEdge: '#1F6640',
  greenText: '#1F6640',
  greenSoft: '#DCF2E4',
  greenLine: '#BFE3CC',
  gold: '#E2A72E',
  goldSoft: '#FFF1D6',
  goldLine: '#F1D79A',
  goldText: '#A8690A',
  /** Progress-bar track. */
  track: '#E6DDCF',
  /** Faint model strokes and the 4-square practice grid. */
  guide: '#E2D9CB',
  /** Selected (not yet checked) quiz option. */
  selectBg: '#FBE1DC',
  selectLine: '#E42020',
  /** Back of a flashcard. */
  cardBack: '#FCF8F1',
  white: '#FFFFFF',
};

const DARK: typeof LIGHT = {
  red: '#E42020',
  redEdge: '#9C1418',
  redText: '#FF8E8C',
  redSoft: '#3A1A1A',
  ink: '#FFFFFF',
  cream: '#141414',
  paper: '#24201C',
  card: '#2E2924',
  line: '#3D3730',
  muted: '#A8A097',
  faint: '#4D463F',
  panel: '#2E2924',
  onPanel: '#FFFFFF',
  green: '#3AA36A',
  greenEdge: '#1F6640',
  greenText: '#86D6A6',
  greenSoft: '#173022',
  greenLine: '#2B5A3D',
  gold: '#E2A72E',
  goldSoft: '#33290F',
  goldLine: '#5C4718',
  goldText: '#F0C463',
  track: '#332E29',
  guide: '#3D3730',
  selectBg: '#3A1A1A',
  selectLine: '#E42020',
  cardBack: '#24201C',
  white: '#FFFFFF',
};

export const C = isDark ? DARK : LIGHT;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const R = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const F = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
  /** Poppins for Latin / Albanian text (loaded in src/app/_layout.tsx). */
  regular: 'Poppins_400Regular',
  italic: 'Poppins_400Regular_Italic',
  medium: 'Poppins_500Medium',
  mediumItalic: 'Poppins_500Medium_Italic',
  semibold: 'Poppins_600SemiBold',
  semiboldItalic: 'Poppins_600SemiBold_Italic',
  bold: 'Poppins_700Bold',
  /** Noto Sans JP Bold for kana and kanji (subset: scripts/fonts/subset.sh). */
  jp: 'NotoSansJP_700Bold',
} as const;

/** Romaji is red italic (docs/BRAND.md). */
export const ROMAJI = { fontFamily: F.mediumItalic, color: C.red } as const;
