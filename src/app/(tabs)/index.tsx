import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pill, ProgressBar, SectionTitle } from '@/components/ui';
import { LESSONS } from '@/data/lessons';
import { completedCount, currentStreak, lessonStatuses, xpToday, type LessonStatus } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, R, S } from '@/theme';

function greeting(hour: number): { sq: string; jp: string } {
  if (hour < 11) return { sq: 'Mirëmëngjes', jp: 'おはよう · ohajoo' };
  if (hour < 18) return { sq: 'Përshëndetje', jp: 'こんにちは · konniçiua' };
  return { sq: 'Mirëmbrëma', jp: 'こんばんは · konbanua' };
}

export default function Today() {
  const { progress, today } = useProgress();
  const hello = greeting(new Date().getHours());
  const streak = currentStreak(progress, today);
  const xp = xpToday(progress, today);
  const goalMet = xp >= progress.dailyGoal;
  const statuses = lessonStatuses(progress);
  const done = completedCount(progress);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jp}>{hello.jp}</Text>
            <Text style={styles.hello} numberOfLines={1}>
              {hello.sq}
              {progress.name ? `, ${progress.name}` : ''}
            </Text>
          </View>
          <Pill>
            <Ionicons name="flame" size={15} color={streak > 0 ? '#e0850b' : C.muted} /> {streak}
          </Pill>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalTop}>
            <Text style={styles.goalTitle}>{goalMet ? 'Qëllimi u arrit! すごい!' : 'Qëllimi ditor'}</Text>
            <Text style={styles.goalNums}>
              {xp} / {progress.dailyGoal} XP
            </Text>
          </View>
          <ProgressBar value={xp / progress.dailyGoal} color={goalMet ? C.green : C.red} />
          <Text style={styles.goalHint}>
            {streak === 0
              ? 'Mbaro një mësim sot për të nisur serinë.'
              : `${streak} ${streak === 1 ? 'ditë' : 'ditë rresht'} — mos e prish serinë!`}
          </Text>
        </View>

        <SectionTitle>
          Rruga jote · {done} / {LESSONS.length}
        </SectionTitle>
        <View style={styles.path}>
          <View style={styles.rail} />
          {LESSONS.map((lesson) => (
            <LessonRow
              key={lesson.id}
              title={lesson.title}
              subtitle={lesson.subtitle}
              badge={lesson.badge}
              status={statuses[lesson.id]}
              best={progress.lessons[lesson.id]}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonRow(props: {
  title: string;
  subtitle: string;
  badge: string;
  status: LessonStatus;
  best?: { best: number; total: number };
  onPress: () => void;
}) {
  const { status } = props;
  const locked = status === 'locked';
  return (
    <Pressable
      disabled={locked}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${props.title}${locked ? ', e kyçur' : ''}`}
      style={({ pressed }) => [styles.row, status === 'current' && styles.rowCurrent, pressed && { opacity: 0.8 }]}>
      <View style={[styles.node, status === 'done' && styles.nodeDone, status === 'current' && styles.nodeCurrent]}>
        {locked ? (
          <Ionicons name="lock-closed" size={16} color={C.muted} />
        ) : (
          <Text style={[styles.nodeText, { color: C.white }]}>{props.badge}</Text>
        )}
      </View>
      <View style={{ flex: 1, opacity: locked ? 0.5 : 1 }}>
        <Text style={styles.rowTitle}>{props.title}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {props.subtitle}
          {props.best ? `  ·  më e mira ${props.best.best}/${props.best.total}` : ''}
        </Text>
      </View>
      {status === 'current' && (
        <View style={styles.go}>
          <Text style={styles.goText}>Fillo</Text>
        </View>
      )}
      {status === 'done' && <Ionicons name="refresh" size={18} color={C.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  jp: { fontSize: 13, color: C.muted, marginBottom: 2 },
  hello: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  goalCard: {
    marginTop: S.lg,
    backgroundColor: C.paper,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
    gap: S.md,
  },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  goalTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  goalNums: { fontSize: 14, fontWeight: '700', color: C.muted },
  goalHint: { fontSize: 13, color: C.muted },
  path: { gap: S.sm, position: 'relative' },
  rail: { position: 'absolute', left: 27, top: 24, bottom: 24, width: 2, backgroundColor: C.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.sm, borderRadius: R.lg },
  rowCurrent: { backgroundColor: C.redSoft },
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: C.green, borderColor: C.green },
  nodeCurrent: { backgroundColor: C.red, borderColor: C.red },
  nodeText: { fontSize: 17, fontWeight: '700', color: C.muted },
  rowTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  rowSub: { fontSize: 13, color: C.muted, marginTop: 1 },
  go: { backgroundColor: C.red, paddingVertical: 8, paddingHorizontal: 14, borderRadius: R.pill },
  goText: { color: C.white, fontWeight: '700', fontSize: 13 },
});
