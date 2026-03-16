# How the Four Square App Works

This doc describes the app’s architecture, data layers, and why **Supabase is required for user signup and social features**. Use it as the reference for how things work going forward.

---

## 1. High-level architecture

- **Front end**: React (Vite + TypeScript + Tailwind). Single-page app: menu, drinks, booking, about, Connect 4.
- **Two data layers**:
  - **Local NoSQL (IndexedDB via Dexie)** — menu, specials, drinks, train sign, version history. Stays in the browser; no server, no users.
  - **Supabase (PostgreSQL + Auth + Realtime)** — user accounts, Connect 4 scores, chat, rewards. Shared across devices and people; requires the internet.

---

## 2. Local NoSQL (IndexedDB / Dexie) — and its limits

**What it does**

- Stores the **current menu** (quadrants, sections, items, daily specials, drinks, train sign events) and **version history** (snapshots per save).
- Used only by **admin** flows: edit menu → Save / Discard / Restore version. No signup, no per-user data.

**Why it’s not enough for “user” features**

| Need | Why NoSQL (local) isn’t enough |
|------|---------------------------------|
| **User signup / login** | No shared notion of “who is this person” across devices or browsers. No passwords, no magic links, no phone OTP. |
| **Same identity everywhere** | IndexedDB is per-browser, per-device. You can’t “log in on your phone” and see the same account. |
| **Shared data** | High scores, chat, rewards opt-in must be the same for everyone. Local DB is only on one device. |
| **Security** | You can’t safely store secrets or enforce “only this user can change their profile” in the browser alone. |

So: **NoSQL is great for the menu/admin experience (single device, no users). For signup, login, and shared social features we need a real backend — Supabase.**

---

## 3. Supabase — required for user signup and social features

**What Supabase provides**

- **Auth**: Sign up / sign in with **email** (magic link) or **phone** (OTP). Same account on any device.
- **Database (PostgreSQL)**: Profiles, Connect 4 scores, chat messages, rewards flag. Row Level Security (RLS) so users only change their own data where intended.
- **Realtime** (optional): Live chat updates without refresh.

**Tables we use** (see `supabase/migrations/001_connect4_social.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | One row per user: display name, email, phone, `rewards_opted_in`. Created on first sign-in. |
| `connect4_scores` | One row per user: `user_id`, `display_name`, `wins`. Updated when they win a game. |
| `connect4_chat` | Chat messages: `user_id`, `display_name`, `message`, `created_at`. Realtime optional. |

So: **user signup, login, scores, chat, and rewards all depend on Supabase. NoSQL is not used for any of that.**

---

## 4. How the app behaves with vs without Supabase

**Without Supabase** (no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `.env`)

- Menu, drinks, train sign, admin, version history: **all work** (IndexedDB only).
- Connect 4: **local two-player only** (no sign-in, no scores, no chat, no rewards).
- No user accounts, no shared data.

**With Supabase** (env vars set, migration run)

- Everything above **plus**:
  - **Sign up / log in** (email magic link or phone OTP).
  - **Connect 4**: Left/right names, high scores (top 8), chat, “Join Four Square Rewards” (sets `rewards_opted_in` on profile).
  - Same identity across devices and sessions.

---

## 5. User signup and login flow (with Supabase)

1. **Email**
   - User enters email on Connect 4 auth screen.
   - App calls `signInWithOtp({ email })`. Supabase sends a magic link.
   - User clicks link → signed in. Profile row created/updated on first sign-in.

2. **Phone**
   - User enters phone number. App calls `signInWithOtp({ phone })`. Supabase sends SMS (requires Auth → Phone enabled and an SMS provider, e.g. Twilio).
   - User enters OTP → `verifyPhoneOtp()` → signed in. Profile created/updated as above.

3. **Session**
   - Stored by Supabase in the browser. On reload, `getSession()` restores the user; no signup again unless they sign out or clear data.

4. **Profile**
   - `profiles` is filled from auth (id, email/phone) and optional display name. Rewards CTA sets `rewards_opted_in = true`.

So: **all of this is Supabase Auth + PostgreSQL. NoSQL is not involved in signup or login.**

---

## 6. Data split summary

| Data | Where it lives | Used for |
|------|----------------|----------|
| Menu (sections, items, specials, drinks, train sign events) | **IndexedDB** (Dexie) | Admin editing, version history, what the site shows. |
| Version history (snapshots per save) | **IndexedDB** (Dexie) | Restore previous menu state. |
| User accounts, sessions | **Supabase Auth** | Sign up, log in, “who is this?” |
| Profiles (display name, rewards) | **Supabase** `profiles` | Connect 4 display name, rewards opt-in. |
| Connect 4 high scores | **Supabase** `connect4_scores` | Leaderboard. |
| Connect 4 chat | **Supabase** `connect4_chat` | Lobby chat (Realtime optional). |

---

## 7. Going forward — what you need

**For menu/admin only (no users)**

- Nothing else. NoSQL is enough. Deploy the app; admins use it on one device.

**For user signup, Connect 4 social, rewards**

1. **Supabase project**  
   Create a project at [supabase.com](https://supabase.com).

2. **Env**  
   In project root, `.env`:
   ```bash
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
   (See `.env.example`.)

3. **Migration**  
   In Supabase Dashboard → SQL Editor, run the contents of `supabase/migrations/001_connect4_social.sql` (creates `profiles`, `connect4_scores`, `connect4_chat`, RLS).

4. **Realtime (optional)**  
   For live chat: Database → Replication → enable for `connect4_chat`.

5. **Phone auth (optional)**  
   If you want phone sign-in: Auth → Providers → Phone, then configure an SMS provider (e.g. Twilio).

**Summary**

- **NoSQL (IndexedDB)** = menu and admin state; single device; no users.
- **Supabase** = user signup, login, scores, chat, rewards; shared and secure.
- For any feature that involves “users” or “accounts,” you need Supabase; NoSQL alone is not enough.
