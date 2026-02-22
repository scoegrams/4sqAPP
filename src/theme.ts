export type ThemeMode = 'dark' | 'light' | 'modern' | 'mbta';

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

const mbtaTheme: Theme = {
  mode: 'mbta',
  isDark: true,
  bg: 'bg-[#231F20]',
  text: 'text-white',
  textMuted: 'text-white/60',
  border: 'border-white/20',
  headerBg: 'bg-[#DA291C]',
  headerBorder: 'border-[#b02218]',
  quadrantGreen: {
    bg: 'bg-[#00843D]/20',
    border: 'border-[#00843D]',
    accent: 'text-[#00843D]',
    headerBg: 'bg-[#00843D]/15',
  },
  quadrantBlue: {
    bg: 'bg-[#003DA5]/20',
    border: 'border-[#003DA5]',
    accent: 'text-[#60a5fa]',
    headerBg: 'bg-[#003DA5]/15',
  },
  navUnderline: 'border-[#b02218] bg-[#DA291C]/90',
  navActive: 'text-white border-white',
  navInactive: 'text-white/70 border-transparent',
  navInactiveHover: 'hover:text-white hover:border-white/50',
  cardBg: 'bg-[#2d2829]',
  footerBg: 'bg-[#231F20]/95 backdrop-blur-md',
  footerBorder: 'border-white/20',
  inputBg: 'bg-[#2d2829]',
  inputBorder: 'border-white/20',
};

export const THEMES: Record<ThemeMode, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  modern: modernTheme,
  mbta: mbtaTheme,
};
