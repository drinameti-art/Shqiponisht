import { Platform } from 'react-native';
import Purchases, { PACKAGE_TYPE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { ENTITLEMENT, trialDays, type Plan, type SubscriptionService } from './subscription-types';

/** Public RevenueCat SDK keys (safe to ship in the app). Set them in .env or EAS environment variables. */
const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

const hasPlus = (info: CustomerInfo) => ENTITLEMENT in info.entitlements.active;

let packages = new Map<string, PurchasesPackage>();
let started = false;

function toPlan(p: PurchasesPackage): Plan {
  const period =
    p.packageType === PACKAGE_TYPE.MONTHLY ? 'monthly' : p.packageType === PACKAGE_TYPE.ANNUAL ? 'annual' : 'other';
  const trial = trialDays(p.product.introPrice);
  return {
    id: p.identifier,
    period,
    price: p.product.priceString,
    amount: p.product.price,
    title: p.product.title,
    trialDays: trial || undefined,
  };
}

export const subscription: SubscriptionService = {
  available: !!API_KEY,

  async init(onPlusChange) {
    if (!API_KEY || started) return;
    started = true;
    Purchases.configure({ apiKey: API_KEY });
    Purchases.addCustomerInfoUpdateListener((info) => onPlusChange(hasPlus(info)));
    try {
      onPlusChange(hasPlus(await Purchases.getCustomerInfo()));
    } catch {
      // Offline: keep the last known status.
    }
  },

  async plans() {
    if (!API_KEY) return [];
    const offerings = await Purchases.getOfferings();
    const available = offerings.current?.availablePackages ?? [];
    packages = new Map(available.map((p) => [p.identifier, p]));
    const order = { annual: 0, monthly: 1, other: 2 };
    return available.map(toPlan).sort((a, b) => order[a.period] - order[b.period]);
  },

  async purchase(planId) {
    const pkg = packages.get(planId);
    if (!pkg) return { status: 'failed', plus: false, message: 'Ky plan nuk u gjet. Provo përsëri.' };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { status: 'purchased', plus: hasPlus(customerInfo) };
    } catch (e) {
      const err = e as { userCancelled?: boolean | null; message?: string };
      if (err.userCancelled) return { status: 'cancelled', plus: false };
      return { status: 'failed', plus: false, message: 'Blerja nuk u krye. Provo përsëri më vonë.' };
    }
  },

  async restore() {
    if (!API_KEY) return false;
    return hasPlus(await Purchases.restorePurchases());
  },
};
