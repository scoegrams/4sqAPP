import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Menu, Info, Grid2x2, CalendarDays, GlassWater, Sparkles } from 'lucide-react';
import TrainSign from './TrainSign';
import FourSquares from './FourSquares';
import { Page } from './NavDrawer';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';

interface HeaderProps {
  theme: Theme;
  activePage: Page;
  trainSignEvents?: TrainSignEvent[];
  onOpenNav: () => void;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: LucideIcon | React.FC<{ size?: number }> }[] = [
  { id: 'menu', label: 'Menu', icon: ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'specials', label: 'Specials', icon: Sparkles },
  { id: 'booking', label: 'Host Your Party', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const Header: React.FC<HeaderProps> = ({ theme, activePage, trainSignEvents = [], onOpenNav, onNavigate }) => {
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
          {/* Hamon-Bold.otf @ 700 */}
          <span
            className="hidden lg:block self-center font-barDisplay text-sm font-bold tracking-widest uppercase border-l pl-4 text-[color:var(--fs-header-tagline)] border-[color:var(--fs-header-tagline-border)]"
            style={{ fontFamily: "'Hamon', system-ui, sans-serif" }}
          >
            Restaurant + Bar
          </span>
        </div>

        <div className="flex items-start gap-2 shrink-0 pt-0.5">
          <TrainSign theme={theme} events={trainSignEvents} isAdmin={false} />
          <button
            onClick={onOpenNav}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 border-2 transition-all active:scale-95 bg-[var(--fs-header-menu-btn-bg)] border-[color:var(--fs-header-menu-btn-border)] text-[color:var(--fs-header-menu-btn-icon)]"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div className={`px-2 sm:px-6 border-t overflow-x-auto no-scrollbar flex items-center gap-0.5 sm:gap-1 ${theme.navUnderline}`}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3 py-3 sm:py-1.5 font-barDisplay text-[11px] sm:text-xs font-normal uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px shrink-0 min-h-[44px] sm:min-h-0 active:scale-[0.98] ${
                isActive
                  ? theme.navActive
                  : `${theme.navInactive} ${theme.navInactiveHover}`
              }`}
              style={{ fontFamily: "'Hamon', system-ui, sans-serif", fontWeight: 400 }}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Header;
