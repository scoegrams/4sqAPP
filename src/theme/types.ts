export type ThemeMode = 'dark' | 'light' | 'modern' | 'apple';

export interface QuadrantTheme {
  bg: string;
  border: string;
  accent: string;
  headerBg: string;
}

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  /** Header / chrome uses light foreground (wordmark, nav on dark bar) */
  chromeLightFg: boolean;
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  headerBg: string;
  headerBorder: string;
  quadrantGreen: QuadrantTheme;
  quadrantBlue: QuadrantTheme;
  navUnderline: string;
  navActive: string;
  navInactive: string;
  navInactiveHover: string;
  cardBg: string;
  footerBg: string;
  footerBorder: string;
  inputBg: string;
  inputBorder: string;
}
