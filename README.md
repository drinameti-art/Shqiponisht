# Shqiponisht

**Mëso japonisht në shqip** — a Japanese course for Albanian speakers, built with Expo (React Native) for iOS and Android.

Every screen is in Albanian, and Japanese sounds are spelled the Albanian way, so learners read them correctly from day one:

| Romaji | Shqip |
| --- | --- |
| chi | çi |
| tsu | cu |
| ji | xhi |
| ya · yu · yo | ja · ju · jo |
| wa | ua |
| ō | oo (long vowels are doubled) |

## What's in the app

- **Mirësevini (welcome):** set your name and a daily XP goal.
- **Sot (today):** greeting, streak, daily-goal bar and a 38-lesson path (24 free + 14 Plus): hiragana and katakana row by row, five kanji lessons (36 kanji), plus greetings, numbers, family, food, animals, places and useful phrases.
- **Lessons:** 10 multiple-choice questions per lesson, with an explanation in Albanian after every answer. Six correct answers pass the lesson and unlock the next one.
- **Si shkruhet (how to write):** every kana and kanji card has a "Si shkruhet" button. *Shiko rendin* animates the strokes in order with numbers; *Provo vetë* is a practice pad where you write with your finger and each stroke is checked for position, order and direction.
- **Kana:** the full hiragana/katakana chart, including the ゛/゜ rows (が, ぱ…). Tap a kana for its Albanian reading, a pronunciation tip and example words. A red dot marks sounds Albanian spells differently from romaji.
- **Kanji:** all 36 kanji by theme (numbers, days of the week, the body, nature and size, school and life). Tap one for its Albanian meaning, on and kun readings (with Albanian spelling), stroke count and example words.
- **Kartat (flashcards):** from Fjalori → *Kartat*. Decks: all your words, "Fjalët e vështira" (words you've missed), or any lesson; Japanese→Albanian or Albanian→Japanese. Tap to flip, then *E dija* / *Nuk e dija* or swipe right / left. Unknown cards come back until known; results feed the spaced review, XP and streak.
- **Fjalori (vocabulary):** every word from the lessons, with its usual kanji spelling, searchable in kanji, kana, romaji or Albanian (search ignores ë and ç, so "nena" finds "nëna").
- **Profili (profile):** XP, streak, lessons passed, daily-goal setting, and a progress reset.

- **Shqiponisht Plus (subscription):** Niveli 2 — 14 more lessons: kana with ゛/゜, verbs (ます form), time, first sentences, numbers to 10 000, shopping, adjectives, the restaurant, and 43 more kanji. Free users see these lessons in the path with a PLUS badge and a paywall.

- **Pronunciation 🔊:** speaker buttons on every kana, kanji, word, sentence and Japanese quiz prompt, using the phone's built-in Japanese voice. Tap twice quickly to hear it slower. With sounds on, the answer is read aloud after each check.
- **Përsëritja e ditës (spaced review):** every answer feeds a Leitner schedule (1 → 3 → 7 → 14 → 30 → 60 days). Anything missed comes back the same day. The Sot screen shows how many items are due.
- **Daily reminder 🔔:** Profili → Kujtesa ditore, at a chosen time. Local notifications only; days already practised are skipped. (Phones only, not web.)
- **Backup code:** Profili → Ruaj përparimin copies or shares a `SHQ1-…` code holding all progress; pasting it on another phone restores it. No server or account involved; the subscription is restored by the store instead.
- **Visual effects:** options pop when chosen, wrong answers shake, the feedback panel slides up, progress bars fill smoothly, the current lesson pulses, and passing a lesson or finishing a character sets off confetti while the XP counts up. Effects are reduced when the phone's *Reduce motion* setting is on.
- **Sounds:** a chime for right answers, a soft buzz for wrong ones, a short melody when a lesson is passed, and a tick for each correct stroke. They mix with your music, follow the phone's silent switch, and can be turned off in Profili → Cilësimet. The sounds are synthesized by `scripts/make-sounds.py`, so there are no third-party recordings.

Progress is saved on the device; there's no account or server.

## Run it

Requires Node 20+.

```bash
npm install
npm start          # then scan the QR code with the Expo Go app on your phone
```

`npm run web` opens it in a browser.

## Checks

```bash
npm run typecheck
npm run lint
npm test           # unit tests for spelling rules, quiz building and progress/streak logic
```

## Setting up the subscription

Plus runs on [RevenueCat](https://www.revenuecat.com) (`react-native-purchases`) with a **€4.99/month** and a **€29.99/year** plan (7-day free trial on yearly), under the entitlement **`plus`**. Until the RevenueCat keys are set, the paywall says subscriptions are only available in the store apps and nothing can be bought.

**Follow [STORE_SETUP.md](STORE_SETUP.md)**: the step-by-step checklist with every product ID, price and text to paste into App Store Connect, Google Play Console and RevenueCat, plus how to publish the privacy policy and terms.

- Privacy policy and terms (Albanian + English): `src/legal/*.json`, shown in the app from the Plus screen and Profili. Put your company name, country and email in `src/legal/publisher.json`.
- `npm run legal` builds them as web pages in `docs/` for GitHub Pages; the stores need those URLs.
- `npm run check:release` fails until the publisher details and RevenueCat keys are in place, and if the demo flag is on.
- `EXPO_PUBLIC_DEMO_PLUS=1` shows a "Provo Plus (demo)" button for reviewing the Plus lessons in a web preview. Never set it for store builds.

## Building for the App Store and Google Play

Builds use [EAS](https://docs.expo.dev/eas/). You need a free Expo account, plus an Apple Developer account ($99/year) for iOS and a Google Play developer account ($25 once) for Android.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # installable APK for testing
npx eas-cli@latest build --profile production --platform all    # store builds
npx eas-cli@latest submit --platform all                         # upload to the stores
```

The bundle id / package name is `com.shqiponisht.app` (in `app.json`); change it before the first store build if you want a different one.

## Project layout

```
src/app/            screens (Expo Router: every file is a route)
  (tabs)/           Sot, Kana, Kanji, Fjalori, Profili
  lesson/[id].tsx   the quiz
  welcome.tsx       first-run setup
src/data/           kana chart, kanji and lesson content
src/lib/            Albanian spelling, quiz builder, progress, stroke grading, subscription
tests/              Vitest unit tests for src/lib and the data
scripts/            build-strokes.mjs: regenerates src/data/strokes.json from KanjiVG
assets/images/      logo, app icon, splash
```

To add words, edit `src/data/lessons.ts`: give the Japanese, the romaji, the Albanian meaning and (optionally) the kanji spelling. To add kanji, edit `src/data/kanji.ts`. The Albanian spelling is generated automatically from the romaji.

## Credits

Stroke-order data (`src/data/strokes.json`) comes from [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). That file stays under CC BY-SA 3.0; the app credits it on the Profile screen. After adding kana or kanji, run `node scripts/build-strokes.mjs` to refresh it.
