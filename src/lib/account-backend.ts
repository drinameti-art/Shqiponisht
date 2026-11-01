import type { Profile, Session, SyncedProgress } from './account-types';

export type SignUpResult =
  /** Signed in straight away. */
  | { status: 'signed-in'; session: Session }
  /** The account exists but the email address must be confirmed before logging in. */
  | { status: 'confirm-email' };

/**
 * Everything the app needs from an account service. The store builds use
 * Supabase; the web preview uses a demo backend that keeps accounts on the
 * device. Every method throws AccountError on failure.
 */
export interface AccountBackend {
  /** 'demo' accounts live only in this browser/phone. */
  readonly kind: 'supabase' | 'demo';
  session(): Promise<Session | null>;
  onSessionChange(cb: (s: Session | null) => void): () => void;
  usernameAvailable(username: string): Promise<boolean>;
  signUp(input: { email: string; password: string; profile: Profile }): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  /** Sends a password-reset email. */
  resetPassword(email: string): Promise<void>;
  loadProfile(): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;
  loadProgress(): Promise<SyncedProgress | null>;
  saveProgress(progress: SyncedProgress): Promise<void>;
  /** Permanently deletes the account and everything stored with it. */
  deleteAccount(): Promise<void>;
}
