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
- **Sot (today):** greeting, streak, daily-goal bar and a 24-lesson path: hiragana and katakana row by row, five kanji lessons (36 kanji), plus greetings, numbers, family, food, animals, places and useful phrases.
- **Lessons:** 10 multiple-choice questions per lesson, with an explanation in Albanian after every answer. Six correct answers pass the lesson and unlock the next one.
- **Kana:** the full hiragana/katakana chart. Tap a kana for its Albanian reading, a pronunciation tip and example words. A red dot marks sounds Albanian spells differently from romaji.
- **Kanji:** all 36 kanji by theme (numbers, days of the week, the body, nature and size, school and life). Tap one for its Albanian meaning, on and kun readings (with Albanian spelling), stroke count and example words.
- **Fjalori (vocabulary):** every word from the lessons, with its usual kanji spelling, searchable in kanji, kana, romaji or Albanian (search ignores ë and ç, so "nena" finds "nëna").
- **Profili (profile):** XP, streak, lessons passed, daily-goal setting, and a progress reset.

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
src/lib/            Albanian spelling rules, quiz builder, progress logic, storage
tests/              Vitest unit tests for src/lib
assets/images/      logo, app icon, splash
```

To add words, edit `src/data/lessons.ts`: give the Japanese, the romaji, the Albanian meaning and (optionally) the kanji spelling. To add kanji, edit `src/data/kanji.ts`. The Albanian spelling is generated automatically from the romaji.
