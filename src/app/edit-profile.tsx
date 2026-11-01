import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgePicker, Field, LevelPicker, PasswordField, useUsernameAvailability } from '@/components/account-forms';
import { Button, SectionTitle } from '@/components/ui';
import { useAccount } from '@/lib/account-context';
import {
  accountErrorMessage,
  LEVELS,
  normalizeUsername,
  passwordProblem,
  usernameProblem,
  type AgeRange,
  type Level,
} from '@/lib/account-types';
import { useProgress } from '@/lib/progress-context';
import { C, F, S } from '@/theme';

const isLevel = (v: string | null | undefined): v is Level => LEVELS.some((l) => l.id === v);

/**
 * Change name and level (everyone), and username, age range and password
 * (learners with an account). Name and level are also kept on the phone.
 */
export default function EditProfile() {
  const { progress, update } = useProgress();
  const { session, profile, updateProfile, changePassword } = useAccount();
  const [name, setName] = useState(profile?.name || progress.name);
  const [level, setLevel] = useState<Level | null>(profile?.level ?? (isLevel(progress.level) ? progress.level : null));
  const [username, setUsername] = useState(profile?.username ?? '');
  const [age, setAge] = useState<AgeRange | null>(profile?.ageRange ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  const availability = useUsernameAvailability(username, profile?.username);
  const hasAccount = !!session && !!profile;
  const uProblem = hasAccount && availability !== 'same' ? usernameProblem(username) : null;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/profili'));

  const save = async () => {
    setError(null);
    setSaved(false);
    if (!name.trim()) return setError('Shkruaj emrin tënd.');
    if (hasAccount) {
      if (uProblem) return setError(uProblem);
      if (availability === 'taken') return setError('Ky emër përdoruesi është i zënë. Provo një tjetër.');
    }
    setBusy(true);
    try {
      if (hasAccount) {
        await updateProfile({
          username: normalizeUsername(username),
          name: name.trim(),
          ageRange: age ?? profile.ageRange,
          level: level ?? profile.level,
        });
      }
      update((p) => ({ ...p, name: name.trim(), level: level ?? p.level }));
      setSaved(true);
    } catch (e) {
      setError(accountErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    setPwError(null);
    setPwDone(false);
    const problem = passwordProblem(password);
    if (problem) return setPwError(problem);
    if (password !== password2) return setPwError('Fjalëkalimet nuk përputhen.');
    setPwBusy(true);
    try {
      await changePassword(password);
      setPassword('');
      setPassword2('');
      setPwDone(true);
    } catch (e) {
      setPwError(accountErrorMessage(e));
    } finally {
      setPwBusy(false);
    }
  };

  const usernameHint =
    availability === 'checking'
      ? 'Po kontrollojmë…'
      : availability === 'free'
        ? `@${normalizeUsername(username)} është i lirë`
        : 'Shkronja a–z, numra, „_“ dhe „.“.';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Mbyll" hitSlop={12}>
            <Ionicons name="close" size={28} color={C.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Ndrysho profilin</Text>

          <Field
            label="Emri"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setSaved(false);
            }}
            placeholder="Emri yt"
            autoCapitalize="words"
            maxLength={30}
          />
          {hasAccount && (
            <Field
              label="Emri i përdoruesit"
              value={username}
              onChangeText={(t) => {
                setUsername(t.replace(/\s/g, ''));
                setSaved(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={21}
              error={availability === 'taken' ? 'Ky emër është i zënë. Provo një tjetër.' : uProblem}
              hint={usernameHint}
              left={<Text style={styles.at}>@</Text>}
            />
          )}
          {hasAccount && (
            <>
              <Text style={styles.label}>Mosha</Text>
              <AgePicker
                value={age}
                adultsOnly
                onChange={(a) => {
                  setAge(a);
                  setSaved(false);
                }}
              />
            </>
          )}
          <Text style={[styles.label, { marginTop: S.lg }]}>Sa japonisht di?</Text>
          <LevelPicker
            value={level}
            onChange={(l) => {
              setLevel(l);
              setSaved(false);
            }}
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {saved && (
            <Text style={styles.ok}>
              <Ionicons name="checkmark-circle" size={15} /> Ndryshimet u ruajtën.
            </Text>
          )}
          <Button
            label={busy ? 'Po ruhet…' : 'Ruaj ndryshimet'}
            onPress={save}
            disabled={busy}
            style={{ marginTop: S.lg }}
          />

          <Button
            label="Bëj testin e nivelit"
            variant="secondary"
            onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: 'placement' } })}
            style={{ marginTop: S.sm }}
          />
          <Text style={styles.hint}>Testi kapërcen mësimet që i di tashmë. Nuk fshin asgjë nga përparimi yt.</Text>

          {hasAccount && (
            <>
              <SectionTitle>Fjalëkalimi</SectionTitle>
              <PasswordField label="Fjalëkalimi i ri" value={password} onChangeText={setPassword} newPassword />
              <PasswordField label="Përsërit fjalëkalimin e ri" value={password2} onChangeText={setPassword2} />
              {pwError && <Text style={styles.error}>{pwError}</Text>}
              {pwDone && (
                <Text style={styles.ok}>
                  <Ionicons name="checkmark-circle" size={15} /> Fjalëkalimi u ndryshua.
                </Text>
              )}
              <Button
                label={pwBusy ? 'Po ndryshohet…' : 'Ndrysho fjalëkalimin'}
                variant="secondary"
                onPress={savePassword}
                disabled={pwBusy || !password}
              />
              <Text style={styles.hint}>Email-i i llogarisë: {session.email}</Text>
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
  body: { padding: S.xl, paddingTop: S.md, paddingBottom: S.xxl, maxWidth: 520, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontFamily: F.bold, color: C.ink, letterSpacing: -0.5, marginBottom: S.xl },
  label: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: S.sm },
  at: { paddingLeft: S.lg, marginRight: -S.md, fontSize: 17, fontFamily: F.bold, color: C.muted },
  error: { fontFamily: F.regular, fontSize: 14.5, lineHeight: 20, color: C.redText, marginTop: S.md },
  ok: { fontFamily: F.regular, fontSize: 14.5, lineHeight: 20, color: C.greenText, marginTop: S.md },
  hint: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted, marginTop: S.sm, textAlign: 'center' },
});
