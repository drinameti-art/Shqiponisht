import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAccount } from '@/lib/account-context';
import type { SignUpResult } from '@/lib/account-backend';
import {
  accountErrorMessage,
  AGE_RANGES,
  LEVELS,
  emailProblem,
  normalizeUsername,
  passwordProblem,
  usernameProblem,
  type AgeRange,
  type Level,
} from '@/lib/account-types';
import { C, R, S } from '@/theme';

import { Button } from './ui';

export function Field({
  label,
  hint,
  error,
  left,
  right,
  ...input
}: TextInputProps & { label: string; hint?: ReactNode; error?: string | null; left?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, !!error && styles.inputError]}>
        {left}
        <TextInput placeholderTextColor={C.muted} style={styles.input} {...input} />
        {right}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        typeof hint === 'string' ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : (
          hint
        )
      ) : null}
    </View>
  );
}

export function PasswordField(props: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string | null;
  newPassword?: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <Field
      label={props.label ?? 'Fjalëkalimi'}
      value={props.value}
      onChangeText={props.onChangeText}
      error={props.error}
      hint={props.newPassword ? 'Të paktën 8 shenja, me shkronja dhe numra.' : undefined}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={props.newPassword ? 'new-password' : 'current-password'}
      textContentType={props.newPassword ? 'newPassword' : 'password'}
      right={
        <Pressable
          onPress={() => setShown((s) => !s)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
          style={styles.eye}>
          <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={22} color={C.muted} />
        </Pressable>
      }
    />
  );
}

type Availability = { username: string; available: boolean | null };

/** Checks a username with the server, a moment after the learner stops typing. */
export function useUsernameAvailability(
  raw: string,
  /** The learner's own current username, which counts as available. */
  current?: string,
): 'idle' | 'checking' | 'free' | 'taken' | 'unknown' | 'same' {
  const { usernameAvailable } = useAccount();
  const username = normalizeUsername(raw);
  const same = !!current && username === current;
  const valid = !usernameProblem(raw) && !same;
  const [result, setResult] = useState<Availability | null>(null);

  useEffect(() => {
    if (!valid) return;
    let alive = true;
    const t = setTimeout(() => {
      usernameAvailable(username).then(
        (available) => alive && setResult({ username, available }),
        () => alive && setResult({ username, available: null }),
      );
    }, 450);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [username, valid, usernameAvailable]);

  if (same) return 'same';
  if (!valid || !username) return 'idle';
  if (result?.username !== username) return 'checking';
  return result.available === null ? 'unknown' : result.available ? 'free' : 'taken';
}

/** Age-range chips. */
export function AgePicker({
  value,
  onChange,
  adultsOnly,
}: {
  value: AgeRange | null;
  onChange: (a: AgeRange) => void;
  /** Hide "Under 16" (account holders are 16+). */
  adultsOnly?: boolean;
}) {
  return (
    <View style={styles.chips}>
      {AGE_RANGES.filter((a) => !adultsOnly || a.id !== 'under16').map((a) => {
        const on = a.id === value;
        return (
          <Pressable
            key={a.id}
            onPress={() => onChange(a.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && { color: C.red }]}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "How much Japanese do you know?" options. */
export function LevelPicker({ value, onChange }: { value: Level | null; onChange: (l: Level) => void }) {
  return (
    <View style={{ gap: S.sm }}>
      {LEVELS.map((l) => {
        const on = l.id === value;
        return (
          <Pressable
            key={l.id}
            onPress={() => onChange(l.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.option, on && styles.chipOn]}>
            <View style={[styles.radio, on && { borderColor: C.red }]}>{on && <View style={styles.radioDot} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{l.title}</Text>
              <Text style={styles.optionDetail}>{l.detail}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export type AboutYou = { name: string; ageRange: AgeRange; level: Level };

/** Username, email and password: the last step of creating an account. */
export function SignUpForm({
  about,
  onDone,
}: {
  about: AboutYou;
  onDone: (result: SignUpResult, email: string) => void;
}) {
  const { signUp } = useAccount();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availability = useUsernameAvailability(username);

  const uProblem = username ? usernameProblem(username) : touched ? 'Zgjidh një emër përdoruesi.' : null;
  const eProblem = touched ? (email ? emailProblem(email) : 'Shkruaj email-in.') : null;
  const pProblem = touched ? (password ? passwordProblem(password) : 'Zgjidh një fjalëkalim.') : null;

  const submit = async () => {
    setTouched(true);
    setError(null);
    if (usernameProblem(username) || emailProblem(email) || passwordProblem(password) || availability === 'taken')
      return;
    setBusy(true);
    try {
      const result = await signUp({
        email,
        password,
        profile: { username: normalizeUsername(username), ...about },
      });
      onDone(result, email.trim());
    } catch (e) {
      setError(accountErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const usernameHint =
    availability === 'checking' ? (
      <Text style={styles.hint}>Po kontrollojmë…</Text>
    ) : availability === 'free' ? (
      <Text style={[styles.hint, { color: C.greenText }]}>
        <Ionicons name="checkmark-circle" size={14} /> @{normalizeUsername(username)} është i lirë
      </Text>
    ) : (
      'Shfaqet në profilin tënd. Shkronja a–z, numra, „_“ dhe „.“.'
    );

  return (
    <View>
      <Field
        label="Emri i përdoruesit"
        value={username}
        onChangeText={(t) => setUsername(t.replace(/\s/g, ''))}
        placeholder="p.sh. arta.k"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        maxLength={21}
        error={availability === 'taken' ? 'Ky emër është i zënë. Provo një tjetër.' : uProblem}
        hint={usernameHint}
        left={<Text style={styles.at}>@</Text>}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="emri@shembull.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        error={eProblem}
      />
      <PasswordField value={password} onChangeText={setPassword} error={pProblem} newPassword />
      {error && <Text style={[styles.error, styles.formError]}>{error}</Text>}
      <Button
        label={busy ? 'Po krijohet…' : 'Krijo llogarinë'}
        onPress={submit}
        disabled={busy}
        style={{ marginTop: S.md }}
      />
      <Text style={styles.terms}>
        Duke krijuar llogari pranon{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
          Kushtet e përdorimit
        </Text>{' '}
        dhe{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
          Politikën e privatësisë
        </Text>
        .
      </Text>
    </View>
  );
}

/** Email + password log-in, with a password-reset link. */
export function LogInForm({ onDone }: { onDone: () => void }) {
  const { signIn, resetPassword } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNote(null);
    if (emailProblem(email)) return setError(emailProblem(email));
    if (!password) return setError('Shkruaj fjalëkalimin.');
    setBusy(true);
    try {
      await signIn(email, password);
      onDone();
    } catch (e) {
      setError(accountErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError(null);
    if (emailProblem(email)) return setError('Shkruaj email-in e llogarisë, pastaj prek „Harrove fjalëkalimin?“.');
    try {
      await resetPassword(email);
      setNote(`Nëse ka një llogari me ${email.trim()}, të kemi dërguar një lidhje për ta ndryshuar fjalëkalimin.`);
    } catch (e) {
      setError(accountErrorMessage(e));
    }
  };

  return (
    <View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="emri@shembull.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />
      <PasswordField value={password} onChangeText={setPassword} />
      <Pressable onPress={forgot} accessibilityRole="button" hitSlop={8} style={styles.forgot}>
        <Text style={styles.link}>Harrove fjalëkalimin?</Text>
      </Pressable>
      {error && <Text style={[styles.error, styles.formError]}>{error}</Text>}
      {note && <Text style={[styles.hint, styles.formError]}>{note}</Text>}
      <Button label={busy ? 'Po hyn…' : 'Hyr'} onPress={submit} disabled={busy} style={{ marginTop: S.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: S.lg },
  label: { fontSize: 14, fontWeight: '800', color: C.ink, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
  },
  inputError: { borderColor: C.red },
  input: {
    flex: 1,
    paddingHorizontal: S.lg,
    paddingVertical: 13,
    fontSize: 17,
    color: C.ink,
    minWidth: 0,
    outlineWidth: 0,
  },
  eye: { paddingHorizontal: S.md },
  at: { paddingLeft: S.lg, marginRight: -S.md, fontSize: 17, fontWeight: '700', color: C.muted },
  hint: { fontSize: 13, lineHeight: 18, color: C.muted, marginTop: 6 },
  error: { fontSize: 13.5, lineHeight: 18, color: C.redText, marginTop: 6 },
  formError: { marginTop: 0, marginBottom: S.sm, fontSize: 14.5 },
  forgot: { alignSelf: 'flex-start', marginTop: -S.sm, marginBottom: S.md },
  link: { color: C.red, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip: {
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.paper,
  },
  chipOn: { borderColor: C.red, backgroundColor: C.redSoft },
  chipText: { fontSize: 15, fontWeight: '800', color: C.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: S.lg,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  optionTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  optionDetail: { fontSize: 13.5, color: C.muted, marginTop: 1 },
  terms: { fontSize: 13, lineHeight: 19, color: C.muted, textAlign: 'center', marginTop: S.md },
});
