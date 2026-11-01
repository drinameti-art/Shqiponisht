# Accounts backend (Supabase)

Shqiponisht accounts (username, email + password, age range, level, and progress synced between phones) run on [Supabase](https://supabase.com). The free plan is enough to launch.

Without these settings the app uses an on-device **demo** backend: sign-up works, but accounts exist only on that phone or browser. The web preview uses it. `npm run check:release` refuses a store build until Supabase is configured.

## Status

The project **shqiponisht** (ref `voubpqzndizofrlyezea`, region Central EU / Frankfurt) exists and the migration below is applied. Its URL and publishable key are in `.env.example` and `eas.json`, so `cp .env.example .env` is all a fresh checkout needs. It was tested live: log-in, profile, username check, progress sync, row-level security (no access to other users' rows, nothing for logged-out visitors), profile edit, password change and account deletion.

**Still to do in the dashboard** (supabase.com → project *shqiponisht*):

1. **Email sender (required before launch).** Supabase's built-in sender only delivers to your own team's addresses, so real people can't sign up until you add an SMTP sender: *Authentication → Emails → SMTP settings*. Any provider works (e.g. Resend, Brevo, Postmark — most have a free tier). Sender: `Shqiponisht <noreply@your-domain>`.
2. **Minimum password length:** *Authentication → Sign In / Providers → Email* → 8 (the app already asks for 8 with a letter and a number). Keep **Confirm email** on.
3. **Site URL:** *Authentication → URL Configuration* → your support page, e.g. `https://drinameti-art.github.io/Shqiponisht/` (where the confirmation link lands after confirming).
4. **Albanian emails:** *Authentication → Emails → Templates*, texts below.

The security advisor lists two functions that run with owner rights and can be called through the API. Both are intended: `username_available` must work before sign-in and only answers yes/no; `delete_my_account` can only delete the caller's own account.

### Email templates

**Confirm signup** — subject: `Konfirmo llogarinë tënde në Shqiponisht`

```html
<h2>Mirë se erdhe në Shqiponisht!</h2>
<p>Prek butonin më poshtë për ta konfirmuar email-in dhe për ta aktivizuar llogarinë.</p>
<p><a href="{{ .ConfirmationURL }}">Konfirmo llogarinë</a></p>
<p>Pastaj kthehu te aplikacioni dhe hyr me email-in dhe fjalëkalimin tënd. がんばって!</p>
<p>Nëse nuk e ke krijuar ti këtë llogari, injoroje këtë email.</p>
```

**Reset password** — subject: `Ndrysho fjalëkalimin e Shqiponisht`

```html
<h2>Ndrysho fjalëkalimin</h2>
<p>Dikush (shpresojmë ti) kërkoi të ndryshojë fjalëkalimin e llogarisë Shqiponisht.</p>
<p><a href="{{ .ConfirmationURL }}">Zgjidh një fjalëkalim të ri</a></p>
<p>Nëse nuk e kërkove ti, injoroje këtë email: fjalëkalimi yt mbetet i njëjtë.</p>
```

## Set up from scratch (another project)

1. **Create a project** at supabase.com → New project. Choose the region **Central EU (Frankfurt)** so data stays in the EU, and save the database password somewhere safe.
2. **Create the tables.** Open *SQL Editor*, paste the whole of [`migrations/20261101000000_accounts.sql`](migrations/20261101000000_accounts.sql) and run it. (With the Supabase CLI: `supabase link` then `supabase db push`.)
3. **Email sign-in.** *Authentication → Sign In / Providers → Email*: keep it enabled, keep **Confirm email** on, and set the minimum password length to 8.
4. **Emails in Albanian.** *Authentication → Emails*: edit *Confirm signup* and *Reset password*. Suggested subjects: `Konfirmo llogarinë tënde në Shqiponisht` and `Ndrysho fjalëkalimin e Shqiponisht`. For real users, set up your own SMTP sender under *Authentication → Emails → SMTP settings* (the built-in sender is limited to a few emails per hour).
5. **Connect the app.** *Project Settings → API*: copy the Project URL and the `anon` public key into `.env` (and as EAS environment variables for builds):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # the publishable key (or the legacy anon key)
   ```

   The publishable key is meant to ship inside apps; row-level security keeps each person's data private. Never put the `service_role` key in the app.

## What is stored

| Table | Columns | Who can read it |
| --- | --- | --- |
| `auth.users` (Supabase) | email, password hash, sign-in times | only Supabase |
| `profiles` | username, name, age range, level | only the owner |
| `progress` | XP, streak, lessons, review cards (JSON) | only the owner |

Learners under 16 can't create an account in the app, so no data from them reaches the server. Deleting an account in the app (Profili → Fshi llogarinë) removes the user and both rows at once.
