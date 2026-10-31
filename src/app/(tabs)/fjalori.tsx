import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VOCAB_LESSONS, type Word } from '@/data/lessons';
import { C, F, R, S } from '@/theme';

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
        <Text style={styles.title}>Fjalori</Text>
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
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
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
  input: { flex: 1, paddingVertical: 11, fontSize: 16, color: C.ink },
  list: { paddingHorizontal: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  section: {
    fontSize: 12,
    fontWeight: '700',
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
  jp: { fontSize: 19, fontWeight: '600', color: C.ink },
  kana: { fontSize: 14, fontWeight: '400', color: C.muted },
  reading: { fontSize: 13, color: C.red, fontWeight: '600', marginTop: 2 },
  romaji: { color: C.muted, fontWeight: '400', fontFamily: F.mono, fontSize: 12 },
  meaning: { fontSize: 14.5, color: C.ink, maxWidth: '45%', textAlign: 'right' },
  empty: { textAlign: 'center', color: C.muted, marginTop: S.xxl },
});
