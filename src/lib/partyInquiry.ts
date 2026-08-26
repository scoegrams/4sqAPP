import type { SupabaseClient } from '@supabase/supabase-js';
import { FunctionsHttpError } from '@supabase/supabase-js';

const CLIENT_KEY = 'four_square_party_client_id';

export type PartyInquiryType = 'catering' | 'venue' | 'table';

export interface PartyInquiryPayload {
  inquiry_type: PartyInquiryType;
  name: string;
  email: string;
  phone: string;
  event_date?: string;
  event_time?: string;
  head_count?: number;
  details?: string;
  /** Honeypot — leave empty */
  website?: string;
}

export function getPartyClientId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let id = sessionStorage.getItem(CLIENT_KEY);
  if (!id || id.length < 8) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export type PartyInquiryResult =
  | { ok: true }
  | { ok: false; message: string };

export async function submitPartyInquiry(
  supabase: SupabaseClient,
  payload: PartyInquiryPayload,
): Promise<PartyInquiryResult> {
  const clientId = getPartyClientId();
  if (!clientId) {
    return { ok: false, message: 'Could not submit from this browser.' };
  }

  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>('party-inquiry', {
    body: { ...payload, client_id: clientId, website: payload.website ?? '' },
  });

  if (!error && data?.ok) {
    return { ok: true };
  }

  const httpErr =
    error instanceof FunctionsHttpError ? error : error?.name === 'FunctionsHttpError' ? (error as FunctionsHttpError) : null;

  if (httpErr?.context) {
    try {
      const body = await httpErr.context.json();
      if (typeof body?.error === 'string') {
        return { ok: false, message: body.error };
      }
    } catch {
      /* ignore */
    }
  }

  if (error?.message?.includes('404') || error?.message?.toLowerCase().includes('not found')) {
    return {
      ok: false,
      message: 'Booking is not live yet — call 781-848-4448 and we’ll take care of you.',
    };
  }

  return {
    ok: false,
    message: error?.message || 'Could not send your request. Call 781-848-4448 if you need help.',
  };
}

export interface PartyInquiryRow {
  id: string;
  inquiry_type: PartyInquiryType;
  name: string;
  email: string;
  phone: string;
  event_date: string | null;
  event_time: string | null;
  head_count: number | null;
  details: string | null;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export async function fetchPartyInquiries(supabase: SupabaseClient, limit = 25): Promise<PartyInquiryRow[]> {
  const { data, error } = await supabase
    .from('party_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as PartyInquiryRow[]) ?? [];
}

export async function updatePartyInquiryStatus(
  supabase: SupabaseClient,
  id: string,
  status: PartyInquiryRow['status'],
): Promise<void> {
  const { error } = await supabase.from('party_inquiries').update({ status }).eq('id', id);
  if (error) throw error;
}
