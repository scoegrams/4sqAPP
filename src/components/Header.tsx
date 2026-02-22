import React from 'react';
import { Settings, Menu, Info, Grid2x2, CalendarDays, GlassWater, Palette } from 'lucide-react';
import TrainSign from './TrainSign';
import FourSquares from './FourSquares';
import { Page } from './NavDrawer';
import { Theme } from '../theme';

interface HeaderProps {
  theme: Theme;
  isAdmin: boolean;
  activePage: Page;
  showAdminControls: boolean;
  onCycleTheme: () => void;
  onToggleAdmin: () => void;
  onOpenNav: () => void;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'menu', label: 'Menu', icon: ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'booking', label: 'Booking', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const THEME_LABELS: Record<string, string> = {
  dark: 'Dark',
  light: 'Light',
  modern: 'Modern',
  mbta: 'MBTA',
};

const Header: React.FC<HeaderProps> = ({ theme, isAdmin, activePage, showAdminControls, onCycleTheme, onToggleAdmin, onOpenNav, onNavigate }) => {
  const isMbta = theme.mode === 'mbta';
  const btnBase = theme.isDark
    ? 'bg-slate-800 border-slate-700'
    : isMbta
    ? 'bg-white/15 border-white/30'
    : theme.mode === 'modern'
    ? 'bg-white border-[#c8d8e4]'
    : 'bg-white border-slate-900 shadow-[2px_2px_0px_#000]';
  const btnText = (theme.isDark || isMbta) ? 'text-white' : theme.text;

  return (
    <div className={`z-20 border-b-2 transition-colors duration-300 ${theme.headerBg} ${theme.headerBorder}`}>
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col leading-none gap-1.5 items-center">
            <h1 className={`text-3xl font-black tracking-tighter uppercase italic leading-none ${isMbta ? 'text-white' : theme.text}`}>FOUR SQUARE</h1>
            <FourSquares />
          </div>
          <span className={`hidden lg:block text-sm font-black tracking-widest uppercase border-l pl-4 ${isMbta ? 'text-white/60 border-white/20' : `${theme.textMuted} ${theme.border}`}`}>
            Restaurant + Bar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TrainSign theme={theme} />

          {showAdminControls && (
            <button
              onClick={onCycleTheme}
              title={`Theme: ${THEME_LABELS[theme.mode]} — click to switch`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all ${btnBase} ${btnText}`}
            >
              <Palette size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">
                {THEME_LABELS[theme.mode]}
              </span>
            </button>
          )}

          <button
            onClick={onOpenNav}
            className={`p-1.5 border transition-all ${btnBase} ${btnText}`}
            aria-label="Open navigation"
          >
            <Menu size={14} />
          </button>

          {showAdminControls && (
            <button
              onClick={onToggleAdmin}
              className={`flex items-center gap-2 px-3 py-1.5 border font-black uppercase text-[10px] tracking-widest transition-all ${isAdmin ? 'bg-[#DA291C] text-white border-[#DA291C]' : (theme.isDark ? 'bg-slate-800 border-slate-700 text-white' : isMbta ? 'bg-[#231F20] text-white border-[#231F20]' : theme.mode === 'modern' ? 'bg-[#2b6777] text-white border-[#2b6777]' : 'bg-slate-900 text-white shadow-[2px_2px_0px_#000]')}`}
            >
              <Settings size={12} />
              {isAdmin ? 'Exit' : 'Admin'}
            </button>
          )}
        </div>
      </div>

      <div className={`px-6 border-t flex items-center gap-1 ${theme.navUnderline}`}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px ${
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
