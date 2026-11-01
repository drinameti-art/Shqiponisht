# Shqiponisht — brand guide

The app and the Shqiponisht Instagram page (reels and stories) are one brand. This guide is taken from the Instagram content; the app follows it through the shared theme in `src/theme/index.ts` and the components in `src/components/brand.tsx` and `src/components/brand-motion.tsx`.

## 1. Colors

| Role | Light | Dark |
| --- | --- | --- |
| Background (main) | cream `#F8F0E4` | `#141414` |
| Cards | cream with a thin rounded frame | `#24201C` |
| Text | ink `#141414` | white |
| Accent, highlights | Shqiponisht red `#E42020` | same red |
| Lines, inactive items, faded hiragana | warm grey `#D0C8BC` | darker warm grey |

Red is for the one thing that matters on a screen (the key kanji, the consonant, the CTA). Everything else stays ink on cream.

## 2. Fonts

- **Poppins** for Latin and Albanian text: Bold / SemiBold for titles, Regular for body.
- **Noto Sans JP Bold** for kana and kanji.
- **Romaji is red italic** (e.g. *ame*, *hana*).

## 3. Brand elements

- **Header:** a small red dot + `SHQIPONISHT` in bold spaced capitals on the left; an outlined pill label on the right (e.g. `KANJI`, `A E DINI?`).
- **Footer:** シュチッポン語 bottom-left.
- **Card:** thin rounded frame on cream.
- **Logo:** red torii gate with the black map of Kosovo inside, `SHQIPONISHT` underneath and シュチッポン語 in red.
- **CTA:** red pill button.

## 4. Components

- **Red pill badge** — e.g. `PJESA 3`.
- **Reading pills** — black pill for the Japanese reading (あめ · ame), red pill for the Chinese reading (ウ · u), each with a small grey caption: *leximi japonez* / *leximi kinez*.
- **Consonant circle** — red filled circle with a white letter (K).
- **Word row** — big kanji with the key kanji in red, red italic romaji, bold Albanian meaning, small grey note.
- **Comparison cards** — 2×2 dark cards.
- **Toast** — black rounded box for a closing line (e.g. *Lexohen tamam si në shqip!*).

## 5. Animation

Calm, slow, one idea per screen: big kanji and few words.

- Elements appear **one at a time** with a soft fade-in plus a small upward slide (about 300–500 ms, ease-out), then hold.
- Text first appears in **light grey**, then becomes black / red.
- Typical sequence: pill badge → title → big red element → formula line (e.g. *K + zanore = rrokje*) → grid items revealed one by one, left to right (the あ い う え お row, then the red circles ka ki ku ke ko appear one by one with the kana underneath).
- Kanji are **written stroke by stroke** (like a brush / felt-tip) on a light 4-square practice grid; drawings (flower, rain cloud) draw themselves line by line.
- Arrows (→) appear between steps.
- End screen: torii logo + `SHQIPONISHT` + red button `NDIQ PËR MË SHUMË`.

In the app, the logo plays the reel's opening each time the app opens (`src/components/logo-intro.tsx`, about 6.5 s; a tap jumps to the end): the pillars grow from their feet one after the other, the tie beam slides in from the right and the black beam from the left, the centre post drops, the curved top beam comes down, the stars appear one by one, the map of Kosovo is assembled from flying pieces, SHQIPONISHT tumbles in letter by letter from grey to ink, シュチッポン語 is typed in red, "Mëso japonisht në shqip · 日本語" appears, and a red sun grows from the map until it fills the screen, then shrinks away onto the app. Words and kanji that name something you can see have a line drawing (`src/data/drawings.ts`) that draws itself in lesson intros and answer feedback, and appears still in Fjalori and on flashcards.

Animations use `react-native-reanimated`, run at 60 fps on the UI thread, use the ease-out curve `cubic-bezier(0.23, 1, 0.32, 1)`, and are skipped when the phone's *Reduce motion* setting is on (everything appears at once, in its final colors).

## 6. Sound (optional)

Soft piano in G major, a gentle felt-tip sound on strokes, soft koto-like music. In the app: the answer, lesson and stroke sounds are short piano-like tones in G major and a soft felt-tip stroke (`scripts/make-sounds.py`); they follow the Sounds setting and the phone's silent switch.
