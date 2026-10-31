# Store listing — Shqiponisht

Everything to paste into App Store Connect and Google Play Console. Every text has been checked against the store's length limit. Images are in [`store/`](store/).

Numbers used below come from the app's content: **41 lessons** (24 free, 17 Plus), **138 kana** (hiragana + katakana), **89 kanji** (36 free), **147 words and phrases**, **337 pronunciation clips**.

> App Store Connect doesn't offer Albanian as a listing language, so the Apple listing is in English (the app itself is in Albanian, and the description says so). Google Play supports Albanian: use it as the default language and add the English translation.

---

## Images

| File | Use | Size |
| --- | --- | --- |
| `store/ios/1-sot.jpg` … `6-kanji.jpg` | App Store, iPhone 6.7"/6.9" screenshots | 1290 × 2796 |
| `store/android/1-sot.jpg` … `6-kanji.jpg` | Google Play, phone screenshots | 1080 × 1920 |
| `store/feature-graphic.png` | Google Play feature graphic | 1024 × 500 |
| `store/play-icon-512.png` | Google Play app icon | 512 × 512 |

The App Store icon comes from the build itself (`assets/images/icon.png`).

The screenshots were taken from the app's web build. Before launch, retake them from the real iOS/Android build: the screens are the same, but the phone's status bar will then look native. Captions (Albanian): *Mëso japonisht në shqip · Shpjegime në shqip · Hiragana me lexim shqip · Mëso të shkruash · Kartat e fjalëve · Kanji me kuptim shqip*.

---

## App Store (English (U.S.))

**Name** (28/30)
```
Shqiponisht – Learn Japanese
```

**Subtitle** (30/30)
```
Japanese for Albanian speakers
```

**Promotional text** (113/170)
```
New: native-speaker pronunciation for every word, flashcards and a daily review that brings back what you forget.
```

**Keywords** (99/100)
```
japanese,hiragana,katakana,kanji,albanian,shqip,japonisht,kosovo,kana,flashcards,writing,vocabulary
```

**Description**
```
Learn Japanese in Albanian. Shqiponisht is the first Japanese course made for Albanian speakers: every lesson, explanation and tip is in Albanian, and Japanese sounds are spelled the way you read them — ち = çi, つ = cu, じ = xhi.

WHAT YOU LEARN
• Hiragana and katakana: all 138 kana, row by row
• 89 kanji with Albanian meanings, on/kun readings and example words
• 147 words and phrases: greetings, numbers, family, food, places, shopping, the restaurant and more
• Your first verbs and sentences

LEARN IT PROPERLY
• Native pronunciation: every kana, word and sentence has real audio — a native Tokyo-accent speaker or a natural Japanese voice. Tap twice to hear it slower.
• Writing practice: watch the stroke order, then write each character with your finger. The app checks the order and direction of every stroke.
• Daily review: what you get wrong comes back until you remember it, at the right intervals.
• Flashcards: flip, swipe, and the hard words keep coming back.

STAY MOTIVATED
• Short lessons, daily goal, XP and streaks
• Daily reminder at the time you choose
• Sounds, animations and confetti when you pass a lesson

PRIVATE BY DESIGN
No account, no ads, no tracking. Your progress stays on your phone, and you can move it to a new phone with a backup code.

SHQIPONISHT PLUS
The first 24 lessons are free. Shqiponisht Plus unlocks Level 2: 17 more lessons and 53 more kanji — verbs, time, sentences, numbers to 10,000, shopping, adjectives, colours, travel and the restaurant. Monthly or yearly, with a 7-day free trial on the yearly plan.

Payment is charged to your Apple ID account at confirmation of purchase. The subscription renews automatically unless cancelled at least 24 hours before the end of the current period. You can manage and cancel it in your App Store account settings.

Terms of Use: [your terms.html URL]
Privacy Policy: [your privacy.html URL]

Pronunciation: recordings by Tofugu and WaniKani (CC BY-SA 4.0) and VOICEVOX:玄野武宏. Stroke order: KanjiVG (CC BY-SA 3.0).
```

**Other App Store fields**

| Field | Value |
| --- | --- |
| Primary category | Education |
| Secondary category | Reference |
| Price | Free, with in-app purchases (Shqiponisht Plus, see `STORE_SETUP.md`) |
| Support URL | your hosted `docs/index.html` (GitHub Pages) |
| Marketing URL | same, or leave empty |
| Privacy Policy URL | your hosted `docs/privacy.html` |
| Copyright | `2026 Shqiponisht` |
| Age rating | **4+**: answer *None* to every content question; *No* to unrestricted web access, user-generated content, gambling, contests; the app has no ads and doesn't collect data from children |
| App Privacy | as in `STORE_SETUP.md` → Step 3: only *Purchases → Purchase History*, for App Functionality, not used for tracking |
| Sign-in required for review | No |
| Review notes | the note in `STORE_SETUP.md` → Step 1a.4 (how to find the subscription in an Albanian-language app) |

---

## Google Play

**App name** (27/30)
```
Shqiponisht: Mëso japonisht
```

**Short description — Albanian, default** (74/80)
```
Japonishtja e shpjeguar në shqip: kana, kanji, fjalë, shqiptim dhe shkrim.
```

**Short description — English** (75/80)
```
Japanese explained in Albanian: kana, kanji, words, pronunciation, writing.
```

**Full description — Albanian, default**
```
Mëso japonisht në shqip. Shqiponisht është kursi i parë i japonishtes i bërë për shqipfolës: çdo mësim, shpjegim dhe këshillë është në shqip, dhe tingujt japonezë shkruhen ashtu si i lexon ti — ち = çi, つ = cu, じ = xhi.

ÇFARË MËSON
• Hiragana dhe katakana: të 138 shkronjat kana, rresht pas rreshti
• 89 kanji me kuptim në shqip, lexime on/kun dhe fjalë shembull
• 147 fjalë dhe shprehje: përshëndetje, numra, familja, ushqimi, vendet, blerjet, restoranti e më shumë
• Foljet dhe fjalitë e para

MËSO SI DUHET
• Shqiptim i vërtetë: çdo shkronjë, fjalë dhe fjali ka zë — një folës vendas me theks të Tokios ose një zë natyral japonez. Prek dy herë për ta dëgjuar më ngadalë.
• Praktikë shkrimi: shiko rendin e vijave, pastaj shkruaj me gisht. Aplikacioni kontrollon rendin dhe drejtimin e çdo vije.
• Përsëritja e ditës: ato që gabon kthehen derisa t’i mbash mend, në kohën e duhur.
• Kartat e fjalëve: kthe kartën, rrëshqit, dhe fjalët e vështira kthehen sërish.

QËNDRO I MOTIVUAR
• Mësime të shkurtra, qëllim ditor, XP dhe seri ditësh
• Kujtesë ditore në orën që zgjedh ti
• Tinguj, animacione dhe konfeti kur kalon një mësim

PRIVATËSI E PLOTË
Pa llogari, pa reklama, pa gjurmim. Përparimi mbetet në telefonin tënd dhe mund ta kalosh në një telefon të ri me një kod rezervimi.

SHQIPONISHT PLUS
24 mësimet e para janë falas. Shqiponisht Plus hap Nivelin 2: 17 mësime dhe 53 kanji të tjera — folje, koha, fjali, numrat deri në 10 000, blerjet, mbiemrat, ngjyrat, udhëtimi dhe restoranti. Mujor ose vjetor, me 7 ditë provë falas te plani vjetor. Abonimi rinovohet automatikisht; mund ta anulosh kur të duash te Google Play.

Shqiptimi: regjistrime nga Tofugu dhe WaniKani (CC BY-SA 4.0) dhe VOICEVOX:玄野武宏. Rendi i vijave: KanjiVG (CC BY-SA 3.0).
```

**Full description — English translation**

Use the App Store description above, replacing its subscription paragraph with: *"Monthly or yearly, with a 7-day free trial on the yearly plan. The subscription renews automatically; cancel anytime in Google Play."*

**Other Play Console fields**

| Field | Value |
| --- | --- |
| App category | Education |
| Tags | Language learning, Education |
| Contact email | `[EMAIL]` (same as `src/legal/publisher.json`) |
| Website | your hosted `docs/index.html` |
| Privacy policy | your hosted `docs/privacy.html` |
| Ads | **No**, the app contains no ads |
| App access | All functionality available without special access (Plus is a normal subscription) |
| Content rating (IARC) | Category *Reference, News, or Educational*; answer *No* to violence, sexuality, language, controlled substances, gambling, user interaction and sharing location → expect **Everyone / PEGI 3** |
| Target audience | 13+ (avoids the extra rules for apps aimed at children; the app is still suitable for everyone) |
| Data safety | as in `STORE_SETUP.md` → Step 3 |
| Government app / financial features / health | No |
