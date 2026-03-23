import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu, Info, Grid2x2, CalendarDays, GlassWater, Sparkles, ShieldCheck, LogOut, X, Save, Loader2, Settings2 } from 'lucide-react';
import TrainSign from './TrainSign';
import FourSquares from './FourSquares';
import { Page } from './NavDrawer';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';

interface HeaderProps {
  theme: Theme;
  activePage: Page;
  trainSignEvents?: TrainSignEvent[];
  isAdmin?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  onOpenNav: () => void;
  onNavigate: (page: Page) => void;
  onExitAdmin?: () => void;
  onSignOut?: () => void;
  onSave?: () => void;
  onGoAdmin?: () => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: LucideIcon | React.FC<{ size?: number }> }[] = [
  { id: 'menu', label: 'Menu', icon: ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'specials', label: 'Specials', icon: Sparkles },
  { id: 'booking', label: 'Host Your Party', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const Header: React.FC<HeaderProps> = ({ theme, activePage, trainSignEvents = [], isAdmin, isDirty, isSaving, onOpenNav, onNavigate, onExitAdmin, onSignOut, onSave, onGoAdmin }) => {
  return (
    <div className={`z-20 transition-colors duration-300 safe-top ${theme.headerBg} ${theme.headerBorder}`}>
      {/* items-start + self-start logo = pinned top-left; safe-left keeps clear of notches */}
      <div className="px-4 sm:px-6 py-2 sm:py-2.5 flex items-start justify-between gap-3 safe-left">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
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
        className={`px-2 sm:px-6 border-t overflow-x-auto no-scrollbar flex items-center justify-center gap-0.5 sm:gap-1 ${theme.navUnderline}`}
        style={{ backdropFilter: 'blur(var(--fs-nav-blur))', WebkitBackdropFilter: 'blur(var(--fs-nav-blur))' }}
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ fontFamily: "'Hamon', system-ui, sans-serif", fontWeight: 700 }}
              className={`flex items-center gap-1.5 px-3 py-3 sm:py-1.5 text-[11px] sm:text-[12px] uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px shrink-0 min-h-[44px] sm:min-h-0 active:scale-[0.98] ${
                isActive
                  ? 'text-[color:var(--fs-nav-active-text)] border-[color:var(--fs-nav-active-border)]'
                  : 'text-[color:var(--fs-nav-active-text)] opacity-50 border-transparent hover:opacity-80 hover:border-[color:var(--fs-nav-active-border)]'
              }`}
            >
              <Icon size={12} />
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
