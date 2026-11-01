import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pulse } from '@/components/motion';
import { Button, Pill, ProgressBar, SectionTitle } from '@/components/ui';
import { LESSONS } from '@/data/lessons';
import { completedCount, currentStreak, lessonStatuses, xpToday, type LessonStatus } from '@/lib/progress';
import { offerPlacement } from '@/lib/placement';
import { dueCount } from '@/lib/review';
import { useProgress } from '@/lib/progress-context';
import { BrandFooter, BrandHeader } from '@/components/brand';
import { InkText, Reveal, STEP_MS } from '@/components/brand-motion';
import { C, F, R, S } from '@/theme';

function greeting(hour: number): { sq: string; jp: string } {
  if (hour < 11) return { sq: 'Mirëmëngjes', jp: 'おはよう · ohajoo' };
  if (hour < 18) return { sq: 'Përshëndetje', jp: 'こんにちは · konniçiua' };
  return { sq: 'Mirëmbrëma', jp: 'こんばんは · konbanua' };
}

export default function Today() {
  const { progress, today, plus, update } = useProgress();
  const hello = greeting(new Date().getHours());
  const streak = currentStreak(progress, today);
  const xp = xpToday(progress, today);
  const goalMet = xp >= progress.dailyGoal;
  const statuses = lessonStatuses(progress);
  const done = completedCount(progress);
  const due = dueCount(progress.review, today);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BrandHeader label="SOT" style={{ marginBottom: S.lg }} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <InkText color={C.muted} style={styles.jp}>
              {hello.jp}
            </InkText>
            <InkText delay={STEP_MS} style={styles.hello} numberOfLines={1}>
              {hello.sq}
              {progress.name ? `, ${progress.name}` : ''}
            </InkText>
          </View>
          <Pill>
            <Ionicons name="flame" size={15} color={streak > 0 ? C.red : C.muted} /> {streak}
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

        {offerPlacement(progress) && (
          <View style={styles.placeCard}>
            <View style={styles.placeHead}>
              <View style={[styles.reviewIcon, { backgroundColor: C.red }]}>
                <Ionicons name="rocket-outline" size={20} color={C.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewTitle}>E di tashmë pak japonisht?</Text>
                <Text style={styles.reviewText}>
                  Bëj testin e nivelit (rreth 3 minuta) dhe kapërce mësimet që i di.
                </Text>
              </View>
            </View>
            <View style={styles.placeActions}>
              <Button
                label="Bëj testin"
                onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: 'placement' } })}
              />
              <Button
                label="Jo, faleminderit"
                variant="ghost"
                onPress={() => update((p) => ({ ...p, placementDone: true }))}
              />
            </View>
          </View>
        )}

        {Object.keys(progress.review).length > 0 && (
          <Pressable
            onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: 'review' } })}
            disabled={due === 0}
            accessibilityRole="button"
            style={({ pressed }) => [styles.reviewCard, due === 0 && styles.reviewDone, pressed && { opacity: 0.85 }]}>
            <View style={[styles.reviewIcon, due === 0 && { backgroundColor: C.green }]}>
              <Ionicons name={due === 0 ? 'checkmark' : 'repeat'} size={22} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>Përsëritja e ditës</Text>
              <Text style={styles.reviewText}>
                {due === 0
                  ? 'Gjithçka e përsëritur për sot. Kthehu nesër!'
                  : `${due} ${due === 1 ? 'gjë' : 'gjëra'} për t’i përsëritur · kujtesa zgjat më shumë`}
              </Text>
            </View>
            {due > 0 && <Ionicons name="chevron-forward" size={22} color={C.ink} />}
          </Pressable>
        )}

        <SectionTitle>
          Rruga jote · {done} / {LESSONS.length}
        </SectionTitle>
        <LessonList lessons={FREE} statuses={statuses} records={progress.lessons} revealFrom={2 * STEP_MS} />

        <View style={styles.plusHead}>
          <SectionTitle>Niveli 2</SectionTitle>
          <View style={[styles.plusBadge, { marginTop: S.md }]}>
            <Text style={styles.plusBadgeText}>PLUS</Text>
          </View>
        </View>
        {!plus && (
          <Pressable
            onPress={() => router.push('/plus')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.plusCard, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.plusCardTitle}>Zhblloko Nivelin 2</Text>
              <Text style={styles.plusCardText}>Folje, fjali, koha dhe {PLUS.length} mësime të tjera.</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={C.white} />
          </Pressable>
        )}
        <LessonList lessons={PLUS} statuses={statuses} records={progress.lessons} revealFrom={900} />
        <BrandFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const FREE = LESSONS.filter((l) => !l.premium);
const PLUS = LESSONS.filter((l) => l.premium);

function LessonList(props: {
  lessons: typeof LESSONS;
  statuses: Record<string, LessonStatus>;
  records: Record<string, { best: number; total: number; completions: number }>;
  revealFrom: number;
}) {
  return (
    <View style={styles.path}>
      <View style={styles.rail} />
      {props.lessons.map((lesson, i) => {
        const status = props.statuses[lesson.id];
        return (
          // The path appears one lesson at a time, top to bottom (only the first screenful waits).
          <Reveal key={lesson.id} delay={props.revealFrom + Math.min(i, 9) * 70}>
            <LessonRow
              title={lesson.title}
              subtitle={lesson.subtitle}
              badge={lesson.badge}
              status={status}
              best={props.records[lesson.id]}
              onPress={() =>
                status === 'premium'
                  ? router.push('/plus')
                  : router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
              }
            />
          </Reveal>
        );
      })}
    </View>
  );
}

function LessonRow(props: {
  title: string;
  subtitle: string;
  badge: string;
  status: LessonStatus;
  best?: { best: number; total: number; completions: number };
  onPress: () => void;
}) {
  const { status } = props;
  const locked = status === 'locked' || status === 'premium';
  return (
    <Pressable
      disabled={status === 'locked'}
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${props.title}${status === 'premium' ? ', Plus' : locked ? ', e kyçur' : ''}`}
      style={({ pressed }) => [styles.row, status === 'current' && styles.rowCurrent, pressed && { opacity: 0.8 }]}>
      <Pulse active={status === 'current'}>
        <View style={[styles.node, status === 'done' && styles.nodeDone, status === 'current' && styles.nodeCurrent]}>
          {status === 'premium' ? (
            <Ionicons name="star" size={16} color={C.gold} />
          ) : locked ? (
            <Ionicons name="lock-closed" size={16} color={C.muted} />
          ) : (
            <Text style={[styles.nodeText, { color: C.white }]}>{props.badge}</Text>
          )}
        </View>
      </Pulse>
      <View style={{ flex: 1, opacity: locked ? 0.5 : 1 }}>
        <Text style={styles.rowTitle}>{props.title}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {props.subtitle}
          {props.best
            ? props.best.completions === 0
              ? '  ·  kaluar me testin'
              : `  ·  më e mira ${props.best.best}/${props.best.total}`
            : ''}
        </Text>
      </View>
      {status === 'current' && (
        <View style={styles.go}>
          <Text style={styles.goText}>Fillo</Text>
        </View>
      )}
      {status === 'done' && <Ionicons name="refresh" size={18} color={C.muted} />}
      {status === 'premium' && (
        <View style={styles.plusBadge}>
          <Text style={styles.plusBadgeText}>PLUS</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  jp: { fontFamily: F.jp, fontSize: 13, color: C.muted, marginBottom: 2 },
  hello: { fontSize: 26, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5 },
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
  goalTitle: { fontSize: 16, fontFamily: F.bold, color: C.ink },
  goalNums: { fontSize: 14, fontFamily: F.bold, color: C.muted },
  goalHint: { fontFamily: F.regular, fontSize: 13, color: C.muted },
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
  nodeText: { fontSize: 17, fontFamily: F.jp, color: C.muted },
  rowTitle: { fontSize: 15, fontFamily: F.bold, color: C.ink },
  rowSub: { fontFamily: F.regular, fontSize: 13, color: C.muted, marginTop: 1 },
  go: { backgroundColor: C.red, paddingVertical: 8, paddingHorizontal: 14, borderRadius: R.pill },
  goText: { color: C.white, fontFamily: F.bold, fontSize: 13 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginTop: S.md,
    backgroundColor: C.goldSoft,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.goldLine,
    padding: S.lg,
  },
  reviewDone: { backgroundColor: C.greenSoft, borderColor: C.greenLine },
  placeCard: {
    marginTop: S.md,
    backgroundColor: C.redSoft,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
    gap: S.md,
  },
  placeHead: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  placeActions: { gap: S.xs },
  reviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: { fontSize: 16, fontFamily: F.bold, color: C.ink },
  reviewText: { fontFamily: F.regular, fontSize: 13.5, color: C.muted, marginTop: 2 },
  plusHead: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  plusBadge: { backgroundColor: C.gold, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: 8 },
  plusBadgeText: { color: C.white, fontSize: 11, fontFamily: F.bold, letterSpacing: 1 },
  plusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.panel,
    borderRadius: R.lg,
    padding: S.lg,
    marginBottom: S.md,
  },
  plusCardTitle: { color: C.white, fontSize: 17, fontFamily: F.bold },
  plusCardText: { color: 'rgba(255,255,255,0.75)', fontFamily: F.regular, fontSize: 13.5, marginTop: 2 },
});
