import type { ThemeMode } from '../theme/types';
import type { DesignTokens, DesignTokenKey } from '../theme/designTokenTypes';
import { CSS_VAR_MAP } from '../theme/designTokenTypes';
import { supabase } from './supabase';

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'modern', 'apple'];

export function parseThemeMode(s: string | null | undefined): ThemeMode {
  if (s && THEME_MODES.includes(s as ThemeMode)) return s as ThemeMode;
  return 'light';
}

/** Keep only known token keys from JSON */
export function sanitizeOverrides(raw: unknown): Partial<DesignTokens> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const src = raw as Record<string, unknown>;
  const out: Partial<DesignTokens> = {};
  (Object.keys(CSS_VAR_MAP) as DesignTokenKey[]).forEach((key) => {
    const v = src[key];
    if (typeof v === 'string' && v.length < 200) out[key] = v;
  });
  return out;
}

export type SiteThemeRow = {
  id: string;
  active_theme_mode: string;
  studio_enabled: boolean;
  token_overrides: unknown;
  updated_at: string;
};

export async function fetchSiteTheme(): Promise<SiteThemeRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('site_theme').select('*').eq('id', 'global').maybeSingle();
  if (error) {
    console.warn('[site_theme] fetch failed', error.message);
    return null;
  }
  return data as SiteThemeRow | null;
}

export async function upsertSiteTheme(payload: {
  active_theme_mode: ThemeMode;
  studio_enabled: boolean;
  token_overrides: Partial<DesignTokens>;
}): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { error } = await supabase.from('site_theme').upsert(
    {
      id: 'global',
      active_theme_mode: payload.active_theme_mode,
      studio_enabled: payload.studio_enabled,
      token_overrides: payload.token_overrides,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
  return { error: error ? new Error(error.message) : null };
}
