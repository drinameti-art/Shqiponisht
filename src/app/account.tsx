import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgePicker, Field, LevelPicker, LogInForm, SignUpForm } from '@/components/account-forms';
import { Button } from '@/components/ui';
import { useAccount } from '@/lib/account-context';
import { canHaveAccount, type AgeRange, type Level } from '@/lib/account-types';
import { useProgress } from '@/lib/progress-context';
import { C, F, R, S } from '@/theme';

type Mode = 'signup' | 'login';

/** Create an account or log in, for learners who skipped it during onboarding. */
export default function AccountScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const { progress } = useProgress();
  const { kind } = useAccount();
  const [mode, setMode] = useState<Mode>(params.mode === 'login' ? 'login' : 'signup');
  const [name, setName] = useState(progress.name);
  const [age, setAge] = useState<AgeRange | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/profili'));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
            <Ionicons name="close" size={28} color={C.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {verifyEmail ? (
            <View>
              <Ionicons name="mail-unread-outline" size={48} color={C.red} />
              <Text style={[styles.title, { marginTop: S.md }]}>Konfirmo email-in</Text>
              <Text style={styles.lead}>
                Të dërguam një lidhje te <Text style={{ fontFamily: F.bold, color: C.ink }}>{verifyEmail}</Text>. Hape
                për ta aktivizuar llogarinë, pastaj kthehu këtu dhe hyr.
              </Text>
              <Button
                label="Hyr"
                onPress={() => {
                  setVerifyEmail(null);
                  setMode('login');
                }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>{mode === 'signup' ? 'Krijo llogari' : 'Hyr në llogari'}</Text>
              <Text style={styles.lead}>
                {mode === 'signup'
                  ? 'Përparimi yt në këtë telefon kalon në llogari dhe e vazhdon në çdo telefon.'
                  : 'Përparimi i llogarisë bashkohet me atë në këtë telefon: nuk humbet asgjë.'}
              </Text>
              <View style={styles.seg} accessibilityRole="tablist">
                {(['signup', 'login'] as const).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: mode === m }}
                    style={[styles.segItem, mode === m && styles.segOn]}>
                    <Text style={[styles.segText, mode === m && { color: C.onPanel }]}>
                      {m === 'signup' ? 'Llogari e re' : 'Kam llogari'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {mode === 'login' && <LogInForm onDone={close} />}

              {mode === 'signup' && (
                <>
                  <Field
                    label="Emri"
                    value={name}
                    onChangeText={setName}
                    placeholder="Emri yt"
                    autoCapitalize="words"
                    maxLength={30}
                  />
                  <Text style={styles.label}>Mosha</Text>
                  <AgePicker value={age} onChange={setAge} />
                  {age === 'under16' ? (
                    <Text style={styles.young}>
                      Llogaritë online janë për moshën 16 vjeç e lart. Përparimi yt mbetet i ruajtur në këtë telefon,
                      dhe mund ta kalosh në një telefon tjetër me kodin e rezervimit te Profili.
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.label, { marginTop: S.lg }]}>Sa japonisht di?</Text>
                      <LevelPicker value={level} onChange={setLevel} />
                      <View style={{ height: S.xl }} />
                      {canHaveAccount(age) && level && name.trim() ? (
                        <SignUpForm
                          about={{ name: name.trim(), ageRange: age!, level }}
                          onDone={(result, email) => (result.status === 'signed-in' ? close() : setVerifyEmail(email))}
                        />
                      ) : (
                        <Text style={styles.hint}>Plotëso emrin, moshën dhe nivelin për të vazhduar.</Text>
                      )}
                    </>
                  )}
                </>
              )}
              {kind === 'demo' && <Text style={styles.demo}>Version demo: llogaritë ruhen vetëm në këtë pajisje.</Text>}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.cream },
  top: { paddingHorizontal: S.xl, paddingTop: S.md, alignItems: 'flex-start' },
  body: { padding: S.xl, paddingTop: S.md, maxWidth: 520, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5 },
  lead: { fontFamily: F.regular, fontSize: 15.5, lineHeight: 22, color: C.muted, marginTop: S.sm, marginBottom: S.xl },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.pill, padding: 4, marginBottom: S.xl },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: R.pill, alignItems: 'center' },
  segOn: { backgroundColor: C.panel },
  segText: { fontSize: 15, fontFamily: F.bold, color: C.muted },
  label: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: S.sm },
  young: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.ink, marginTop: S.lg },
  hint: { fontFamily: F.regular, fontSize: 14, color: C.muted, textAlign: 'center' },
  demo: { fontFamily: F.italic, fontSize: 12.5, color: C.muted, textAlign: 'center', marginTop: S.lg },
});
