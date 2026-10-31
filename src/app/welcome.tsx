import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EASE_OUT } from '@/components/motion';
import { Button } from '@/components/ui';
import { decodeBackup } from '@/lib/backup';
import { DAILY_GOALS } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, R, S } from '@/theme';

type Step = 'cover' | 'name' | 'goal' | 'restore';

/** Daily goals as learners think about them: minutes first, XP second. */
const GOALS: Record<number, { title: string; time: string }> = {
  10: { title: 'Lehtë', time: '5 minuta në ditë' },
  20: { title: 'Normal', time: '10 minuta në ditë' },
  30: { title: 'Serioz', time: '15 minuta në ditë' },
  50: { title: 'Intensiv', time: '20+ minuta në ditë' },
};

export default function Welcome() {
  const { progress, update } = useProgress();
  const [step, setStep] = useState<Step>('cover');
  const [name, setName] = useState(progress.name);
  const [goal, setGoal] = useState(progress.dailyGoal);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  const finish = () => {
    update((p) => ({ ...p, onboarded: true, name: name.trim(), dailyGoal: goal }));
    router.replace('/');
  };

  const restore = () => {
    const restored = decodeBackup(code, { plus: progress.plus, demoPlus: progress.demoPlus });
    if (!restored) {
      setCodeError(true);
      return;
    }
    update(() => restored);
    router.replace('/');
  };

  if (step === 'cover') {
    return (
      <View style={styles.cover}>
        <SafeAreaView edges={['top']} style={styles.hero}>
          <Animated.View entering={ZoomIn.duration(600).easing(EASE_OUT)} style={styles.logoWrap}>
            <Image
              source={require('@/assets/images/logo-mark.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Logo e Shqiponisht: portë torii mbi hartën e Kosovës"
            />
          </Animated.View>
        </SafeAreaView>
        <SafeAreaView edges={['bottom']} style={styles.coverBody}>
          <Animated.View entering={FadeInDown.delay(250).duration(500).easing(EASE_OUT)}>
            <Text style={styles.brand}>SHQIPONISHT</Text>
            <Text style={styles.title}>Mëso japonisht në shqip</Text>
            <Text style={styles.lead}>Pak minuta në ditë: shkronja, fjalë dhe zë i vërtetë japonez.</Text>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.coverActions}>
            <Button label="Fillo" onPress={() => setStep('name')} />
            <Pressable onPress={() => setStep('restore')} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.secondary}>
                Ke një kod rezervimi? <Text style={styles.secondaryStrong}>Rikthe përparimin</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  const back = () => setStep(step === 'goal' ? 'name' : 'cover');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Kthehu" hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={C.muted} />
          </Pressable>
          {step !== 'restore' && (
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotOn]} />
              <View style={[styles.dot, step === 'goal' && styles.dotOn]} />
            </View>
          )}
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 'name' && (
            <Animated.View key="name" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Si të quajmë?</Text>
              <Text style={styles.stepLead}>Emri shfaqet vetëm në telefonin tënd.</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Emri yt"
                placeholderTextColor={C.muted}
                style={styles.input}
                autoCapitalize="words"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => setStep('goal')}
                maxLength={30}
              />
              <Button label="Vazhdo" onPress={() => setStep('goal')} style={{ marginTop: S.xl }} />
              {!name.trim() && (
                <Text style={[styles.secondary, { marginTop: S.md }]}>Mund ta lësh bosh dhe ta shtosh më vonë.</Text>
              )}
            </Animated.View>
          )}

          {step === 'goal' && (
            <Animated.View key="goal" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>
                {name.trim() ? `${name.trim()}, sa kohë do në ditë?` : 'Sa kohë do në ditë?'}
              </Text>
              <Text style={styles.stepLead}>Mund ta ndryshosh kur të duash te Profili.</Text>
              <View style={styles.goals}>
                {DAILY_GOALS.map((g) => {
                  const on = g === goal;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGoal(g)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      style={[styles.goal, on && styles.goalOn]}>
                      <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.goalTitle}>{GOALS[g].title}</Text>
                        <Text style={styles.goalTime}>{GOALS[g].time}</Text>
                      </View>
                      <Text style={[styles.goalXp, on && { color: C.red }]}>{g} XP</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button label="Le të fillojmë!" onPress={finish} style={{ marginTop: S.xl }} />
            </Animated.View>
          )}

          {step === 'restore' && (
            <Animated.View key="restore" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Rikthe përparimin</Text>
              <Text style={styles.stepLead}>
                Ngjit kodin e rezervimit që ke ruajtur nga Profili i telefonit tjetër (fillon me SHQ1-).
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setCodeError(false);
                }}
                placeholder="SHQ1-…"
                placeholderTextColor={C.muted}
                style={[styles.input, styles.codeInput]}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              {codeError && (
                <Text style={styles.error}>Ky kod nuk është i vlefshëm. Kontrollo që e ke ngjitur të plotë.</Text>
              )}
              <Button label="Rikthe" onPress={restore} disabled={!code.trim()} style={{ marginTop: S.lg }} />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cover: { flex: 1, backgroundColor: C.cream },
  hero: { flex: 1.15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xl },
  logoWrap: { width: '100%', alignItems: 'center' },
  logo: { width: '78%', maxWidth: 340, aspectRatio: 900 / 667 },
  coverBody: {
    flex: 1,
    paddingHorizontal: S.xl,
    paddingTop: S.md,
    paddingBottom: S.lg,
    justifyContent: 'space-between',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brand: { fontSize: 14, fontWeight: '800', letterSpacing: 3, color: C.red, textAlign: 'center' },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.8,
    lineHeight: 39,
    marginTop: S.sm,
    textAlign: 'center',
  },
  lead: {
    fontSize: 16,
    lineHeight: 23,
    color: C.muted,
    marginTop: S.sm,
    maxWidth: 340,
    textAlign: 'center',
    alignSelf: 'center',
  },
  coverActions: { gap: S.lg, paddingTop: S.lg },
  secondary: { fontSize: 14, color: C.muted, textAlign: 'center' },
  secondaryStrong: { color: C.ink, fontWeight: '700', textDecorationLine: 'underline' },
  safe: { flex: 1, backgroundColor: C.cream },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    paddingTop: S.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 6, borderRadius: 3, backgroundColor: C.line },
  dotOn: { backgroundColor: C.red },
  body: { padding: S.xl, maxWidth: 520, width: '100%', alignSelf: 'center' },
  stepBox: { marginTop: S.lg },
  stepTitle: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5, lineHeight: 33 },
  stepLead: { fontSize: 15.5, lineHeight: 22, color: C.muted, marginTop: S.sm, marginBottom: S.xl },
  input: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    paddingVertical: 14,
    fontSize: 17,
    color: C.ink,
  },
  codeInput: { minHeight: 110, fontSize: 14, textAlignVertical: 'top' },
  error: { color: C.redDark, fontSize: 14, marginTop: S.sm },
  goals: { gap: S.sm },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.lg,
  },
  goalOn: { borderColor: C.red, backgroundColor: C.redSoft },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: C.red },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  goalTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  goalTime: { fontSize: 13.5, color: C.muted, marginTop: 1 },
  goalXp: { fontSize: 14, fontWeight: '800', color: C.muted },
});
