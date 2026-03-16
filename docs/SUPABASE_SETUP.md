# Supabase setup (Connect 4 social)

You created a Supabase project — follow these steps to turn on sign-in, high scores, chat, and rewards.

---

## 1. Add your project keys to the app

1. In [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Project Settings** (gear) → **API**.
3. Copy:
   - **Project URL**
   - **anon public** key (under "Project API keys").
4. In the **project root** of this app (same folder as `package.json`), create a file named **`.env`** (or copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your real URL and anon key. Save the file.

5. **Restart the dev server** (stop and run `npm run dev` again) so Vite picks up the new env.

---

## 2. Create the database tables

1. In Supabase Dashboard go to **SQL Editor**.
2. Click **New query**.
3. Open this repo’s file **`supabase/migrations/001_connect4_social.sql`**, copy its **entire contents**, and paste into the SQL editor.
4. Click **Run** (or Ctrl/Cmd + Enter).

You should see success. That creates:

- `profiles` — one row per user (display name, rewards opt-in)
- `connect4_scores` — high scores for Connect 4
- `connect4_chat` — lobby chat messages
- RLS policies so users only edit their own data where intended

---

## 3. (Optional) Live chat updates

For chat to update in real time without refresh:

1. In Supabase go to **Database** → **Replication**.
2. Find **`connect4_chat`** and turn replication **on**.

Without this, chat still works; new messages appear after a refresh or when someone sends another message.

---

## 4. (Optional) Phone sign-in

Email magic-link sign-in works as soon as the steps above are done. To also allow **phone (SMS)** sign-in:

1. In Supabase go to **Authentication** → **Providers** → **Phone** and enable it.
2. Configure an SMS provider (e.g. Twilio) in the same section.

---

## 5. Test it

1. Restart dev server if you hadn’t: `npm run dev`.
2. Open the app and go to **Connect 4**.
3. You should see the sign-in gate (email or phone). Enter your email and submit.
4. Check your email for the magic link and click it — you should be signed in and see high scores, chat, and the rewards CTA.

If something doesn’t work, check the browser console and Supabase **Authentication** → **Users** and **Table Editor** for `profiles`, `connect4_scores`, `connect4_chat`.
