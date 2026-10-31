import PRIVACY from '@/legal/privacy.json';
import PUBLISHER from '@/legal/publisher.json';
import TERMS from '@/legal/terms.json';

export type LegalDocId = 'privacy' | 'terms';
export type LegalLang = 'sq' | 'en';
export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

type Publisher = { company: string; country: string; email: string; updated: Record<LegalLang, string> };
type Source = Record<LegalLang, { title: string; sections: LegalSection[] }>;

const SOURCES: Record<LegalDocId, Source> = { privacy: PRIVACY, terms: TERMS };

/** True while publisher.json still holds the "[...]" placeholders. */
export function publisherMissing(p: Publisher = PUBLISHER): string[] {
  return (['company', 'country', 'email'] as const).filter((k) => /^\[.*\]$/.test(p[k].trim()) || !p[k].trim());
}

export function fill(text: string, p: Publisher = PUBLISHER): string {
  return text
    .replaceAll('{{COMPANY}}', p.company)
    .replaceAll('{{COUNTRY}}', p.country)
    .replaceAll('{{EMAIL}}', p.email);
}

/** A legal document in one language, with the publisher's details filled in. */
export function legalDoc(id: LegalDocId, lang: LegalLang, p: Publisher = PUBLISHER): LegalDoc {
  const src = SOURCES[id][lang];
  return {
    title: src.title,
    updated: p.updated[lang],
    sections: src.sections.map((s) => ({ heading: fill(s.heading, p), body: s.body.map((b) => fill(b, p)) })),
  };
}
