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

### Jackpot staff PINs (no email for bar staff)

1. **Create one Auth user** everyone shares after a correct PIN (e.g. `jackpot-staff@yourdomain.com`). In **Authentication → Users** → *Add user* → set email + a long random password (staff never use this password).
2. **Grant that user access** in SQL:

```sql
INSERT INTO public.owner_roles (email, role)
VALUES ('jackpot-staff@yourdomain.com', 'staff')
ON CONFLICT (email) DO NOTHING;
```

3. **Add up to 4 PINs** (hashed — replace the example strings with your own):

```sql
INSERT INTO public.jackpot_pins (pin_hash, label, sort_order) VALUES
  (extensions.crypt('YOUR-PIN-1', extensions.gen_salt('bf')), 'Staff 1', 1),
  (extensions.crypt('YOUR-PIN-2', extensions.gen_salt('bf')), 'Staff 2', 2),
  (extensions.crypt('YOUR-PIN-3', extensions.gen_salt('bf')), 'Staff 3', 3),
  (extensions.crypt('YOUR-PIN-4', extensions.gen_salt('bf')), 'Staff 4', 4);
```

4. **Deploy the Edge Function** `jackpot-pin` (from `supabase/functions/jackpot-pin/`):

```bash
supabase functions deploy jackpot-pin --no-verify-jwt
```

**Important:** `--no-verify-jwt` (or turning **JWT verification OFF** for `jackpot-pin` in the Supabase Dashboard) is required. If JWT stays on, the **OPTIONS** preflight often returns **401**, and the browser reports a **CORS** error (`preflight doesn't pass`). Staff are not logged in yet when they call this function.

If you still see CORS errors after redeploying: **Edge Functions** → **jackpot-pin** → disable **Verify JWT** / **Enforce JWT**, then deploy again. See `supabase/functions/jackpot-pin/README.md`.

5. In **Supabase → Edge Functions → jackpot-pin → Secrets**, set:

| Secret | Value |
|--------|--------|
| `JACKPOT_STAFF_USER_EMAIL` | Same email as step 1 (e.g. `jackpot-staff@yourdomain.com`) |

(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually injected automatically.)

6. **`supabase/config.toml`** in this repo already sets `[functions.jackpot-pin] verify_jwt = false` so unauthenticated staff can call the function (PIN + rate limit protect it).

**Security (honest summary):** Good enough for a **small internal** dashboard if PINs are **long random** (not `1234`), you **rotate** a PIN when someone leaves, and you accept that **all staff share one Auth user** after entry (no per-person audit in Supabase). The function is public; **3 wrong tries** then **30 minutes** lockout is enforced **per browser session ID** (new tab = new tries — not perfect against a determined attacker). For stronger security, use per-user logins only.

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

The Jackpot page is **not linked in the public navigation**. Open: `https://yourdomain.com/#jackpot`

**Everyone:** Enter the **PIN** you were given — **no email on this page**. After **3 wrong tries** in the same browser session, sign-in locks for **30 minutes** for that session.

---

## 9. Environment variables summary

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes (for auth) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (for auth) | Supabase public anon key |

Edge Function secret **`JACKPOT_STAFF_USER_EMAIL`** is set in the Supabase dashboard (not in Vercel).

---

## Architecture notes

- **Menu data** is stored in browser IndexedDB (Dexie) — this means each device/browser has its own copy. Future work: sync to `menu_versions` Postgres table on save.
- **Owner roles** are managed directly in the database — there is no self-signup. You must manually add emails to `owner_roles`.
- **The Jackpot URL is not secret.** Staff PINs gate access via the **`jackpot-pin`** Edge Function + **`jackpot_pins`** table; a correct PIN issues a real session for the shared **`JACKPOT_STAFF_USER_EMAIL`** user (must be in `owner_roles`). Staff never see that email in the app.
