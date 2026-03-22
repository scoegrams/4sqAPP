import type { SupabaseClient } from '@supabase/supabase-js';
import { FunctionsHttpError } from '@supabase/supabase-js';

const CLIENT_KEY = 'four_square_jackpot_client_id';

/** Stable ID for this browser tab session (clears when the tab/session ends). */
export function getJackpotClientId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let id = sessionStorage.getItem(CLIENT_KEY);
  if (!id || id.length < 8) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export type JackpotPinResult =
  | { ok: true; access_token: string; refresh_token: string }
  | { ok: false; message: string; attemptsLeft?: number; locked?: boolean };

export async function signInWithJackpotPin(
  supabase: SupabaseClient,
  pin: string,
  clientId: string,
): Promise<JackpotPinResult> {
  const { data, error } = await supabase.functions.invoke<{
    access_token?: string;
    refresh_token?: string;
    error?: string;
    attempts_left?: number;
    locked?: boolean;
  }>('jackpot-pin', {
    body: { pin: pin.trim(), client_id: clientId },
  });

  if (!error && data?.access_token && data?.refresh_token) {
    return { ok: true, access_token: data.access_token, refresh_token: data.refresh_token };
  }

  const httpErr =
    error instanceof FunctionsHttpError ? error : error?.name === 'FunctionsHttpError' ? (error as FunctionsHttpError) : null;
  if (httpErr?.context) {
    try {
      const body = await httpErr.context.json();
      return {
        ok: false,
        message: typeof body?.error === 'string' ? body.error : 'Could not sign in',
        attemptsLeft: typeof body?.attempts_left === 'number' ? body.attempts_left : undefined,
        locked: !!body?.locked,
      };
    } catch {
      /* ignore */
    }
  }

  return {
    ok: false,
    message: error?.message || 'Could not reach sign-in. Is the jackpot-pin function deployed?',
  };
}
