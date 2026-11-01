#!/usr/bin/env node
/**
 * Builds docs/privacy.html, docs/terms.html and docs/index.html from the
 * same texts the app shows (src/legal/*.json), for hosting on GitHub Pages
 * (Settings → Pages → Deploy from branch → /docs). The store listings need
 * these public URLs.
 *
 * Usage: node scripts/build-legal.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const publisher = json('src/legal/publisher.json');
const docs = { privacy: json('src/legal/privacy.json'), terms: json('src/legal/terms.json') };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fill = (s, lang = 'sq') =>
  s
    .replaceAll('{{COMPANY}}', publisher.company)
    .replaceAll('{{COUNTRY}}', lang === 'en' ? (publisher.country_en ?? publisher.country) : publisher.country)
    .replaceAll('{{EMAIL}}', publisher.email);
const linkify = (s) =>
  esc(s)
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
    .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+)/g, '$1<a href="mailto:$2">$2</a>');

const css = `body{margin:0;background:#f7f1e5;color:#151515;font:16px/1.6 -apple-system,system-ui,"Segoe UI",sans-serif}
main{max-width:720px;margin:0 auto;padding:40px 24px 64px}h1{font-size:30px;margin:0 0 4px;letter-spacing:-.02em}
h2{font-size:19px;margin:32px 0 8px}.updated{color:#756d64;margin:0}a{color:#e41e20}
nav{display:flex;gap:16px;margin-bottom:28px;font-size:14px}.lang{border-top:1px solid #e6dccb;margin-top:48px;padding-top:32px}
.brand{font-weight:800;letter-spacing:.08em;color:#151515;text-decoration:none}`;

function page(id) {
  const doc = docs[id];
  const lang = (l) => {
    const d = doc[l];
    const sections = d.sections
      .map((s) => `<h2>${esc(fill(s.heading, l))}</h2>\n${s.body.map((p) => `<p>${linkify(fill(p, l))}</p>`).join('\n')}`)
      .join('\n');
    const updated = l === 'sq' ? 'Përditësuar më' : 'Last updated';
    return `<section lang="${l}" id="${l}"><h1>${esc(d.title)}</h1><p class="updated">${updated}: ${esc(publisher.updated[l])}</p>\n${sections}</section>`;
  };
  return `<!doctype html>
<html lang="sq"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.sq.title)} · ${esc(doc.en.title)} — Shqiponisht</title><style>${css}</style></head>
<body><main><nav><a class="brand" href="index.html">SHQIPONISHT</a><a href="#sq">Shqip</a><a href="#en">English</a></nav>
${lang('sq')}
<div class="lang">${lang('en')}</div>
</main></body></html>
`;
}

const index = `<!doctype html>
<html lang="sq"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Shqiponisht — mëso japonisht në shqip</title><style>${css}</style></head>
<body><main><h1>Shqiponisht</h1><p>Mëso japonisht në shqip · Learn Japanese in Albanian</p>
<ul><li><a href="privacy.html">Politika e privatësisë · Privacy Policy</a></li>
<li><a href="terms.html">Kushtet e përdorimit · Terms of Use</a></li></ul>
<p>Kontakt · Contact: ${linkify(publisher.email)}</p>
<h2 id="delete-account">Fshi llogarinë · Delete your account</h2>
<p><strong>Në aplikacion:</strong> hap Shqiponisht → Profili → Llogaria → „Fshi llogarinë“ → „Po, fshije llogarinë“.
Llogaria, emri i përdoruesit, profili dhe përparimi i ruajtur fshihen menjëherë dhe përgjithmonë; kopjet rezervë teknike fshihen brenda 7 ditësh.</p>
<p><strong>Pa aplikacionin:</strong> na shkruaj në ${linkify(publisher.email)} nga adresa e email-it të llogarisë, me temë „Fshi llogarinë“. E fshijmë brenda 30 ditësh dhe të njoftojmë.</p>
<div class="lang"><p><strong>In the app:</strong> open Shqiponisht → Profili → Llogaria → “Fshi llogarinë” (Delete account) → confirm.
Your account, username, profile and saved progress are deleted immediately and permanently; technical backups are erased within 7 days.</p>
<p><strong>Without the app:</strong> email ${linkify(publisher.email)} from the address of your account with the subject “Delete my account”. We delete it within 30 days and confirm by email.</p></div>
</main></body></html>
`;

mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs/privacy.html'), page('privacy'));
writeFileSync(join(root, 'docs/terms.html'), page('terms'));
writeFileSync(join(root, 'docs/index.html'), index);
console.log('Wrote docs/index.html, docs/privacy.html, docs/terms.html');
