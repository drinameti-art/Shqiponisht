import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Confetti, CountUp, EASE_OUT, Feedback } from '@/components/motion';
import { Button, ProgressBar, SpeakButton } from '@/components/ui';
import { lessonById } from '@/data/lessons';
import { NOTES, type Note } from '@/data/notes';
import { passes, PASS_RATIO } from '@/lib/progress';
import { useProgress, type Answer } from '@/lib/progress-context';
import { buildQuiz, buildReviewQuiz, seededRng } from '@/lib/quiz';
import { dueItems } from '@/lib/review';
import { speakJapanese } from '@/lib/speech';
import { C, R, S } from '@/theme';

function feel(kind: 'ok' | 'bad') {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(
    kind === 'ok' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  );
}

const PRAISE = ['Saktë!', 'Shumë mirë!', 'Bravo!', 'すごい!', 'Perfekt!'];

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { finishLesson, finishReview, plus, sfx, progress, today } = useProgress();
  // "review" is the daily spaced-review session; anything else is a lesson id.
  const isReview = id === 'review';
  const lesson = isReview ? undefined : lessonById(id);
  // The review list is fixed when the session opens, so answering doesn't reshuffle it.
  const [reviewItems] = useState(() => (isReview ? dueItems(progress.review, today) : []));

  // Listening questions need sound; decided once when the lesson opens.
  const [listening] = useState(() => progress.sound);
  const [seed, setSeed] = useState(() => Date.now());
  const quiz = useMemo(
    () =>
      isReview
        ? buildReviewQuiz(reviewItems, seededRng(seed), { listening })
        : lesson
          ? buildQuiz(lesson, seededRng(seed), undefined, { listening })
          : [],
    [isReview, reviewItems, lesson, seed, listening],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const correct = answers.filter((a) => a.correct).length;
  /** Bumped on every select / check, to replay the option's feedback animation. */
  const [bump, setBump] = useState(0);
  const [result, setResult] = useState<{ xp: number } | null>(null);
  // A lesson with a grammar note opens with it; retries go straight to the questions.
  const note = isReview ? undefined : NOTES[id];
  const [showNote, setShowNote] = useState(() => !!note);

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
  };

  // Plus lessons can be reached by deep link too; send those to the paywall.
  if (lesson?.premium && !plus) return <Redirect href="/plus" />;

  if ((!lesson && !isReview) || quiz.length === 0) {
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

  const title = isReview ? 'Përsëritja e ditës' : lesson!.title;

  if (result) {
    const total = quiz.length;
    const ok = isReview || passes(correct, total);
    const needed = Math.ceil(PASS_RATIO * total);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.medal}>
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
    return <NoteScreen note={note} lessonTitle={title} onStart={() => setShowNote(false)} onClose={close} />;
  }

  const q = quiz[index];
  const isRight = selected === q.answer;

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
    if (index < quiz.length - 1) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    // `answers` already includes this question's answer (it was recorded on check).
    const xp = isReview ? finishReview(answers) : finishLesson(lesson!.id, answers);
    sfx(isReview || passes(correct, quiz.length) ? 'complete' : 'retry');
    setResult({ xp });
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
        <Animated.View
          key={index}
          entering={index === 0 ? FadeIn.duration(250) : SlideInRight.duration(260).easing(EASE_OUT)}>
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
                    <Text style={styles.optionLabel}>{o.label}</Text>
                    {o.hint ? <Text style={styles.optionHint}>{o.hint}</Text> : null}
                  </Pressable>
                </Feedback>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, checked && (isRight ? styles.footerOk : styles.footerBad)]}>
        {checked && (
          <Animated.View
            entering={FadeInDown.duration(220).easing(EASE_OUT)}
            style={styles.feedback}
            accessibilityLiveRegion="polite">
            <View style={styles.feedbackHead}>
              <Text style={[styles.feedbackTitle, { color: isRight ? C.greenText : C.redText }]}>
                {isRight ? PRAISE[index % PRAISE.length] : 'Nuk është saktë.'}
              </Text>
              <SpeakButton text={q.speak} size={36} />
            </View>
            <Text style={[styles.feedbackBody, { color: isRight ? C.greenText : C.redText }]}>{q.explanation}</Text>
          </Animated.View>
        )}
        <Button
          label={!checked ? 'Kontrollo' : index < quiz.length - 1 ? 'Vazhdo' : 'Përfundo'}
          variant={checked && isRight ? 'success' : 'primary'}
          disabled={!checked && selected === null}
          onPress={onAction}
        />
      </View>
    </SafeAreaView>
  );
}

function NoteScreen(props: { note: Note; lessonTitle: string; onStart: () => void; onClose: () => void }) {
  const { note } = props;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable onPress={props.onClose} accessibilityRole="button" accessibilityLabel="Mbyll mësimin" hitSlop={12}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <Text style={styles.noteLesson} numberOfLines={1}>
          {props.lessonTitle}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View entering={FadeInUp.duration(300).easing(EASE_OUT)}>
          <Text style={styles.noteEyebrow}>Para se të fillosh</Text>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <View style={styles.notePoints}>
            {note.points.map((p) => (
              <View key={p} style={styles.notePoint}>
                <View style={styles.noteBullet} />
                <Text style={styles.noteText}>{p}</Text>
              </View>
            ))}
          </View>
          {note.examples.length > 0 && (
            <View style={styles.noteExamples}>
              {note.examples.map((e) => (
                <View key={e.jp} style={styles.noteExample}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteJp}>{e.jp}</Text>
                    <Text style={styles.noteSq}>
                      {e.sq} · <Text style={styles.noteMeaning}>{e.meaning}</Text>
                    </Text>
                  </View>
                  <SpeakButton text={e.jp} size={38} />
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Fillo ushtrimet" onPress={props.onStart} />
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
  count: { fontSize: 13, fontWeight: '700', color: C.muted, minWidth: 36, textAlign: 'right' },
  body: { padding: S.xl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  instruction: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  prompt: { fontSize: 26, fontWeight: '800', color: C.ink, marginTop: S.md, marginBottom: S.xl, letterSpacing: -0.3 },
  promptJp: { fontSize: 56, fontWeight: '600', letterSpacing: 0, textAlign: 'center', marginVertical: S.xl },
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
  optionLabel: { fontSize: 21, fontWeight: '700', color: C.ink },
  optionHint: { fontSize: 12.5, color: C.muted, marginTop: 4 },
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
  noteLesson: { flex: 1, fontSize: 14, fontWeight: '700', color: C.muted },
  noteEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: C.red },
  noteTitle: { fontSize: 26, fontWeight: '800', color: C.ink, marginTop: S.xs, letterSpacing: -0.4 },
  notePoints: { gap: S.md, marginTop: S.lg },
  notePoint: { flexDirection: 'row', gap: S.md },
  noteBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, marginTop: 8 },
  noteText: { flex: 1, fontSize: 16, lineHeight: 24, color: C.ink },
  noteExamples: { gap: S.sm, marginTop: S.xl },
  noteExample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.md,
  },
  noteJp: { fontSize: 20, fontWeight: '600', color: C.ink },
  noteSq: { fontSize: 14, fontWeight: '700', color: C.red, marginTop: 2 },
  noteMeaning: { fontWeight: '400', color: C.muted },
  listen: { alignItems: 'center', gap: S.md, marginVertical: S.xl },
  listenHint: { fontSize: 13, color: C.muted },
  promptSpeak: { alignItems: 'center', marginTop: -S.md, marginBottom: S.lg },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedbackTitle: { fontSize: 18, fontWeight: '800' },
  feedbackBody: { fontSize: 14, lineHeight: 20 },
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
  medalText: { fontSize: 52, fontWeight: '800', color: C.goldText },
  doneTitle: { fontSize: 26, fontWeight: '800', color: C.ink, marginTop: S.lg },
  doneSub: { fontSize: 15, color: C.muted },
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
  statValue: { fontSize: 20, fontWeight: '800', color: C.ink },
  statLabel: { fontSize: 12, color: C.muted },
  wide: { alignSelf: 'stretch', maxWidth: 520, width: '100%' },
});
