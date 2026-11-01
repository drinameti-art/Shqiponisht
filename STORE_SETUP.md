# Setting up Shqiponisht Plus

A checklist for turning on real subscriptions. Steps 1–2 happen in your Apple, Google and RevenueCat accounts; everything you need to type is below, ready to copy. Step 3 (privacy policy and terms) is already written — you only fill in your company details.

**Plans:** monthly **€4.99**, yearly **€29.99** with a **7-day free trial** (the app shows this as "Kurse 50%").
**Entitlement:** `plus` — the app checks only this name, so keep it exactly.

When you're done, `npm run check:release` must print ✓ before you make a store build.

---

## Before you start (one-time)

- [ ] **Accounts:** set up Supabase as described in [`supabase/README.md`](supabase/README.md) and put its URL and anon key in `.env` / EAS environment variables.

- [ ] **Apple Developer Program** membership ($99/year) and **Google Play Console** account ($25 once), in the company's name.
- [ ] **Apple:** App Store Connect → *Business* → sign the **Paid Apps Agreement** and fill in banking and tax. Subscriptions will not load until this shows *Active*.
- [ ] **Google:** Play Console → *Setup → Payments profile* → link a merchant account.
- [ ] Create the app in both stores with bundle ID / package name **`com.shqiponisht.app`** (set in `app.json`).
- [ ] **Google only:** Play lets you create subscriptions only after a build that includes billing has been uploaded. Upload one to *Internal testing* first: `npx eas-cli@latest build --platform android --profile production`, then `npx eas-cli@latest submit --platform android`.

---

## Step 1a — App Store Connect

*Your app → Monetization → Subscriptions*

1. **Create subscription group**
   - Reference name: `Shqiponisht Plus`
   - Localization (English (U.S.) — App Store Connect doesn't offer Albanian):
     - Display name: `Shqiponisht Plus`
2. **Add two subscriptions to the group:**

   | Field | Monthly | Yearly |
   | --- | --- | --- |
   | Reference name | `Plus Monthly` | `Plus Yearly` |
   | Product ID | `shqiponisht_plus_monthly` | `shqiponisht_plus_annual` |
   | Duration | 1 month | 1 year |
   | Price | €4.99 | €29.99 |
   | Display name (English) | `Shqiponisht Plus – Monthly` | `Shqiponisht Plus – Yearly` |
   | Description (English, ≤ 45 chars) | `All Level 2 lessons, billed monthly` | `All Level 2 lessons, billed yearly` |

   For the price, pick your base country, enter the euro price, and let Apple fill in the other countries.
3. **Free trial (yearly only):** open *Plus Yearly → Subscription Prices → Introductory Offers → +* → all countries → *Free* → *1 week*.
4. **Review information** for each subscription: upload a screenshot of the Plus screen (open it from *Sot → Zhblloko Nivelin 2*) and paste this note:

   > The app is in Albanian. To see the subscription: open the "Sot" (Today) tab and tap "Zhblloko Nivelin 2" (Unlock Level 2), or go to the "Profili" tab → "Shiko Plus". "Abonohu" = Subscribe, "Rikthe blerjet" = Restore purchases. Plus unlocks the "Niveli 2" lessons at the bottom of the Sot tab.

5. **App-level links:** *App Information → License Agreement* (or the description) and *App Privacy → Privacy Policy URL*: use your hosted `terms.html` and `privacy.html` (see Step 3).
6. **In-App Purchase key for RevenueCat:** *Users and Access → Integrations → In-App Purchase* → generate a key → download the `.p8` file and note the **Key ID** and **Issuer ID**.

## Step 1b — Google Play Console

*Your app → Monetize with Play → Products → Subscriptions*

1. **Create subscription** `shqiponisht_plus_monthly`
   - Name: `Shqiponisht Plus – Mujor`
   - Benefits (Albanian): `Të gjitha mësimet e Nivelit 2` · `27 kanji të reja` · `Folje dhe fjali`
   - Add **base plan** ID `monthly` → *Auto-renewing* → billing period *1 month* → price **€4.99** (*Set prices → update exchange rates* for other countries) → **Activate**.
2. **Create subscription** `shqiponisht_plus_annual`
   - Name: `Shqiponisht Plus – Vjetor`
   - Same benefits.
   - Base plan ID `annual` → *Auto-renewing* → *1 year* → **€29.99** → **Activate**.
   - **Add offer** on `annual`: offer ID `trial-7d` → eligibility *New customer acquisition* → phase *Free trial*, *7 days* → **Activate**.
3. Add English translations of the names if you list the app in English too.
4. **Service account for RevenueCat:** follow RevenueCat's guide *"Google Play — Service Account Credentials"* (Google Cloud → service account → JSON key; Play Console → *Users and permissions* → invite it with *View financial data* and *Manage orders and subscriptions*). New credentials can take up to 36 hours to start working.

## Step 2 — RevenueCat

[app.revenuecat.com](https://app.revenuecat.com) (free until your app earns $2,500/month).

1. **Create project** `Shqiponisht`.
2. **Add App Store app:** bundle ID `com.shqiponisht.app` → upload the In-App Purchase key `.p8` with its Key ID and Issuer ID.
3. **Add Play Store app:** package `com.shqiponisht.app` → upload the service-account JSON.
4. **Products:** *Product catalog → Products → Import* (or add by ID):
   - App Store: `shqiponisht_plus_monthly`, `shqiponisht_plus_annual`
   - Play Store: `shqiponisht_plus_monthly:monthly`, `shqiponisht_plus_annual:annual`
5. **Entitlement:** *Entitlements → New* → identifier **`plus`** → attach all four products.
6. **Offering:** *Offerings → New* → identifier `default` → mark it **Current** → add packages:
   - **Monthly** (`$rc_monthly`): `shqiponisht_plus_monthly` (App Store) + `shqiponisht_plus_monthly:monthly` (Play)
   - **Annual** (`$rc_annual`): `shqiponisht_plus_annual` (App Store) + `shqiponisht_plus_annual:annual` (Play)
7. **API keys:** *Project settings → API keys* → copy the public **Apple** key (`appl_…`) and **Google** key (`goog_…`), then either:
   - copy `.env.example` to `.env` and paste them there, **or**
   - store them in EAS (recommended for cloud builds):
     ```
     npx eas-cli@latest env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --environment production --visibility plaintext
     npx eas-cli@latest env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_… --environment production --visibility plaintext
     ```
     These keys are public by design; they only let the app read its own purchases.

## Step 3 — Privacy policy and terms (already written)

The texts are in `src/legal/privacy.json` and `src/legal/terms.json`, in Albanian and English. The app shows them from the Plus screen and from Profili, which is what Apple requires.

1. **Fill in your company** in `src/legal/publisher.json`: `company` (registered name, e.g. `Shqiponisht SH.P.K.`), `country` (e.g. `Kosovë`), `email` (a support address). Update `updated` whenever you change the texts.
2. **Build the web pages:** `npm run legal` writes `docs/index.html`, `docs/privacy.html` and `docs/terms.html`.
3. **Host them:** push the repo to GitHub → *Settings → Pages → Deploy from a branch → `main` / `docs`*. Your links become `https://<user>.github.io/shqiponisht/privacy.html` and `…/terms.html`.
4. Paste those URLs into **App Store Connect** (*App Privacy → Privacy Policy URL*; terms in the description or *License Agreement*) and **Play Console** (*Policy → App content → Privacy policy*).
5. **Privacy questionnaires** (match what the policy says: optional account on Supabase, no ads, no analytics; purchase data goes through RevenueCat):
   - App Store *App Privacy* — all items **Linked to the user**, used only for **App Functionality**, **not** used for tracking:
     - **Contact Info → Email Address**
     - **Contact Info → Name**
     - **Identifiers → User ID** (the username and account ID)
     - **User Content → Other User Content** (lesson progress)
     - **Purchases → Purchase History** (RevenueCat; check its "Apple App Privacy" guide for your SDK version)
     - Age range and level: **Other Data → Other Data Types**
   - Play *Data safety*: data is **collected**, **not shared**, **encrypted in transit**, and **users can request deletion** (in the app: Profili → Llogaria → Fshi llogarinë). Declare, each *optional* and for *App functionality* + *Account management*:
     - **Personal info → Email address, Name, User IDs, Other info** (age range, level)
     - **App activity → Other user-generated content** (progress)
     - **Financial info → Purchase history** (RevenueCat)
   - Play *Account deletion*: the app lets users delete their account in-app. Play also asks for a **web link** where people can request deletion without the app: use your support page (`docs/index.html`) and say there that they can email `[EMAIL]` from the account's address.
   - Apple review notes: mention that the account is optional ("Vazhdo pa llogari" on the last sign-up step) and that accounts can be deleted in Profili → Llogaria → Fshi llogarinë.

I wrote these texts carefully, but they are not legal advice. Have them checked by a lawyer or your accountant before launch, especially the governing-law section.

---

## Test before release

1. Make a development build: `npx eas-cli@latest build --profile development --platform ios` (and `android`). **Purchases don't work in Expo Go.**
2. **iOS:** create a *Sandbox tester* (App Store Connect → Users and Access → Sandbox) and sign in with it on the device under *Settings → App Store → Sandbox Account*. Sandbox renewals are sped up (1 month ≈ 5 minutes).
3. **Android:** add your Google account under *Play Console → Settings → License testing*, and install the app from the internal-testing link.
4. Check: the Plus screen shows both prices, "Kurse 50%" and "7 ditë falas"; buying unlocks *Niveli 2*; deleting and reinstalling the app, then tapping **Rikthe blerjet**, brings Plus back.
5. `npm run check:release` → ✓, then build for the stores.
