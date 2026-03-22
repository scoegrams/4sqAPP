# Four Square — Deployment Guide
**Vercel + Supabase (Postgres)**

---

## Stack

| Layer | Service |
|---|---|
| Frontend | Vite + React (static site) |
| Hosting | Vercel |
| Database & Auth | Supabase (Postgres + Auth) |
| Local storage | Dexie (IndexedDB) — offline-first menu editing |

**Local checklist:** copy `.env.example` → `.env`, add API keys, then `npm run check:db`. Full walkthrough: [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md).

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region close to your users (e.g. `us-east-1`)
3. Save your database password somewhere safe
4. Wait for the project to provision (~1 min)

---

## 2. Run the database migrations

In the Supabase dashboard → **SQL Editor**, run these files **in order**:

```
supabase/migrations/001_connect4_social.sql
supabase/migrations/002_owner_roles_and_menu.sql
supabase/migrations/003_site_theme.sql
```

Paste each file's contents and click **Run**.

### Grant yourself owner access

After running the migrations, add the owner's email:

```sql
INSERT INTO public.owner_roles (email, role)
VALUES ('owner@foursquarebar.com', 'owner')
ON CONFLICT (email) DO NOTHING;
```

Replace `owner@foursquarebar.com` with the real owner email. Anyone with that email who signs in via the Jackpot page will get owner access automatically.

To add a staff member later:

```sql
INSERT INTO public.owner_roles (email, role)
VALUES ('manager@foursquarebar.com', 'staff')
ON CONFLICT (email) DO NOTHING;
```

---

## 3. Configure Supabase Auth

In the Supabase dashboard → **Authentication → Settings**:

1. **Email** → enable "Magic links" (passwordless email OTP) — this powers the Jackpot login
2. **Site URL** → set to your Vercel domain: `https://foursquare.vercel.app` (update after deploy)
3. **Redirect URLs** → add `https://foursquare.vercel.app/**`

For phone OTP (Connect 4 login):
- Enable **Phone** provider
- Integrate a Twilio or Vonage account (Supabase Auth → Providers → Phone)

---

## 4. Get your API keys

Supabase dashboard → **Settings → API**:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `anon` / `public` key |

**Never use the `service_role` key in the frontend.**

---

## 5. Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked for environment variables, add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Option B — Vercel Dashboard (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **Deploy**

### vercel.json (SPA routing)

Create this file at the root so all routes resolve to `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 6. Connect Supabase Realtime (optional)

For Connect 4 chat to update in real time:

Supabase dashboard → **Database → Replication** → find `connect4_chat` → toggle on.

Or run in SQL Editor:

```sql
alter publication supabase_realtime add table public.connect4_chat;
```

---

## 7. Local development

```bash
cp .env.example .env
# Fill in your Supabase URL and anon key
npm install
npm run dev
```

The app works fully offline without Supabase (menu editing uses IndexedDB). Supabase is only required for:
- Jackpot owner login
- Connect 4 ranked play + chat

---

## 8. Accessing the Jackpot dashboard

The Jackpot page is **not linked in the public navigation**. To access it:

- Navigate directly: `https://yourdomain.com/#jackpot` (or scroll to it in the nav drawer when logged in)
- Or: ask the developer to add a direct bookmark

Once at the Jackpot page, enter the owner email → receive a magic link → click it → you're in.

---

## 9. Environment variables summary

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes (for auth) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (for auth) | Supabase public anon key |

---

## Architecture notes

- **Menu data** is stored in browser IndexedDB (Dexie) — this means each device/browser has its own copy. Future work: sync to `menu_versions` Postgres table on save.
- **Owner roles** are managed directly in the database — there is no self-signup. You must manually add emails to `owner_roles`.
- **The Jackpot URL is not secret**, but access is fully gated by the `owner_roles` table. Anyone who navigates there and is not in the table sees "Access denied."
