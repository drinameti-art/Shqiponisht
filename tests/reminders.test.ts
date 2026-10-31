import { describe, expect, it } from 'vitest';

import { planReminders } from '@/lib/reminder-plan';

const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);

describe('planReminders', () => {
  it('plans a week of reminders at the chosen time, starting today if it is still ahead', () => {
    const plan = planReminders({ now: at(31, 10), hour: 19, minute: 0, practisedToday: false, streak: 0 });
    expect(plan).toHaveLength(7);
    expect(plan[0].date).toEqual(at(31, 19));
    expect(plan[6].date).toEqual(new Date(2026, 10, 6, 19, 0));
  });

  it('skips today once the learner has practised, or when the time has passed', () => {
    expect(planReminders({ now: at(31, 10), hour: 19, minute: 0, practisedToday: true, streak: 3 })[0].date).toEqual(
      new Date(2026, 10, 1, 19, 0),
    );
    expect(planReminders({ now: at(31, 20), hour: 19, minute: 0, practisedToday: false, streak: 0 })).toHaveLength(6);
  });

  it('mentions the streak in the next reminder only', () => {
    const plan = planReminders({ now: at(31, 10), hour: 19, minute: 0, practisedToday: false, streak: 5 });
    expect(plan[0].body).toContain('5 ditë rresht');
    expect(plan.slice(1).some((r) => r.body.includes('ditë rresht'))).toBe(false);
  });
});
