import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { legalDoc, type LegalDocId, type LegalLang } from '@/lib/legal';
import { C, R, S } from '@/theme';

const URL = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

/** Renders a paragraph with its links and email addresses tappable. */
function Paragraph({ text }: { text: string }) {
  const parts = text.split(URL);
  return (
    <Text style={styles.p}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            style={styles.link}
            onPress={() =>
              void Linking.openURL(part.includes('@') && !part.startsWith('http') ? `mailto:${part}` : part)
            }>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const id: LegalDocId = doc === 'terms' ? 'terms' : 'privacy';
  const [lang, setLang] = useState<LegalLang>('sq');
  const content = legalDoc(id, lang);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Mbyll"
          hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <View style={styles.seg} accessibilityRole="tablist">
          {(['sq', 'en'] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              accessibilityRole="tab"
              accessibilityState={{ selected: lang === l }}
              style={[styles.segBtn, lang === l && styles.segOn]}>
              <Text style={[styles.segText, lang === l && { color: C.white }]}>{l === 'sq' ? 'Shqip' : 'English'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.updated}>
          {lang === 'sq' ? 'Përditësuar më' : 'Last updated'}: {content.updated}
        </Text>
        {content.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text style={styles.h}>{s.heading}</Text>
            {s.body.map((b, i) => (
              <Paragraph key={i} text={b} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    paddingTop: S.md,
  },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.pill, padding: 3 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill },
  segOn: { backgroundColor: C.panel },
  segText: { fontSize: 13, fontWeight: '700', color: C.muted },
  body: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.4 },
  updated: { fontSize: 13, color: C.muted, marginTop: 4 },
  section: { marginTop: S.xl, gap: S.sm },
  h: { fontSize: 17, fontWeight: '800', color: C.ink },
  p: { fontSize: 15, lineHeight: 22, color: C.ink },
  link: { color: C.red, textDecorationLine: 'underline' },
});
