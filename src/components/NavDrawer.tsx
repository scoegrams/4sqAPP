import React from 'react';
import { LucideIcon } from 'lucide-react';
import { X, UtensilsCrossed, GlassWater, CalendarDays, Info, Grid2x2, Sparkles } from 'lucide-react';
import { Theme } from '../theme';
import Button from './ui/Button';
import { FEATURES } from '../config/features';

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
  ...(FEATURES.connect4 ? [{ id: 'connect4' as const, label: 'Connect 4', icon: Grid2x2 }] : []),
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
          <Button
            type="button"
            variant="muted"
            size="icon"
            iconOnly
            onClick={onClose}
            className="-m-2 text-[color:var(--fs-drawer-text)]"
            aria-label="Close menu"
          >
            <X size={20} />
          </Button>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <Button
                key={id}
                type="button"
                variant={isActive ? 'drawerActive' : 'drawer'}
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
              >
                <Icon size={16} />
                {label}
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default NavDrawer;
