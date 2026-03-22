# `jackpot-pin` Edge Function

## Deploy

From repo root (with [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project):

```bash
supabase functions deploy jackpot-pin --no-verify-jwt
```

**`--no-verify-jwt` is required** so browsers can call `OPTIONS` + `POST` **before** the user is logged in. If JWT verification stays on, the **CORS preflight** often gets a non-2xx response and the browser shows a CORS error.

### If you deployed from the Dashboard

1. **Edge Functions** → **jackpot-pin** → open the function.
2. Find **Enforce JWT verification** / **Verify JWT** and **turn it OFF** for this function.
3. Save and redeploy if needed.

## Secrets

In **Project Settings → Edge Functions → Secrets** (or CLI `supabase secrets set`):

| Name | Value |
|------|--------|
| `JACKPOT_STAFF_USER_EMAIL` | Auth user email that exists in `auth.users` and `owner_roles` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically in the Edge runtime.

## CORS / “preflight failed” in the browser

Chrome often labels any failed preflight as **CORS**. Check the **status code**:

| Status | Meaning |
|--------|---------|
| **404** | Function **not deployed** on this project (or wrong `*.supabase.co` URL in Vercel env). Run `npm run deploy:jackpot-pin` from repo root after `supabase link`. |
| **401** on `OPTIONS` | **JWT verification** still ON — use `--no-verify-jwt` and/or Dashboard → turn **Verify JWT** off for `jackpot-pin`. |
| **200** / **204** | Preflight OK; if the app still fails, check the **POST** response and secrets. |

1. Redeploy this function after pulling the latest `index.ts` (uses `corsHeaders` from `@supabase/supabase-js`).
2. Confirm **JWT verification is off** for `jackpot-pin` (above).
3. Test preflight:

```bash
curl -i -X OPTIONS \
  'https://YOUR_PROJECT.supabase.co/functions/v1/jackpot-pin' \
  -H 'Origin: https://4sq-app.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type,apikey,x-client-info'
```

You should see **HTTP/2 200** (or 204) and `access-control-allow-origin` in the response — **not 404**.
