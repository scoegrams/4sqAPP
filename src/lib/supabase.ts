import { createClient } from '@supabase/supabase-js';

/** Set at build time — see vite.config.ts (supports VITE_* or SUPABASE_* / NEXT_PUBLIC_* on Vercel). */
const url = __FOURSQ_SUPABASE_URL__.trim();
const anonKey = __FOURSQ_SUPABASE_ANON_KEY__.trim();

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const hasSupabase = () => !!supabase;
