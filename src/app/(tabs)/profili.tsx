import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, SectionTitle } from '@/components/ui';
import { LESSONS } from '@/data/lessons';
import { completedCount, currentStreak, DAILY_GOALS } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, R, S } from '@/theme';

export default function Profile() {
  const { progress, today, update, reset, plus } = useProgress();
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

        <SectionTitle>Cilësimet</SectionTitle>
        <Pressable
          onPress={() => update((p) => ({ ...p, sound: !p.sound }))}
          accessibilityRole="switch"
          accessibilityState={{ checked: progress.sound }}
          style={styles.setting}>
          <Ionicons name={progress.sound ? 'volume-high' : 'volume-mute'} size={22} color={C.ink} />
          <Text style={styles.settingText}>Tingujt</Text>
          <View style={[styles.toggle, progress.sound && styles.toggleOn]}>
            <View style={[styles.knob, progress.sound && styles.knobOn]} />
          </View>
        </Pressable>

        <SectionTitle>Shqiponisht Plus</SectionTitle>
        <View style={styles.about}>
          <Text style={styles.aboutText}>
            {progress.plus
              ? 'Plus është aktiv. Ke qasje në të gjitha mësimet e Nivelit 2.'
              : plus
                ? 'Plus është aktiv në modalitetin demo.'
                : 'Niveli 2 — folje, fjali, koha dhe 27 kanji të reja — është pjesë e Plus.'}
          </Text>
          {progress.plus ? (
            <Button
              label="Menaxho abonimin"
              variant="secondary"
              onPress={() =>
                void Linking.openURL(
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/account/subscriptions'
                    : 'https://play.google.com/store/account/subscriptions',
                )
              }
            />
          ) : progress.demoPlus ? (
            <Button
              label="Çaktivizo demon"
              variant="secondary"
              onPress={() => update((p) => ({ ...p, demoPlus: false }))}
            />
          ) : (
            <Button label="Shiko Plus" onPress={() => router.push('/plus')} />
          )}
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

        <View style={styles.legalLinks}>
          <Text
            style={styles.legalLink}
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })}>
            Kushtet e përdorimit
          </Text>
          <Text
            style={styles.legalLink}
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })}>
            Politika e privatësisë
          </Text>
        </View>

        <Text style={styles.credits}>
          Rendi i vijave: KanjiVG © Ulrich Apel, licencë CC BY-SA 3.0 (kanjivg.tagaini.net).
        </Text>
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
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
  },
  settingText: { flex: 1, fontSize: 16, fontWeight: '600', color: C.ink },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: C.line, padding: 3 },
  toggleOn: { backgroundColor: C.green },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.white },
  knobOn: { transform: [{ translateX: 20 }] },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: S.lg, marginTop: S.xl },
  legalLink: { fontSize: 13.5, color: C.ink, textDecorationLine: 'underline' },
  credits: { fontSize: 11.5, lineHeight: 16, color: C.muted, textAlign: 'center', marginTop: S.xl },
});
