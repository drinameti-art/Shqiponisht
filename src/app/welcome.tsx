import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { DAILY_GOALS } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, R, S } from '@/theme';

const GOAL_LABELS: Record<number, string> = { 10: 'Lehtë', 20: 'Normal', 30: 'Serioz', 50: 'Intensiv' };

export default function Welcome() {
  const { progress, update } = useProgress();
  const [name, setName] = useState(progress.name);
  const [goal, setGoal] = useState(progress.dailyGoal);

  const start = () => {
    update((p) => ({ ...p, onboarded: true, name: name.trim(), dailyGoal: goal }));
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Shqiponisht — portë torii mbi hartën e Kosovës"
          />
          <Text style={styles.title}>Japonishtja, e shpjeguar në shqip.</Text>
          <Text style={styles.body}>
            Hiragana, katakana dhe fjalët e para — me shqiptim të shkruar ashtu si e lexon ti: ち = çi, つ = cu, じ =
            xhi.
          </Text>

          <Text style={styles.label}>Si të quajnë?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Emri yt"
            placeholderTextColor={C.muted}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={30}
          />

          <Text style={styles.label}>Qëllimi ditor</Text>
          <View style={styles.goals}>
            {DAILY_GOALS.map((g) => {
              const active = g === goal;
              return (
                <Pressable
                  key={g}
                  onPress={() => setGoal(g)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.goal, active && styles.goalActive]}>
                  <Text style={[styles.goalXp, active && { color: C.red }]}>{g} XP</Text>
                  <Text style={styles.goalName}>{GOAL_LABELS[g]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button label="Fillo" onPress={start} style={{ marginTop: S.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  content: { padding: S.xl, paddingBottom: S.xxl, maxWidth: 520, width: '100%', alignSelf: 'center' },
  logo: { width: 240, height: 240, alignSelf: 'center', marginTop: -S.lg },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5, lineHeight: 33 },
  body: { fontSize: 15.5, lineHeight: 22, color: C.muted, marginTop: S.sm },
  label: { fontSize: 13, fontWeight: '700', color: C.ink, marginTop: S.xl, marginBottom: S.sm },
  input: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    paddingVertical: 13,
    fontSize: 16,
    color: C.ink,
  },
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
  goalActive: { borderColor: C.red, backgroundColor: C.redSoft },
  goalXp: { fontSize: 15, fontWeight: '800', color: C.ink },
  goalName: { fontSize: 11.5, color: C.muted, marginTop: 2 },
});
