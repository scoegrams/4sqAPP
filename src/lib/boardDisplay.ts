import type { BoardBackgroundFit, BoardBackgroundPosition, DisplayBoardConfig } from '../types';

export const DEFAULT_DISPLAY_BOARD: DisplayBoardConfig = {
  backgroundImageUrl: '',
  fallbackImageUrl: '',
  backgroundFit: 'cover',
  backgroundPosition: 'center',
  overlayStrength: 72,
  tagline: 'Restaurant & Bar · Wed–Sat',
  accentColor: '#34d399',
  highlightColor: '#fcd34d',
};

export const BOARD_COLOR_PRESETS = [
  { label: 'Forest', accent: '#34d399', highlight: '#fcd34d' },
  { label: 'Patriots', accent: '#002244', highlight: '#C60C30' },
  { label: 'Ocean', accent: '#38bdf8', highlight: '#fbbf24' },
  { label: 'Chalk', accent: '#9ED3C7', highlight: '#f5f5f5' },
  { label: 'Gold', accent: '#d97706', highlight: '#fef3c7' },
] as const;

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHex(value: string | undefined, fallback: string): string {
  const v = value?.trim() ?? '';
  if (!HEX_COLOR.test(v)) return fallback;
  if (v.length === 4) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
}

function clampOverlay(n: number | undefined): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return DEFAULT_DISPLAY_BOARD.overlayStrength;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function normalizeDisplayBoard(config?: Partial<DisplayBoardConfig>): DisplayBoardConfig {
  const fit: BoardBackgroundFit = config?.backgroundFit === 'contain' ? 'contain' : 'cover';
  const pos: BoardBackgroundPosition =
    config?.backgroundPosition === 'top' || config?.backgroundPosition === 'bottom'
      ? config.backgroundPosition
      : 'center';

  return {
    backgroundImageUrl: config?.backgroundImageUrl?.trim() ?? '',
    fallbackImageUrl: config?.fallbackImageUrl?.trim() ?? '',
    backgroundFit: fit,
    backgroundPosition: pos,
    overlayStrength: clampOverlay(config?.overlayStrength),
    tagline: config?.tagline?.trim() || DEFAULT_DISPLAY_BOARD.tagline,
    accentColor: normalizeHex(config?.accentColor, DEFAULT_DISPLAY_BOARD.accentColor),
    highlightColor: normalizeHex(config?.highlightColor, DEFAULT_DISPLAY_BOARD.highlightColor),
  };
}

/** Scrim over background photo — strength 0–100 */
export function boardOverlayCss(strength: number, tint = '#080c0a'): string {
  const t = clampOverlay(strength) / 100;
  const a = 0.35 + t * 0.58;
  const b = 0.2 + t * 0.45;
  const c = 0.12 + t * 0.35;
  return `
    linear-gradient(105deg, color-mix(in srgb, ${tint} ${Math.round(a * 100)}%, transparent) 0%, color-mix(in srgb, ${tint} ${Math.round(b * 100)}%, transparent) 45%, color-mix(in srgb, ${tint} ${Math.round(c * 100)}%, transparent) 100%),
    linear-gradient(to top, color-mix(in srgb, ${tint} ${Math.round((a + 0.08) * 100)}%, transparent) 0%, transparent 48%)
  `;
}

export function boardBackgroundPositionCss(pos: BoardBackgroundPosition): string {
  if (pos === 'top') return 'center top';
  if (pos === 'bottom') return 'center bottom';
  return 'center center';
}

export function resolveBoardBackgroundUrl(board: DisplayBoardConfig, siteFallback = '/4square.jpg'): string {
  return board.backgroundImageUrl || board.fallbackImageUrl || siteFallback;
}

export function getBoardDisplayUrl(): string {
  if (typeof window === 'undefined') return '#board';
  return `${window.location.origin}${window.location.pathname}#board`;
}

export function withAlpha(hex: string, alpha: number): string {
  const h = normalizeHex(hex, DEFAULT_DISPLAY_BOARD.accentColor).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
