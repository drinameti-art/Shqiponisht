import type { SubscriptionService } from './subscription-types';

/** Web: there is no App Store / Google Play here, so purchases are unavailable. */
export const subscription: SubscriptionService = {
  available: false,
  async init() {},
  async plans() {
    return [];
  },
  async purchase() {
    return {
      status: 'failed',
      plus: false,
      message: 'Blerjet funksionojnë vetëm në aplikacionin për iPhone dhe Android.',
    };
  },
  async restore() {
    return false;
  },
};
