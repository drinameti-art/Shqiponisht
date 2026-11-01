import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AccountBackend } from './account-backend';
import { createDemoBackend } from './account-demo';
import { createSupabaseBackend } from './account-supabase';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The account service: Supabase when EXPO_PUBLIC_SUPABASE_URL and
 * EXPO_PUBLIC_SUPABASE_ANON_KEY are set (store builds; see supabase/README.md),
 * otherwise the on-device demo used by the web preview and local development.
 */
export const accounts: AccountBackend =
  URL && ANON_KEY ? createSupabaseBackend(URL, ANON_KEY, AsyncStorage) : createDemoBackend(AsyncStorage);
