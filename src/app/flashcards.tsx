import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Confetti, CountUp, EASE_OUT } from '@/components/motion';
import { Button, ProgressBar, SpeakButton } from '@/components/ui';
import { VOCAB_LESSONS, type Word } from '@/data/lessons';
import {
  answerCard,
  decks,
  isFinished,
  remaining,
  sessionAnswers,
  startSession,
  type Deck,
  type Session,
} from '@/lib/flashcards';
import { useProgress } from '@/lib/progress-context';
import { seededRng } from '@/lib/quiz';
import { wordSay } from '@/lib/sayables';
import { speakJapanese } from '@/lib/speech';
import { C, R, S } from '@/theme';

const WORDS = new Map<string, Word>(VOCAB_LESSONS.flatMap((l) => l.words).map((w) => [w.jp, w]));
const SWIPE = 90;

type Direction = 'jp' | 'sq';

export default function FlashcardsScreen() {
  const { progress, plus } = useProgress();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [direction, setDirection] = useState<Direction>('jp');
  const list = useMemo(() => decks(progress.review, plus), [progress.review, plus]);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/fjalori'));

  if (deck) {
    return <Study deck={deck} direction={direction} onExit={() => setDeck(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <Text style={styles.topTitle}>Kartat e fjalëve</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>
          Kthe kartën, thuaj nëse e dije, dhe fjalët që nuk i di kthehen derisa t’i mësosh.
        </Text>

        <Text style={styles.section}>Ana e parë e kartës</Text>
        <View style={styles.seg} accessibilityRole="tablist">
          {(
            [
              ['jp', 'Japonisht → Shqip'],
              ['sq', 'Shqip → Japonisht'],
            ] as const
          ).map(([d, label]) => (
            <Pressable
              key={d}
              onPress={() => setDirection(d)}
              accessibilityRole="tab"
              accessibilityState={{ selected: direction === d }}
              style={[styles.segBtn, direction === d && styles.segOn]}>
              <Text style={[styles.segText, direction === d && { color: C.white }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Zgjidh paketën</Text>
        {list.map((d) => {
          const locked = d.premium && !plus;
          const empty = d.words.length === 0;
          return (
            <Pressable
              key={d.id}
              disabled={empty}
              onPress={() => (locked ? router.push('/plus') : setDeck(d))}
              accessibilityRole="button"
              accessibilityLabel={`${d.title}, ${d.words.length} fjalë${locked ? ', Plus' : ''}`}
              style={({ pressed }) => [
                styles.deck,
                (d.id === 'all' || d.id === 'hard') && styles.deckFeatured,
                (empty || locked) && { opacity: 0.55 },
                pressed && { opacity: 0.8 },
              ]}>
              <View style={[styles.deckIcon, d.id === 'hard' && { backgroundColor: C.gold }]}>
                <Ionicons
                  name={d.id === 'all' ? 'albums' : d.id === 'hard' ? 'flame' : locked ? 'star' : 'copy'}
                  size={18}
                  color={C.white}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deckTitle}>{d.title}</Text>
                <Text style={styles.deckSub}>
                  {d.id === 'hard' && empty ? 'Fjalët që gabon do të shfaqen këtu' : `${d.words.length} fjalë`}
                </Text>
              </View>
              {locked ? (
                <View style={styles.plusBadge}>
                  <Text style={styles.plusBadgeText}>PLUS</Text>
                </View>
              ) : (
                !empty && <Ionicons name="chevron-forward" size={20} color={C.muted} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Study({ deck, direction, onExit }: { deck: Deck; direction: Direction; onExit: () => void }) {
  const { finishReview, sfx, progress } = useProgress();
  const [seed, setSeed] = useState(() => Date.now());
  const [session, setSession] = useState<Session>(() => startSession(deck.words, seededRng(seed)));
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<{ xp: number; known: number; total: number } | null>(null);
  const reduced = useReducedMotion();

  const flip = useSharedValue(0);
  const tx = useSharedValue(0);
  const startX = useRef(0);
  const total = useMemo(() => new Set(session.queue).size, [session.queue]);

  const word = WORDS.get(session.queue[session.pos] ?? '');

  const turn = () => {
    const next = !flipped;
    setFlipped(next);
    flip.set(reduced ? (next ? 1 : 0) : withTiming(next ? 1 : 0, { duration: 320, easing: EASE_OUT }));
    // When the Albanian side was in front, revealing the Japanese also lets you hear it.
    if (next && direction === 'sq' && word && progress.sound) speakJapanese(wordSay(word));
  };

  const answer = (knew: boolean) => {
    if (!flipped) return;
    sfx(knew ? 'stroke' : 'wrong');
    const next = answerCard(session, knew);
    setFlipped(false);
    // The next card starts face up and centred.
    flip.set(0);
    tx.set(0);
    if (isFinished(next)) {
      const answers = sessionAnswers(next);
      const xp = finishReview(answers);
      sfx('complete');
      setResult({ xp, known: answers.filter((a) => a.correct).length, total: answers.length });
    }
    setSession(next);
  };

  const restart = () => {
    const s = Date.now();
    setSeed(s);
    setSession(startSession(deck.words, seededRng(s)));
    setResult(null);
    setFlipped(false);
  };

  const front = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 900 },
      { translateX: tx.value },
      { rotateZ: `${tx.value / 25}deg` },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const back = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [
      { perspective: 900 },
      { translateX: tx.value },
      { rotateZ: `${tx.value / 25}deg` },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
  }));
  const knowHint = useAnimatedStyle(() => ({ opacity: Math.max(0, Math.min(1, tx.value / SWIPE)) }));
  const missHint = useAnimatedStyle(() => ({ opacity: Math.max(0, Math.min(1, -tx.value / SWIPE)) }));

  // Swiping: right = "E dija", left = "Nuk e dija" (only once the card is turned).
  const onGrant = (e: GestureResponderEvent) => {
    startX.current = e.nativeEvent.pageX;
  };
  const onMove = (e: GestureResponderEvent) => {
    if (flipped) tx.set(e.nativeEvent.pageX - startX.current);
  };
  const onRelease = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - startX.current;
    if (Math.abs(dx) < 8) {
      turn();
      return;
    }
    if (flipped && Math.abs(dx) > SWIPE) {
      answer(dx > 0);
    } else {
      tx.set(withSpring(0, { damping: 14 }));
    }
  };

  if (result) {
    const perfect = result.known === result.total;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.medal}>
            <Text style={styles.medalText}>{perfect ? '満' : '覚'}</Text>
          </Animated.View>
          <Text style={styles.doneTitle}>{perfect ? 'I dije të gjitha!' : 'Paketa u përfundua!'}</Text>
          <Text style={styles.doneSub}>{deck.title}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <CountUp value={result.xp} prefix="+" style={styles.statValue} />
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {result.known}/{result.total}
              </Text>
              <Text style={styles.statLabel}>në provën e parë</Text>
            </View>
          </View>
          {!perfect && (
            <Text style={styles.doneNote}>
              Fjalët që nuk i dije do të dalin sot te përsëritja dhe te „Fjalët e vështira“.
            </Text>
          )}
          <Button label="Paketë tjetër" onPress={onExit} style={styles.wide} />
          <Button label="Përsërit këtë paketë" variant="ghost" onPress={restart} style={styles.wide} />
        </View>
        {perfect && <Confetti />}
      </SafeAreaView>
    );
  }

  if (!word) return null;
  const written = word.kanji ?? word.jp;
  const japanese = (
    <>
      <Text style={styles.cardJp} adjustsFontSizeToFit numberOfLines={2}>
        {written}
      </Text>
      {word.kanji && <Text style={styles.cardKana}>{word.jp}</Text>}
    </>
  );
  const albanian = <Text style={styles.cardMeaning}>{word.meaning}</Text>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Kthehu te paketat" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <ProgressBar value={(total - remaining(session)) / total} style={{ flex: 1 }} />
        <Text style={styles.count}>{remaining(session)}</Text>
      </View>

      <View style={styles.stage}>
        <Animated.View style={[styles.hint, styles.hintLeft, missHint]}>
          <Text style={[styles.hintText, { color: C.red }]}>Nuk e dija</Text>
        </Animated.View>
        <Animated.View style={[styles.hint, styles.hintRight, knowHint]}>
          <Text style={[styles.hintText, { color: C.green }]}>E dija</Text>
        </Animated.View>

        <View
          style={styles.cardArea}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onGrant}
          onResponderMove={onMove}
          onResponderRelease={onRelease}
          accessibilityRole="button"
          accessibilityLabel={flipped ? 'Karta e kthyer' : 'Prek për ta kthyer kartën'}
          accessibilityHint="Rrëshqit djathtas nëse e dije, majtas nëse jo">
          <Animated.View style={[styles.card, front]}>
            <Text style={styles.side}>{direction === 'jp' ? 'JAPONISHT' : 'SHQIP'}</Text>
            {direction === 'jp' ? japanese : albanian}
            <Text style={styles.tap}>Prek për ta kthyer</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, back]}>
            <Text style={styles.side}>{direction === 'jp' ? 'SHQIP' : 'JAPONISHT'}</Text>
            {direction === 'jp' ? albanian : japanese}
            <Text style={styles.reading}>
              {word.sq}
              {word.sq !== word.romaji ? <Text style={styles.romaji}>{`  ·  ${word.romaji}`}</Text> : null}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.speakRow}>
          <SpeakButton text={wordSay(word)} size={48} />
        </View>
      </View>

      <View style={styles.actions}>
        {flipped ? (
          <>
            <Button label="Nuk e dija" variant="secondary" onPress={() => answer(false)} style={{ flex: 1 }} />
            <Button label="E dija" variant="success" onPress={() => answer(true)} style={{ flex: 1 }} />
          </>
        ) : (
          <Button label="Kthe kartën" onPress={turn} style={{ flex: 1 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.xl,
    paddingTop: S.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: C.ink },
  count: { fontSize: 13, fontWeight: '700', color: C.muted, minWidth: 24, textAlign: 'right' },
  body: { padding: S.xl, paddingBottom: S.xxl, gap: S.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  lead: { fontSize: 15, lineHeight: 21, color: C.muted },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: S.lg,
    marginBottom: S.xs,
  },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.pill, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: R.pill, alignItems: 'center' },
  segOn: { backgroundColor: C.ink },
  segText: { fontSize: 13.5, fontWeight: '700', color: C.muted },
  deck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.md,
  },
  deckFeatured: { borderWidth: 2 },
  deckIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckTitle: { fontSize: 15.5, fontWeight: '700', color: C.ink },
  deckSub: { fontSize: 13, color: C.muted, marginTop: 1 },
  plusBadge: { backgroundColor: C.gold, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: 8 },
  plusBadgeText: { color: C.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  stage: { flex: 1, justifyContent: 'center', paddingHorizontal: S.xl },
  cardArea: { height: 330, maxWidth: 420, width: '100%', alignSelf: 'center' },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    backgroundColor: C.paper,
    borderRadius: R.lg + 6,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: S.xl,
    gap: S.sm,
  },
  cardBack: { backgroundColor: '#fff8f2', borderColor: C.red },
  side: { position: 'absolute', top: S.lg, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, color: C.muted },
  cardJp: { fontSize: 46, fontWeight: '600', color: C.ink, textAlign: 'center' },
  cardKana: { fontSize: 18, color: C.muted },
  cardMeaning: { fontSize: 28, fontWeight: '800', color: C.ink, textAlign: 'center' },
  reading: { fontSize: 17, fontWeight: '700', color: C.red, marginTop: S.sm },
  romaji: { fontSize: 13, fontWeight: '400', color: C.muted },
  tap: { position: 'absolute', bottom: S.lg, fontSize: 12.5, color: C.muted },
  hint: { position: 'absolute', top: '12%', zIndex: 2 },
  hintLeft: { left: S.xl },
  hintRight: { right: S.xl },
  hintText: { fontSize: 15, fontWeight: '800' },
  speakRow: { alignItems: 'center', marginTop: S.lg },
  actions: {
    flexDirection: 'row',
    gap: S.sm,
    padding: S.xl,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl, gap: S.sm },
  medal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#f6d27a',
  },
  medalText: { fontSize: 52, fontWeight: '800', color: '#7a4b00' },
  doneTitle: { fontSize: 26, fontWeight: '800', color: C.ink, marginTop: S.lg },
  doneSub: { fontSize: 15, color: C.muted },
  doneNote: { fontSize: 14, lineHeight: 20, color: C.muted, textAlign: 'center', maxWidth: 360 },
  stats: { flexDirection: 'row', gap: S.sm, marginVertical: S.lg },
  stat: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    minWidth: 110,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: C.ink },
  statLabel: { fontSize: 12, color: C.muted },
  wide: { alignSelf: 'stretch', maxWidth: 520, width: '100%' },
});
