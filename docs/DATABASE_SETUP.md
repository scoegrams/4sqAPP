# Connect the database (Supabase)

The app does **not** use a Postgres connection string in code. It uses the **HTTP API** via:

| Variable | Where to get it |
|----------|------------------|
| `VITE_SUPABASE_URL` or `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) | Supabase → **Settings** → **API** → Project URL |
| `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | Same page → `anon` `public` key |

The build reads these in **`vite.config.ts`** — you don’t have to use the `VITE_` prefix on Vercel if you prefer `SUPABASE_*`. Put values in **`.env`** locally (see `.env.example`).

## 1. Verify connectivity

```bash
npm run check:db
```

- **Auth OK** → URL and anon key are valid.
- **Warning about `profiles`** → run migrations below.

## 2. Create tables (run SQL in Supabase)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run **in order**, whole file each time:
   - `supabase/migrations/001_connect4_social.sql`
   - `supabase/migrations/002_owner_roles_and_menu.sql`
   - `supabase/migrations/003_site_theme.sql` — global Theme Studio + active preset (public read, owners update)

(New → paste → **Run**.)

## 3. Auth settings (magic link)

**Authentication** → **Providers** → **Email** → enable **magic links**.

**Authentication** → **URL configuration**:

- **Site URL**: set to the URL you use most (e.g. production `https://your-app.vercel.app`). This is only the default when the app does not send a redirect; this project **sends the current page URL** in the magic link so local vs production matches where you clicked “Send magic link”.
- **Redirect URLs** (required): Supabase will reject unknown redirects. Add **both**:
  - `http://localhost:5173/**` (Vite dev)
  - `https://your-app.vercel.app/**` (or your real domain)

Without the production entry, magic links that point at your live site will fail. Without `localhost`, local dev links will fail.

Optional env override: **`VITE_AUTH_REDIRECT_URL`** — if set, magic links always use this URL instead (must still be listed under Redirect URLs). Example: `https://your-app.vercel.app/#jackpot`.

## 4. Owner access (Jackpot admin)

After you can sign in with your email, Supabase must know you’re an owner. In **SQL Editor**:

```sql
INSERT INTO public.owner_roles (email, role)
VALUES ('you@yourdomain.com', 'owner')
ON CONFLICT (email) DO NOTHING;
```

Use the **same email** you’ll type on the Jackpot page. The trigger in migration `002` links `user_id` on first login.

## 5. Production

Set **URL + anon key** in your host (e.g. Vercel → Environment Variables) for production builds — either **`VITE_SUPABASE_*`** or **`SUPABASE_URL` / `SUPABASE_ANON_KEY`**.

Never commit `.env` or use the **service_role** key in the frontend.
