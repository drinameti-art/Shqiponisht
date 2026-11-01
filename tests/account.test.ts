import { describe, expect, it } from 'vitest';

import { createDemoBackend, type KeyValue } from '@/lib/account-demo';
import {
  AccountError,
  canHaveAccount,
  emailProblem,
  mergeProgress,
  normalizeUsername,
  parseSynced,
  passwordProblem,
  supabaseErrorCode,
  toSynced,
  usernameProblem,
} from '@/lib/account-types';
import { INITIAL_PROGRESS, type Progress } from '@/lib/progress';

function memory(): KeyValue {
  const m = new Map<string, string>();
  return {
    getItem: async (k) => m.get(k) ?? null,
    setItem: async (k, v) => void m.set(k, v),
    removeItem: async (k) => void m.delete(k),
  };
}

const progress = (over: Partial<Progress>): Progress => ({ ...INITIAL_PROGRESS, ...over });
const ARTA = { username: 'Arta.K', name: 'Arta', ageRange: '18-24', level: 'new' } as const;

describe('sign-up validation', () => {
  it('accepts simple usernames and stores them lower-case without @', () => {
    expect(usernameProblem('arta')).toBeNull();
    expect(usernameProblem('@Arta_99')).toBeNull();
    expect(normalizeUsername(' @Arta.K ')).toBe('arta.k');
  });

  it('rejects usernames the database would refuse', () => {
    for (const bad of ['ab', '1arta', 'arta!', 'artë', 'arta..k', 'arta_', 'a'.repeat(21)]) {
      expect(usernameProblem(bad), bad).not.toBeNull();
    }
  });

  it('checks email and password', () => {
    expect(emailProblem('arta@example.com')).toBeNull();
    expect(emailProblem('arta@example')).not.toBeNull();
    expect(passwordProblem('short1')).not.toBeNull();
    expect(passwordProblem('longenough')).not.toBeNull();
    expect(passwordProblem('longenough1')).toBeNull();
  });

  it('keeps under-16s off online accounts', () => {
    expect(canHaveAccount('under16')).toBe(false);
    expect(canHaveAccount(null)).toBe(false);
    expect(canHaveAccount('16-17')).toBe(true);
  });
});

describe('mergeProgress', () => {
  it('keeps the best of both sides when logging in on a second phone', () => {
    const local = progress({
      xp: 40,
      lessons: { 'hira-a': { best: 8, total: 10, completions: 1 }, 'hira-k': { best: 5, total: 10, completions: 2 } },
      review: { 'kana:あ': { box: 2, due: '2026-11-03', seen: 3, lapses: 0 } },
      streak: { count: 2, lastDay: '2026-10-30' },
      sound: false,
    });
    const remote = toSynced(
      progress({
        xp: 120,
        lessons: { 'hira-a': { best: 10, total: 10, completions: 3 }, numrat: { best: 7, total: 10, completions: 1 } },
        review: { 'kana:あ': { box: 1, due: '2026-11-01', seen: 2, lapses: 1 } },
        streak: { count: 6, lastDay: '2026-10-31' },
      }),
    );
    const merged = mergeProgress(local, remote);
    expect(merged.xp).toBe(120);
    expect(merged.lessons['hira-a']).toEqual({ best: 10, total: 10, completions: 3 });
    expect(merged.lessons['hira-k']).toEqual(local.lessons['hira-k']);
    expect(merged.lessons.numrat.best).toBe(7);
    expect(merged.review['kana:あ'].seen).toBe(3);
    expect(merged.streak).toEqual({ count: 6, lastDay: '2026-10-31' });
    expect(merged.sound).toBe(false); // device settings stay
  });

  it('is a no-op without account progress and idempotent', () => {
    const local = progress({ xp: 10 });
    expect(mergeProgress(local, null)).toBe(local);
    const once = mergeProgress(local, toSynced(progress({ xp: 50 })));
    expect(mergeProgress(once, toSynced(once))).toEqual(once);
  });

  it('never syncs the subscription or device settings', () => {
    const synced = toSynced(progress({ plus: true, demoPlus: true, sound: false }));
    expect(synced).not.toHaveProperty('plus');
    expect(synced).not.toHaveProperty('sound');
    expect(synced).not.toHaveProperty('reminder');
  });

  it('ignores account data it cannot read', () => {
    expect(parseSynced(null)).toBeNull();
    expect(parseSynced({ version: 2 })).toBeNull();
    expect(parseSynced({ version: 1, xp: 'lots' })?.xp).toBe(0);
  });
});

describe('demo account backend', () => {
  it('signs up, checks usernames, saves and loads progress', async () => {
    const b = createDemoBackend(memory());
    expect(await b.usernameAvailable('arta.k')).toBe(true);
    const res = await b.signUp({ email: 'Arta@Example.com', password: 'secret123', profile: ARTA });
    expect(res.status).toBe('signed-in');
    expect(await b.usernameAvailable('ARTA.K')).toBe(false);
    expect((await b.loadProfile())?.username).toBe('arta.k');
    await b.saveProgress(toSynced(progress({ xp: 33 })));
    await b.signOut();
    expect(await b.session()).toBeNull();
    await b.signIn('arta@example.com', 'secret123');
    expect((await b.loadProgress())?.xp).toBe(33);
  });

  it('reports taken usernames and emails, and wrong passwords', async () => {
    const b = createDemoBackend(memory());
    await b.signUp({ email: 'a@x.com', password: 'secret123', profile: ARTA });
    await expect(
      b.signUp({ email: 'a@x.com', password: 'secret123', profile: { ...ARTA, username: 'other' } }),
    ).rejects.toMatchObject({ code: 'email-taken' });
    await expect(b.signUp({ email: 'b@x.com', password: 'secret123', profile: ARTA })).rejects.toBeInstanceOf(
      AccountError,
    );
    await b.signOut();
    await expect(b.signIn('a@x.com', 'wrong')).rejects.toMatchObject({ code: 'wrong-credentials' });
  });

  it('updates the profile and password', async () => {
    const b = createDemoBackend(memory());
    await b.signUp({ email: 'a@x.com', password: 'secret123', profile: ARTA });
    await b.signUp({ email: 'b@x.com', password: 'secret123', profile: { ...ARTA, username: 'besa' } });
    // Signed in as besa now; taking arta's username is refused.
    await expect(b.saveProfile({ ...ARTA, username: 'ARTA.K' })).rejects.toMatchObject({ code: 'username-taken' });
    await b.saveProfile({ ...ARTA, username: 'besa.k', level: 'kana' });
    expect(await b.loadProfile()).toMatchObject({ username: 'besa.k', level: 'kana' });
    await expect(b.changePassword('secret123')).rejects.toMatchObject({ code: 'same-password' });
    await b.changePassword('newsecret9');
    await b.signOut();
    await b.signIn('b@x.com', 'newsecret9');
  });

  it('deletes the account and its data', async () => {
    const store = memory();
    const b = createDemoBackend(store);
    const changes: (string | null)[] = [];
    b.onSessionChange((s) => changes.push(s?.email ?? null));
    await b.signUp({ email: 'a@x.com', password: 'secret123', profile: ARTA });
    await b.deleteAccount();
    expect(changes).toEqual(['a@x.com', null]);
    expect(await b.usernameAvailable('arta.k')).toBe(true);
    await expect(b.signIn('a@x.com', 'secret123')).rejects.toMatchObject({ code: 'wrong-credentials' });
  });
});

describe('Supabase errors', () => {
  it('maps server errors to messages the learner understands', () => {
    expect(supabaseErrorCode({ code: 'invalid_credentials' })).toBe('wrong-credentials');
    expect(supabaseErrorCode({ code: 'email_exists' })).toBe('email-taken');
    expect(supabaseErrorCode({ code: 'unexpected_failure', message: 'Database error saving new user' })).toBe(
      'username-taken',
    );
    expect(supabaseErrorCode({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toBe('offline');
    expect(supabaseErrorCode({ code: 'same_password' })).toBe('same-password');
    expect(supabaseErrorCode({ code: 'something_new' })).toBe('unknown');
  });
});
