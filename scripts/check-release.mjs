#!/usr/bin/env node
/**
 * Checks that a store build is ready for subscriptions. Run before
 * `eas build --profile production`. Exits non-zero when something is missing.
 *
 * Usage: node scripts/check-release.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
const envFile = join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const problems = [];
const publisher = JSON.parse(readFileSync(join(root, 'src/legal/publisher.json'), 'utf8'));
for (const key of ['company', 'country', 'email']) {
  if (!publisher[key] || /^\[.*\]$/.test(publisher[key].trim())) {
    problems.push(`src/legal/publisher.json: fill in "${key}" (it still says ${publisher[key]})`);
  }
}
if (!env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.startsWith('appl_')) {
  problems.push('EXPO_PUBLIC_REVENUECAT_IOS_KEY is missing (RevenueCat → Project → API keys, starts with appl_)');
}
if (!env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.startsWith('goog_')) {
  problems.push('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY is missing (RevenueCat → Project → API keys, starts with goog_)');
}
if (env.EXPO_PUBLIC_DEMO_PLUS === '1') {
  problems.push('EXPO_PUBLIC_DEMO_PLUS=1 is set: remove it, it lets anyone unlock Plus for free');
}
if (!existsSync(join(root, 'docs/privacy.html'))) problems.push('Run `npm run legal` to build docs/privacy.html and docs/terms.html');

if (problems.length) {
  console.error('Not ready for a store build:\n' + problems.map((p) => `  ✗ ${p}`).join('\n'));
  console.error('\nKeys set as EAS environment variables (not in .env) count only when exported in this shell.');
  process.exit(1);
}
console.log('✓ Ready: publisher details, RevenueCat keys and legal pages are in place.');
