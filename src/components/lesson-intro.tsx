import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DRAWINGS } from '@/data/drawings';
import { KANA, type Kana } from '@/data/kana';
import type { KanaLesson } from '@/data/lessons';
import type { Note } from '@/data/notes';
import { spellsDifferently } from '@/lib/albanian';
import { C, F, S } from '@/theme';

import { BrandHeader, ConsonantCircle, PillBadge, Toast, WordRow } from './brand';
import { Arrow, DrawPath, InkText, Reveal, step as at } from './brand-motion';
import { Button, SpeakButton } from './ui';

type IntroProps = { part: number; lessonTitle: string; onStart: () => void; onClose: () => void };

function Frame({
  onClose,
  children,
  footer,
}: {
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Mbyll mësimin" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <BrandHeader style={{ flex: 1 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  );
}

/**
 * A grammar note, told the way the reels tell it (docs/BRAND.md §5): pill
 * badge → title → (drawings) → each point in turn → example words → start.
 */
export function NoteIntro({ note, part, onStart, onClose }: IntroProps & { note: Note }) {
  const drawings = (note.drawings ?? []).filter((c) => DRAWINGS[c]);
  const pointsAt = 2 + (drawings.length ? 2 : 0);
  const examplesAt = pointsAt + note.points.length;
  return (
    <Frame
      onClose={onClose}
      footer={
        <Reveal delay={at(examplesAt + note.examples.length)}>
          <Button label="Fillo ushtrimet" onPress={onStart} />
        </Reveal>
      }>
      <Reveal>
        <PillBadge>PJESA {part}</PillBadge>
      </Reveal>
      <InkText delay={at(1)} style={styles.title}>
        {note.title}
      </InkText>
      {drawings.length > 0 && (
        <View style={styles.drawings}>
          {drawings.map((c, i) => (
            <Reveal key={c} delay={at(2 + i)} style={styles.drawing}>
              <DrawPath drawing={DRAWINGS[c]} size={112} delay={at(2 + i) + 200} />
              <Text style={styles.drawingChar}>{c}</Text>
            </Reveal>
          ))}
        </View>
      )}
      <View style={styles.points}>
        {note.points.map((p, i) => (
          <Reveal key={p} delay={at(pointsAt + i)} style={styles.point}>
            <View style={styles.bullet} />
            <Text style={styles.pointText}>{p}</Text>
          </Reveal>
        ))}
      </View>
      {note.examples.length > 0 && (
        <View style={styles.examples}>
          {note.examples.map((e, i) => (
            <Reveal key={e.jp} delay={at(examplesAt + i)}>
              <WordRow
                jp={e.jp}
                highlight={drawings.length ? e.jp : undefined}
                romaji={e.sq}
                meaning={e.meaning}
                note={e.jp !== e.kana ? e.kana : undefined}
                right={<SpeakButton text={e.jp} size={38} />}
              />
            </Reveal>
          ))}
        </View>
      )}
    </Frame>
  );
}

/** Consonant of a kana row as the reels write it: K for ka, SH for sha… (none for the vowel row). */
function rowConsonant(kana: Kana[]): string | null {
  const m = kana[0]?.sq.match(/^[^aeiou]+/);
  return m ? m[0].toUpperCase() : null;
}

/**
 * Opens a kana lesson like a reel: PJESA badge → title → the consonant in a
 * red circle → "K + zanore = rrokje" → the vowel row あ い う え お → arrow →
 * each syllable appearing in a red circle with its kana underneath → closing
 * toast.
 */
export function KanaIntro({ lesson, part, onStart, onClose }: IntroProps & { lesson: KanaLesson }) {
  const consonant = rowConsonant(lesson.kana);
  const vowels = KANA.filter((k) => k.row === 'a');
  const script = lesson.script;
  const different = lesson.kana.filter((k) => spellsDifferently(k.romaji));
  const sylAt = consonant ? 5 : 2;
  const closing =
    different.length === 0
      ? 'Lexohen tamam si në shqip!'
      : `Kujdes: ${different.map((k) => `${k[script]} = ${k.sq}`).join(', ')}`;
  return (
    <Frame
      onClose={onClose}
      footer={
        <Reveal delay={at(sylAt + 1) + lesson.kana.length * 220 + 300}>
          <Button label="Fillo ushtrimet" onPress={onStart} />
        </Reveal>
      }>
      <Reveal>
        <PillBadge>PJESA {part}</PillBadge>
      </Reveal>
      <InkText delay={at(1)} style={styles.title}>
        {lesson.title}
      </InkText>

      {consonant && (
        <>
          <Reveal delay={at(2)} style={styles.center}>
            <ConsonantCircle letter={consonant} size={88} />
          </Reveal>
          <InkText delay={at(3)} style={styles.formula}>
            {consonant} + zanore = rrokje
          </InkText>
          <Reveal delay={at(4)} style={styles.vowelRow}>
            {vowels.map((v) => (
              <View key={v.romaji} style={styles.vowel}>
                <Text style={styles.vowelKana}>{v[script]}</Text>
                <Text style={styles.vowelSq}>{v.sq}</Text>
              </View>
            ))}
          </Reveal>
          <Arrow delay={at(4) + 200} style={styles.arrowDown} />
        </>
      )}

      <View style={styles.sylRow}>
        {lesson.kana.map((k, i) => (
          <Reveal key={k.romaji} delay={at(sylAt) + i * 220} style={styles.syl}>
            <ConsonantCircle letter={k.sq} size={54} />
            <Text style={styles.sylKana}>{k[script]}</Text>
          </Reveal>
        ))}
      </View>

      <Reveal delay={at(sylAt) + lesson.kana.length * 220 + 100}>
        <Toast style={styles.toast}>{closing}</Toast>
      </Reveal>
    </Frame>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: { flexDirection: 'row', alignItems: 'center', gap: S.lg, paddingHorizontal: S.xl, paddingTop: S.md },
  body: { padding: S.xl, paddingTop: S.xl, maxWidth: 560, width: '100%', alignSelf: 'center', gap: S.lg },
  footer: { padding: S.xl, paddingTop: S.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontFamily: F.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  center: { alignItems: 'center', marginTop: S.sm },
  formula: { fontFamily: F.semibold, fontSize: 20, textAlign: 'center' },
  vowelRow: { flexDirection: 'row', justifyContent: 'center', gap: S.md },
  vowel: { alignItems: 'center', minWidth: 44 },
  vowelKana: { fontFamily: F.jp, fontSize: 30, color: C.faint },
  vowelSq: { fontFamily: F.italic, fontSize: 13, color: C.muted },
  arrowDown: { transform: [{ rotate: '90deg' }], alignSelf: 'center' },
  sylRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: S.md },
  syl: { alignItems: 'center', gap: 6, minWidth: 56 },
  sylKana: { fontFamily: F.jp, fontSize: 28, color: C.ink },
  toast: { marginTop: S.sm },
  drawings: { flexDirection: 'row', justifyContent: 'center', gap: S.xl },
  drawing: { alignItems: 'center' },
  drawingChar: { fontFamily: F.jp, fontSize: 30, color: C.red, marginTop: -4 },
  points: { gap: S.md },
  point: { flexDirection: 'row', gap: S.md },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, marginTop: 9 },
  pointText: { flex: 1, fontFamily: F.regular, fontSize: 16, lineHeight: 24, color: C.ink },
  examples: { gap: S.sm },
});
