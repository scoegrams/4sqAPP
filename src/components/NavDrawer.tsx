import React from 'react';
import { X, UtensilsCrossed, GlassWater, CalendarDays, Info, Grid2x2 } from 'lucide-react';
import { Theme } from '../theme';

export type Page = 'menu' | 'about' | 'connect4' | 'booking' | 'drinks';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  theme: Theme;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'drinks', label: 'Drinks', icon: GlassWater },
  { id: 'booking', label: 'Booking', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const NavDrawer: React.FC<NavDrawerProps> = ({ isOpen, onClose, activePage, onNavigate, theme }) => {
  const isMbta = theme.mode === 'mbta';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out border-l-2 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme.isDark ? 'bg-slate-900 border-slate-700' : isMbta ? 'bg-[#231F20] border-[#DA291C]' : 'bg-white border-slate-300'}`}
      >
        <div className="p-4 flex justify-between items-center border-b-2 border-inherit">
          <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.isDark || isMbta ? 'text-white' : 'text-slate-900'}`}>
            Navigate
          </span>
          <button onClick={onClose} className={`p-1 ${theme.isDark || isMbta ? 'text-white' : 'text-slate-900'}`}>
            <X size={18} />
          </button>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? (isMbta ? 'bg-[#DA291C] text-white' : theme.isDark ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark || isMbta ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')
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
