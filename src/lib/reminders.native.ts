import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { currentStreak, type Progress } from './progress';
import { planReminders } from './reminder-plan';

export const remindersSupported = true;

const CHANNEL = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Kujtesa ditore',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

/** Asks for notification permission (shows the system prompt the first time). */
export async function requestReminderPermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Replaces all scheduled reminders with a fresh plan for the next week.
 * Reminders are local notifications: nothing leaves the phone. Called on
 * start-up, after every practice, and when the setting changes, so a day
 * that's already been practised never gets a reminder.
 */
export async function syncReminders(progress: Progress, today: string): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { enabled, hour, minute } = progress.reminder;
    if (!enabled) return;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return;
    await ensureChannel();
    const plan = planReminders({
      now: new Date(),
      hour,
      minute,
      practisedToday: progress.streak.lastDay === today,
      streak: currentStreak(progress, today),
    });
    for (const r of plan) {
      await Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL },
      });
    }
  } catch {
    // Reminders are best-effort; never break the app over them.
  }
}
