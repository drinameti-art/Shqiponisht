/** RevenueCat entitlement that unlocks Shqiponisht Plus. */
export const ENTITLEMENT = 'plus';

export type Plan = {
  id: string;
  period: 'monthly' | 'annual' | 'other';
  /** Localized price from the store, e.g. "4,99 €". */
  price: string;
  /** Numeric price in the store currency, for comparing plans. */
  amount: number;
  title: string;
  /** Length of a free trial in days, when the store offers one to this user. */
  trialDays?: number;
};

const UNIT_DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** Converts a store intro period (e.g. 1 WEEK) to days; 0 when it isn't a free trial. */
export function trialDays(intro: { price: number; periodUnit: string; periodNumberOfUnits: number } | null): number {
  if (!intro || intro.price !== 0) return 0;
  return (UNIT_DAYS[intro.periodUnit.toUpperCase()] ?? 0) * intro.periodNumberOfUnits;
}

/** Whole-percent saving of the yearly plan over twelve monthly payments (0 if none). */
export function annualSavings(plans: Plan[]): number {
  const monthly = plans.find((p) => p.period === 'monthly');
  const annual = plans.find((p) => p.period === 'annual');
  if (!monthly || !annual || monthly.amount <= 0) return 0;
  return Math.max(0, Math.round((1 - annual.amount / (monthly.amount * 12)) * 100));
}

export type PurchaseOutcome = { status: 'purchased' | 'cancelled' | 'failed'; plus: boolean; message?: string };

export interface SubscriptionService {
  /** False when the store isn't set up for this build (no API key, or web). */
  readonly available: boolean;
  /** Starts the SDK and reports Plus status now and whenever it changes. */
  init(onPlusChange: (plus: boolean) => void): Promise<void>;
  plans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseOutcome>;
  restore(): Promise<boolean>;
}

/**
 * The web preview can turn on a clearly labelled demo of Plus, so the
 * premium lessons can be reviewed without a store. Never set this for
 * store builds.
 */
export const DEMO_PLUS_ALLOWED = process.env.EXPO_PUBLIC_DEMO_PLUS === '1';
