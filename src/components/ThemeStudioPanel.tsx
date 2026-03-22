import React, { useCallback, useState } from 'react';
import { RotateCcw, Sparkles, ToggleLeft, ToggleRight, Download, Upload, Cloud, CloudOff, Loader2 } from 'lucide-react';
import type { DesignTokenKey, ThemeMode } from '../theme';
import { TOKEN_GROUPS, TOKEN_LABELS, PRESET_TOKENS } from '../theme';
import { useDesignTokens, type CloudSyncStatus } from '../contexts/DesignTokensContext';

const PRESET_BUTTONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'modern', label: 'Modern' },
  { mode: 'apple', label: 'Apple' },
];

const CloudSyncBanner: React.FC<{
  remoteHydrated: boolean;
  cloudSyncStatus: CloudSyncStatus;
  cloudSyncMessage: string | null;
  lastCloudSavedAt: Date | null;
  isOwner: boolean;
}> = ({ remoteHydrated, cloudSyncStatus, cloudSyncMessage, lastCloudSavedAt, isOwner }) => {
  if (!remoteHydrated) {
    return (
      <p className="text-xs text-[#5c564d] bg-[#f9f6f1] border border-[#c4beb5] px-3 py-2 flex items-center gap-2">
        <Loader2 size={14} className="animate-spin shrink-0" />
        Loading site theme…
      </p>
    );
  }

  if (cloudSyncStatus === 'offline') {
    return (
      <p className="text-xs text-[#5c564d] bg-stone-100 border border-[#c4beb5] px-3 py-2 flex items-center gap-2">
        <CloudOff size={14} className="shrink-0" />
        Database not configured — theme overrides stay in this browser only.
      </p>
    );
  }

  return (
    <div className="text-xs border border-[#c4beb5] px-3 py-2 space-y-1 bg-[#f0f4f1]">
      <p className="flex items-center gap-2 font-semibold text-[#2d3d2d]">
        <Cloud size={14} className="shrink-0 text-emerald-700" />
        Site theme from database
      </p>
      <p className="text-[#5c564d]">
        {isOwner ? (
          <>
            You&apos;re signed in as staff — edits auto-save to Supabase for all visitors.
            {cloudSyncStatus === 'saving' && (
              <span className="ml-2 inline-flex items-center gap-1 font-bold text-amber-800">
                <Loader2 size={12} className="animate-spin" /> Saving…
              </span>
            )}
            {cloudSyncStatus === 'synced' && lastCloudSavedAt && (
              <span className="ml-2 text-emerald-800 font-semibold">
                Saved {lastCloudSavedAt.toLocaleTimeString()}
              </span>
            )}
            {cloudSyncStatus === 'error' && (
              <span className="ml-2 text-red-700 font-semibold">Save failed: {cloudSyncMessage || 'unknown error'}</span>
            )}
          </>
        ) : (
          <>Visitors load the published theme from the cloud. Sign in on Jackpot as owner to edit.</>
        )}
      </p>
    </div>
  );
};

function normalizeHex(v: string): string {
  const t = v.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return t;
  if (/^[0-9a-fA-F]{3,8}$/.test(t)) return `#${t}`;
  return t;
}

const ThemeStudioPanel: React.FC<{ onRequestTheme?: (mode: ThemeMode) => void }> = ({ onRequestTheme }) => {
  const {
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
  } = useDesignTokens();

  const [importErr, setImportErr] = useState<string | null>(null);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify({ themeMode, overrides, effectiveTokens }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `four-square-theme-${themeMode}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [themeMode, overrides, effectiveTokens]);

  const importJson = useCallback(
    (file: File) => {
      setImportErr(null);
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(String(r.result)) as { overrides?: Partial<Record<DesignTokenKey, string>> };
          if (!data.overrides || typeof data.overrides !== 'object') {
            setImportErr('JSON must contain an "overrides" object');
            return;
          }
          const patch: Partial<Record<DesignTokenKey, string>> = {};
          Object.entries(data.overrides).forEach(([k, v]) => {
            if (typeof v === 'string' && k in TOKEN_LABELS) {
              patch[k as DesignTokenKey] = v;
            }
          });
          setTokens(patch);
        } catch {
          setImportErr('Invalid JSON file');
        }
      };
      r.readAsText(file);
    },
    [setTokens],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">Live design tokens</p>
          <p className="text-xs text-[#5c564d] mt-0.5">
            Turn on to layer custom colors on top of the selected app theme. With Supabase, the live site loads this for <strong>everyone</strong> and owners <strong>auto-save to the database</strong> (see status below). Without DB, only this browser keeps overrides. Use <strong>Export</strong> to back up; new named schemes live in{' '}
            <code className="text-[10px] bg-white px-1 border border-[#c4beb5]">src/theme/presets.ts</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStudioEnabled(!studioEnabled)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-2 transition-colors ${
            studioEnabled
              ? 'bg-[#2d3d2d] text-[#F4F1EA] border-[#2d3d2d]'
              : 'border-[#c4beb5] text-[#5c564d] hover:border-[#2d3d2d]'
          }`}
        >
          {studioEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {studioEnabled ? 'Custom colors ON' : 'Custom colors OFF'}
        </button>
      </div>

      <CloudSyncBanner
        remoteHydrated={remoteHydrated}
        cloudSyncStatus={cloudSyncStatus}
        cloudSyncMessage={cloudSyncMessage}
        lastCloudSavedAt={lastCloudSavedAt}
        isOwner={isOwner}
      />

      {!studioEnabled && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2">
          Preset themes still apply from <strong>App theme</strong> above. Enable custom colors to tune individual tokens.
        </p>
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5c564d] mb-2">Load preset as base</p>
        <p className="text-[11px] text-[#5c564d] mb-2">
          Switches the global app theme (same as App theme section). Your overrides stay on top when custom colors are ON.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_BUTTONS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onRequestTheme?.(mode)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors ${
                themeMode === mode
                  ? 'bg-[#c9b896] text-[#1a1918] border-[#c9b896]'
                  : 'border-[#c4beb5] text-[#2d3d2d] hover:bg-[#c9b896]/20'
              }`}
            >
              <Sparkles size={12} className="inline mr-1 -mt-0.5" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={clearOverrides}
            className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-[#c4beb5] text-[#5c564d] hover:border-red-300 hover:text-red-700 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw size={12} /> Clear overrides
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportJson} className={btnMini}>
          <Download size={12} /> Export JSON
        </button>
        <label className={`${btnMini} cursor-pointer`}>
          <Upload size={12} /> Import overrides
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
        </label>
        {importErr && <span className="text-xs text-red-600">{importErr}</span>}
      </div>

      {studioEnabled &&
        TOKEN_GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="font-barDisplay text-sm font-bold text-[#2d3d2d] mb-3 border-b-2 border-[#c4beb5] pb-1">
              {group.title}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.keys.map((key) => (
                <TokenRow
                  key={key}
                  label={TOKEN_LABELS[key]}
                  value={effectiveTokens[key]}
                  override={overrides[key]}
                  onChange={(v) => setToken(key, v)}
                  onReset={() => resetToken(key)}
                  presetValue={PRESET_TOKENS[themeMode][key]}
                  themeMode={themeMode}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

const btnMini =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-[#c4beb5] text-[#2d3d2d] hover:bg-[#f9f6f1] transition-colors';

const TokenRow: React.FC<{
  label: string;
  value: string;
  override: string | undefined;
  presetValue: string;
  themeMode: ThemeMode;
  onChange: (v: string) => void;
  onReset: () => void;
}> = ({ label, value, override, presetValue, themeMode, onChange, onReset }) => {
  const isOpacity = /opacity/i.test(label) || /^0(\.\d+)?$/.test(value.trim());
  const showPicker = !isOpacity && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());

  return (
    <div className="flex flex-col gap-1 p-2 bg-white/80 border border-[#c4beb5]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c564d]">{label}</span>
        {override !== undefined && (
          <span className="text-[9px] text-amber-700 font-semibold">override</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showPicker && (
          <input
            type="color"
            value={value.slice(0, 7)}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 border border-[#c4beb5] cursor-pointer bg-white p-0.5"
            title="Pick color"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(normalizeHex(e.target.value))}
          className="flex-1 min-w-0 text-xs font-mono border border-[#c4beb5] px-2 py-1.5 bg-white"
          spellCheck={false}
        />
        <span
          className="h-8 w-8 shrink-0 border border-[#c4beb5] rounded-sm"
          style={
            showPicker ? { backgroundColor: value } : { background: '#e7e5e4' }
          }
          title="Preview"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-[9px] text-[#5c564d] hover:text-[#2d3d2d] underline self-start"
      >
        Clear override (use {themeMode} preset)
      </button>
    </div>
  );
};

export default ThemeStudioPanel;