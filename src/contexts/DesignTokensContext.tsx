import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ThemeMode } from '../theme/types';
import type { DesignTokens, DesignTokenKey } from '../theme/designTokenTypes';
import { THEME_STUDIO_ENABLED_KEY } from '../theme/designTokenTypes';
import { PRESET_TOKENS } from '../theme/presets';
import {
  applyDesignTokens,
  mergeTokens,
  loadOverrides,
  saveOverrides,
} from '../theme/tokenApply';
import { hasSupabase, supabase } from '../lib/supabase';
import {
  fetchSiteTheme,
  upsertSiteTheme,
  sanitizeOverrides,
  parseThemeMode,
} from '../lib/siteThemeApi';
import { useOwnerRole } from '../hooks/useOwnerRole';

export type CloudSyncStatus = 'idle' | 'loading' | 'saving' | 'synced' | 'error' | 'offline';

interface DesignTokensContextValue {
  studioEnabled: boolean;
  setStudioEnabled: (v: boolean) => void;
  themeMode: ThemeMode;
  overrides: Partial<DesignTokens>;
  setToken: (key: DesignTokenKey, value: string) => void;
  setTokens: (patch: Partial<DesignTokens>) => void;
  clearOverrides: () => void;
  resetToken: (key: DesignTokenKey) => void;
  effectiveTokens: DesignTokens;
  /** Loaded initial row from Supabase (or skipped if no DB) */
  remoteHydrated: boolean;
  cloudSyncStatus: CloudSyncStatus;
  cloudSyncMessage: string | null;
  lastCloudSavedAt: Date | null;
  /** Owners push theme to DB; others read-only */
  isOwner: boolean;
}

const DesignTokensContext = createContext<DesignTokensContextValue | null>(null);

export function DesignTokensProvider({
  themeMode,
  setThemeMode,
  children,
}: {
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  children: React.ReactNode;
}) {
  const isOwner = useOwnerRole();

  const [studioEnabled, setStudioEnabledState] = useState(() => {
    try {
      return localStorage.getItem(THEME_STUDIO_ENABLED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [overrides, setOverridesState] = useState<Partial<DesignTokens>>(() => loadOverrides());
  const [remoteHydrated, setRemoteHydrated] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null);
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<Date | null>(null);

  const effectiveTokens = useMemo(() => {
    const base = PRESET_TOKENS[themeMode];
    if (!studioEnabled) return base;
    return mergeTokens(base, overrides);
  }, [themeMode, studioEnabled, overrides]);

  useEffect(() => {
    applyDesignTokens(effectiveTokens);
  }, [effectiveTokens]);

  /* Hydrate from Supabase (public read) — wins over localStorage when a row exists */
  useEffect(() => {
    let alive = true;
    setCloudSyncStatus(hasSupabase() ? 'loading' : 'offline');

    (async () => {
      if (!hasSupabase() || !supabase) {
        if (alive) {
          setRemoteHydrated(true);
          setCloudSyncStatus('offline');
        }
        return;
      }

      const row = await fetchSiteTheme();
      if (!alive) return;

      if (row) {
        setThemeMode(parseThemeMode(row.active_theme_mode));
        setStudioEnabledState(row.studio_enabled);
        const clean = sanitizeOverrides(row.token_overrides);
        setOverridesState(clean);
        saveOverrides(clean);
        try {
          localStorage.setItem(THEME_STUDIO_ENABLED_KEY, row.studio_enabled ? '1' : '0');
        } catch {
          /* ignore */
        }
        setCloudSyncStatus('idle');
        setLastCloudSavedAt(row.updated_at ? new Date(row.updated_at) : null);
      } else {
        setCloudSyncStatus('idle');
      }

      setRemoteHydrated(true);
    })();

    return () => {
      alive = false;
    };
  }, [setThemeMode]);

  const overridesJson = useMemo(() => JSON.stringify(overrides), [overrides]);

  /* Owners: debounced save to site_theme */
  useEffect(() => {
    if (!remoteHydrated || !isOwner || !hasSupabase()) return;

    setCloudSyncStatus('saving');
    setCloudSyncMessage(null);

    const t = setTimeout(() => {
      void (async () => {
        const { error } = await upsertSiteTheme({
          active_theme_mode: themeMode,
          studio_enabled: studioEnabled,
          token_overrides: overrides,
        });
        if (error) {
          setCloudSyncStatus('error');
          setCloudSyncMessage(error.message);
        } else {
          setCloudSyncStatus('synced');
          setCloudSyncMessage(null);
          setLastCloudSavedAt(new Date());
        }
      })();
    }, 900);

    return () => clearTimeout(t);
  }, [remoteHydrated, isOwner, themeMode, studioEnabled, overridesJson, overrides]);

  const setStudioEnabled = useCallback((v: boolean) => {
    setStudioEnabledState(v);
    try {
      localStorage.setItem(THEME_STUDIO_ENABLED_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setToken = useCallback((key: DesignTokenKey, value: string) => {
    setOverridesState((prev) => {
      const next = { ...prev, [key]: value };
      saveOverrides(next);
      return next;
    });
  }, []);

  const setTokens = useCallback((patch: Partial<DesignTokens>) => {
    setOverridesState((prev) => {
      const next = { ...prev, ...patch };
      saveOverrides(next);
      return next;
    });
  }, []);

  const clearOverrides = useCallback(() => {
    saveOverrides({});
    setOverridesState({});
  }, []);

  const resetToken = useCallback((key: DesignTokenKey) => {
    setOverridesState((prev) => {
      const next = { ...prev };
      delete next[key];
      saveOverrides(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      studioEnabled,
      setStudioEnabled,
      themeMode,
      overrides,
      setToken,
      setTokens,
      clearOverrides,
      resetToken,
      effectiveTokens,
      remoteHydrated,
      cloudSyncStatus,
      cloudSyncMessage,
      lastCloudSavedAt,
      isOwner,
    }),
    [
      studioEnabled,
      setStudioEnabled,
      themeMode,
      overrides,
      setToken,
      setTokens,
      clearOverrides,
      resetToken,
      effectiveTokens,
      remoteHydrated,
      cloudSyncStatus,
      cloudSyncMessage,
      lastCloudSavedAt,
      isOwner,
    ],
  );

  return <DesignTokensContext.Provider value={value}>{children}</DesignTokensContext.Provider>;
}

export function useDesignTokens() {
  const ctx = useContext(DesignTokensContext);
  if (!ctx) throw new Error('useDesignTokens must be used within DesignTokensProvider');
  return ctx;
}
