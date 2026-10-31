/** RevenueCat entitlement that unlocks Shqiponisht Plus. */
export const ENTITLEMENT = 'plus';

export type Plan = {
  id: string;
  period: 'monthly' | 'annual' | 'other';
  /** Localized price from the store, e.g. "4,99 €". */
  price: string;
  title: string;
};

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
