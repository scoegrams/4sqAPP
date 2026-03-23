import React from 'react';
import { RotateCcw, Cloud, CloudOff, Loader2, Check, AlertTriangle } from 'lucide-react';
import type { ThemeMode } from '../theme';
import type { DesignTokens } from '../theme/designTokenTypes';
import { useDesignTokens, type CloudSyncStatus } from '../contexts/DesignTokensContext';

// ── Color math helpers ────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return '#' + [hh + 1 / 3, hh, hh - 1 / 3]
    .map(t => Math.round(hue2rgb(p, q, t) * 255).toString(16).padStart(2, '0'))
    .join('');
}

/** Given one accent hex, generate a full coordinated token patch. */
function buildAccentTokens(hex: string): Partial<DesignTokens> {
  const [h, s, l] = hexToHsl(hex);
  const dark = hslToHex(h, Math.min(s + 5, 100), Math.max(l - 18, 10));
  const bg = hslToHex(h, Math.max(s - 35, 8), 96);
  const bgHeader = hslToHex(h, Math.max(s - 25, 12), 91);
  return {
    navActiveText: hex, navActiveBorder: hex,
    navInactiveHoverBorder: hex,
    quadrantGreenAccent: dark, quadrantGreenBorder: hex, quadrantGreenBg: bg, quadrantGreenHeaderBg: bgHeader,
    quadrantBlueAccent: dark, quadrantBlueBorder: hex, quadrantBlueBg: bg, quadrantBlueHeaderBg: bgHeader,
    footerScheduleBg: dark, footerScheduleBorder: hex, footerScheduleHoverBg: hex,
    footerPriceAccent: dark, trainSignAccent: hex,
    logoSq0: hex, logoSq1: dark, logoSq2: dark, logoSq3: hex, logoSqPop: hex,
  };
}

// ── Save status banner ────────────────────────────────────────────────────────

const SaveStatus: React.FC<{
  status: CloudSyncStatus;
  message: string | null;
  savedAt: Date | null;
  remoteHydrated: boolean;
  isOwner: boolean;
}> = ({ status, message, savedAt, remoteHydrated, isOwner }) => {
  if (!remoteHydrated) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-[#5c564d] bg-[#f9f6f1] border border-[#c4beb5] px-3 py-2 rounded">
        <Loader2 size={13} className="animate-spin shrink-0" /> Loading…
      </div>
    );
  }
  if (status === 'offline') {
    return (
      <div className="flex items-center gap-2 text-[11px] text-[#5c564d] bg-stone-100 border border-[#c4beb5] px-3 py-2 rounded">
        <CloudOff size={13} className="shrink-0" /> No database — changes saved to this browser only.
      </div>
    );
  }
  if (!isOwner) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-[#5c564d] bg-[#f9f6f1] border border-[#c4beb5] px-3 py-2 rounded">
        <Cloud size={13} className="shrink-0" /> Sign in as staff to publish changes for all visitors.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[11px] bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
      {status === 'saving' && <><Loader2 size={13} className="animate-spin shrink-0 text-amber-600" /><span className="text-amber-700 font-semibold">Saving for all visitors…</span></>}
      {status === 'synced' && savedAt && <><Check size={13} className="text-emerald-600 shrink-0" /><span className="text-emerald-700 font-semibold">Saved for everyone — {savedAt.toLocaleTimeString()}</span></>}
      {status === 'error' && <><AlertTriangle size={13} className="text-red-500 shrink-0" /><span className="text-red-600 font-semibold">Save failed: {message || 'unknown error'}</span></>}
      {status === 'idle' && <><Cloud size={13} className="text-emerald-600 shrink-0" /><span className="text-emerald-700 font-semibold">Changes publish live for all visitors</span></>}
    </div>
  );
};

// ── A single labeled color control ───────────────────────────────────────────

const ColorRow: React.FC<{
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, hint, value, onChange }) => {
  const isHex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
  return (
    <div className="flex items-center gap-3">
      <label className="w-36 shrink-0">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d]">{label}</span>
        {hint && <span className="block text-[10px] text-[#8a8580] mt-0.5 leading-tight">{hint}</span>}
      </label>
      <div className="flex items-center gap-2 flex-1">
        {isHex && (
          <input
            type="color"
            value={value.slice(0, 7)}
            onChange={e => onChange(e.target.value)}
            className="h-9 w-10 border-2 border-[#c4beb5] cursor-pointer p-0.5 bg-white shrink-0"
          />
        )}
        <div
          className="h-9 flex-1 border-2 border-[#c4beb5] flex items-center px-2 text-xs font-mono text-[#2d3d2d] gap-2 cursor-pointer select-none"
          style={{ backgroundColor: isHex ? value : '#f5f5f4' }}
          onClick={() => {
            const el = document.querySelector<HTMLInputElement>(`[data-color-picker="${label}"]`);
            el?.click();
          }}
        >
          <input
            data-color-picker={label}
            type="color"
            value={value.slice(0, 7)}
            onChange={e => onChange(e.target.value)}
            className="sr-only"
          />
          <span style={{ color: isHex ? (isDark(value) ? '#fff' : '#111') : '#5c564d' }}>
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// ── Main component ────────────────────────────────────────────────────────────

const ThemeStudioPanel: React.FC<{ onRequestTheme?: (mode: ThemeMode) => void }> = ({ onRequestTheme }) => {
  const {
    setTokens, clearOverrides, setStudioEnabled,
    effectiveTokens, themeMode,
    remoteHydrated, cloudSyncStatus, cloudSyncMessage, lastCloudSavedAt, isOwner,
  } = useDesignTokens();

  const handleReset = () => {
    clearOverrides();
    setStudioEnabled(false);
    onRequestTheme?.('light');
  };

  const handleAccentChange = (hex: string) => {
    setStudioEnabled(true);
    setTokens(buildAccentTokens(hex));
  };

  const handleSingleToken = (key: keyof DesignTokens, hex: string) => {
    setStudioEnabled(true);
    setTokens({ [key]: hex });
  };

  const accent = effectiveTokens.navActiveText;
  const pageBg = effectiveTokens.pageBg;
  const headerBg = effectiveTokens.headerBg;
  const cardBg = effectiveTokens.cardBg;

  // Parse slider values from token strings
  const fontSizePx = Math.round(parseFloat(effectiveTokens.menuItemFontSize) * 16);
  const paddingYPx = Math.round(parseFloat(effectiveTokens.menuItemPaddingY) * 16);
  const radiusPx = parseInt(effectiveTokens.borderRadius) || 0;
  const blurPx = parseInt(effectiveTokens.navBlur) || 0;

  return (
    <div className="space-y-5">

      {/* Save status */}
      <SaveStatus
        status={cloudSyncStatus}
        message={cloudSyncMessage}
        savedAt={lastCloudSavedAt}
        remoteHydrated={remoteHydrated}
        isOwner={isOwner}
      />

      {/* Reset */}
      <div className="flex items-center justify-between gap-3 p-3 bg-[#fef2f2] border-2 border-red-200">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-800">Reset everything to default</p>
          <p className="text-[10px] text-red-600 mt-0.5">Removes all customizations and switches back to the Light preset.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-red-300 text-red-700 hover:bg-red-50 transition-colors shrink-0"
        >
          <RotateCcw size={14} /> Reset all
        </button>
      </div>

      {/* Color controls */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c564d]">
          Colors — apply live for all visitors
        </p>

        <div className="space-y-3 p-4 bg-white border-2 border-[#c4beb5]">
          <ColorRow
            label="Accent / Primary"
            hint="Nav, borders, prices, logo"
            value={accent}
            onChange={handleAccentChange}
          />
          <div className="border-t border-[#e7e5e4]" />
          <ColorRow
            label="Page background"
            hint="Main canvas color"
            value={pageBg}
            onChange={hex => handleSingleToken('pageBg', hex)}
          />
          <ColorRow
            label="Header"
            hint="Top bar background"
            value={headerBg.startsWith('#') ? headerBg : '#ffffff'}
            onChange={hex => {
              handleSingleToken('headerBg', hex);
              handleSingleToken('navStripBg', hex);
              handleSingleToken('headerWordmark', isDark(hex) ? '#ffffff' : '#0f172a');
              handleSingleToken('headerMenuBtnIcon', isDark(hex) ? '#ffffff' : '#0f172a');
              handleSingleToken('headerTagline', isDark(hex) ? '#ffffffaa' : '#64748b');
            }}
          />
          <ColorRow
            label="Cards / Sections"
            hint="Menu quadrant backgrounds"
            value={cardBg.startsWith('#') ? cardBg : '#ffffff'}
            onChange={hex => {
              handleSingleToken('cardBg', hex);
            }}
          />
        </div>
      </div>

      {/* Menu layout sliders */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c564d]">
          Menu layout
        </p>

        <div className="space-y-4 p-4 bg-white border-2 border-[#c4beb5]">
          {/* Font size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d]">
                Item font size
              </label>
              <span className="text-[11px] font-mono font-bold text-[#2d3d2d] bg-[#f5f5f4] px-2 py-0.5 border border-[#c4beb5]">
                {fontSizePx}px
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={22}
              step={1}
              value={fontSizePx}
              onChange={e => {
                setStudioEnabled(true);
                setTokens({ menuItemFontSize: `${parseInt(e.target.value) / 16}rem` });
              }}
              className="w-full accent-[#2d3d2d] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#8a8580] mt-1">
              <span>Small (10)</span>
              <span>Default (14)</span>
              <span>Large (22)</span>
            </div>
          </div>

          <div className="border-t border-[#e7e5e4]" />

          {/* Row padding */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d]">
                Row padding
              </label>
              <span className="text-[11px] font-mono font-bold text-[#2d3d2d] bg-[#f5f5f4] px-2 py-0.5 border border-[#c4beb5]">
                {paddingYPx}px
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              step={1}
              value={paddingYPx}
              onChange={e => {
                setStudioEnabled(true);
                setTokens({ menuItemPaddingY: `${parseInt(e.target.value) / 16}rem` });
              }}
              className="w-full accent-[#2d3d2d] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#8a8580] mt-1">
              <span>Tight (2)</span>
              <span>Default (6)</span>
              <span>Airy (16)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Style & shape */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c564d]">
          Style &amp; shape
        </p>

        <div className="space-y-5 p-4 bg-white border-2 border-[#c4beb5]">

          {/* Corner radius */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d]">
                Corner radius
              </label>
              <span className="text-[11px] font-mono font-bold text-[#2d3d2d] bg-[#f5f5f4] px-2 py-0.5 border border-[#c4beb5]">
                {radiusPx}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={radiusPx}
              onChange={e => {
                setStudioEnabled(true);
                setTokens({ borderRadius: `${e.target.value}px` });
              }}
              className="w-full accent-[#2d3d2d] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#8a8580] mt-1">
              <span>Sharp (0)</span>
              <span>Soft (8)</span>
              <span>Round (20)</span>
            </div>
            {/* Live preview */}
            <div className="flex gap-2 mt-2.5">
              {[0, 6, 12, 20].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setStudioEnabled(true); setTokens({ borderRadius: `${r}px` }); }}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider border-2 transition-all ${radiusPx === r ? 'border-[#2d3d2d] bg-[#2d3d2d] text-white' : 'border-[#c4beb5] text-[#5c564d] hover:border-[#2d3d2d]'}`}
                  style={{ borderRadius: `${r}px` }}
                >
                  {r === 0 ? 'Sharp' : r === 6 ? 'Soft' : r === 12 ? 'Rounded' : 'Pill'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e7e5e4]" />

          {/* Card shadow */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d] mb-2">
              Card shadow
            </label>
            <div className="flex gap-2">
              {[
                { label: 'None',   value: 'none' },
                { label: 'Subtle', value: '0 1px 4px rgba(0,0,0,0.10)' },
                { label: 'Medium', value: '0 4px 16px rgba(0,0,0,0.14)' },
                { label: 'Deep',   value: '0 8px 32px rgba(0,0,0,0.20)' },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setStudioEnabled(true); setTokens({ cardShadow: value }); }}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider border-2 transition-colors ${effectiveTokens.cardShadow === value ? 'border-[#2d3d2d] bg-[#2d3d2d] text-white' : 'border-[#c4beb5] text-[#5c564d] hover:border-[#2d3d2d]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e7e5e4]" />

          {/* Glass header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2d3d2d]">
                  Frosted glass header
                </label>
                <span className="text-[10px] text-[#8a8580]">Adds a blur behind the nav bar</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#2d3d2d] bg-[#f5f5f4] px-2 py-0.5 border border-[#c4beb5]">
                {blurPx === 0 ? 'off' : `${blurPx}px`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              step={4}
              value={blurPx}
              onChange={e => {
                setStudioEnabled(true);
                setTokens({ navBlur: `${e.target.value}px` });
              }}
              className="w-full accent-[#2d3d2d] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#8a8580] mt-1">
              <span>Off</span>
              <span>Subtle</span>
              <span>Heavy</span>
            </div>
          </div>

        </div>
      </div>

      <p className="text-[10px] text-[#8a8580]">
        Current base: <strong className="text-[#2d3d2d]">{themeMode}</strong> — pick a preset from "App theme &amp; colors" above to start fresh, then tweak here.
      </p>
    </div>
  );
};

export default ThemeStudioPanel;
