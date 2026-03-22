import type { Theme, ThemeMode } from './types';

/**
 * All colors flow from CSS variables (`--fs-*`), set by presets + Theme Studio.
 * Only layout-related flags vary by mode.
 */
const FLAGS: Record<ThemeMode, { isDark: boolean; chromeLightFg: boolean }> = {
  dark: { isDark: true, chromeLightFg: true },
  light: { isDark: false, chromeLightFg: false },
  modern: { isDark: false, chromeLightFg: true },
  apple: { isDark: false, chromeLightFg: true },
};

export function getTheme(mode: ThemeMode): Theme {
  const { isDark, chromeLightFg } = FLAGS[mode];
  return {
    mode,
    isDark,
    chromeLightFg,
    bg: 'bg-[var(--fs-page-bg)]',
    text: 'text-[color:var(--fs-page-text)]',
    textMuted: 'text-[color:var(--fs-text-muted)]',
    border: 'border-[color:var(--fs-border)]',
    headerBg: 'bg-[color-mix(in_srgb,var(--fs-header-bg)_94%,transparent)] backdrop-blur-md',
    headerBorder: 'border-b-2 border-[color:var(--fs-header-border)]',
    quadrantGreen: {
      bg: 'bg-[var(--fs-quad-green-bg)]',
      border: 'border-2 border-[color:var(--fs-quad-green-border)]',
      accent: 'text-[color:var(--fs-quad-green-accent)]',
      headerBg: 'bg-[var(--fs-quad-green-header-bg)]',
    },
    quadrantBlue: {
      bg: 'bg-[var(--fs-quad-blue-bg)]',
      border: 'border-2 border-[color:var(--fs-quad-blue-border)]',
      accent: 'text-[color:var(--fs-quad-blue-accent)]',
      headerBg: 'bg-[var(--fs-quad-blue-header-bg)]',
    },
    navUnderline:
      'border-t-2 border-[color:var(--fs-nav-strip-border-top)] bg-[var(--fs-nav-strip-bg)]',
    navActive:
      'text-[color:var(--fs-nav-active-text)] border-b-2 border-[color:var(--fs-nav-active-border)]',
    navInactive: 'text-[color:var(--fs-nav-inactive-text)] border-b-2 border-transparent',
    navInactiveHover:
      'hover:text-[color:var(--fs-nav-inactive-hover-text)] hover:border-[color:var(--fs-nav-inactive-hover-border)]',
    cardBg: 'bg-[var(--fs-card-bg)]',
    footerBg: 'bg-[color-mix(in_srgb,var(--fs-footer-bg)_94%,transparent)] backdrop-blur-md',
    footerBorder: 'border-t-2 border-[color:var(--fs-footer-border)]',
    inputBg: 'bg-[var(--fs-input-bg)]',
    inputBorder: 'border-[color:var(--fs-input-border)]',
  };
}

/** Back-compat: same reference shape as before */
export const THEMES: Record<ThemeMode, Theme> = {
  light: getTheme('light'),
  dark: getTheme('dark'),
  modern: getTheme('modern'),
  apple: getTheme('apple'),
};
