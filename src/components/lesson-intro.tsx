import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DRAWINGS, drawingFor, type Drawing } from '@/data/drawings';
import { KANA, type Kana } from '@/data/kana';
import type { KanaLesson, KanjiLesson, VocabLesson } from '@/data/lessons';
import type { Note } from '@/data/notes';
import { spellsDifferently } from '@/lib/albanian';
import { C, F, S } from '@/theme';

import { BrandHeader, ConsonantCircle, PillBadge, Toast, WordRow } from './brand';
import { Arrow, DrawingIcon, DrawPath, InkText, Reveal, step as at } from './brand-motion';
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

type IntroItem = {
  key: string;
  jp: string;
  highlight?: string;
  romaji: string;
  meaning: string;
  note?: string;
  drawing?: Drawing;
};

/** What a word or kanji lesson teaches, with its picture when it has one. */
function introItems(lesson: VocabLesson | KanjiLesson): IntroItem[] {
  if (lesson.kind === 'kanji') {
    return lesson.kanji.map((k) => ({
      key: k.char,
      jp: k.char,
      highlight: k.char,
      romaji: k.kun.sq || k.on.sq,
      meaning: k.meaning.split(';')[0],
      note: `${k.kun.kana} · ${k.on.kana}`,
      drawing: drawingFor(k.char),
    }));
  }
  return lesson.words.map((w) => ({
    key: w.jp,
    jp: w.kanji ?? w.jp,
    romaji: w.sq,
    meaning: w.meaning,
    note: w.kanji ? w.jp : undefined,
    drawing: drawingFor(w.kanji, w.jp),
  }));
}

/** Gap between words in the intro: slower for pictures, which draw themselves. */
const ITEM_MS = 360;

/**
 * Opens a word or kanji lesson like a reel: PJESA badge → title → each word
 * in turn, its picture drawing itself next to the word (key kanji in red,
 * red italic reading, bold meaning) → start (docs/BRAND.md §5).
 */
export function WordsIntro({ lesson, part, onStart, onClose }: IntroProps & { lesson: VocabLesson | KanjiLesson }) {
  const items = introItems(lesson);
  const start = at(2);
  return (
    <Frame
      onClose={onClose}
      footer={
        <Reveal delay={start + items.length * ITEM_MS}>
          <Button label="Fillo ushtrimet" onPress={onStart} />
        </Reveal>
      }>
      <Reveal>
        <PillBadge>PJESA {part}</PillBadge>
      </Reveal>
      <InkText delay={at(1)} style={styles.title}>
        {lesson.title}
      </InkText>
      <View style={styles.examples}>
        {items.map((it, i) => (
          <Reveal key={it.key} delay={start + i * ITEM_MS}>
            <View style={styles.wordCard}>
              <View style={styles.picture}>
                {it.drawing ? (
                  <DrawPath drawing={it.drawing} size={64} delay={start + i * ITEM_MS + 120} />
                ) : (
                  <Text style={styles.pictureGlyph} numberOfLines={1} adjustsFontSizeToFit>
                    {it.jp}
                  </Text>
                )}
              </View>
              <WordRow
                jp={it.jp}
                highlight={it.highlight}
                romaji={it.romaji}
                meaning={it.meaning}
                note={it.note}
                right={<SpeakButton text={it.jp} size={36} />}
                style={styles.wordRowFlat}
              />
            </View>
          </Reveal>
        ))}
      </View>
    </Frame>
  );
}

/** A small still picture for lists (Fjalori, flashcards), if the word has one. */
export function WordPicture({ kanji, jp, size = 40 }: { kanji?: string; jp: string; size?: number }) {
  const drawing = drawingFor(kanji, jp);
  return drawing ? <DrawingIcon drawing={drawing} size={size} /> : null;
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
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    paddingLeft: S.sm,
  },
  picture: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  pictureGlyph: { fontFamily: F.jp, fontSize: 34, color: C.faint },
  wordRowFlat: { flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingLeft: 0 },
});
