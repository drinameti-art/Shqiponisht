export type PlannedReminder = { date: Date; title: string; body: string };

const GENERIC: [title: string, body: string][] = [
  ['Koha për japonisht! 日本語', 'Një mësim i shkurtër të pret te Shqiponisht.'],
  ['5 minuta japonisht?', 'Përsërit disa fjalë para se t’i harrosh.'],
  ['がんばって!', 'Një hap i vogël sot, shumë kanji nesër.'],
  ['Mirëmbrëma! こんばんは', 'Mëso një shkronjë të re sot.'],
];

/**
 * Plans the daily reminders for the next `days` days at the chosen time.
 * Today is skipped when the learner has already practised or the time has
 * passed. When there is a streak to protect, the next reminder says so.
 */
export function planReminders(opts: {
  now: Date;
  hour: number;
  minute: number;
  practisedToday: boolean;
  streak: number;
  days?: number;
}): PlannedReminder[] {
  const { now, hour, minute, practisedToday, streak, days = 7 } = opts;
  const out: PlannedReminder[] = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, minute, 0, 0);
    if (d === 0 && (practisedToday || date <= now)) continue;
    const first = out.length === 0;
    // The streak is only certain for the very next reminder; later days stay generic.
    const keepStreak = first && streak > 0;
    const [title, body] = keepStreak
      ? ['Mos e prish serinë! 🔥', `${streak} ditë rresht. Pak japonisht sot e mban gjallë.`]
      : GENERIC[(date.getDate() + d) % GENERIC.length];
    out.push({ date, title, body });
  }
  return out;
}

export const REMINDER_TIMES: [hour: number, minute: number][] = [
  [8, 0],
  [12, 30],
  [18, 0],
  [20, 0],
  [21, 30],
];
