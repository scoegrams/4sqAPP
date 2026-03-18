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
  const isApple = theme.mode === 'apple';
  const btnBase = theme.isDark
    ? 'bg-slate-800 border-slate-700'
    : isApple
    ? 'bg-white/10 border-white/20'
    : theme.mode === 'modern'
    ? 'bg-white border-[#c8d8e4]'
    : 'bg-white border-slate-900 shadow-[2px_2px_0px_#000]';
  const btnText = (theme.isDark || isApple) ? 'text-white' : theme.text;

  return (
    <div className={`z-20 border-b-2 transition-colors duration-300 safe-top ${theme.headerBg} ${theme.headerBorder}`}>
      <div className="px-4 sm:px-6 py-2.5 sm:py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex flex-col leading-none gap-1 sm:gap-1.5 items-center min-w-0">
            <h1 className={`font-barWordmark text-2xl sm:text-3xl font-black tracking-tighter uppercase italic leading-none truncate ${isApple ? 'text-white' : theme.text}`}>FOUR SQUARE</h1>
            <FourSquares />
          </div>
          <span className={`hidden lg:block text-sm font-black tracking-widest uppercase border-l pl-4 ${isApple ? 'text-white/60 border-white/20' : `${theme.textMuted} ${theme.border}`}`}>
            Restaurant + Bar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TrainSign theme={theme} events={trainSignEvents} isAdmin={false} />
          <button
            onClick={onOpenNav}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 border transition-all active:scale-95 ${btnBase} ${btnText}`}
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
              className={`flex items-center gap-1.5 px-3 py-3 sm:py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px shrink-0 min-h-[44px] sm:min-h-0 active:scale-[0.98] ${
                isActive
                  ? theme.navActive
                  : `${theme.navInactive} ${theme.navInactiveHover}`
              }`}
            >
              <Icon size={10} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Header;
