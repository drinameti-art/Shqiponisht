import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { C, F, isDark, R, ROMAJI, S } from '@/theme';

/**
 * The Shqiponisht Instagram page, opened by "NDIQ PËR MË SHUMË".
 * Check this is the right handle before release.
 */
export const INSTAGRAM_URL = 'https://www.instagram.com/shqiponisht/';

/** The brand's Japanese name, shown in the footer and under the logo. */
export const BRAND_JP = 'シュチッポン語';

/** Red dot + SHQIPONISHT on the left, an outlined pill label on the right (docs/BRAND.md §3). */
export function BrandHeader({ label, style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.header, style]} accessibilityRole="header">
      <View style={styles.brandRow}>
        <View style={styles.dot} />
        <Text style={styles.brand}>SHQIPONISHT</Text>
      </View>
      {label ? <OutlinePill>{label}</OutlinePill> : null}
    </View>
  );
}

/** Outlined pill label (KANJI, A E DINI?). */
export function OutlinePill({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.outline, style]}>
      <Text style={styles.outlineText}>{children}</Text>
    </View>
  );
}

/** シュチッポン語, bottom-left. */
export function BrandFooter({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.footer, style]}>
      <Text style={styles.footerText}>{BRAND_JP}</Text>
    </View>
  );
}

/** Filled pill badge, e.g. PJESA 3. */
export function PillBadge({
  children,
  tone = 'red',
  style,
}: {
  children: ReactNode;
  tone?: 'red' | 'ink';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: tone === 'red' ? C.red : C.panel }, style]}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

/**
 * Reading pill: black for the Japanese (kun) reading, red for the Chinese (on)
 * reading, with the small grey caption underneath.
 */
export function ReadingPill({ kana, romaji, kind }: { kana: string; romaji: string; kind: 'jp' | 'cn' }) {
  return (
    <View style={styles.readingWrap}>
      <View style={[styles.reading, { backgroundColor: kind === 'jp' ? C.panel : C.red }]}>
        <Text style={styles.readingKana}>{kana}</Text>
        <Text style={styles.readingDot}> · </Text>
        <Text style={styles.readingRomaji}>{romaji}</Text>
      </View>
      <Text style={styles.caption}>{kind === 'jp' ? 'leximi japonez' : 'leximi kinez'}</Text>
    </View>
  );
}

/** Red filled circle with a white letter (the consonant of a kana row). */
export function ConsonantCircle({
  letter,
  size = 56,
  style,
}: {
  letter: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text
        style={[styles.circleText, { fontSize: size * (letter.length > 2 ? 0.34 : letter.length > 1 ? 0.4 : 0.48) }]}>
        {letter}
      </Text>
    </View>
  );
}

/** Japanese text with the characters in `highlight` in red (the key kanji). */
export function KeyKanji({
  text,
  highlight,
  style,
}: {
  text: string;
  highlight?: string;
  style?: StyleProp<TextStyle>;
}) {
  if (!highlight) return <Text style={[styles.jp, style]}>{text}</Text>;
  return (
    <Text style={[styles.jp, style]}>
      {[...text].map((ch, i) => (
        <Text key={i} style={highlight.includes(ch) ? { color: C.red } : undefined}>
          {ch}
        </Text>
      ))}
    </Text>
  );
}

/** Word row: big Japanese (key kanji in red), red italic romaji, bold Albanian meaning, small grey note. */
export function WordRow({
  jp,
  highlight,
  romaji,
  meaning,
  note,
  right,
  style,
}: {
  jp: string;
  highlight?: string;
  romaji?: string;
  meaning: string;
  note?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wordRow, style]}>
      <View style={{ flex: 1 }}>
        <View style={styles.wordTop}>
          <KeyKanji text={jp} highlight={highlight} style={styles.wordJp} />
          {romaji ? <Text style={styles.wordRomaji}>{romaji}</Text> : null}
        </View>
        <Text style={styles.wordMeaning}>{meaning}</Text>
        {note ? <Text style={styles.wordNote}>{note}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** Black rounded box for a closing line ("Lexohen tamam si në shqip!"). */
export function Toast({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.toast, style]}>
      <Text style={styles.toastText}>{children}</Text>
    </View>
  );
}

/** Thin rounded card frame on cream. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const TOAST_BG = isDark ? C.panel : '#141414';
const TOAST_FG = isDark ? C.ink : '#F8F0E4';

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  brand: { fontFamily: F.bold, fontSize: 12, letterSpacing: 3, color: C.ink },
  outline: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  outlineText: { fontFamily: F.semibold, fontSize: 11, letterSpacing: 1.6, color: C.ink },
  footer: { marginTop: S.xl, alignItems: 'flex-start' },
  footerText: { fontFamily: F.jp, fontSize: 12, color: C.muted, letterSpacing: 1 },
  badge: { alignSelf: 'flex-start', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: F.bold, fontSize: 11.5, letterSpacing: 1.6, color: C.white },
  readingWrap: { alignItems: 'flex-start', gap: 4 },
  reading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  readingKana: { fontFamily: F.jp, fontSize: 17, color: C.white },
  readingDot: { fontFamily: F.regular, fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  readingRomaji: { fontFamily: F.mediumItalic, fontSize: 15, color: C.white },
  caption: { fontFamily: F.regular, fontSize: 11.5, color: C.muted, marginLeft: 4 },
  circle: { backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  circleText: { fontFamily: F.bold, color: C.white, marginTop: 2 },
  jp: { fontFamily: F.jp, color: C.ink },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.md,
    paddingHorizontal: S.lg,
  },
  wordTop: { flexDirection: 'row', alignItems: 'baseline', gap: S.sm, flexWrap: 'wrap' },
  wordJp: { fontSize: 26 },
  wordRomaji: { ...ROMAJI, fontSize: 15 },
  wordMeaning: { fontFamily: F.bold, fontSize: 15, color: C.ink, marginTop: 2 },
  wordNote: { fontFamily: F.regular, fontSize: 12.5, color: C.muted, marginTop: 1 },
  toast: {
    alignSelf: 'center',
    backgroundColor: TOAST_BG,
    borderRadius: R.md,
    paddingHorizontal: S.xl,
    paddingVertical: S.md,
  },
  toastText: { fontFamily: F.semibold, fontSize: 15.5, color: TOAST_FG, textAlign: 'center' },
  card: { backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.line, borderRadius: R.lg, padding: S.lg },
});
