# Accounts backend (Supabase)

Shqiponisht accounts (username, email + password, age range, level, and progress synced between phones) run on [Supabase](https://supabase.com). The free plan is enough to launch.

Without these settings the app uses an on-device **demo** backend: sign-up works, but accounts exist only on that phone or browser. The web preview uses it. `npm run check:release` refuses a store build until Supabase is configured.

## Set up (about 15 minutes)

1. **Create a project** at supabase.com → New project. Choose the region **Central EU (Frankfurt)** so data stays in the EU, and save the database password somewhere safe.
2. **Create the tables.** Open *SQL Editor*, paste the whole of [`migrations/20261101000000_accounts.sql`](migrations/20261101000000_accounts.sql) and run it. (With the Supabase CLI: `supabase link` then `supabase db push`.)
3. **Email sign-in.** *Authentication → Sign In / Providers → Email*: keep it enabled, keep **Confirm email** on, and set the minimum password length to 8.
4. **Emails in Albanian.** *Authentication → Emails*: edit *Confirm signup* and *Reset password*. Suggested subjects: `Konfirmo llogarinë tënde në Shqiponisht` and `Ndrysho fjalëkalimin e Shqiponisht`. For real users, set up your own SMTP sender under *Authentication → Emails → SMTP settings* (the built-in sender is limited to a few emails per hour).
5. **Connect the app.** *Project Settings → API*: copy the Project URL and the `anon` public key into `.env` (and as EAS environment variables for builds):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

   The anon key is meant to ship inside apps; row-level security keeps each person's data private. Never put the `service_role` key in the app.

## What is stored

| Table | Columns | Who can read it |
| --- | --- | --- |
| `auth.users` (Supabase) | email, password hash, sign-in times | only Supabase |
| `profiles` | username, name, age range, level | only the owner |
| `progress` | XP, streak, lessons, review cards (JSON) | only the owner |

Learners under 16 can't create an account in the app, so no data from them reaches the server. Deleting an account in the app (Profili → Fshi llogarinë) removes the user and both rows at once.
