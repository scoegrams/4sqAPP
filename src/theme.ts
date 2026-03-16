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

const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  bg: 'bg-slate-950',
  text: 'text-white',
  textMuted: 'text-slate-400',
  border: 'border-slate-700',
  headerBg: 'bg-slate-900/95 backdrop-blur-md',
  headerBorder: 'border-slate-700',
  quadrantGreen: {
    bg: 'bg-emerald-950/50',
    border: 'border-emerald-700',
    accent: 'text-emerald-400',
    headerBg: 'bg-emerald-900/30',
  },
  quadrantBlue: {
    bg: 'bg-blue-950/50',
    border: 'border-blue-700',
    accent: 'text-blue-400',
    headerBg: 'bg-blue-900/30',
  },
  navUnderline: 'border-slate-700 bg-slate-900/80',
  navActive: 'text-emerald-400 border-emerald-400',
  navInactive: 'text-slate-400 border-transparent',
  navInactiveHover: 'hover:text-white hover:border-slate-500',
  cardBg: 'bg-slate-800/60',
  footerBg: 'bg-slate-900/95 backdrop-blur-md',
  footerBorder: 'border-slate-700',
  inputBg: 'bg-slate-800',
  inputBorder: 'border-slate-600',
};

const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  bg: 'bg-stone-100',
  text: 'text-slate-900',
  textMuted: 'text-slate-500',
  border: 'border-slate-300',
  headerBg: 'bg-white/95 backdrop-blur-md',
  headerBorder: 'border-slate-300',
  quadrantGreen: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-600',
    accent: 'text-emerald-700',
    headerBg: 'bg-emerald-100/60',
  },
  quadrantBlue: {
    bg: 'bg-blue-50',
    border: 'border-blue-600',
    accent: 'text-blue-700',
    headerBg: 'bg-blue-100/60',
  },
  navUnderline: 'border-slate-200 bg-white/80',
  navActive: 'text-emerald-700 border-emerald-600',
  navInactive: 'text-slate-500 border-transparent',
  navInactiveHover: 'hover:text-slate-900 hover:border-slate-400',
  cardBg: 'bg-white',
  footerBg: 'bg-white/95 backdrop-blur-md',
  footerBorder: 'border-slate-300',
  inputBg: 'bg-white',
  inputBorder: 'border-slate-300',
};

const modernTheme: Theme = {
  mode: 'modern',
  isDark: false,
  bg: 'bg-[#f2f2f2]',
  text: 'text-[#1a1a2e]',
  textMuted: 'text-[#52616b]',
  border: 'border-[#c8d8e4]',
  headerBg: 'bg-[#f2f2f2]/95 backdrop-blur-md',
  headerBorder: 'border-[#c8d8e4]',
  quadrantGreen: {
    bg: 'bg-[#e8f5e9]',
    border: 'border-[#2b6777]',
    accent: 'text-[#2b6777]',
    headerBg: 'bg-[#d4e9e2]',
  },
  quadrantBlue: {
    bg: 'bg-[#e3f2fd]',
    border: 'border-[#2b6777]',
    accent: 'text-[#2b6777]',
    headerBg: 'bg-[#d4e9e2]',
  },
  navUnderline: 'border-[#c8d8e4] bg-[#f2f2f2]/80',
  navActive: 'text-[#2b6777] border-[#2b6777]',
  navInactive: 'text-[#52616b] border-transparent',
  navInactiveHover: 'hover:text-[#1a1a2e] hover:border-[#52616b]',
  cardBg: 'bg-white',
  footerBg: 'bg-[#f2f2f2]/95 backdrop-blur-md',
  footerBorder: 'border-[#c8d8e4]',
  inputBg: 'bg-white',
  inputBorder: 'border-[#c8d8e4]',
};

// Apple-inspired: ultra-clean titanium/aluminum, SF palette, precise blue accents
const appleTheme: Theme = {
  mode: 'apple',
  isDark: false,
  bg: 'bg-[#f5f5f7]',
  text: 'text-[#1d1d1f]',
  textMuted: 'text-[#6e6e73]',
  border: 'border-[#d2d2d7]',
  headerBg: 'bg-[#1d1d1f]/95 backdrop-blur-xl',
  headerBorder: 'border-[#3a3a3c]',
  quadrantGreen: {
    bg: 'bg-white',
    border: 'border-[#d2d2d7]',
    accent: 'text-[#34c759]',
    headerBg: 'bg-[#f5f5f7]',
  },
  quadrantBlue: {
    bg: 'bg-white',
    border: 'border-[#d2d2d7]',
    accent: 'text-[#0071e3]',
    headerBg: 'bg-[#f5f5f7]',
  },
  navUnderline: 'border-[#3a3a3c] bg-[#1d1d1f]/90',
  navActive: 'text-white border-white',
  navInactive: 'text-[#aeaeb2] border-transparent',
  navInactiveHover: 'hover:text-white hover:border-white/40',
  cardBg: 'bg-white',
  footerBg: 'bg-[#f5f5f7]/95 backdrop-blur-xl',
  footerBorder: 'border-[#d2d2d7]',
  inputBg: 'bg-white',
  inputBorder: 'border-[#d2d2d7]',
};

export const THEMES: Record<ThemeMode, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  modern: modernTheme,
  apple: appleTheme,
};
