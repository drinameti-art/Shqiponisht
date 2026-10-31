import { Platform } from 'react-native';

/** Brand colors, taken from the Shqiponisht logo. */
export const C = {
  red: '#e41e20',
  redDark: '#a5141a',
  redSoft: '#fde3e1',
  ink: '#151515',
  cream: '#f7f1e5',
  paper: '#fffdf8',
  card: '#f1e9da',
  line: '#e6dccb',
  muted: '#756d64',
  green: '#2f8f5b',
  greenDark: '#1f6640',
  greenSoft: '#dcf2e4',
  gold: '#e2a72e',
  goldSoft: '#fff1d6',
  white: '#ffffff',
} as const;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const R = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const F = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
} as const;
