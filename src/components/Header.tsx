import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu, Info, Grid2x2, CalendarDays, GlassWater, Sparkles, ShieldCheck, LogOut, X, Save, Loader2, Settings2, UserCircle2 } from 'lucide-react';
import TrainSign from './TrainSign';
import FourSquares from './FourSquares';
import { Page } from './NavDrawer';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';
import type { Profile } from '../types/supabase';

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

/** Mobile: first three only. md+ (tablet / desktop): About, Party, Connect 4 also in the bar (still in drawer on all sizes). */
const HEADER_NAV_ROW: NavRowItem[] = [
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'menu', label: 'Menu', icon: MenuLinesIcon },
  { id: 'specials', label: 'Specials', icon: Sparkles },
  { id: 'about', label: 'About', icon: Info, wideOnly: true },
  { id: 'booking', label: 'Host Your Party', icon: CalendarDays, wideOnly: true },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2, wideOnly: true },
];

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

  return (
    <div className={`z-20 transition-colors duration-300 safe-top ${theme.headerBg} ${theme.headerBorder}`}>
      {/* pl uses max() so logo never hugs the screen edge when safe-area is 0 */}
      <div className="py-2 sm:py-2.5 flex items-start justify-between gap-3 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 pl-0">
          {/* Stacked Hamon wordmark + square tech — matches brand lockup */}
          <div
            className="shrink-0 self-start font-barDisplay font-bold text-center text-[color:var(--fs-header-wordmark)] w-fit max-w-[92vw]"
            style={{ fontSize: 'clamp(1.45rem, 4.6vw, 1.95rem)' }}
          >
            <h1
              className="m-0 p-0 leading-[0.88] tracking-[0.04em]"
              aria-label="Four Square, Restaurant and Bar"
            >
              <span className="block">FOUR</span>
              <span className="block">SQUARE</span>
            </h1>
            <div aria-hidden="true">
              <FourSquares unit="0.24em" className="mt-[0.07em]" />
            </div>
          </div>
          <span
            className="hidden md:block self-center font-barDisplay font-bold border-l pl-4 text-[color:var(--fs-header-tagline)] border-[color:var(--fs-header-tagline-border)]"
            style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)', letterSpacing: '0.02em' }}
          >
            Restaurant &amp; Bar
          </span>
        </div>

        <div className="flex items-start gap-2 shrink-0 pt-0.5">
          <TrainSign theme={theme} events={trainSignEvents} isAdmin={false} />

          {/* Member auth: only relevant on the Connect 4 page */}
          {isLoggedIn && activePage === 'connect4' ? (
            <div ref={avatarRef} className="relative">
              <button
                type="button"
                onClick={() => setAvatarMenuOpen(v => !v)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center font-barDisplay font-bold text-sm text-white transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--fs-footer-schedule-bg)',
                  borderRadius: 'var(--fs-radius)',
                }}
                aria-label="Account menu"
              >
                {initial}
              </button>
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
                  <button
                    type="button"
                    onClick={() => { setAvatarMenuOpen(false); onSignOut?.(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={11} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : !isLoggedIn && activePage === 'connect4' && onSignIn ? (
            <button
              type="button"
              onClick={onSignIn}
              className="min-h-[44px] flex items-center gap-1.5 px-3 font-bold text-[10px] uppercase tracking-wider text-white border-2 transition-all active:scale-95 hover:opacity-85"
              style={{
                backgroundColor: 'var(--fs-footer-schedule-bg)',
                borderColor: 'var(--fs-footer-schedule-bg)',
                borderRadius: 'var(--fs-radius)',
              }}
            >
              <UserCircle2 size={14} />
              <span className="hidden sm:inline">Join</span>
            </button>
          ) : null}

          <button
            onClick={onOpenNav}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 border-2 transition-all active:scale-95 bg-[var(--fs-header-menu-btn-bg)] border-[color:var(--fs-header-menu-btn-border)] text-[color:var(--fs-header-menu-btn-icon)]"
            style={{ borderRadius: 'var(--fs-radius)' }}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div
        className={`border-t overflow-x-auto no-scrollbar flex items-center justify-center gap-0 sm:gap-1 px-2 sm:px-6 ${theme.navUnderline}`}
        style={{
          backdropFilter: 'blur(var(--fs-nav-blur))',
          WebkitBackdropFilter: 'blur(var(--fs-nav-blur))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right, 0px))',
        }}
      >
        {HEADER_NAV_ROW.map(({ id, label, icon: Icon, wideOnly }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ fontFamily: "'Hamon', system-ui, sans-serif", fontWeight: 700 }}
              className={`items-center gap-1 px-2 md:px-3 py-2 md:py-1.5 text-[9px] md:text-[12px] uppercase tracking-wider md:tracking-widest transition-all duration-200 border-b-2 -mb-px shrink-0 min-h-[40px] md:min-h-0 active:scale-[0.98] ${
                wideOnly ? 'hidden md:inline-flex' : 'inline-flex'
              } ${
                isActive
                  ? 'text-[color:var(--fs-nav-active-text)] border-[color:var(--fs-nav-active-border)]'
                  : 'text-[color:var(--fs-nav-active-text)] opacity-50 border-transparent hover:opacity-80 hover:border-[color:var(--fs-nav-active-border)]'
              }`}
            >
              <Icon size={10} className="md:w-3 md:h-3 shrink-0" />
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
