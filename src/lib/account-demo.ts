import { AccountError, normalizeUsername, type Profile, type Session, type SyncedProgress } from './account-types';
import type { AccountBackend, SignUpResult } from './account-backend';

/** Minimal key-value storage (AsyncStorage in the app, a Map in tests). */
export type KeyValue = {
  getItem(k: string): Promise<string | null>;
  setItem(k: string, v: string): Promise<void>;
  removeItem(k: string): Promise<void>;
};

type DemoUser = { id: string; email: string; password: string; profile: Profile; progress: SyncedProgress | null };
type DemoDb = { users: DemoUser[]; sessionUserId: string | null };

const KEY = 'shqiponisht.demo-accounts.v1';

/**
 * Account backend for the web preview and for development without a Supabase
 * project: accounts are kept in local storage on this device only. Passwords
 * are stored as given, which is fine for a demo and never used in store builds
 * (scripts/check-release.mjs requires Supabase).
 */
export function createDemoBackend(storage: KeyValue): AccountBackend {
  const listeners = new Set<(s: Session | null) => void>();

  const read = async (): Promise<DemoDb> => {
    try {
      const raw = await storage.getItem(KEY);
      if (raw) return JSON.parse(raw) as DemoDb;
    } catch {
      // fall through to an empty database
    }
    return { users: [], sessionUserId: null };
  };
  const write = (db: DemoDb) => storage.setItem(KEY, JSON.stringify(db));
  const toSession = (u: DemoUser): Session => ({ userId: u.id, email: u.email });
  const emit = (s: Session | null) => listeners.forEach((cb) => cb(s));

  const me = async () => {
    const db = await read();
    const user = db.users.find((u) => u.id === db.sessionUserId);
    if (!user) throw new AccountError('unknown', 'not signed in');
    return { db, user };
  };

  return {
    kind: 'demo',
    async session() {
      const db = await read();
      const user = db.users.find((u) => u.id === db.sessionUserId);
      return user ? toSession(user) : null;
    },
    onSessionChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async usernameAvailable(username) {
      const name = normalizeUsername(username);
      return !(await read()).users.some((u) => u.profile.username === name);
    },
    async signUp({ email, password, profile }): Promise<SignUpResult> {
      const db = await read();
      const mail = email.trim().toLowerCase();
      if (db.users.some((u) => u.email === mail)) throw new AccountError('email-taken');
      const username = normalizeUsername(profile.username);
      if (db.users.some((u) => u.profile.username === username)) throw new AccountError('username-taken');
      const user: DemoUser = {
        id: `demo-${Date.now().toString(36)}-${db.users.length}`,
        email: mail,
        password,
        profile: { ...profile, username },
        progress: null,
      };
      db.users.push(user);
      db.sessionUserId = user.id;
      await write(db);
      emit(toSession(user));
      return { status: 'signed-in', session: toSession(user) };
    },
    async signIn(email, password) {
      const db = await read();
      const user = db.users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
      if (!user) throw new AccountError('wrong-credentials');
      db.sessionUserId = user.id;
      await write(db);
      emit(toSession(user));
      return toSession(user);
    },
    async signOut() {
      const db = await read();
      db.sessionUserId = null;
      await write(db);
      emit(null);
    },
    async changePassword(newPassword) {
      const { db, user } = await me();
      if (user.password === newPassword) throw new AccountError('same-password');
      user.password = newPassword;
      await write(db);
    },
    async resetPassword() {
      // Nothing to send in the demo.
    },
    async loadProfile() {
      return (await me()).user.profile;
    },
    async saveProfile(profile) {
      const { db, user } = await me();
      const username = normalizeUsername(profile.username);
      if (db.users.some((u) => u.id !== user.id && u.profile.username === username)) {
        throw new AccountError('username-taken');
      }
      user.profile = { ...profile, username };
      await write(db);
    },
    async loadProgress() {
      return (await me()).user.progress;
    },
    async saveProgress(progress) {
      const { db, user } = await me();
      user.progress = progress;
      await write(db);
    },
    async deleteAccount() {
      const { db, user } = await me();
      db.users = db.users.filter((u) => u.id !== user.id);
      db.sessionUserId = null;
      await write(db);
      emit(null);
    },
  };
}
