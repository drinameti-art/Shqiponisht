import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpeakButton, WriteButton } from '@/components/ui';
import { useProgress } from '@/lib/progress-context';
import { KANJI_GROUPS, kanjiByChar, kanjiInGroup, type Reading } from '@/data/kanji';
import { C, F, R, S } from '@/theme';

export default function KanjiScreen() {
  const { plus } = useProgress();
  const [selected, setSelected] = useState('山');
  const k = kanjiByChar(selected);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kanji</Text>
        <Text style={styles.intro}>
          Çdo kanji ka kuptim dhe zakonisht dy lexime: on (nga kinezishtja, me katakana) dhe kun (japonez, me hiragana).
        </Text>

        <View style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardTop}>
            <View style={styles.big}>
              <Text style={styles.bigText}>{k.char}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.meaning}>{k.meaning}</Text>
              <Text style={styles.strokes}>{k.strokes} vija</Text>
            </View>
          </View>
          <View style={styles.readings}>
            <ReadingBox label="on" reading={k.on} />
            <ReadingBox label="kun" reading={k.kun} />
          </View>
          <WriteButton char={k.char} />
          <View style={styles.examples}>
            {k.examples.map((e) => (
              <View key={e.jp} style={styles.example}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exampleJp}>{e.jp}</Text>
                  <Text style={styles.exampleSub}>
                    {e.kana} · {e.sq}
                  </Text>
                  <Text style={styles.exampleMeaning}>{e.meaning}</Text>
                </View>
                <SpeakButton text={e.jp} tone="dark" size={36} />
              </View>
            ))}
          </View>
        </View>

        {KANJI_GROUPS.map((g) => {
          const locked = !!g.premium && !plus;
          return (
            <View key={g.id}>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>{g.title}</Text>
                {g.premium && (
                  <View style={styles.plusBadge}>
                    <Text style={styles.plusBadgeText}>PLUS</Text>
                  </View>
                )}
              </View>
              <View style={styles.grid}>
                {kanjiInGroup(g.id).map((x) => {
                  const on = x.char === selected;
                  return (
                    <Pressable
                      key={x.char}
                      onPress={() => (locked ? router.push('/plus') : setSelected(x.char))}
                      accessibilityRole="button"
                      accessibilityLabel={`${x.char}, ${locked ? 'Plus' : x.meaning}`}
                      accessibilityState={{ selected: on }}
                      style={[styles.cell, on && styles.cellOn, locked && styles.cellLocked]}>
                      {locked && <Ionicons name="lock-closed" size={10} color={C.muted} style={styles.lock} />}
                      <Text style={styles.cellChar}>{x.char}</Text>
                      <Text style={styles.cellMeaning} numberOfLines={1}>
                        {x.meaning.split(';')[0]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadingBox({ label, reading }: { label: string; reading: Reading }) {
  return (
    <View style={styles.reading}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingKana}>{reading.kana}</Text>
      <Text style={styles.readingSq}>
        {reading.sq}
        {reading.sq !== reading.romaji ? <Text style={styles.readingRomaji}>{`  ${reading.romaji}`}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  intro: { fontSize: 14, lineHeight: 20, color: C.muted, marginTop: S.xs },
  card: { backgroundColor: C.panel, borderRadius: R.lg, padding: S.lg, marginTop: S.lg, gap: S.md },
  cardTop: { flexDirection: 'row', gap: S.lg, alignItems: 'center' },
  big: {
    width: 104,
    height: 104,
    borderRadius: R.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigText: { fontSize: 68, color: C.onPanel },
  meaning: { fontSize: 26, fontWeight: '800', color: C.onPanel },
  strokes: { fontSize: 13, color: 'rgba(247,241,229,0.6)', marginTop: 4 },
  readings: { flexDirection: 'row', gap: S.sm },
  reading: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: R.sm, padding: S.sm },
  readingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#ff8a8c',
  },
  readingKana: { fontSize: 18, color: C.onPanel, marginTop: 2 },
  readingSq: { fontSize: 14, fontWeight: '700', color: C.onPanel },
  readingRomaji: { fontSize: 12, fontWeight: '400', color: 'rgba(247,241,229,0.55)', fontFamily: F.mono },
  examples: { gap: S.sm },
  example: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: R.sm,
    padding: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  exampleJp: { fontSize: 18, fontWeight: '600', color: C.onPanel },
  exampleSub: { fontSize: 12.5, color: 'rgba(247,241,229,0.7)', marginTop: 2 },
  exampleMeaning: { fontSize: 13.5, color: C.onPanel, marginTop: 2 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: S.xl,
    marginBottom: S.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: '18.5%',
    aspectRatio: 1,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cellOn: { borderColor: C.red, backgroundColor: C.redSoft },
  cellLocked: { opacity: 0.55 },
  lock: { position: 'absolute', top: 4, right: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  plusBadge: {
    backgroundColor: C.gold,
    borderRadius: R.pill,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: S.md,
  },
  plusBadgeText: { color: C.white, fontSize: 10.5, fontWeight: '800', letterSpacing: 1 },
  cellChar: { fontSize: 24, color: C.ink },
  cellMeaning: { fontSize: 10.5, color: C.muted },
});
