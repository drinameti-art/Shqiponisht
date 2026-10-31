import { describe, expect, it } from 'vitest';

import PRIVACY from '@/legal/privacy.json';
import TERMS from '@/legal/terms.json';
import { legalDoc, publisherMissing } from '@/lib/legal';

const filled = {
  company: 'Shembull SH.P.K.',
  country: 'Kosovë',
  email: 'support@example.com',
  updated: { sq: 'x', en: 'x' },
};

describe('legal documents', () => {
  it('has the same sections in Albanian and English', () => {
    for (const doc of [PRIVACY, TERMS]) {
      expect(doc.sq.sections.length).toBe(doc.en.sections.length);
      doc.sq.sections.forEach((s, i) => expect(s.body.length).toBe(doc.en.sections[i].body.length));
    }
  });

  it('fills every placeholder with the publisher details', () => {
    for (const id of ['privacy', 'terms'] as const) {
      for (const lang of ['sq', 'en'] as const) {
        const text = JSON.stringify(legalDoc(id, lang, filled));
        expect(text).not.toMatch(/\{\{/);
        expect(text).toContain('support@example.com');
      }
    }
  });

  it('covers what App Review requires for subscriptions', () => {
    const terms = JSON.stringify(legalDoc('terms', 'en', filled)).toLowerCase();
    for (const phrase of ['renews automatically', '24 hours', 'cancel', 'free trial', 'app store', 'google play']) {
      expect(terms).toContain(phrase);
    }
  });

  it('reports which publisher fields are still placeholders', () => {
    expect(publisherMissing(filled)).toEqual([]);
    expect(publisherMissing({ ...filled, email: '[EMAIL]' })).toEqual(['email']);
  });
});
