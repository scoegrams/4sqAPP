import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '../lib/supabase';
import type { Profile } from '../types/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'rewards_opted_in'>>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Where the magic link should send the user. Uses the current browser URL so
 * production logins get production links (Supabase otherwise uses Dashboard Site URL).
 * Must match an entry under Authentication → URL Configuration → Redirect URLs.
 */
function getEmailMagicLinkRedirectUrl(): string {
  const fixed = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (fixed) return fixed;
  if (typeof window === 'undefined') return '';
  const { origin, pathname, hash } = window.location;
  return `${origin}${pathname || '/'}${hash || ''}`;
}

async function ensureProfile(userId: string, email?: string | null, phone?: string | null): Promise<Profile | null> {
  if (!supabase) return null;
  const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (existing) return existing as Profile;
  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert({ id: userId, display_name: email?.split('@')[0] || 'Player', email: email || null, phone: phone || null, rewards_opted_in: false })
    .select()
    .single();
  if (error) return null;
  return inserted as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (u: User) => {
    if (!supabase) return;
    let profileData = await ensureProfile(u.id, u.email ?? null, u.phone ?? null);
    if (!profileData) {
      const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
      profileData = data as Profile | null;
    }
    setProfile(profileData || null);
  }, []);

  useEffect(() => {
    if (!hasSupabase() || !supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithEmail = useCallback(async (email: string): Promise<{ error: string | null }> => {
    setError(null);
    if (!supabase) {
      setError('Social features not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
      return { error: 'Not configured' };
    }
    const emailRedirectTo = getEmailMagicLinkRedirectUrl();
    const { error: e } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });
    if (e) {
      setError(e.message);
      return { error: e.message };
    }
    return { error: null };
  }, []);

  const signInWithPhone = useCallback(async (phone: string): Promise<{ error: string | null }> => {
    setError(null);
    if (!supabase) {
      setError('Social features not configured.');
      return { error: 'Not configured' };
    }
    const normalized = phone.replace(/\D/g, '');
    const withPlus = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith('1') ? `+${normalized}` : `+${normalized}`;
    const { error: e } = await supabase.auth.signInWithOtp({ phone: withPlus });
    if (e) {
      setError(e.message);
      return { error: e.message };
    }
    return { error: null };
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Not configured' };
    const normalized = phone.replace(/\D/g, '');
    const withPlus = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith('1') ? `+${normalized}` : `+${normalized}`;
    const { data, error: e } = await supabase.auth.verifyOtp({
      phone: withPlus,
      token,
      type: 'sms',
    });
    if (e) {
      setError(e.message);
      return { error: e.message };
    }
    if (data?.user) await ensureProfile(data.user.id, null, withPlus);
    setError(null);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'display_name' | 'rewards_opted_in'>>) => {
    if (!supabase || !user) return;
    await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id);
    loadProfile(user);
  }, [user, loadProfile]);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    error,
    signInWithEmail,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
