import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ProgressBar } from '@/components/ui';
import { lessonById } from '@/data/lessons';
import { lessonXp, passes, PASS_RATIO } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { buildQuiz, seededRng } from '@/lib/quiz';
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
  const lesson = lessonById(id);
  const { finishLesson, plus, sfx } = useProgress();

  const [seed, setSeed] = useState(() => Date.now());
  const quiz = useMemo(() => (lesson ? buildQuiz(lesson, seededRng(seed)) : []), [lesson, seed]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<{ xp: number } | null>(null);

  const retry = () => {
    setSeed(Date.now());
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrect(0);
    setResult(null);
  };

  // Plus lessons can be reached by deep link too; send those to the paywall.
  if (lesson?.premium && !plus) return <Redirect href="/plus" />;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.prompt}>Mësimi nuk u gjet.</Text>
          <Button label="Kthehu" onPress={() => router.back()} style={{ marginTop: S.lg, alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    );
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (result) {
    const total = quiz.length;
    const ok = passes(correct, total);
    const needed = Math.ceil(PASS_RATIO * total);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.medal}>
            <Text style={styles.medalText}>{correct === total ? '満' : ok ? '良' : '頑'}</Text>
          </View>
          <Text style={styles.doneTitle}>
            {correct === total ? 'Pa asnjë gabim!' : ok ? 'Mësimi u kalua!' : 'Edhe pak!'}
          </Text>
          <Text style={[styles.doneSub, { textAlign: 'center' }]}>
            {ok ? lesson.title : `Të paktën ${needed} përgjigje të sakta hapin mësimin tjetër. がんばって!`}
          </Text>
          <View style={styles.stats}>
            <Stat value={`+${result.xp}`} label="XP" />
            <Stat value={`${correct}/${total}`} label="saktë" />
            <Stat value={`${Math.round((correct / total) * 100)}%`} label="saktësi" />
          </View>
          <Button label={ok ? 'Vazhdo' : 'Provo përsëri'} onPress={ok ? close : retry} style={styles.wide} />
          <Button
            label={ok ? 'Përsërit mësimin' : 'Kthehu'}
            variant="ghost"
            style={styles.wide}
            onPress={ok ? retry : close}
          />
        </View>
      </SafeAreaView>
    );
  }

  const q = quiz[index];
  const isRight = selected === q.answer;

  const onAction = () => {
    if (!checked) {
      if (selected === null) return;
      setChecked(true);
      if (isRight) setCorrect((c) => c + 1);
      feel(isRight ? 'ok' : 'bad');
      sfx(isRight ? 'correct' : 'wrong');
      return;
    }
    if (index < quiz.length - 1) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    // `correct` already includes this question's answer (it was counted on check).
    finishLesson(lesson.id, correct, quiz.length);
    sfx(passes(correct, quiz.length) ? 'complete' : 'retry');
    setResult({ xp: lessonXp(correct, quiz.length) });
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
        <Text style={styles.instruction}>{q.instruction}</Text>
        <Text style={[styles.prompt, q.promptIsJapanese && styles.promptJp]}>{q.prompt}</Text>
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
            return (
              <Pressable
                key={`${index}-${o.label}`}
                disabled={checked}
                onPress={() => setSelected(i)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selected === i, disabled: checked }}
                style={[styles.option, OPTION_STATES[state]]}>
                <Text style={styles.optionLabel}>{o.label}</Text>
                {o.hint ? <Text style={styles.optionHint}>{o.hint}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, checked && (isRight ? styles.footerOk : styles.footerBad)]}>
        {checked && (
          <View style={styles.feedback} accessibilityLiveRegion="polite">
            <Text style={[styles.feedbackTitle, { color: isRight ? C.greenDark : C.redDark }]}>
              {isRight ? PRAISE[index % PRAISE.length] : 'Nuk është saktë.'}
            </Text>
            <Text style={[styles.feedbackBody, { color: isRight ? C.greenDark : C.redDark }]}>{q.explanation}</Text>
          </View>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const OPTION_STATES = StyleSheet.create({
  idle: {},
  selected: { borderColor: '#5b8def', backgroundColor: '#eef3fe' },
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
  option: {
    flexGrow: 1,
    flexBasis: '45%',
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
    borderColor: '#f6d27a',
  },
  medalText: { fontSize: 52, fontWeight: '800', color: '#7a4b00' },
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
