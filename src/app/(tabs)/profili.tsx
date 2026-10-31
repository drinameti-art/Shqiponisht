import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, SectionTitle } from '@/components/ui';
import { LESSONS } from '@/data/lessons';
import { completedCount, currentStreak, DAILY_GOALS } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, R, S } from '@/theme';

export default function Profile() {
  const { progress, today, update, reset } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const done = completedCount(progress);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo-mark.png')} style={styles.mark} contentFit="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{progress.name || 'Nxënës/e'}</Text>
            <Text style={styles.sub}>Mëson japonisht me Shqiponisht</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={String(progress.xp)} label="XP gjithsej" />
          <Stat value={String(currentStreak(progress, today))} label="ditë rresht" />
          <Stat value={`${done}/${LESSONS.length}`} label="mësime" />
        </View>

        <SectionTitle>Qëllimi ditor</SectionTitle>
        <View style={styles.goals}>
          {DAILY_GOALS.map((g) => {
            const on = g === progress.dailyGoal;
            return (
              <Pressable
                key={g}
                onPress={() => update((p) => ({ ...p, dailyGoal: g }))}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.goal, on && styles.goalOn]}>
                <Text style={[styles.goalText, on && { color: C.red }]}>{g} XP</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle>Rreth shqiptimit</SectionTitle>
        <View style={styles.about}>
          <Text style={styles.aboutText}>
            Shqiponisht shkruan tingujt japonezë me shkronja shqipe, që t’i lexosh menjëherë saktë:
          </Text>
          {[
            ['chi', 'çi'],
            ['tsu', 'cu'],
            ['ji', 'xhi'],
            ['ya · yo', 'ja · jo'],
            ['wa', 'ua'],
            ['ō', 'oo'],
          ].map(([a, b]) => (
            <Text key={a} style={styles.rule}>
              {a} → <Text style={{ color: C.red, fontWeight: '800' }}>{b}</Text>
            </Text>
          ))}
        </View>

        <SectionTitle>Të dhënat</SectionTitle>
        <Button
          label={confirmReset ? 'Po, fshi gjithçka' : 'Rinis përparimin'}
          variant={confirmReset ? 'primary' : 'secondary'}
          onPress={() => {
            if (!confirmReset) return setConfirmReset(true);
            reset();
            setConfirmReset(false);
            router.replace('/welcome');
          }}
        />
        {confirmReset && (
          <Button label="Anulo" variant="ghost" onPress={() => setConfirmReset(false)} style={{ marginTop: S.sm }} />
        )}
      </ScrollView>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.lg },
  mark: { width: 72, height: 54 },
  name: { fontSize: 24, fontWeight: '800', color: C.ink },
  sub: { fontSize: 14, color: C.muted },
  stats: { flexDirection: 'row', gap: S.sm, marginTop: S.xl },
  stat: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: C.ink },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 2 },
  goals: { flexDirection: 'row', gap: S.sm },
  goal: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: S.md,
    alignItems: 'center',
  },
  goalOn: { borderColor: C.red, backgroundColor: C.redSoft },
  goalText: { fontSize: 15, fontWeight: '800', color: C.ink },
  about: { backgroundColor: C.paper, borderRadius: R.md, borderWidth: 1, borderColor: C.line, padding: S.lg, gap: 6 },
  aboutText: { fontSize: 14.5, lineHeight: 21, color: C.ink, marginBottom: 4 },
  rule: { fontSize: 15, color: C.ink },
});
