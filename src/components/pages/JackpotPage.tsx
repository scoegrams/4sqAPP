import React, { useState, useEffect } from 'react';
import {
  LogOut, ShieldCheck, ShieldOff, Save, Printer, History,
  RotateCcw, PencilLine, Palette, Check, AlertCircle, ChevronDown,
  ChevronUp, CalendarDays, Train, Eye, Lock, Sparkles, KeyRound,
} from 'lucide-react';
import { Theme, ThemeMode } from '../../theme';
import type { Special, TrainSignEvent, MenuVersion } from '../../types';
import VersionHistory from '../VersionHistory';
import SpecialsEditor from '../SpecialsEditor';
import TrainSignEditor from '../TrainSignEditor';
import ThemeStudioPanel from '../ThemeStudioPanel';
import { supabase, hasSupabase } from '../../lib/supabase';
import { getJackpotClientId, signInWithJackpotPin } from '../../lib/jackpotPinAuth';
import { useAuth } from '../../contexts/AuthContext';

const PRESETS = [
  null, '#0f172a', '#1e293b', '#18181b', '#1c1917', '#1a1a2e', '#0c0a09',
  '#ffffff', '#f8fafc', '#F4F1EA', '#f5f5f4', '#fef2f2', '#eff6ff', '#ecfdf5',
];

const THEME_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark', light: 'Light', modern: 'Modern', apple: 'Apple',
};

interface JackpotPageProps {
  theme: Theme;
  themeMode: ThemeMode;
  isAdmin: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  customBgColor: string | null;
  specials: Special[];
  openHours: string;
  events: TrainSignEvent[];
  onToggleAdmin: () => void;
  onCycleTheme: () => void;
  onSetTheme: (mode: ThemeMode) => void;
  onSave: (note: string) => Promise<void>;
  onDiscard: () => void;
  onPrint: () => void;
  onChalkboard: () => void;
  onColorChange: (color: string | null) => void;
  onUpdateSpecial: (idx: number, field: keyof Special, value: string | number) => void;
  onUpdateOpenHours: (v: string) => void;
  onUpdateEvent: (idx: number, field: keyof TrainSignEvent, value: string) => void;
  onAddEvent: () => void;
  onRemoveEvent: (idx: number) => void;
  onMoveEvent: (idx: number, dir: 'up' | 'down') => void;
  onRestoreVersion: (version: MenuVersion) => void;
}

// ── Collapsible section ─────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-2 border-[#c4beb5] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#f9f6f1] text-left transition-colors"
      >
        <span className="text-[#2d3d2d]">{icon}</span>
        <span className="font-barDisplay text-base font-bold text-[#2d3d2d] flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300">
            {badge}
          </span>
        )}
        {open ? <ChevronUp size={14} className="text-[#5c564d] shrink-0" /> : <ChevronDown size={14} className="text-[#5c564d] shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-[#F4F1EA] border-t-2 border-[#c4beb5]">
          {children}
        </div>
      )}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const JackpotPage: React.FC<JackpotPageProps> = ({
  theme, themeMode, isAdmin, isDirty, lastSaved, customBgColor,
  specials, openHours, events,
  onToggleAdmin, onCycleTheme, onSetTheme,
  onSave, onDiscard, onPrint, onChalkboard, onColorChange,
  onUpdateSpecial, onUpdateOpenHours,
  onUpdateEvent, onAddEvent, onRemoveEvent, onMoveEvent,
  onRestoreVersion,
}) => {
  const auth = useAuth();
  const { user, profile, loading, signOut } = auth;

  const [pinInput, setPinInput] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [pinLocked, setPinLocked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [showSpecials, setShowSpecials] = useState(false);
  const [showTrainSign, setShowTrainSign] = useState(false);

  // Check if logged-in user has owner/staff role
  useEffect(() => {
    if (!user || !supabase) { setIsOwner(false); return; }
    setCheckingRole(true);
    supabase
      .from('owner_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsOwner(!!data);
        setCheckingRole(false);
      });
  }, [user]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);
    if (!supabase || pinLocked) return;
    const clientId = getJackpotClientId();
    if (!clientId) {
      setPinMessage('Allow session storage for this site (not full private mode).');
      return;
    }
    setPinSubmitting(true);
    const result = await signInWithJackpotPin(supabase, pinInput, clientId);
    setPinSubmitting(false);
    if (result.ok) {
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
      if (sessionErr) {
        setPinMessage(sessionErr.message);
        return;
      }
      setPinInput('');
      setAttemptsLeft(null);
      setPinLocked(false);
      return;
    }
    setPinMessage(result.message);
    setAttemptsLeft(typeof result.attemptsLeft === 'number' ? result.attemptsLeft : null);
    if (result.locked || result.attemptsLeft === 0) {
      setPinLocked(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(note);
    setNote('');
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  // ── Button styles ──
  const btnTan = 'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-2 bg-[#c9b896] text-[#1a1918] border-[#c9b896] hover:bg-[#d4c4a4] transition-colors cursor-pointer';
  const btnOutline = 'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-[#c4beb5] text-[#2d3d2d] hover:bg-[#c9b896]/15 hover:border-[#2d3d2d] transition-colors cursor-pointer';
  const btnRed = 'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-red-300 text-red-700 hover:bg-red-50 transition-colors cursor-pointer';
  const input = 'w-full px-4 py-3 text-sm border-2 border-[#c4beb5] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#2d3d2d] placeholder:text-[#8a8580]';

  // ── Not connected to Supabase ──
  if (!hasSupabase()) {
    return (
      <div className="min-h-[60vh] bg-[#F4F1EA] font-bar py-10 sm:py-14 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <Lock size={32} className="mx-auto text-[#5c564d]" />
          <h2 className="font-barDisplay text-2xl font-bold text-[#2d3d2d]">Not configured</h2>
          <p className="text-sm text-[#5c564d]">
            Add Supabase <code className="bg-white px-1 py-0.5 border border-[#c4beb5] text-xs">URL</code> +{' '}
            <code className="bg-white px-1 py-0.5 border border-[#c4beb5] text-xs">anon key</code> to env (e.g.{' '}
            <code className="text-[10px] bg-white px-1 border border-[#c4beb5]">SUPABASE_URL</code> /{' '}
            <code className="text-[10px] bg-white px-1 border border-[#c4beb5]">VITE_SUPABASE_URL</code>) in your{' '}
            <code className="bg-white px-1 py-0.5 border border-[#c4beb5] text-xs">.env</code> file to enable the Jackpot dashboard.
          </p>
          <p className="text-xs text-[#5c564d]">See <strong>DEPLOY.md</strong> for setup instructions.</p>
        </div>
      </div>
    );
  }

  // ── Loading auth ──
  if (loading || checkingRole) {
    return (
      <div className="min-h-[60vh] bg-[#F4F1EA] font-bar flex items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5c564d]">Loading…</span>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-[60vh] bg-[#F4F1EA] font-bar py-10 sm:py-14">
        <div className="max-w-sm mx-auto px-5 sm:px-8">
          <div className="mb-8 text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#5c564d] mb-1.5">Four Square</p>
            <h2 className="font-barDisplay text-3xl font-bold text-[#2d3d2d]">Jackpot</h2>
            <p className="text-base text-[#2d3d2d] mt-3 font-semibold">Enter your PIN.</p>
            <p className="text-sm text-[#5c564d] mt-1.5 leading-relaxed">
              <strong>3 tries</strong> per browser session, then a short lockout. No email — PIN only.
            </p>
          </div>

          <div className="space-y-5">
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2d3d2d] mb-2">PIN</label>
                <input
                  type="password"
                  required
                  autoComplete="off"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="••••••••"
                  disabled={pinLocked}
                  className={`${input} text-lg tracking-widest`}
                />
                {attemptsLeft !== null && attemptsLeft > 0 && !pinLocked && (
                  <p className="text-xs text-amber-800 mt-2 font-semibold">
                    {attemptsLeft === 1 ? '1 try left' : `${attemptsLeft} tries left`}
                  </p>
                )}
              </div>
              {pinMessage && (
                <p className="text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {pinMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={pinSubmitting || pinLocked}
                className={`${btnTan} w-full justify-center py-4 text-sm disabled:opacity-60`}
              >
                <KeyRound size={16} /> {pinSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <details className="text-xs text-[#8a8580] border-t border-[#c4beb5] pt-4">
              <summary className="cursor-pointer font-semibold text-[#5c564d] hover:text-[#2d3d2d]">
                Admin: set up PINs &amp; function
              </summary>
              <p className="mt-2 leading-relaxed pl-1">
                Add PINs in <code className="bg-white px-1 border border-[#c4beb5] text-[10px]">jackpot_pins</code>, deploy{' '}
                <code className="text-[10px]">jackpot-pin</code>, set the function secret (technical staff user — see{' '}
                <strong>DEPLOY.md</strong>). Nobody types an email on this screen.
              </p>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in but not an owner/staff ──
  if (!isOwner) {
    return (
      <div className="min-h-[60vh] bg-[#F4F1EA] font-bar py-10 sm:py-14 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <Lock size={32} className="mx-auto text-[#5c564d]" />
          <h2 className="font-barDisplay text-2xl font-bold text-[#2d3d2d]">Access denied</h2>
          <p className="text-sm text-[#5c564d]">
            This sign-in isn’t allowed for Jackpot. Ask your admin to add the staff account to{' '}
            <code className="bg-white px-1 py-0.5 border border-[#c4beb5] text-xs">owner_roles</code> in Supabase.
          </p>
          <button type="button" onClick={() => signOut()} className={`${btnOutline} mx-auto`}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Owner dashboard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-[60vh] bg-[#F4F1EA] font-bar py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 space-y-5">

        {/* Header */}
        <div className="border-b-2 border-[#2d3d2d]/20 pb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#5c564d] mb-1">Four Square</p>
            <h2 className="font-barDisplay text-3xl font-bold text-[#2d3d2d]">Jackpot</h2>
            <p className="text-xs text-[#5c564d] mt-1">
              {profile?.display_name ? (
                <>
                  Signed in as <strong>{profile.display_name}</strong>
                </>
              ) : (
                <>Signed in</>
              )}
            </p>
          </div>
          <button type="button" onClick={() => signOut()} className={btnOutline}>
            <LogOut size={13} /> Sign out
          </button>
        </div>

        {/* Admin mode toggle */}
        <Section
          title="Admin mode"
          icon={isAdmin ? <ShieldCheck size={16} className="text-emerald-600" /> : <ShieldOff size={16} />}
          defaultOpen
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1a1a1a]">
                {isAdmin ? 'Admin mode is ON — inline editing is active' : 'Admin mode is OFF'}
              </p>
              <p className="text-xs text-[#5c564d] mt-0.5">
                {isAdmin
                  ? 'Menu items, specials, drinks, and the footer are all editable directly on screen.'
                  : 'Toggle on to unlock inline editing of all content across the site.'}
              </p>
            </div>
            <button type="button" onClick={onToggleAdmin} className={isAdmin ? btnRed : btnTan}>
              {isAdmin ? <><ShieldOff size={13} /> Exit admin</> : <><ShieldCheck size={13} /> Enable admin</>}
            </button>
          </div>
        </Section>

        {/* Save / discard */}
        <Section
          title="Save changes"
          icon={<Save size={16} />}
          defaultOpen={isDirty}
          badge={isDirty ? 'Unsaved' : undefined}
        >
          {isDirty && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 mb-3">
              <AlertCircle size={12} className="text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-amber-700">You have unsaved changes</span>
            </div>
          )}
          {savedFlash && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-300 mb-3">
              <Check size={12} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-emerald-700">Saved!</span>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5c564d] mb-1.5">Version note (optional)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="e.g. Updated wing prices for fall menu"
                className={input}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving || !isDirty} className={`${btnTan} disabled:opacity-40 disabled:cursor-not-allowed`}>
                <Save size={13} /> {saving ? 'Saving…' : 'Save version'}
              </button>
              <button type="button" onClick={onDiscard} disabled={!isDirty} className={`${btnOutline} disabled:opacity-40 disabled:cursor-not-allowed`}>
                <RotateCcw size={13} /> Discard
              </button>
              <button type="button" onClick={() => setShowHistory(true)} className={btnOutline}>
                <History size={13} /> Version history
              </button>
            </div>
            {lastSaved && !isDirty && (
              <p className="text-[11px] text-[#5c564d]">Last saved: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>
        </Section>

        {/* Export */}
        <Section title="Export &amp; print" icon={<Printer size={16} />}>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onPrint} className={btnTan}>
              <Printer size={13} /> Print menu PDF
            </button>
            <button type="button" onClick={onChalkboard} className={btnOutline}>
              <PencilLine size={13} /> Chalkboard specials
            </button>
          </div>
        </Section>

        {/* Specials & events */}
        <Section title="Specials &amp; events" icon={<CalendarDays size={16} />}>
          <p className="text-xs text-[#5c564d] mb-3">Edit daily specials shown in the footer, and the scrolling marquee events in the header.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowSpecials(true)} className={btnTan}>
              <CalendarDays size={13} /> Daily specials
            </button>
            <button type="button" onClick={() => setShowTrainSign(true)} className={btnOutline}>
              <Train size={13} /> Marquee events
            </button>
          </div>
        </Section>

        {/* Theme */}
        <Section title="App theme" icon={<Palette size={16} />}>
          <p className="text-xs text-[#5c564d] mb-3">Controls how the app looks for all visitors.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(['light', 'dark', 'modern', 'apple'] as ThemeMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onSetTheme(m)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-colors ${
                  themeMode === m
                    ? 'bg-[#c9b896] text-[#1a1918] border-[#c9b896]'
                    : 'border-[#c4beb5] text-[#5c564d] hover:border-[#2d3d2d]'
                }`}
              >
                {THEME_LABELS[m]}
              </button>
            ))}
          </div>
          <button type="button" onClick={onCycleTheme} className={btnOutline}>
            <Eye size={13} /> Cycle through themes
          </button>
        </Section>

        {/* Live design tokens */}
        <Section title="Theme Studio" icon={<Sparkles size={16} className="text-amber-600" />} defaultOpen={false}>
          <p className="text-xs text-[#5c564d] mb-4">
            All UI colors flow from one token map (<code className="text-[10px] bg-white px-1 py-0.5 border border-[#c4beb5]">src/theme/presets.ts</code>).
            Turn on <strong>Custom colors</strong> to tune any value live in this browser; export JSON to save a scheme. New named themes: duplicate a preset block and wire it in{' '}
            <code className="text-[10px] bg-white px-1 py-0.5 border border-[#c4beb5]">ThemeMode</code> + app theme buttons.
          </p>
          <ThemeStudioPanel onRequestTheme={onSetTheme} />
        </Section>

        {/* Background color */}
        <Section title="Background color (quick override)" icon={<Palette size={16} />}>
          <p className="text-xs text-[#5c564d] mb-3">
            Paints the main canvas only (bypasses the <strong>Page background</strong> token). Clear to use tokens again.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((color, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onColorChange(color)}
                title={color || 'Theme default'}
                className={`w-8 h-8 border-2 transition-all hover:scale-110 ${
                  customBgColor === color
                    ? 'border-[#2d3d2d] scale-110 ring-2 ring-[#c9b896]'
                    : 'border-[#c4beb5]'
                }`}
                style={{ background: color || '#F4F1EA' }}
              />
            ))}
          </div>
          {customBgColor && (
            <button type="button" onClick={() => onColorChange(null)} className={`${btnOutline} text-[10px]`}>
              Reset to theme default
            </button>
          )}
        </Section>

      </div>

      {/* Modals */}
      <VersionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={onRestoreVersion}
        theme={theme}
      />
      <SpecialsEditor
        isOpen={showSpecials}
        specials={specials}
        openHours={openHours}
        onUpdateOpenHours={onUpdateOpenHours}
        theme={theme}
        onUpdate={onUpdateSpecial}
        onClose={() => setShowSpecials(false)}
      />
      <TrainSignEditor
        isOpen={showTrainSign}
        events={events}
        theme={theme}
        onUpdate={onUpdateEvent}
        onAdd={onAddEvent}
        onRemove={onRemoveEvent}
        onMove={onMoveEvent}
        onClose={() => setShowTrainSign(false)}
      />
    </div>
  );
};

export default JackpotPage;
