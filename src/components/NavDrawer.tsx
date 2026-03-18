import React from 'react';
import { LucideIcon } from 'lucide-react';
import { X, UtensilsCrossed, GlassWater, CalendarDays, Info, Grid2x2, Sparkles } from 'lucide-react';
import { Theme } from '../theme';

export type Page = 'menu' | 'about' | 'connect4' | 'booking' | 'drinks' | 'specials' | 'jackpot';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  theme: Theme;
}

const NAV_ITEMS: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'specials', label: 'Specials', icon: Sparkles },
  { id: 'booking', label: 'Host Your Party', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const NavDrawer: React.FC<NavDrawerProps> = ({ isOpen, onClose, activePage, onNavigate, theme }) => {
  const isApple = theme.mode === 'apple';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[min(18rem,100vw)] max-w-[280px] z-50 transform transition-transform duration-300 ease-out border-l-2 safe-top safe-right ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme.isDark ? 'bg-slate-900 border-slate-700' : isApple ? 'bg-[#1d1d1f] border-[#3a3a3c]' : 'bg-white border-slate-300'}`}
      >
        <div className="p-4 flex justify-between items-center border-b-2 border-inherit">
          <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.isDark || isApple ? 'text-white' : 'text-slate-900'}`}>
            Navigate
          </span>
          <button onClick={onClose} className={`min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 ${theme.isDark || isApple ? 'text-white' : 'text-slate-900'} active:opacity-70`} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 min-h-[48px] py-3 text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.99] ${
                  isActive
                    ? (isApple ? 'bg-[#0071e3] text-white' : theme.isDark ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark || isApple ? 'text-[#aeaeb2] hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100')
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default NavDrawer;
