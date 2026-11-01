/**
 * Line drawings that draw themselves line by line (docs/BRAND.md §5), in a
 * 100 × 100 box. `accent` lines are drawn in Shqiponisht red, the rest in ink.
 */
export type Drawing = { paths: { d: string; accent?: boolean }[] };

/** 花 hana — a flower on a stem with two leaves. */
export const FLOWER: Drawing = {
  paths: [
    { d: 'M50 92 C50 78 49 66 50 50' },
    { d: 'M50 76 C40 70 32 72 28 64 C38 62 46 66 50 74' },
    { d: 'M50 68 C60 62 68 64 72 56 C62 54 54 58 50 66' },
    { d: 'M50 40 C40 40 34 30 40 22 C46 16 50 26 50 30', accent: true },
    { d: 'M50 30 C50 22 56 14 63 20 C68 26 62 38 50 40', accent: true },
    { d: 'M50 40 C42 46 32 44 32 36 C34 30 44 32 50 40', accent: true },
    { d: 'M50 40 C58 46 68 44 68 36 C66 30 56 32 50 40', accent: true },
    { d: 'M47 37 C47 34 53 34 53 37 C53 40 47 40 47 37 Z' },
  ],
};

/** 雨 ame — a rain cloud with falling drops. */
export const RAIN_CLOUD: Drawing = {
  paths: [
    { d: 'M24 54 C14 54 12 40 22 37 C22 26 36 22 42 30 C46 18 64 18 68 30 C80 28 88 40 80 48 C80 54 74 56 68 54 Z' },
    { d: 'M30 64 L26 74', accent: true },
    { d: 'M46 64 L42 74', accent: true },
    { d: 'M62 64 L58 74', accent: true },
    { d: 'M38 78 L34 88', accent: true },
    { d: 'M54 78 L50 88', accent: true },
    { d: 'M70 78 L66 88', accent: true },
  ],
};

/** Kanji that come with a drawing of what they mean. */
export const DRAWINGS: Record<string, Drawing> = { 雨: RAIN_CLOUD, 花: FLOWER };
