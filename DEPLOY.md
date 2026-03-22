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
supabase/migrations/004_jackpot_pins.sql
supabase/migrations/005_jackpot_pin_48177.sql
```

Paste each file's contents and click **Run**. (If `004` already included the `48177` seed, `005` does nothing.)

### Jackpot staff PINs (no email, no secrets to configure)

Migrations `004` + `005` already seed PIN `48177`. To add more PINs:

```sql
INSERT INTO public.jackpot_pins (pin_hash, label, sort_order) VALUES
  (extensions.crypt('YOUR-PIN', extensions.gen_salt('bf')), 'Staff 2', 2);
```

Then **deploy the Edge Function** — that's the only setup step:

```bash
supabase link --project-ref YOUR_PROJECT_REF
npm run deploy:jackpot-pin
```

**No secrets to set.** The function auto-creates an internal staff Auth user and `owner_roles` row on first successful PIN entry.

**`--no-verify-jwt` is required** — without it, the OPTIONS preflight returns 401 and the browser shows a CORS error. `supabase/config.toml` already sets `verify_jwt = false` for this function.

**If CORS fails:** check the real HTTP status — **404** means function not deployed, **401** on OPTIONS means JWT is still on in Dashboard (Edge Functions → jackpot-pin → turn Verify JWT OFF). See `supabase/functions/jackpot-pin/README.md`.

**Security:** Good enough for a small internal dashboard if PINs aren't trivial. Rotate PINs when staff leave. **3 wrong tries** then **30 min lockout** per browser session.

### Grant yourself owner access

After running the migrations, add the owner's email:

```sql
INSERT INTO public.owner_roles (email, role)
VALUES ('owner@foursquarebar.com', 'owner')
ON CONFLICT (email) DO NOTHING;
```

Replace `owner@foursquarebar.com` with the real owner email. Anyone with that email who signs in via the Jackpot page will get owner access automatically.

---

## 3. Configure Supabase Auth

In the Supabase dashboard → **Authentication → Settings**:

1. **Email** → enable "Magic links" (passwordless email OTP)
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
| `SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `SUPABASE_ANON_KEY` | `anon` / `public` key |

**Never use the `service_role` key in the frontend.**

The app also accepts `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_*` variants — all work.

---

## 5. Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked for environment variables, add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Option B — Vercel Dashboard (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Under **Environment Variables**, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`
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

The Jackpot page is **not linked in the public navigation**. Open: `https://yourdomain.com/#jackpot`

Enter the **PIN** — no email required. After **3 wrong tries** in the same browser session, sign-in locks for **30 minutes**.

---

## 9. Environment variables summary

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anon key |

No Edge Function secrets needed. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically into Edge Functions.

---

## Architecture notes

- **Menu data** is stored in browser IndexedDB (Dexie) — each device/browser has its own copy. Saved versions sync to `menu_versions` Postgres table.
- **Owner roles** are managed directly in the database — no self-signup. Add emails to `owner_roles` manually for owner access.
- **The Jackpot URL is not secret.** Staff PINs gate access via the `jackpot-pin` Edge Function + `jackpot_pins` table. A correct PIN auto-creates/uses an internal Auth user and issues a real session. Staff never see any email.
