import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Confetti, CountUp, EASE_OUT, Feedback } from '@/components/motion';
import { Toast } from '@/components/brand';
import { DrawPath, Reveal } from '@/components/brand-motion';
import { KanaIntro, NoteIntro, WordsIntro } from '@/components/lesson-intro';
import { drawingForItem } from '@/lib/visuals';
import { Button, ProgressBar, SpeakButton } from '@/components/ui';
import { lessonAfter, lessonById, LESSONS } from '@/data/lessons';
import { NOTES } from '@/data/notes';
import { buildPlacement, placementFinished } from '@/lib/placement';
import { passes, PASS_RATIO } from '@/lib/progress';
import { useProgress, type Answer } from '@/lib/progress-context';
import { buildQuiz, buildReviewQuiz, seededRng } from '@/lib/quiz';
import { dueItems } from '@/lib/review';
import { speakJapanese } from '@/lib/speech';
import { C, F, R, S } from '@/theme';

function feel(kind: 'ok' | 'bad') {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(
    kind === 'ok' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  );
}

const PRAISE = ['Saktë!', 'Shumë mirë!', 'Bravo!', 'すごい!', 'Perfekt!'];

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { finishLesson, finishReview, finishPlacement, plus, sfx, progress, today } = useProgress();
  // "review" is the daily spaced-review session, "placement" the level test; anything else is a lesson id.
  const isReview = id === 'review';
  const isPlacement = id === 'placement';
  const lesson = isReview || isPlacement ? undefined : lessonById(id);
  // The review list is fixed when the session opens, so answering doesn't reshuffle it.
  const [reviewItems] = useState(() => (isReview ? dueItems(progress.review, today) : []));

  // Listening questions need sound; decided once when the lesson opens.
  const [listening] = useState(() => progress.sound);
  const [seed, setSeed] = useState(() => Date.now());
  const placement = useMemo(() => (isPlacement ? buildPlacement(seededRng(seed)) : null), [isPlacement, seed]);
  const quiz = useMemo(
    () =>
      placement
        ? placement.questions
        : isReview
          ? buildReviewQuiz(reviewItems, seededRng(seed), { listening })
          : lesson
            ? buildQuiz(lesson, seededRng(seed), undefined, { listening })
            : [],
    [placement, isReview, reviewItems, lesson, seed, listening],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const correct = answers.filter((a) => a.correct).length;
  /** Bumped on every select / check, to replay the option's feedback animation. */
  const [bump, setBump] = useState(0);
  const [result, setResult] = useState<{ xp: number; placed?: string } | null>(null);
  // A lesson with a grammar note opens with it; retries go straight to the questions.
  const note = isReview || isPlacement ? undefined : NOTES[id];
  const [showNote, setShowNote] = useState(() => !!note);
  // Lessons without a note open with a reel-style introduction: the kana row, or the words with their pictures (docs/BRAND.md §5).
  const [showIntro, setShowIntro] = useState(() => !note && !!lesson);
  /** "PJESA n": the lesson's place on the path. */
  const part = lesson ? LESSONS.findIndex((l) => l.id === lesson.id) + 1 : 0;

  // A listening question plays its sound as soon as it appears.
  const current = quiz[index];
  useEffect(() => {
    if (current?.listen && !result && !showNote) speakJapanese(current.speak);
  }, [current, result, showNote]);

  const retry = () => {
    setSeed(Date.now());
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
    setResult(null);
    setShowNote(false);
    setShowIntro(false);
  };

  // Plus lessons can be reached by deep link too; send those to the paywall.
  if (lesson?.premium && !plus) return <Redirect href="/plus" />;

  if ((!lesson && !isReview && !isPlacement) || quiz.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={[styles.prompt, { textAlign: 'center' }]}>
            {isReview ? 'Asgjë për të përsëritur tani. Kthehu nesër!' : 'Mësimi nuk u gjet.'}
          </Text>
          <Button label="Kthehu" onPress={() => router.back()} style={{ marginTop: S.lg, alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    );
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const title = isPlacement ? 'Testi i nivelit' : isReview ? 'Përsëritja e ditës' : lesson!.title;

  if (result && isPlacement) {
    const answered = answers.length;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View entering={FadeInUp.duration(520).easing(EASE_OUT)} style={styles.medal}>
            <Text style={styles.medalText}>{result.placed ? '進' : '始'}</Text>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(150).duration(300).easing(EASE_OUT)} style={styles.doneTitle}>
            {result.placed ? 'Bravo, e di mirë!' : 'Fillojmë nga fillimi'}
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(220).duration(300).easing(EASE_OUT)}
            style={[styles.doneSub, { textAlign: 'center' }]}>
            {result.placed
              ? `Mësimet që i di tashmë u shënuan si të kaluara. Vazhdon nga „${result.placed}“.`
              : 'Mësimet e para shkojnë shpejt kur di pak japonisht. がんばって!'}
          </Animated.Text>
          <Animated.View entering={FadeInUp.delay(320).duration(300).easing(EASE_OUT)} style={styles.stats}>
            <Stat value={<CountUp value={result.xp} prefix="+" style={styles.statValue} />} label="XP" />
            <Stat value={`${correct}/${answered}`} label="saktë" />
            <Stat value={`${Math.round((correct / Math.max(1, answered)) * 100)}%`} label="saktësi" />
          </Animated.View>
          <Button label="Vazhdo" onPress={close} style={styles.wide} />
        </View>
        {!!result.placed && <Confetti />}
      </SafeAreaView>
    );
  }

  if (result) {
    const total = quiz.length;
    const ok = isReview || passes(correct, total);
    const needed = Math.ceil(PASS_RATIO * total);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View entering={FadeInUp.duration(520).easing(EASE_OUT)} style={styles.medal}>
            <Text style={styles.medalText}>{correct === total ? '満' : ok ? '良' : '頑'}</Text>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(150).duration(300).easing(EASE_OUT)} style={styles.doneTitle}>
            {correct === total
              ? 'Pa asnjë gabim!'
              : isReview
                ? 'Përsëritja u krye!'
                : ok
                  ? 'Mësimi u kalua!'
                  : 'Edhe pak!'}
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(220).duration(300).easing(EASE_OUT)}
            style={[styles.doneSub, { textAlign: 'center' }]}>
            {isReview
              ? correct === total
                ? title
                : 'Gabimet do të kthehen sërish sot, derisa t’i mësosh.'
              : ok
                ? title
                : `Të paktën ${needed} përgjigje të sakta hapin mësimin tjetër. がんばって!`}
          </Animated.Text>
          <Animated.View entering={FadeInUp.delay(320).duration(300).easing(EASE_OUT)} style={styles.stats}>
            <Stat value={<CountUp value={result.xp} prefix="+" style={styles.statValue} />} label="XP" />
            <Stat value={`${correct}/${total}`} label="saktë" />
            <Stat value={`${Math.round((correct / total) * 100)}%`} label="saktësi" />
          </Animated.View>
          <Reveal delay={520} style={styles.toastWrap}>
            <Toast>
              {isReview
                ? 'Kujtesa po forcohet, ditë pas dite.'
                : ok
                  ? 'Mësimi tjetër të pret!'
                  : 'Edhe një herë dhe e ke!'}
            </Toast>
          </Reveal>
          <Button label={ok ? 'Vazhdo' : 'Provo përsëri'} onPress={ok ? close : retry} style={styles.wide} />
          {!isReview && (
            <Button
              label={ok ? 'Përsërit mësimin' : 'Kthehu'}
              variant="ghost"
              style={styles.wide}
              onPress={ok ? retry : close}
            />
          )}
        </View>
        {ok && <Confetti />}
      </SafeAreaView>
    );
  }

  if (showNote && note) {
    return <NoteIntro note={note} part={part} lessonTitle={title} onStart={() => setShowNote(false)} onClose={close} />;
  }
  if (showIntro && lesson && lesson.kind !== 'kana') {
    return (
      <WordsIntro lesson={lesson} part={part} lessonTitle={title} onStart={() => setShowIntro(false)} onClose={close} />
    );
  }
  if (showIntro && lesson?.kind === 'kana') {
    return (
      <KanaIntro lesson={lesson} part={part} lessonTitle={title} onStart={() => setShowIntro(false)} onClose={close} />
    );
  }

  const q = quiz[index];
  /** The picture of this question's word or kanji, drawn in the feedback once answered. */
  const drawing = drawingForItem(q.item);
  const isRight = selected === q.answer;

  const finish = (all: Answer[]) => {
    if (isPlacement && placement) {
      const { xp, placed } = finishPlacement(all, placement.stageOf);
      // The first lesson after the placed ones is where the learner continues.
      const next = placed.length ? lessonAfter(placed[placed.length - 1].id) : undefined;
      sfx(placed.length ? 'complete' : 'retry');
      setResult({ xp, placed: placed.length ? (next?.title ?? placed[placed.length - 1].title) : undefined });
      return;
    }
    // `answers` already includes this question's answer (it was recorded on check).
    const xp = isReview ? finishReview(all) : finishLesson(lesson!.id, all);
    sfx(isReview || passes(correct, quiz.length) ? 'complete' : 'retry');
    setResult({ xp });
  };

  /** Placement only: shows the answer without guessing, and counts it as wrong. */
  const dontKnow = () => {
    setSelected(null);
    setChecked(true);
    setBump((b) => b + 1);
    setAnswers((a) => [...a, { item: q.item, correct: false }]);
    feel('bad');
  };

  const onAction = () => {
    if (!checked) {
      if (selected === null) return;
      setChecked(true);
      setBump((b) => b + 1);
      setAnswers((a) => [...a, { item: q.item, correct: isRight }]);
      feel(isRight ? 'ok' : 'bad');
      sfx(isRight ? 'correct' : 'wrong');
      // Hearing the answer right after the sound effect ties the sound to the script.
      if (progress.sound) setTimeout(() => speakJapanese(q.speak), 550);
      return;
    }
    const stop =
      placement !== null &&
      placementFinished(
        answers.map((a) => a.correct),
        placement.stageOf,
      );
    if (index < quiz.length - 1 && !stop) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    finish(answers);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll mësimin" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <ProgressBar value={(index + (checked ? 1 : 0)) / quiz.length} style={{ flex: 1 }} />
        <Text style={styles.count}>
          {index + 1}/{quiz.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* One idea per screen: each question fades in with a small upward slide (docs/BRAND.md §5). */}
        <Reveal key={index} distance={12}>
          <Text style={styles.instruction}>{q.instruction}</Text>
          {q.listen ? (
            <View style={styles.listen}>
              <SpeakButton text={q.speak} size={96} label="Dëgjo përsëri" />
              <Text style={styles.listenHint}>Prek për ta dëgjuar sërish · dy herë për më ngadalë</Text>
            </View>
          ) : (
            <Text style={[styles.prompt, q.promptIsJapanese && styles.promptJp]}>{q.prompt}</Text>
          )}
          {q.promptIsJapanese && !q.listen && (
            <View style={styles.promptSpeak}>
              <SpeakButton text={q.speak} size={44} />
            </View>
          )}
          <View style={styles.options}>
            {q.options.map((o, i) => {
              const state = !checked
                ? selected === i
                  ? 'selected'
                  : 'idle'
                : i === q.answer
                  ? 'right'
                  : i === selected
                    ? 'wrong'
                    : 'idle';
              const motion =
                state === 'wrong'
                  ? 'shake'
                  : state === 'right' && i === selected
                    ? 'pop'
                    : state === 'selected'
                      ? 'pop'
                      : null;
              return (
                <Feedback
                  key={`${index}-${o.label}`}
                  kind={motion}
                  trigger={motion ? bump : 0}
                  style={styles.optionWrap}>
                  <Pressable
                    disabled={checked}
                    onPress={() => {
                      setSelected(i);
                      setBump((b) => b + 1);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selected === i, disabled: checked }}
                    style={[styles.option, OPTION_STATES[state]]}>
                    <Text style={[styles.optionLabel, JAPANESE.test(o.label) && styles.optionJp]}>{o.label}</Text>
                    {o.hint ? <Text style={styles.optionHint}>{o.hint}</Text> : null}
                  </Pressable>
                </Feedback>
              );
            })}
          </View>
        </Reveal>
      </ScrollView>

      <View style={[styles.footer, checked && (isRight ? styles.footerOk : styles.footerBad)]}>
        {checked && (
          <Animated.View
            entering={FadeInDown.duration(220).easing(EASE_OUT)}
            style={styles.feedback}
            accessibilityLiveRegion="polite">
            <View style={styles.feedbackHead}>
              <Text style={[styles.feedbackTitle, { color: isRight ? C.greenText : C.redText }]}>
                {isRight
                  ? PRAISE[index % PRAISE.length]
                  : selected === null
                    ? 'Kjo është përgjigjja:'
                    : 'Nuk është saktë.'}
              </Text>
              <SpeakButton text={q.speak} size={36} />
            </View>
            <View style={styles.feedbackRow}>
              <Text style={[styles.feedbackBody, styles.feedbackText, { color: isRight ? C.greenText : C.redText }]}>
                {q.explanation}
              </Text>
              {drawing && <DrawPath key={index} drawing={drawing} size={56} delay={150} />}
            </View>
          </Animated.View>
        )}
        <Button
          label={!checked ? 'Kontrollo' : index < quiz.length - 1 ? 'Vazhdo' : 'Përfundo'}
          variant={checked && isRight ? 'success' : 'primary'}
          disabled={!checked && selected === null}
          onPress={onAction}
        />
        {isPlacement && !checked && (
          <Button label="Nuk e di" variant="ghost" onPress={dontKnow} style={{ marginTop: S.xs }} />
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const OPTION_STATES = StyleSheet.create({
  idle: {},
  selected: { borderColor: C.selectLine, backgroundColor: C.selectBg },
  right: { borderColor: C.green, backgroundColor: C.greenSoft },
  wrong: { borderColor: C.red, backgroundColor: C.redSoft },
});

/** Kana or kanji in a string: those options use the Japanese font. */
const JAPANESE = /[\u3040-\u30ff\u3400-\u9fff]/;

const styles = StyleSheet.create({
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  feedbackText: { flex: 1 },
  optionJp: { fontFamily: F.jp, fontSize: 24 },
  toastWrap: { marginBottom: S.lg },
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
  count: { fontSize: 13, fontFamily: F.bold, color: C.muted, minWidth: 36, textAlign: 'right' },
  body: { padding: S.xl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  instruction: { fontSize: 13, fontFamily: F.bold, letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  prompt: { fontSize: 26, fontFamily: F.bold, color: C.ink, marginTop: S.md, marginBottom: S.xl, letterSpacing: -0.3 },
  promptJp: { fontSize: 56, fontFamily: F.jp, letterSpacing: 0, textAlign: 'center', marginVertical: S.xl },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  optionWrap: { flexGrow: 1, flexBasis: '45%' },
  option: {
    flex: 1,
    minHeight: 84,
    justifyContent: 'center',
    backgroundColor: C.paper,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.md,
  },
  optionLabel: { fontSize: 21, fontFamily: F.bold, color: C.ink },
  optionHint: { fontFamily: F.regular, fontSize: 12.5, color: C.muted, marginTop: 4 },
  footer: {
    padding: S.xl,
    paddingTop: S.lg,
    gap: S.md,
    borderTopLeftRadius: R.lg,
    borderTopRightRadius: R.lg,
  },
  footerOk: { backgroundColor: C.greenSoft },
  footerBad: { backgroundColor: C.redSoft },
  feedback: { gap: 4, maxWidth: 640, width: '100%', alignSelf: 'center' },
  listen: { alignItems: 'center', gap: S.md, marginVertical: S.xl },
  listenHint: { fontFamily: F.regular, fontSize: 13, color: C.muted },
  promptSpeak: { alignItems: 'center', marginTop: -S.md, marginBottom: S.lg },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedbackTitle: { fontSize: 18, fontFamily: F.bold },
  feedbackBody: { fontFamily: F.regular, fontSize: 14, lineHeight: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl, gap: S.sm },
  medal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: C.goldLine,
  },
  medalText: { fontSize: 52, fontFamily: F.jp, color: C.white },
  doneTitle: { fontSize: 26, fontFamily: F.bold, color: C.ink, marginTop: S.lg },
  doneSub: { fontFamily: F.regular, fontSize: 15, color: C.muted },
  stats: { flexDirection: 'row', gap: S.sm, marginVertical: S.xl },
  stat: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    minWidth: 86,
  },
  statValue: { fontSize: 20, fontFamily: F.bold, color: C.ink },
  statLabel: { fontFamily: F.regular, fontSize: 12, color: C.muted },
  wide: { alignSelf: 'stretch', maxWidth: 520, width: '100%' },
});
