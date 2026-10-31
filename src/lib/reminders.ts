import type { Progress } from './progress';

/** Web: no local notifications. The reminder setting is hidden there. */
export const remindersSupported = false;

export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function syncReminders(_progress: Progress, _today: string): Promise<void> {}
