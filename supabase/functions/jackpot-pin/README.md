# `jackpot-pin` Edge Function

Staff enter a PIN → function verifies it → issues a real Supabase session.
No email secret needed. The function auto-creates and manages an internal Auth user.

## Deploy

From repo root (with [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project):

```bash
supabase functions deploy jackpot-pin --no-verify-jwt
```

**`--no-verify-jwt` is required** so browsers can call `OPTIONS` + `POST` before the user is
logged in. If JWT verification stays on, the CORS preflight gets a non-2xx response.

### If you deployed from the Dashboard

1. **Edge Functions** → **jackpot-pin** → open the function.
2. Find **Enforce JWT verification** / **Verify JWT** and **turn it OFF**.
3. Save and redeploy if needed.

## Secrets

**None required.** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.

The function derives a stable internal staff email from your project URL and creates that
Auth user (+ `owner_roles` row) on first successful PIN entry. Nothing to configure.

## CORS / "preflight failed" in the browser

| Status | Meaning |
|--------|---------|
| **404** | Function **not deployed**. Run `npm run deploy:jackpot-pin` after `supabase link`. |
| **401** on `OPTIONS` | **JWT verification** still ON — use `--no-verify-jwt`. |
| **200** / **204** | Preflight OK. |

Test preflight:

```bash
curl -i -X OPTIONS \
  'https://YOUR_PROJECT.supabase.co/functions/v1/jackpot-pin' \
  -H 'Origin: https://4sq-app.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type,apikey,x-client-info'
```

Expect **HTTP/2 200** and `access-control-allow-origin` in the response.
