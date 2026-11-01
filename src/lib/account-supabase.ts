import 'react-native-url-polyfill/auto';

import { createClient, type AuthError, type Session as SbSession, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import {
  AccountError,
  supabaseErrorCode,
  normalizeUsername,
  parseSynced,
  type Profile,
  type Session,
} from './account-types';
import type { AccountBackend } from './account-backend';
import type { KeyValue } from './account-demo';

const fail = (e: AuthError | { code?: string; message?: string } | null): never => {
  throw new AccountError(supabaseErrorCode(e), e?.message);
};

const toSession = (s: SbSession | null): Session | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '' } : null;

type ProfileRow = { username: string; name: string; age_range: Profile['ageRange']; level: Profile['level'] };

export function createSupabaseBackend(url: string, anonKey: string, storage: KeyValue): AccountBackend {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: Platform.OS === 'web' },
  });

  // Refresh the session only while the app is in the foreground (Supabase's React Native advice).
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void sb.auth.startAutoRefresh();
      else void sb.auth.stopAutoRefresh();
    });
  }

  const userId = async () => {
    const { data } = await sb.auth.getSession();
    if (!data.session) throw new AccountError('unknown', 'not signed in');
    return data.session.user.id;
  };

  return {
    kind: 'supabase',
    async session() {
      const { data } = await sb.auth.getSession();
      return toSession(data.session);
    },
    onSessionChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_event, s) => cb(toSession(s)));
      return () => data.subscription.unsubscribe();
    },
    async usernameAvailable(username) {
      const { data, error } = await sb.rpc('username_available', { candidate: normalizeUsername(username) });
      if (error) fail(error);
      return data === true;
    },
    async signUp({ email, password, profile }) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Read by the handle_new_user trigger, which creates the profile row.
          data: {
            username: normalizeUsername(profile.username),
            name: profile.name.trim(),
            age_range: profile.ageRange,
            level: profile.level,
          },
        },
      });
      if (error) fail(error);
      // With email confirmation on, an existing address comes back as a user without identities.
      if (data.user && data.user.identities?.length === 0) throw new AccountError('email-taken');
      const session = toSession(data.session);
      return session ? { status: 'signed-in', session } : { status: 'confirm-email' };
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) fail(error);
      return toSession(data.session)!;
    },
    async signOut() {
      const { error } = await sb.auth.signOut();
      if (error) fail(error);
    },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim());
      if (error) fail(error);
    },
    async loadProfile() {
      const { data, error } = await sb
        .from('profiles')
        .select('username, name, age_range, level')
        .eq('id', await userId())
        .maybeSingle<ProfileRow>();
      if (error) fail(error);
      return data ? { username: data.username, name: data.name, ageRange: data.age_range, level: data.level } : null;
    },
    async saveProfile(profile) {
      const { error } = await sb
        .from('profiles')
        .update({
          username: normalizeUsername(profile.username),
          name: profile.name.trim(),
          age_range: profile.ageRange,
          level: profile.level,
        })
        .eq('id', await userId());
      if (error) fail(error);
    },
    async loadProgress() {
      const { data, error } = await sb
        .from('progress')
        .select('data')
        .eq('user_id', await userId())
        .maybeSingle<{ data: unknown }>();
      if (error) fail(error);
      return data ? parseSynced(data.data) : null;
    },
    async saveProgress(progress) {
      const { error } = await sb.from('progress').upsert({ user_id: await userId(), data: progress });
      if (error) fail(error);
    },
    async deleteAccount() {
      const { error } = await sb.rpc('delete_my_account');
      if (error) fail(error);
      await sb.auth.signOut({ scope: 'local' });
    },
  };
}
