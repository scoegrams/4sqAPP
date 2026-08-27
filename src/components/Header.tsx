import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu, Info, Grid2x2, CalendarDays, GlassWater, Sparkles, ShieldCheck, LogOut, X, Save, Loader2, Settings2, UserCircle2 } from 'lucide-react';
import TrainSign from './TrainSign';
import FourSquares from './FourSquares';
import { Page } from './NavDrawer';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';
import type { Profile } from '../types/supabase';
import Button from './ui/Button';
import { FEATURES } from '../config/features';

interface HeaderProps {
  theme: Theme;
  activePage: Page;
  trainSignEvents?: TrainSignEvent[];
  isAdmin?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  isLoggedIn?: boolean;
  profile?: Profile | null;
  onOpenNav: () => void;
  onNavigate: (page: Page) => void;
  onExitAdmin?: () => void;
  onSignOut?: () => void;
  onSave?: () => void;
  onGoAdmin?: () => void;
  onSignIn?: () => void;
}

const MenuLinesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

type NavRowItem = {
  id: Page;
  label: string;
  icon: LucideIcon | React.FC<{ size?: number; className?: string }>;
  wideOnly?: boolean;
};

/** Mobile: first three only. md+ (tablet / desktop): About, Party also in the bar (still in drawer on all sizes). */
const HEADER_NAV_ROW: NavRowItem[] = [
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'menu', label: 'Menu', icon: MenuLinesIcon },
  { id: 'specials', label: 'Specials', icon: Sparkles },
  { id: 'about', label: 'About', icon: Info, wideOnly: true },
  { id: 'booking', label: 'Host Your Party', icon: CalendarDays, wideOnly: true },
  ...(FEATURES.connect4
    ? [{ id: 'connect4' as const, label: 'Connect 4', icon: Grid2x2, wideOnly: true }]
    : []),
];

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const WordmarkWithSquares: React.FC<{ fontSize: string; sqUnit: string }> = ({ fontSize, sqUnit }) => (
  <div
    className="relative shrink-0 font-barDisplay font-bold text-center text-[color:var(--fs-header-wordmark)] w-fit z-10"
    style={{ fontSize }}
  >
    <h1
      className="m-0 p-0 leading-[0.88] tracking-[0.04em] text-center"
      aria-label="Four Square, Restaurant and Bar, Braintree Landing"
    >
      <span className="block">FOUR</span>
      <span className="block">SQUARE</span>
    </h1>
    <div
      aria-hidden="true"
      className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      style={{ top: '100%', marginTop: '-0.06em' }}
    >
      <FourSquares unit={sqUnit} />
    </div>
  </div>
);

const Header: React.FC<HeaderProps> = ({
  theme, activePage, trainSignEvents = [], isAdmin, isDirty, isSaving,
  isLoggedIn, profile,
  onOpenNav, onNavigate, onExitAdmin, onSignOut, onSave, onGoAdmin, onSignIn,
}) => {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [avatarMenuOpen]);

  const initial = (profile?.display_name || profile?.email || 'M')[0].toUpperCase();

  const navLinkClasses = (isActive: boolean) =>
    joinClasses(
      'inline-flex flex-1 lg:flex-none items-center justify-center gap-1 min-h-[44px] lg:min-h-0 px-1 lg:px-3 py-0 lg:py-1.5',
      'text-[10px] lg:text-[12px] uppercase tracking-wider lg:tracking-widest transition-all duration-200 active:scale-[0.98]',
      'border-b-2 -mb-px shrink-0',
      isActive
        ? 'text-[color:var(--fs-nav-active-text)] border-[color:var(--fs-nav-active-border)]'
        : 'text-[color:var(--fs-nav-active-text)] opacity-50 border-transparent hover:opacity-80 hover:border-[color:var(--fs-nav-active-border)]',
    );

  return (
    <div className={`z-20 transition-colors duration-300 safe-top ${theme.headerBg} ${theme.headerBorder}`}>
      {/* Mobile: 3 columns — wordmark | tagline | menu */}
      <div
        className="md:hidden grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 py-1 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]"
      >
        <WordmarkWithSquares fontSize="clamp(1.3rem, 4vw, 1.55rem)" sqUnit="0.44em" />

        <div
          className="min-w-0 self-stretch flex flex-col justify-center border-l border-[color:var(--fs-header-tagline-border)] pl-2 leading-none text-[color:var(--fs-header-tagline)]"
          aria-hidden="true"
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.16em]">Bar &amp; Restaurant</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] mt-1">Braintree Landing</span>
        </div>

        <div className="flex justify-end self-center pl-1">
          <Button
            type="button"
            variant="menu"
            size="iconSm"
            iconOnly
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="min-h-[40px] min-w-[40px] p-1.5"
          >
            <Menu size={16} strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      {/* Tablet / desktop brand row */}
      <div className="hidden md:flex items-center gap-3 py-1.5 pl-[max(1.5rem,env(safe-area-inset-left,0px))] pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
        <WordmarkWithSquares fontSize="clamp(1.45rem, 2.4vw, 1.95rem)" sqUnit="0.42em" />

        <span
          className="self-center font-barDisplay font-bold border-l pl-4 ml-1 text-[color:var(--fs-header-tagline)] border-[color:var(--fs-header-tagline-border)] shrink-0"
          style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)', letterSpacing: '0.02em' }}
        >
          Restaurant &amp; Bar
          <span className="block text-[0.55em] font-bold uppercase tracking-[0.22em] opacity-75 mt-0.5">
            Braintree Landing
          </span>
        </span>

        <div className="flex-1 min-w-2" aria-hidden />

        <div className="flex items-center gap-1.5 shrink-0">
          <TrainSign theme={theme} events={trainSignEvents} isAdmin={false} />

          {/* Member auth — Connect 4 only when feature is enabled */}
          {FEATURES.connect4 && isLoggedIn && activePage === 'connect4' ? (
            <div ref={avatarRef} className="relative">
              <Button
                type="button"
                variant="primary"
                size="icon"
                iconOnly
                onClick={() => setAvatarMenuOpen(v => !v)}
                className="text-sm"
                aria-label="Account menu"
              >
                {initial}
              </Button>
              {avatarMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 border-2 shadow-lg z-50 py-1 bg-[var(--fs-card-bg)]"
                  style={{ borderColor: 'var(--fs-border)', borderRadius: 'var(--fs-radius)' }}
                >
                  <div className="px-3 py-2 border-b border-[var(--fs-divider-muted)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fs-nav-active-text)] truncate">
                      {profile?.display_name || 'Member'}
                    </p>
                    <p className="text-[9px] text-[var(--fs-text-muted)] truncate mt-0.5">
                      {profile?.email || ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="dangerGhost"
                    size="sm"
                    fullWidth
                    onClick={() => { setAvatarMenuOpen(false); onSignOut?.(); }}
                    className="justify-start px-3 py-2 text-[10px] tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none normal-case"
                  >
                    <LogOut size={11} /> Sign out
                  </Button>
                </div>
              )}
            </div>
          ) : FEATURES.connect4 && !isLoggedIn && activePage === 'connect4' && onSignIn ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onSignIn}
              className="px-3"
            >
              <UserCircle2 size={14} />
              <span className="hidden sm:inline">Join</span>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="menu"
            size="iconSm"
            iconOnly
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <Menu size={18} strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      {/* Nav bar — low vertical padding, full-width tap targets on mobile */}
      <div
        className={`border-t flex w-full items-stretch justify-stretch lg:justify-center overflow-x-auto no-scrollbar ${theme.navUnderline}`}
        style={{
          backdropFilter: 'blur(var(--fs-nav-blur))',
          WebkitBackdropFilter: 'blur(var(--fs-nav-blur))',
          paddingLeft: 'max(0.25rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.25rem, env(safe-area-inset-right, 0px))',
        }}
      >
        {HEADER_NAV_ROW.map(({ id, label, icon: Icon, wideOnly }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              style={{ fontFamily: "'Hamon', system-ui, sans-serif", fontWeight: 700 }}
              className={joinClasses(
                wideOnly ? 'hidden lg:inline-flex' : 'inline-flex',
                navLinkClasses(isActive),
              )}
            >
              <Icon size={11} className="md:w-3 md:h-3 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Admin mode indicator strip */}
      {isAdmin && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-amber-50 border-t border-amber-200 safe-left">
          {/* Left: label + admin panel link */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 shrink-0">
              <ShieldCheck size={11} className="shrink-0" />
              Admin
            </div>
            {onGoAdmin && (
              <button
                type="button"
                onClick={onGoAdmin}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  activePage === 'jackpot'
                    ? 'text-amber-900 border-amber-400 bg-amber-100'
                    : 'text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Settings2 size={10} /> Admin Panel
              </button>
            )}
            {isDirty && (
              <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 shrink-0">
                Unsaved
              </span>
            )}
          </div>
          {/* Right: save + exit + sign out */}
          <div className="flex items-center gap-1 shrink-0">
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={!isDirty || isSaving}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  isDirty && !isSaving
                    ? 'text-emerald-800 border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-amber-300 border-amber-200 cursor-not-allowed opacity-50'
                }`}
              >
                {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            )}
            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
              >
                <X size={10} /> Exit
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut size={10} /> Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
