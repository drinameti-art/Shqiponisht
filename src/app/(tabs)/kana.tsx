import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpeakButton, WriteButton } from '@/components/ui';
import { KANA_GRID, KANA_TIPS, kanaByRomaji, VOICED_GRID, YOON_GRID, type Script } from '@/data/kana';
import { hasStrokes } from '@/lib/writing';
import { VOCAB_LESSONS } from '@/data/lessons';
import { spellsDifferently } from '@/lib/albanian';
import { BrandFooter, BrandHeader, ConsonantCircle, Toast, WordRow } from '@/components/brand';
import { BrushKanji, InkText, PracticeGrid, Reveal, step as at } from '@/components/brand-motion';
import { C, F, R, ROMAJI, S } from '@/theme';

const ALL_WORDS = VOCAB_LESSONS.flatMap((l) => l.words);

/** The consonant shown in the red circle (K for ka, SH for shi); none for vowels and ん. */
function consonantOf(sq: string): string | null {
  const m = sq.match(/^[^aeiouy]+/i);
  return m && sq !== 'n' ? m[0].toUpperCase() : null;
}

/** Up to two vocabulary words that contain the given kana, as study examples. */
function examplesFor(hiragana: string, katakana: string) {
  return ALL_WORDS.filter((w) => w.jp.includes(hiragana) || w.jp.includes(katakana)).slice(0, 2);
}

export default function KanaScreen() {
  const [script, setScript] = useState<Script>('hiragana');
  const [selected, setSelected] = useState('shi');
  const k = kanaByRomaji(selected);
  const examples = examplesFor(k.hiragana, k.katakana);
  const tip = KANA_TIPS[k.romaji] ?? KANA_TIPS[k.row];

  const renderGrid = (grid: (string | null)[][], reveal = false) => (
    <View style={styles.grid}>
      {grid.map((row, r) => (
        <Reveal key={r} delay={reveal ? Math.min(r * 110, 1100) : 0} duration={reveal ? 420 : 1} style={styles.gridRow}>
          {row.map((romaji, c) => {
            if (!romaji) return <View key={c} style={styles.cellEmpty} />;
            const cell = kanaByRomaji(romaji);
            const on = romaji === selected;
            return (
              <Pressable
                key={c}
                onPress={() => setSelected(romaji)}
                accessibilityRole="button"
                accessibilityLabel={`${cell[script]}, ${cell.sq}`}
                accessibilityState={{ selected: on }}
                style={[styles.cell, on && styles.cellOn]}>
                {spellsDifferently(romaji) && <View style={styles.dot} />}
                <Text style={styles.cellGlyph}>{cell[script]}</Text>
                <Text style={styles.cellReading}>{cell.sq}</Text>
              </Pressable>
            );
          })}
        </Reveal>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader label="KANA" style={{ marginBottom: S.lg }} />
        <View style={styles.header}>
          <Text style={styles.title}>Kana</Text>
          <View style={styles.seg} accessibilityRole="tablist">
            {(['hiragana', 'katakana'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setScript(s)}
                accessibilityRole="tab"
                accessibilityState={{ selected: script === s }}
                style={[styles.segBtn, script === s && styles.segBtnOn]}>
                <Text style={[styles.segText, script === s && { color: C.white }]}>
                  {s === 'hiragana' ? 'ひらがな' : 'カタカナ'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* key: picking another kana replays the sequence (docs/BRAND.md §5). */}
        <View key={`${script}-${k.romaji}`} style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardTop}>
            {hasStrokes(k[script]) ? (
              <BrushKanji char={k[script]} size={116} />
            ) : (
              <PracticeGrid size={116}>
                <View style={styles.bigCenter}>
                  <Text style={styles.bigText}>{k[script]}</Text>
                </View>
              </PracticeGrid>
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Reveal delay={at(1)} style={styles.readingRow}>
                {consonantOf(k.sq) ? <ConsonantCircle letter={consonantOf(k.sq)!} size={34} /> : null}
                <Text style={styles.reading}>{k.sq}</Text>
                <SpeakButton text={k[script]} size={38} />
              </Reveal>
              {k.romaji !== k.sq && (
                <InkText delay={at(2)} color={C.red} style={styles.romaji}>
                  romaji: {k.romaji}
                </InkText>
              )}
              <InkText delay={at(3)} color={C.muted} style={styles.other}>
                {script === 'hiragana' ? 'katakana' : 'hiragana'}: {script === 'hiragana' ? k.katakana : k.hiragana}
              </InkText>
            </View>
          </View>
          {tip ? (
            <Reveal delay={at(4)}>
              <Toast style={styles.tip}>{tip}</Toast>
            </Reveal>
          ) : null}
          {hasStrokes(k[script]) && (
            <Reveal delay={at(5)}>
              <WriteButton char={k[script]} />
            </Reveal>
          )}
          {examples.map((w, i) => (
            <Reveal key={w.jp} delay={at(6 + i)}>
              <WordRow jp={w.jp} highlight={k[script]} romaji={w.sq} meaning={w.meaning} />
            </Reveal>
          ))}
        </View>

        {renderGrid(KANA_GRID, true)}
        <Text style={styles.section}>Me ゛ dhe ゜</Text>
        {renderGrid(VOICED_GRID)}
        <Text style={styles.section}>Kombinimet (ゃ ゅ ょ)</Text>
        {renderGrid(YOON_GRID)}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Në shqip shkruhet ndryshe nga romaji</Text>
        </View>
        <BrandFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5 },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.pill, padding: 3 },
  segBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: R.pill },
  segBtnOn: { backgroundColor: C.panel },
  segText: { fontSize: 13, fontFamily: F.semibold, color: C.muted },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.lg,
    gap: S.md,
  },
  bigCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: { flexDirection: 'row', gap: S.lg, alignItems: 'center' },
  bigText: { fontFamily: F.jp, fontSize: 60, color: C.ink },
  readingRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  reading: { flex: 1, fontSize: 30, fontFamily: F.bold, color: C.ink },
  romaji: { ...ROMAJI, fontSize: 16 },
  other: { fontFamily: F.regular, fontSize: 13 },
  tip: { alignSelf: 'stretch' },
  grid: { marginTop: S.lg, gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 76,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: { flex: 1 },
  cellOn: { borderColor: C.red, backgroundColor: C.redSoft },
  cellGlyph: { fontFamily: F.jp, fontSize: 22, color: C.ink },
  cellReading: { fontSize: 11, color: C.muted, fontFamily: F.italic },
  dot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  section: {
    fontSize: 12,
    fontFamily: F.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: S.xl,
    marginBottom: S.sm,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.md },
  legendDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  legendText: { fontFamily: F.regular, fontSize: 12.5, color: C.muted },
});
