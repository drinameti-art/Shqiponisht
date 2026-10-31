import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KANA_GRID, KANA_TIPS, kanaByRomaji, type Script } from '@/data/kana';
import { VOCAB_LESSONS } from '@/data/lessons';
import { spellsDifferently } from '@/lib/albanian';
import { C, F, R, S } from '@/theme';

const ALL_WORDS = VOCAB_LESSONS.flatMap((l) => l.words);

/** Up to two vocabulary words that contain the given kana, as study examples. */
function examplesFor(hiragana: string, katakana: string) {
  return ALL_WORDS.filter((w) => w.jp.includes(hiragana) || w.jp.includes(katakana)).slice(0, 2);
}

export default function KanaScreen() {
  const [script, setScript] = useState<Script>('hiragana');
  const [selected, setSelected] = useState('shi');
  const k = kanaByRomaji(selected);
  const examples = examplesFor(k.hiragana, k.katakana);
  const tip = KANA_TIPS[k.romaji];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardTop}>
            <View style={styles.big}>
              <Text style={styles.bigText}>{k[script]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reading}>{k.sq}</Text>
              <Text style={styles.romaji}>romaji: {k.romaji}</Text>
              <Text style={styles.other}>
                {script === 'hiragana' ? 'katakana' : 'hiragana'}: {script === 'hiragana' ? k.katakana : k.hiragana}
              </Text>
            </View>
          </View>
          {tip ? <Text style={styles.tip}>{tip}</Text> : null}
          {examples.length > 0 && (
            <View style={styles.examples}>
              {examples.map((w) => (
                <View key={w.jp} style={styles.example}>
                  <Text style={styles.exampleJp}>{w.jp}</Text>
                  <Text style={styles.exampleSub}>
                    {w.sq} · {w.meaning}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.grid}>
          {KANA_GRID.map((row, r) => (
            <View key={r} style={styles.gridRow}>
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
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Në shqip shkruhet ndryshe nga romaji</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.pill, padding: 3 },
  segBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: R.pill },
  segBtnOn: { backgroundColor: C.ink },
  segText: { fontSize: 13, fontWeight: '600', color: C.muted },
  card: { backgroundColor: C.ink, borderRadius: R.lg, padding: S.lg, marginTop: S.lg, gap: S.md },
  cardTop: { flexDirection: 'row', gap: S.lg, alignItems: 'center' },
  big: {
    width: 96,
    height: 96,
    borderRadius: R.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigText: { fontSize: 60, color: C.cream },
  reading: { fontSize: 30, fontWeight: '800', color: C.cream },
  romaji: { fontSize: 13, color: 'rgba(247,241,229,0.6)', fontFamily: F.mono, marginTop: 2 },
  other: { fontSize: 13, color: 'rgba(247,241,229,0.6)', marginTop: 2 },
  tip: { fontSize: 14, lineHeight: 20, color: 'rgba(247,241,229,0.85)' },
  examples: { flexDirection: 'row', gap: S.sm },
  example: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: R.sm, padding: S.sm },
  exampleJp: { fontSize: 17, fontWeight: '600', color: C.cream },
  exampleSub: { fontSize: 12, color: 'rgba(247,241,229,0.65)', marginTop: 2 },
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
  cellGlyph: { fontSize: 22, color: C.ink },
  cellReading: { fontSize: 11, color: C.muted, fontFamily: F.mono },
  dot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  legend: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.md },
  legendDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  legendText: { fontSize: 12.5, color: C.muted },
});
