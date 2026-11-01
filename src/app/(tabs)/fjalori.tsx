import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpeakButton } from '@/components/ui';
import { VOCAB_LESSONS, type Word } from '@/data/lessons';
import { wordSay } from '@/lib/sayables';
import { BrandFooter, BrandHeader } from '@/components/brand';
import { C, F, R, ROMAJI, S } from '@/theme';

/** Lowercases and strips Albanian diacritics so „ç“ matches „c“ and „ë“ matches „e“. */
function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function matches(w: Word, q: string): boolean {
  if (!q) return true;
  return [w.jp, w.romaji, w.sq, w.meaning, w.kanji ?? ''].some((field) => fold(field).includes(q));
}

export default function Vocabulary() {
  const [query, setQuery] = useState('');
  const sections = useMemo(() => {
    const q = fold(query.trim());
    return VOCAB_LESSONS.map((l) => ({ title: l.title, key: l.id, data: l.words.filter((w) => matches(w, q)) })).filter(
      (s) => s.data.length > 0,
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <BrandHeader label="FJALORI" style={{ marginBottom: S.lg }} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>Fjalori</Text>
          <Pressable
            onPress={() => router.push('/flashcards')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cardsBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="albums" size={17} color={C.white} />
            <Text style={styles.cardsText}>Kartat</Text>
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Kërko: mace, 猫, ねこ, neko…"
            placeholderTextColor={C.muted}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(w) => w.jp}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListFooterComponent={<BrandFooter />}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jp}>
                {item.kanji ?? item.jp}
                {item.kanji ? <Text style={styles.kana}>{`  ${item.jp}`}</Text> : null}
              </Text>
              <Text style={styles.reading}>
                {item.sq}
                {item.sq !== item.romaji ? <Text style={styles.romaji}>{`  ·  ${item.romaji}`}</Text> : null}
              </Text>
            </View>
            <Text style={styles.meaning}>{item.meaning}</Text>
            <SpeakButton text={wordSay(item)} size={34} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Asnjë fjalë nuk përputhet me „{query}“.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  head: { paddingHorizontal: S.xl, paddingTop: S.xl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.red,
    borderRadius: R.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cardsText: { color: C.white, fontSize: 14.5, fontFamily: F.bold },
  title: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginTop: S.md,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.md,
  },
  input: { flex: 1, paddingVertical: 11, fontFamily: F.regular, fontSize: 16, color: C.ink },
  list: { paddingHorizontal: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  section: {
    fontSize: 12,
    fontFamily: F.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: S.xl,
    marginBottom: S.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.md,
    marginBottom: S.sm,
  },
  jp: { fontSize: 19, fontFamily: F.jp, color: C.ink },
  kana: { fontSize: 14, fontFamily: F.jp, color: C.muted },
  reading: { fontSize: 13, color: C.red, fontFamily: F.semibold, marginTop: 2 },
  romaji: { ...ROMAJI, fontSize: 13 },
  meaning: { fontFamily: F.semibold, fontSize: 14.5, color: C.ink, maxWidth: '45%', textAlign: 'right' },
  empty: { textAlign: 'center', color: C.muted, marginTop: S.xxl },
});
