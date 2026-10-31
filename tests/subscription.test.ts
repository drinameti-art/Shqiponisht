import { describe, expect, it } from 'vitest';

import { annualSavings, trialDays, type Plan } from '@/lib/subscription-types';

const plan = (period: Plan['period'], amount: number): Plan => ({
  id: period,
  period,
  amount,
  price: `${amount} €`,
  title: period,
});

describe('subscription plans', () => {
  it('reads a free trial from the store intro price', () => {
    expect(trialDays({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 })).toBe(7);
    expect(trialDays({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 3 })).toBe(3);
    expect(trialDays({ price: 0.99, periodUnit: 'MONTH', periodNumberOfUnits: 1 })).toBe(0);
    expect(trialDays(null)).toBe(0);
  });

  it('computes the yearly saving for €4.99 / €29.99 as 50%', () => {
    expect(annualSavings([plan('monthly', 4.99), plan('annual', 29.99)])).toBe(50);
    expect(annualSavings([plan('annual', 29.99)])).toBe(0);
  });
});
