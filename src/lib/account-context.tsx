import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { accounts } from './account';
import type { SignUpResult } from './account-backend';
import { mergeProgress, normalizeUsername, toSynced, type Profile, type Session } from './account-types';
import { useProgress } from './progress-context';

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';

type AccountApi = {
  /** 'demo' accounts are kept on this device only (web preview, development). */
  kind: 'supabase' | 'demo';
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  sync: SyncState;
  usernameAvailable: (username: string) => Promise<boolean>;
  signUp: (input: { email: string; password: string; profile: Profile }) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Saves profile changes (name, username, age range, level) to the account. */
  updateProfile: (profile: Profile) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const Ctx = createContext<AccountApi | null>(null);

const SAVE_DELAY_MS = 2000;

/**
 * Signs the learner in and keeps their progress in the account. On sign-in the
 * progress on this phone is merged with the account's (nothing is lost on
 * either side); afterwards every change is saved to the account a moment later.
 * Progress always stays on the phone too, so the app works offline.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const { progress, ready: progressReady, update } = useProgress();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sync, setSync] = useState<SyncState>('idle');
  /** User id whose account progress has been merged in; saving waits for it. */
  const [pulledFor, setPulledFor] = useState<string | null>(null);
  const adopting = useRef<string | null>(null);
  const pulled = useRef<string | null>(null);

  const adopt = useCallback(
    async (s: Session | null) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setPulledFor(null);
        pulled.current = null;
        setSync('idle');
        return;
      }
      // Token refreshes report the same user again; merge once per sign-in.
      if (adopting.current === s.userId || pulled.current === s.userId) return;
      adopting.current = s.userId;
      try {
        const [p, remote] = await Promise.all([accounts.loadProfile(), accounts.loadProgress()]);
        setProfile(p);
        update((local) => ({
          ...mergeProgress(local, remote),
          onboarded: true,
          name: local.name || p?.name || remote?.name || '',
          level: local.level ?? p?.level ?? null,
        }));
        pulled.current = s.userId;
        setPulledFor(s.userId);
      } catch {
        setSync('error');
      } finally {
        adopting.current = null;
      }
    },
    [update],
  );

  useEffect(() => {
    if (!progressReady) return;
    let alive = true;
    accounts
      .session()
      .then((s) => (alive ? adopt(s) : undefined))
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    const off = accounts.onSessionChange((s) => {
      if (alive) void adopt(s);
    });
    return () => {
      alive = false;
      off();
    };
  }, [progressReady, adopt]);

  // Save progress to the account shortly after it changes.
  const synced = useMemo(() => JSON.stringify(toSynced(progress)), [progress]);
  useEffect(() => {
    if (!session || pulledFor !== session.userId) return;
    const t = setTimeout(() => {
      setSync('saving');
      accounts.saveProgress(JSON.parse(synced)).then(
        () => setSync('saved'),
        () => setSync('error'),
      );
    }, SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [synced, session, pulledFor]);

  const signUp = useCallback(
    async (input: { email: string; password: string; profile: Profile }) => {
      const result = await accounts.signUp(input);
      if (result.status === 'signed-in') await adopt(result.session);
      return result;
    },
    [adopt],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await adopt(await accounts.signIn(email, password));
    },
    [adopt],
  );

  const signOut = useCallback(async () => {
    await accounts.signOut();
    await adopt(null);
  }, [adopt]);

  const updateProfile = useCallback(async (next: Profile) => {
    await accounts.saveProfile(next);
    setProfile({ ...next, username: normalizeUsername(next.username) });
  }, []);

  const deleteAccount = useCallback(async () => {
    await accounts.deleteAccount();
    await adopt(null);
  }, [adopt]);

  const api = useMemo<AccountApi>(
    () => ({
      kind: accounts.kind,
      ready,
      session,
      profile,
      sync,
      usernameAvailable: (u) => accounts.usernameAvailable(u),
      signUp,
      signIn,
      signOut,
      resetPassword: (e) => accounts.resetPassword(e),
      deleteAccount,
      updateProfile,
      changePassword: (pw) => accounts.changePassword(pw),
    }),
    [ready, session, profile, sync, signUp, signIn, signOut, deleteAccount, updateProfile],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider');
  return ctx;
}
