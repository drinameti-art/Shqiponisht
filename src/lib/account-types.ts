import { INITIAL_PROGRESS, type LessonRecord, type Progress } from './progress';
import type { Card } from './review';

/** Age ranges asked at sign-up. Under-16s keep using the app without an online account. */
export const AGE_RANGES = [
  { id: 'under16', label: 'Nën 16' },
  { id: '16-17', label: '16–17' },
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45+', label: '45+' },
] as const;
export type AgeRange = (typeof AGE_RANGES)[number]['id'];

/** How much Japanese the learner already knows. */
export const LEVELS = [
  { id: 'new', title: 'Fillestar/e', detail: 'Nuk di ende asgjë japonisht' },
  { id: 'some-kana', title: 'Di pak hiragana', detail: 'Njoh disa shkronja' },
  { id: 'kana', title: 'Di hiragana dhe katakana', detail: 'I lexoj, ndonëse ngadalë' },
  { id: 'kanji', title: 'Di edhe disa kanji', detail: 'Dua të vazhdoj më tej' },
] as const;
export type Level = (typeof LEVELS)[number]['id'];

export type Profile = { username: string; name: string; ageRange: AgeRange; level: Level };

export type Session = { userId: string; email: string };

/** Online accounts need the learner to be 16 or older (no parental consent flow). */
export function canHaveAccount(age: AgeRange | null): boolean {
  return age !== null && age !== 'under16';
}

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;

/** Usernames are stored lower-case, without a leading @. */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

/** Albanian error for an invalid username, or null when it's fine. */
export function usernameProblem(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (u.length < USERNAME_MIN) return `Të paktën ${USERNAME_MIN} shkronja.`;
  if (u.length > USERNAME_MAX) return `Jo më shumë se ${USERNAME_MAX} shkronja.`;
  if (!/^[a-z]/.test(u)) return 'Duhet të fillojë me një shkronjë.';
  if (!/^[a-z0-9_.]+$/.test(u)) return 'Vetëm shkronja pa theks (a–z), numra, „_“ dhe „.“.';
  if (/[._]{2}/.test(u) || /[._]$/.test(u)) return 'Mos e mbyll me „.“ ose „_“ dhe mos i vër dy rresht.';
  return null;
}

export function emailProblem(raw: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim()) ? null : 'Shkruaj një email të vlefshëm.';
}

export function passwordProblem(raw: string): string | null {
  if (raw.length < PASSWORD_MIN) return `Fjalëkalimi duhet të ketë të paktën ${PASSWORD_MIN} shenja.`;
  if (!/[A-Za-z]/.test(raw) || !/[0-9]/.test(raw)) return 'Përdor të paktën një shkronjë dhe një numër.';
  return null;
}

/** Error codes the account backends report; the UI shows them in Albanian. */
export type AccountErrorCode =
  | 'username-taken'
  | 'email-taken'
  | 'wrong-credentials'
  | 'email-not-confirmed'
  | 'weak-password'
  | 'rate-limited'
  | 'same-password'
  | 'reauth-needed'
  | 'offline'
  | 'unknown';

export class AccountError extends Error {
  constructor(
    readonly code: AccountErrorCode,
    detail?: string,
  ) {
    super(detail ?? code);
  }
}

export const ACCOUNT_ERRORS: Record<AccountErrorCode, string> = {
  'username-taken': 'Ky emër përdoruesi është i zënë. Provo një tjetër.',
  'email-taken': 'Ekziston tashmë një llogari me këtë email. Hyr në të.',
  'wrong-credentials': 'Email-i ose fjalëkalimi nuk është i saktë.',
  'email-not-confirmed': 'Konfirmo email-in tënd fillimisht: kemi dërguar një lidhje.',
  'weak-password': 'Ky fjalëkalim është shumë i dobët. Provo një më të gjatë.',
  'rate-limited': 'Shumë përpjekje. Prit pak minuta dhe provo përsëri.',
  'same-password': 'Fjalëkalimi i ri duhet të jetë ndryshe nga ai i vjetri.',
  'reauth-needed': 'Për siguri, dil nga llogaria, hyr përsëri dhe provo sërish.',
  offline: 'Nuk ka lidhje me internetin. Provo përsëri.',
  unknown: 'Diçka shkoi keq. Provo përsëri pak më vonë.',
};

/** Maps Supabase error codes to the app's error codes (see supabase/README.md for the server setup). */
export function supabaseErrorCode(e: { code?: string; name?: string; message?: string } | null): AccountErrorCode {
  if (!e) return 'unknown';
  if (e.name === 'AuthRetryableFetchError' || /network|fetch/i.test(e.message ?? '')) return 'offline';
  switch (e.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'email-taken';
    case 'invalid_credentials':
      return 'wrong-credentials';
    case 'email_not_confirmed':
      return 'email-not-confirmed';
    case 'weak_password':
      return 'weak-password';
    case 'same_password':
      return 'same-password';
    case 'reauthentication_needed':
      return 'reauth-needed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rate-limited';
    case '23505': // unique_violation: the username was taken between the check and the save
      return 'username-taken';
  }
  // The sign-up trigger fails this way when the username is already taken.
  if (/database error saving new user/i.test(e.message ?? '')) return 'username-taken';
  return 'unknown';
}

export function accountErrorMessage(e: unknown): string {
  return ACCOUNT_ERRORS[e instanceof AccountError ? e.code : 'unknown'];
}

/** The part of Progress that follows the learner between phones (not device settings or store state). */
export type SyncedProgress = Pick<
  Progress,
  'version' | 'name' | 'dailyGoal' | 'xp' | 'today' | 'streak' | 'lessons' | 'review'
>;

export function toSynced(p: Progress): SyncedProgress {
  const { version, name, dailyGoal, xp, today, streak, lessons, review } = p;
  return { version, name, dailyGoal, xp, today, streak, lessons, review };
}

function mergeLesson(a: LessonRecord | undefined, b: LessonRecord | undefined): LessonRecord {
  if (!a) return b!;
  if (!b) return a;
  const best = a.best / (a.total || 1) >= b.best / (b.total || 1) ? a : b;
  return { best: best.best, total: best.total, completions: Math.max(a.completions, b.completions) };
}

/** The card reviewed more times holds the newer state; on a tie, the one due later. */
function mergeCard(a: Card | undefined, b: Card | undefined): Card {
  if (!a) return b!;
  if (!b) return a;
  if (a.seen !== b.seen) return a.seen > b.seen ? a : b;
  return a.due >= b.due ? a : b;
}

function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, pick: (x?: T, y?: T) => T): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = pick(a[k], b[k]);
  return out;
}

/**
 * Combines the progress on this phone with the progress saved in the account,
 * so logging in never loses work done on either side: the higher XP, the best
 * score per lesson, the latest state of every review card, and the streak and
 * today's XP from whichever side practised more recently. Device settings and
 * the subscription stay as they are on this phone.
 */
export function mergeProgress(local: Progress, remote: SyncedProgress | null): Progress {
  if (!remote) return local;
  const remoteNewer = (remote.streak.lastDay ?? '') > (local.streak.lastDay ?? '');
  const sameDay = remote.today.day === local.today.day;
  return {
    ...local,
    name: local.name || remote.name,
    dailyGoal: remoteNewer ? remote.dailyGoal : local.dailyGoal,
    xp: Math.max(local.xp, remote.xp),
    today: sameDay
      ? { day: local.today.day, xp: Math.max(local.today.xp, remote.today.xp) }
      : remote.today.day > local.today.day
        ? remote.today
        : local.today,
    streak:
      remote.streak.lastDay === local.streak.lastDay
        ? { lastDay: local.streak.lastDay, count: Math.max(local.streak.count, remote.streak.count) }
        : remoteNewer
          ? remote.streak
          : local.streak,
    lessons: mergeRecords(local.lessons, remote.lessons ?? {}, mergeLesson),
    review: mergeRecords(local.review, remote.review ?? {}, mergeCard),
  };
}

/** Reads synced progress saved by an older or newer app version; null when unusable. */
export function parseSynced(data: unknown): SyncedProgress | null {
  if (!data || typeof data !== 'object' || (data as { version?: number }).version !== 1) return null;
  const d = data as Partial<SyncedProgress>;
  return {
    version: 1,
    name: typeof d.name === 'string' ? d.name : '',
    dailyGoal: typeof d.dailyGoal === 'number' ? d.dailyGoal : INITIAL_PROGRESS.dailyGoal,
    xp: typeof d.xp === 'number' ? d.xp : 0,
    today: d.today ?? INITIAL_PROGRESS.today,
    streak: d.streak ?? INITIAL_PROGRESS.streak,
    lessons: d.lessons ?? {},
    review: d.review ?? {},
  };
}
