import type { DesignTokens, DesignTokenKey } from './designTokenTypes';
import { CSS_VAR_MAP, THEME_OVERRIDES_KEY } from './designTokenTypes';

export function applyDesignTokens(tokens: DesignTokens): void {
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as DesignTokenKey[]).forEach((key) => {
    const name = CSS_VAR_MAP[key];
    const val = tokens[key];
    if (name && val !== undefined) root.style.setProperty(name, val);
  });
}

export function mergeTokens(base: DesignTokens, partial: Partial<DesignTokens>): DesignTokens {
  return { ...base, ...partial };
}

export function loadOverrides(): Partial<DesignTokens> {
  try {
    const raw = localStorage.getItem(THEME_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<DesignTokens>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: Partial<DesignTokens>): void {
  try {
    if (Object.keys(overrides).length === 0) {
      localStorage.removeItem(THEME_OVERRIDES_KEY);
      return;
    }
    localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}
