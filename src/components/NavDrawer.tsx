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
  { id: 'booking', label: 'Party', icon: CalendarDays },
  { id: 'about', label: 'About', icon: Info },
  { id: 'connect4', label: 'Connect 4', icon: Grid2x2 },
];

const NavDrawer: React.FC<NavDrawerProps> = ({ isOpen, onClose, activePage, onNavigate, theme: _theme }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          style={{ backgroundColor: 'var(--fs-drawer-scrim)' }}
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[min(18rem,100vw)] max-w-[280px] z-50 transform transition-transform duration-300 ease-out border-l-2 border-[color:var(--fs-drawer-border)] safe-top safe-right bg-[var(--fs-drawer-bg)] text-[color:var(--fs-drawer-text)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b-2 border-inherit">
          <span className="font-barDisplay text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--fs-drawer-text)]">
            Navigate
          </span>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 text-[color:var(--fs-drawer-text)] active:opacity-70"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
                className="font-barDisplay w-full flex items-center gap-3 px-4 min-h-[48px] py-3 text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.99]"
                style={{
                  backgroundColor: isActive ? 'var(--fs-drawer-active-bg)' : 'transparent',
                  color: isActive ? 'var(--fs-drawer-active-text)' : 'var(--fs-drawer-inactive-text)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--fs-drawer-hover-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
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
