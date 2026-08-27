import type { ChalkboardData } from '../types';

export const DEFAULT_CHALKBOARD_BG = '#2b2b2b';
export const DEFAULT_CHALK_ACCENT = '#9ED3C7';

export const CHALK_PALETTE = [
  { label: 'Mint', value: '#9ED3C7' },
  { label: 'White', value: '#f5f5f5' },
  { label: 'Yellow', value: '#f5e6a3' },
  { label: 'Pink', value: '#f4a8b8' },
  { label: 'Blue', value: '#8ecae6' },
  { label: 'Orange', value: '#f4a261' },
] as const;

export const BOARD_BG_PALETTE = [
  { label: 'Chalkboard', value: '#2b2b2b' },
  { label: 'Slate', value: '#1e293b' },
  { label: 'Forest', value: '#1a2e1a' },
  { label: 'Cream', value: '#f4f1ea' },
  { label: 'White', value: '#ffffff' },
  { label: 'Navy', value: '#0f172a' },
] as const;

export type ChalkboardMetaField =
  | 'title'
  | 'price'
  | 'subtitle'
  | 'accentColor'
  | 'backgroundColor'
  | 'invertText';

export type ChalkboardTheme = {
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  frame: string;
  invert: boolean;
};

export function resolveChalkboardTheme(
  meta: Pick<ChalkboardData, 'accentColor' | 'backgroundColor' | 'invertText'>,
): ChalkboardTheme {
  const accent = meta.accentColor ?? DEFAULT_CHALK_ACCENT;
  const bg = meta.backgroundColor ?? DEFAULT_CHALKBOARD_BG;
  const invert = meta.invertText ?? false;

  if (invert) {
    return {
      bg,
      primary: '#141414',
      secondary: '#525252',
      accent,
      frame: '#14141422',
      invert: true,
    };
  }

  return {
    bg,
    primary: '#f5f5f5',
    secondary: '#d8d8d8',
    accent,
    frame: '#d8d8d833',
    invert: false,
  };
}
