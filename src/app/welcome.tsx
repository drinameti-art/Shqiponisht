import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EASE_OUT } from '@/components/motion';
import { AgePicker, Field, LevelPicker, LogInForm, SignUpForm } from '@/components/account-forms';
import { BrandHeader } from '@/components/brand';
import { InkText, Reveal, step as at } from '@/components/brand-motion';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui';
import { useAccount } from '@/lib/account-context';
import { canHaveAccount, type AgeRange, type Level } from '@/lib/account-types';
import { decodeBackup } from '@/lib/backup';
import { DAILY_GOALS } from '@/lib/progress';
import { useProgress } from '@/lib/progress-context';
import { C, F, R, S } from '@/theme';

const LOGO_WIDTH = Math.min(300, Dimensions.get('window').width * 0.66);

type Step = 'cover' | 'about' | 'goal' | 'account' | 'young' | 'verify' | 'login' | 'restore';

const FLOW: Step[] = ['about', 'goal', 'account'];

/** Daily goals as learners think about them: minutes first, XP second. */
const GOALS: Record<number, { title: string; time: string }> = {
  10: { title: 'Lehtë', time: '5 minuta në ditë' },
  20: { title: 'Normal', time: '10 minuta në ditë' },
  30: { title: 'Serioz', time: '15 minuta në ditë' },
  50: { title: 'Intensiv', time: '20+ minuta në ditë' },
};

export default function Welcome() {
  const { progress, update } = useProgress();
  const { kind } = useAccount();
  const [step, setStep] = useState<Step>('cover');
  const [name, setName] = useState(progress.name);
  const [age, setAge] = useState<AgeRange | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState(progress.dailyGoal);
  const [aboutTouched, setAboutTouched] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  const finish = () => {
    update((p) => ({ ...p, onboarded: true, name: name.trim() || p.name, dailyGoal: goal, level: level ?? p.level }));
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

  const continueAbout = () => {
    setAboutTouched(true);
    if (name.trim() && age && level) setStep('goal');
  };

  if (step === 'cover') {
    // One element at a time, as in the reels: header, logo, title, line, button (docs/BRAND.md §5).
    return (
      <View style={styles.cover}>
        <SafeAreaView edges={['top']} style={styles.hero}>
          <Reveal style={styles.coverHeader}>
            <BrandHeader label="JAPONISHT" />
          </Reveal>
          <Reveal delay={at(1)} distance={14} style={styles.logoWrap}>
            <Logo width={LOGO_WIDTH} wordmark />
          </Reveal>
        </SafeAreaView>
        <SafeAreaView edges={['bottom']} style={styles.coverBody}>
          <View>
            <InkText delay={at(3)} style={styles.title}>
              Mëso japonisht në shqip
            </InkText>
            <InkText delay={at(4)} color={C.muted} style={styles.lead}>
              Pak minuta në ditë: shkronja, fjalë dhe zë i vërtetë japonez.
            </InkText>
          </View>
          <Reveal delay={at(6)} style={styles.coverActions}>
            <Button label="Fillo" onPress={() => setStep('about')} />
            <Pressable onPress={() => setStep('login')} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.secondary}>
                Ke llogari? <Text style={styles.secondaryStrong}>Hyr</Text>
              </Text>
            </Pressable>
          </Reveal>
        </SafeAreaView>
      </View>
    );
  }

  const back = () => {
    const prev: Partial<Record<Step, Step>> = { goal: 'about', account: 'goal', young: 'goal', restore: 'login' };
    setStep(prev[step] ?? 'cover');
  };
  const flowIndex = FLOW.indexOf(step === 'young' ? 'account' : step);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          {step !== 'verify' ? (
            <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Kthehu" hitSlop={12}>
              <Ionicons name="chevron-back" size={26} color={C.muted} />
            </Pressable>
          ) : (
            <View style={{ width: 26 }} />
          )}
          {flowIndex >= 0 && (
            <View style={styles.dots}>
              {FLOW.map((s, i) => (
                <View key={s} style={[styles.dot, i <= flowIndex && styles.dotOn]} />
              ))}
            </View>
          )}
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === 'about' && (
            <Animated.View key="about" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Na trego pak për veten</Text>
              <Text style={styles.stepLead}>Kështu e përshtatim aplikacionin për ty.</Text>
              <Field
                label="Emri"
                value={name}
                onChangeText={setName}
                placeholder="Emri yt"
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                maxLength={30}
                error={aboutTouched && !name.trim() ? 'Shkruaj emrin tënd.' : null}
              />
              <Text style={styles.label}>Mosha</Text>
              <AgePicker value={age} onChange={setAge} />
              {aboutTouched && !age && <Text style={styles.error}>Zgjidh moshën.</Text>}
              <Text style={[styles.label, { marginTop: S.lg }]}>Sa japonisht di?</Text>
              <LevelPicker value={level} onChange={setLevel} />
              {aboutTouched && !level && <Text style={styles.error}>Zgjidh nivelin tënd.</Text>}
              <Button label="Vazhdo" onPress={continueAbout} style={{ marginTop: S.xl }} />
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
              <Button
                label="Vazhdo"
                onPress={() => setStep(canHaveAccount(age) ? 'account' : 'young')}
                style={{ marginTop: S.xl }}
              />
            </Animated.View>
          )}

          {step === 'account' && age && level && (
            <Animated.View key="account" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Krijo llogarinë tënde</Text>
              <Text style={styles.stepLead}>Përparimi ruhet në llogari, që ta vazhdosh në çdo telefon.</Text>
              <SignUpForm
                about={{ name: name.trim(), ageRange: age, level }}
                onDone={(result, email) => {
                  if (result.status === 'signed-in') finish();
                  else {
                    setVerifyEmail(email);
                    setStep('verify');
                  }
                }}
              />
              <Pressable onPress={finish} accessibilityRole="button" hitSlop={8} style={styles.skip}>
                <Text style={styles.secondary}>
                  <Text style={styles.secondaryStrong}>Vazhdo pa llogari</Text> · përparimi mbetet vetëm në këtë telefon
                </Text>
              </Pressable>
              {kind === 'demo' && <Text style={styles.demo}>Version demo: llogaritë ruhen vetëm në këtë pajisje.</Text>}
            </Animated.View>
          )}

          {step === 'young' && (
            <Animated.View key="young" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Gati për të filluar!</Text>
              <Text style={styles.stepLead}>
                Llogaritë online janë për moshën 16 vjeç e lart, ndaj përparimi yt ruhet vetëm në këtë telefon. Të
                gjitha mësimet funksionojnë njësoj.
              </Text>
              <Text style={styles.stepLead}>
                Për ta kaluar në një telefon tjetër, përdor kodin e rezervimit te Profili.
              </Text>
              <Button label="Le të fillojmë!" onPress={finish} />
            </Animated.View>
          )}

          {step === 'verify' && (
            <Animated.View key="verify" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Ionicons name="mail-unread-outline" size={48} color={C.red} />
              <Text style={[styles.stepTitle, { marginTop: S.md }]}>Konfirmo email-in</Text>
              <Text style={styles.stepLead}>
                Të dërguam një lidhje te <Text style={{ fontFamily: F.bold, color: C.ink }}>{verifyEmail}</Text>. Hape
                për ta aktivizuar llogarinë, pastaj hyr nga Profili. Ndërkohë mund të fillosh mësimet.
              </Text>
              <Button label="Le të fillojmë!" onPress={finish} />
            </Animated.View>
          )}

          {step === 'login' && (
            <Animated.View key="login" entering={FadeInRight.duration(260).easing(EASE_OUT)} style={styles.stepBox}>
              <Text style={styles.stepTitle}>Mirë se u ktheve!</Text>
              <Text style={styles.stepLead}>Hyr në llogari dhe vazhdo nga ku e le.</Text>
              <LogInForm onDone={() => router.replace('/')} />
              <Pressable onPress={() => setStep('restore')} accessibilityRole="button" hitSlop={8} style={styles.skip}>
                <Text style={styles.secondary}>
                  Pa llogari? <Text style={styles.secondaryStrong}>Rikthe me kod rezervimi</Text>
                </Text>
              </Pressable>
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
  coverHeader: { position: 'absolute', top: S.lg, left: S.xl, right: S.xl, marginTop: S.xxl },
  logoWrap: { width: '100%', alignItems: 'center' },
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
  brand: { fontSize: 14, fontFamily: F.bold, letterSpacing: 3, color: C.red, textAlign: 'center' },
  title: {
    fontSize: 34,
    fontFamily: F.bold,
    color: C.ink,
    letterSpacing: -0.8,
    lineHeight: 39,
    marginTop: S.sm,
    textAlign: 'center',
  },
  lead: {
    fontFamily: F.regular,
    fontSize: 16,
    lineHeight: 23,
    color: C.muted,
    marginTop: S.sm,
    maxWidth: 340,
    textAlign: 'center',
    alignSelf: 'center',
  },
  coverActions: { gap: S.lg, paddingTop: S.lg },
  secondary: { fontFamily: F.regular, fontSize: 14, color: C.muted, textAlign: 'center' },
  secondaryStrong: { color: C.ink, fontFamily: F.bold, textDecorationLine: 'underline' },
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
  stepTitle: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5, lineHeight: 33 },
  stepLead: {
    fontFamily: F.regular,
    fontSize: 15.5,
    lineHeight: 22,
    color: C.muted,
    marginTop: S.sm,
    marginBottom: S.xl,
  },
  input: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    paddingVertical: 14,
    fontFamily: F.regular,
    fontSize: 17,
    color: C.ink,
  },
  codeInput: { minHeight: 110, fontFamily: F.regular, fontSize: 14, textAlignVertical: 'top' },
  error: { color: C.redText, fontFamily: F.regular, fontSize: 14, marginTop: S.sm },
  label: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: S.sm },
  skip: { marginTop: S.xl, alignItems: 'center' },
  demo: { fontFamily: F.italic, fontSize: 12.5, color: C.muted, textAlign: 'center', marginTop: S.md },
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
  goalTitle: { fontSize: 16, fontFamily: F.bold, color: C.ink },
  goalTime: { fontFamily: F.regular, fontSize: 13.5, color: C.muted, marginTop: 1 },
  goalXp: { fontSize: 14, fontFamily: F.bold, color: C.muted },
});
