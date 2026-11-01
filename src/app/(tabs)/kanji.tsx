import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpeakButton, WriteButton } from '@/components/ui';
import { useProgress } from '@/lib/progress-context';
import { KANJI_GROUPS, kanjiByChar, kanjiInGroup } from '@/data/kanji';
import { BrandFooter, BrandHeader, ReadingPill, WordRow } from '@/components/brand';
import { BrushKanji, DrawPath, InkText, Reveal, step as at } from '@/components/brand-motion';
import { DRAWINGS } from '@/data/drawings';
import { C, F, R, S } from '@/theme';

export default function KanjiScreen() {
  const { plus } = useProgress();
  const [selected, setSelected] = useState('山');
  const k = kanjiByChar(selected);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader label="KANJI" style={{ marginBottom: S.lg }} />
        <Text style={styles.title}>Kanji</Text>
        <Text style={styles.intro}>
          Çdo kanji ka kuptim dhe zakonisht dy lexime: on (nga kinezishtja, me katakana) dhe kun (japonez, me hiragana).
        </Text>

        {/* key: picking another kanji replays the sequence (docs/BRAND.md §5). */}
        <View key={k.char} style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardTop}>
            <BrushKanji
              char={k.char}
              size={128}
              color={C.ink}
              fallback={<Text style={styles.bigText}>{k.char}</Text>}
            />
            <View style={{ flex: 1 }}>
              <InkText delay={at(1)} style={styles.meaning}>
                {k.meaning}
              </InkText>
              <InkText delay={at(2)} color={C.muted} style={styles.strokes}>
                {k.strokes} vija
              </InkText>
            </View>
          </View>
          {DRAWINGS[k.char] && (
            <Reveal delay={at(3)} style={styles.drawing}>
              <DrawPath drawing={DRAWINGS[k.char]} size={104} delay={at(3) + 200} />
              <Text style={styles.drawingNote}>{k.char} lindi si vizatim</Text>
            </Reveal>
          )}
          <Reveal delay={at(3)} style={styles.readings}>
            <ReadingPill kind="jp" kana={k.kun.kana} romaji={k.kun.sq} />
            <ReadingPill kind="cn" kana={k.on.kana} romaji={k.on.sq} />
          </Reveal>
          <Reveal delay={at(4)}>
            <WriteButton char={k.char} />
          </Reveal>
          <View style={styles.examples}>
            {k.examples.map((e, i) => (
              <Reveal key={e.jp} delay={at(5 + i)}>
                <WordRow
                  jp={e.jp}
                  highlight={k.char}
                  romaji={e.sq}
                  meaning={e.meaning}
                  note={e.kana}
                  right={<SpeakButton text={e.jp} size={36} />}
                />
              </Reveal>
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
        <BrandFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5 },
  intro: { fontFamily: F.regular, fontSize: 14, lineHeight: 20, color: C.muted, marginTop: S.xs },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.lg,
    gap: S.md,
  },
  cardTop: { flexDirection: 'row', gap: S.lg, alignItems: 'center' },
  bigText: { fontFamily: F.jp, fontSize: 68, color: C.ink },
  meaning: { fontSize: 24, fontFamily: F.bold, color: C.ink, lineHeight: 30 },
  strokes: { fontFamily: F.regular, fontSize: 13, color: C.muted, marginTop: 4 },
  drawing: { alignItems: 'center' },
  drawingNote: { fontFamily: F.italic, fontSize: 12.5, color: C.muted },
  readings: { flexDirection: 'row', gap: S.lg, flexWrap: 'wrap' },
  examples: { gap: S.sm },
  section: {
    fontSize: 12,
    fontFamily: F.bold,
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
  plusBadgeText: { color: C.white, fontSize: 10.5, fontFamily: F.bold, letterSpacing: 1 },
  cellChar: { fontFamily: F.jp, fontSize: 24, color: C.ink },
  cellMeaning: { fontFamily: F.regular, fontSize: 10.5, color: C.muted },
});
