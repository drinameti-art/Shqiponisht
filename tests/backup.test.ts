import { describe, expect, it } from 'vitest';

import { decodeBackup, encodeBackup } from '@/lib/backup';
import { completeLesson, INITIAL_PROGRESS } from '@/lib/progress';
import { recordAnswers } from '@/lib/review';

describe('backup codes', () => {
  const learner = {
    ...completeLesson(
      { ...INITIAL_PROGRESS, onboarded: true, name: 'Ëndrra Çela 🌸' },
      { lessonId: 'hira-a', correct: 9, total: 10 },
      '2026-10-31',
    ).state,
    review: recordAnswers({}, [{ item: 'kana:あ', correct: true }], '2026-10-31'),
    plus: true,
  };

  it('round-trips progress, including Albanian letters, emoji and Japanese', () => {
    const code = encodeBackup(learner);
    expect(code.startsWith('SHQ1-')).toBe(true);
    const back = decodeBackup(code, { plus: false, demoPlus: false })!;
    expect(back.name).toBe('Ëndrra Çela 🌸');
    expect(back.lessons).toEqual(learner.lessons);
    expect(back.review).toEqual(learner.review);
    expect(back.xp).toBe(learner.xp);
  });

  it('never carries the subscription; the restoring phone keeps its own', () => {
    expect(encodeBackup(learner)).not.toContain('plus');
    expect(decodeBackup(encodeBackup(learner), { plus: false, demoPlus: false })!.plus).toBe(false);
  });

  it('accepts a code broken across lines by a messaging app', () => {
    const code = encodeBackup(learner);
    const wrapped = code.match(/.{1,20}/g)!.join('\n ');
    expect(decodeBackup(wrapped, { plus: false, demoPlus: false })?.name).toBe('Ëndrra Çela 🌸');
  });

  it('rejects anything that is not a valid code', () => {
    const keep = { plus: false, demoPlus: false };
    expect(decodeBackup('', keep)).toBeNull();
    expect(decodeBackup('hello', keep)).toBeNull();
    expect(decodeBackup('SHQ1-!!!!', keep)).toBeNull();
    expect(decodeBackup('SHQ1-' + encodeBackup(learner).slice(5, 30), keep)).toBeNull();
  });
});
