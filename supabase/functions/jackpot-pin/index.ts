/**
 * Staff Jackpot login: verify PIN (hashed in DB) → return real Supabase session.
 *
 * No secrets to configure. The function auto-creates/manages an internal staff
 * Auth user and owner_roles row on first successful PIN entry.
 *
 * Auto-provided: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';

const MAX_FAILS = 3;
const LOCK_MINUTES = 30;

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Derive a stable internal staff email using the project's own hostname (always valid). */
function staffEmail(supabaseUrl: string): string {
  try {
    const host = new URL(supabaseUrl).hostname; // e.g. mcspuzkhfwrxyafgoeyh.supabase.co
    return `jackpot-staff@${host}`;
  } catch {
    return 'jackpot-staff@supabase.co';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const pin = typeof body?.pin === 'string' ? body.pin : '';
    const clientId = typeof body?.client_id === 'string' ? body.client_id.trim() : '';

    if (!clientId || clientId.length < 8) {
      return json({ error: 'Invalid request' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      console.error('jackpot-pin: missing SUPABASE_URL or SERVICE_ROLE_KEY');
      return json({ error: 'Server not configured' }, 503);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date();

    // ── Rate limiting ──────────────────────────────────────────────────────
    let { data: row } = await admin
      .from('jackpot_pin_attempts')
      .select('fail_count, locked_until')
      .eq('client_id', clientId)
      .maybeSingle();

    if (row?.locked_until && new Date(row.locked_until) > now) {
      return json({ error: 'Too many wrong PINs. Try again later.', locked: true }, 429);
    }
    if (row?.locked_until && new Date(row.locked_until) <= now) {
      await admin.from('jackpot_pin_attempts').delete().eq('client_id', clientId);
      row = null;
    }

    // ── Verify PIN ─────────────────────────────────────────────────────────
    const { data: pinOk, error: rpcErr } = await admin.rpc('check_jackpot_pin', { p_pin: pin });

    if (rpcErr) {
      console.error('check_jackpot_pin rpc error:', rpcErr.message, rpcErr.code);
      return json({ error: 'Could not verify PIN' }, 500);
    }

    if (!pinOk) {
      const fails = (row?.fail_count ?? 0) + 1;
      const lockedUntil =
        fails >= MAX_FAILS
          ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000).toISOString()
          : null;
      await admin.from('jackpot_pin_attempts').upsert(
        { client_id: clientId, fail_count: fails, locked_until: lockedUntil, updated_at: now.toISOString() },
        { onConflict: 'client_id' },
      );
      const attemptsLeft = Math.max(0, MAX_FAILS - fails);
      return json(
        { error: fails >= MAX_FAILS ? `Locked for ${LOCK_MINUTES} minutes.` : 'Wrong PIN.', attempts_left: fails >= MAX_FAILS ? 0 : attemptsLeft },
        401,
      );
    }

    // ── PIN correct — clear attempts ───────────────────────────────────────
    await admin.from('jackpot_pin_attempts').delete().eq('client_id', clientId);

    // ── Find or auto-create the internal staff Auth user ───────────────────
    // Uses createUser (idempotent via duplicate handling) — avoids getUserByEmail
    // which may not be available in all SDK builds.
    const email = staffEmail(supabaseUrl);
    let staffUserId: string;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (created?.user?.id) {
      staffUserId = created.user.id;
    } else {
      // User already exists — find them via listUsers (small list, only our internal users)
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
      if (listErr) {
        console.error('listUsers error:', listErr.message);
        return json({ error: 'Could not prepare staff session' }, 500);
      }
      const found = list?.users?.find((u: { email?: string; id: string }) => u.email === email);
      if (!found?.id) {
        console.error('createUser failed and user not found in list; createErr:', createErr?.message);
        return json({ error: 'Could not create staff session' }, 500);
      }
      staffUserId = found.id;
    }

    // ── Ensure owner_roles row exists ──────────────────────────────────────
    const { error: roleErr } = await admin
      .from('owner_roles')
      .upsert({ email, user_id: staffUserId, role: 'staff' }, { onConflict: 'email' });
    if (roleErr) {
      console.error('owner_roles upsert error:', roleErr.message, roleErr.code);
      return json({ error: 'Could not assign staff role' }, 500);
    }

    // ── Issue session ──────────────────────────────────────────────────────
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('generateLink error:', linkErr?.message);
      return json({ error: 'Could not create session' }, 500);
    }

    const { data: sessionData, error: verifyErr } = await admin.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });
    if (verifyErr || !sessionData?.session) {
      console.error('verifyOtp error:', verifyErr?.message);
      return json({ error: 'Session error' }, 500);
    }

    return json({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    }, 200);
  } catch (e) {
    console.error('jackpot-pin unhandled exception:', e);
    return json({ error: 'Server error' }, 500);
  }
});
