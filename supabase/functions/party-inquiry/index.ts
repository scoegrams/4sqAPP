/**
 * Public party / event inquiry form → validate, rate-limit, insert row.
 *
 * Auto-provided: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';

const MAX_SUBMITS_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

type InquiryType = 'catering' | 'venue' | 'table';

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function cleanText(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen);
}

function parseInquiryType(v: unknown): InquiryType | null {
  return v === 'catering' || v === 'venue' || v === 'table' ? v : null;
}

function parseDate(v: unknown): string | null {
  const s = cleanText(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return null;
  return s;
}

function parseTime(v: unknown): string | null {
  const s = cleanText(v, 5);
  return /^\d{2}:\d{2}$/.test(s) ? s : null;
}

function parseHeadCount(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n) || n < 1 || n > 500) return null;
  return n;
}

function validEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function validPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request' }, 400);
    }

    // Honeypot — bots get a fake success
    if (cleanText(body.website, 200)) {
      return json({ ok: true }, 200);
    }

    const clientId = cleanText(body.client_id, 64);
    if (clientId.length < 8) {
      return json({ error: 'Invalid request' }, 400);
    }

    const inquiryType = parseInquiryType(body.inquiry_type);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 32);
    const eventDate = parseDate(body.event_date);
    const eventTime = parseTime(body.event_time);
    const headCount = parseHeadCount(body.head_count);
    const details = cleanText(body.details, 2000);

    if (!inquiryType || !name || !validEmail(email) || !validPhone(phone)) {
      return json({ error: 'Please check your name, email, and phone.' }, 400);
    }

    if (inquiryType === 'catering') {
      if (!eventDate || !headCount || !details) {
        return json({ error: 'Catering requests need a date, head count, and menu notes.' }, 400);
      }
    }

    if (inquiryType === 'venue') {
      if (!eventDate) {
        return json({ error: 'Please pick an event date.' }, 400);
      }
    }

    if (inquiryType === 'table') {
      if (!eventDate || !eventTime || !headCount) {
        return json({ error: 'Table reservations need a date, time, and party size.' }, 400);
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      console.error('party-inquiry: missing SUPABASE_URL or SERVICE_ROLE_KEY');
      return json({ error: 'Server not configured' }, 503);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date();

    const { data: bucket } = await admin
      .from('party_inquiry_attempts')
      .select('submit_count, window_start')
      .eq('client_id', clientId)
      .maybeSingle();

    if (bucket) {
      const windowStart = new Date(bucket.window_start);
      const inWindow = now.getTime() - windowStart.getTime() < WINDOW_MS;
      const count = inWindow ? bucket.submit_count : 0;
      if (inWindow && count >= MAX_SUBMITS_PER_HOUR) {
        return json({ error: 'Too many requests. Please call 781-848-4448.' }, 429);
      }
      await admin.from('party_inquiry_attempts').upsert({
        client_id: clientId,
        submit_count: inWindow ? count + 1 : 1,
        window_start: inWindow ? bucket.window_start : now.toISOString(),
      });
    } else {
      await admin.from('party_inquiry_attempts').insert({
        client_id: clientId,
        submit_count: 1,
        window_start: now.toISOString(),
      });
    }

    const { error: insertErr } = await admin.from('party_inquiries').insert({
      inquiry_type: inquiryType,
      name,
      email,
      phone,
      event_date: eventDate,
      event_time: eventTime,
      head_count: headCount,
      details: details || null,
    });

    if (insertErr) {
      console.error('party-inquiry insert:', insertErr.message);
      return json({ error: 'Could not save your request. Please call 781-848-4448.' }, 500);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('party-inquiry unhandled:', err);
    return json({ error: 'Something went wrong. Please try again or call 781-848-4448.' }, 500);
  }
});
