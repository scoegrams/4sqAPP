/**
 * Staff Jackpot login: verify PIN (hashed in DB) → return real Supabase session
 * for JACKPOT_STAFF_USER_EMAIL (must exist in auth.users + owner_roles).
 *
 * Secrets (Dashboard → Edge Functions → jackpot-pin):
 *   JACKPOT_STAFF_USER_EMAIL  — e.g. jackpot-staff@yourdomain.com
 *
 * Auto-provided: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FAILS = 3;
const LOCK_MINUTES = 30;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
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
    const staffEmail = Deno.env.get('JACKPOT_STAFF_USER_EMAIL')?.trim();

    if (!supabaseUrl || !serviceKey || !staffEmail) {
      console.error('jackpot-pin: missing SUPABASE_URL, SERVICE_ROLE_KEY, or JACKPOT_STAFF_USER_EMAIL');
      return json({ error: 'Server not configured' }, 503);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date();

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

    const { data: ok, error: rpcErr } = await admin.rpc('check_jackpot_pin', { p_pin: pin });

    if (rpcErr) {
      console.error('check_jackpot_pin', rpcErr);
      return json({ error: 'Could not verify PIN' }, 500);
    }

    if (!ok) {
      const fails = (row?.fail_count ?? 0) + 1;
      const lockedUntil =
        fails >= MAX_FAILS
          ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000).toISOString()
          : null;

      await admin.from('jackpot_pin_attempts').upsert(
        {
          client_id: clientId,
          fail_count: fails,
          locked_until: lockedUntil,
          updated_at: now.toISOString(),
        },
        { onConflict: 'client_id' },
      );

      const attemptsLeft = Math.max(0, MAX_FAILS - fails);
      return json(
        {
          error: fails >= MAX_FAILS ? `Locked for ${LOCK_MINUTES} minutes.` : 'Wrong PIN.',
          attempts_left: fails >= MAX_FAILS ? 0 : attemptsLeft,
        },
        401,
      );
    }

    await admin.from('jackpot_pin_attempts').delete().eq('client_id', clientId);

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: staffEmail,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('generateLink', linkErr);
      return json({ error: 'Could not create session' }, 500);
    }

    const { data: sessionData, error: verifyErr } = await admin.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });

    if (verifyErr || !sessionData?.session) {
      console.error('verifyOtp', verifyErr);
      return json({ error: 'Session error' }, 500);
    }

    return json({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Server error' }, 500);
  }
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
