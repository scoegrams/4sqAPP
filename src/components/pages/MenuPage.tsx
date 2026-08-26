import React, { useCallback, useRef, useState } from 'react';
import Quadrant from '../Quadrant';
import { MenuData, MenuItem, MenuSection } from '../../types';
import { Theme } from '../../theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollCompact } from '../../hooks/useScrollCompact';

const QUADRANT_ORDER: (keyof MenuData)[] = ['apps', 'mains', 'burgers', 'healthy'];
type MenuView = 'all' | keyof MenuData;

const RAIL_INSET = 'max(1rem, env(safe-area-inset-left, 0px))';
const RAIL_INSET_RIGHT = 'max(1rem, env(safe-area-inset-right, 0px))';

interface MenuPageProps {
  theme: Theme;
  menu: MenuData;
  isAdmin: boolean;
  onUpdateItem: (q: keyof MenuData, si: number, ii: number, field: keyof MenuItem, value: string | number | boolean) => void;
  onAddItem: (q: keyof MenuData, si: number) => void;
  onRemoveItem: (q: keyof MenuData, si: number, ii: number) => void;
  onMoveItem: (q: keyof MenuData, si: number, ii: number, dir: 'up' | 'down') => void;
  onUpdateSection: (q: keyof MenuData, si: number, field: keyof MenuSection, value: string) => void;
  onAddSection: (q: keyof MenuData) => void;
  onRemoveSection: (q: keyof MenuData, si: number) => void;
  onMoveSection: (q: keyof MenuData, si: number, dir: 'up' | 'down') => void;
}

const MenuPage: React.FC<MenuPageProps> = ({
  theme,
  menu,
  isAdmin,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onUpdateSection,
  onAddSection,
  onRemoveSection,
  onMoveSection,
}) => {
  const isWide = useMediaQuery('(min-width: 1024px)');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const railCompact = useScrollCompact(scrollRef);
  const [viewMode, setViewMode] = useState<MenuView>('all');
  const mobileStageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<keyof MenuData, HTMLDivElement | null>>>({});

  const scrollMargin = railCompact ? 'scroll-mt-[3.25rem]' : 'scroll-mt-[4.25rem]';

  const quadrantThemeFor = (key: keyof MenuData) =>
    menu[key].color === 'green' ? theme.quadrantGreen : theme.quadrantBlue;

  const selectView = useCallback((next: MenuView) => {
    setViewMode(next);
    if (next === 'all') return;

    if (isWide) {
      requestAnimationFrame(() => {
        sectionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      requestAnimationFrame(() => {
        mobileStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [isWide]);

  const tabActiveClass = (active: boolean) =>
    active
      ? theme.isDark
        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
        : 'border-emerald-600 bg-emerald-50 text-emerald-800'
      : theme.isDark
        ? 'border-transparent text-slate-400 hover:text-slate-200'
        : 'border-transparent text-slate-500 hover:text-slate-800';

  const renderQuadrant = (
    key: keyof MenuData,
    opts?: { emphasis?: 'default' | 'focus'; animate?: boolean; dimmed?: boolean },
  ) => {
    const { emphasis = 'default', animate = false, dimmed = false } = opts ?? {};
    const inDesktopFocus = isWide && viewMode !== 'all' && viewMode === key;

    return (
      <div
        key={key}
        ref={(el) => { sectionRefs.current[key] = el; }}
        className={[
          inDesktopFocus ? `ring-2 ring-[color:var(--fs-nav-active-border)] z-10 relative ${scrollMargin}` : isWide ? scrollMargin : '',
          'transition-opacity duration-300',
        ].filter(Boolean).join(' ')}
      >
        <Quadrant
          id={key}
          data={menu[key]}
          isAdmin={isAdmin}
          theme={theme}
          quadrantTheme={quadrantThemeFor(key)}
          emphasis={emphasis}
          dimmed={dimmed}
          className={[
            animate ? 'menu-focus-enter min-h-[min(52vh,480px)]' : '',
            'transition-all duration-300',
          ].filter(Boolean).join(' ')}
          onFocusRequest={isAdmin ? undefined : () => selectView(key)}
          onUpdateItem={onUpdateItem}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onMoveItem={onMoveItem}
          onUpdateSection={onUpdateSection}
          onAddSection={onAddSection}
          onRemoveSection={onRemoveSection}
          onMoveSection={onMoveSection}
        />
      </div>
    );
  };

  const desktopDimOthers = isWide && viewMode !== 'all';

  const sectionTabs = (
    <>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'all'}
        onClick={() => selectView('all')}
        className={`fs-sticky-rail__tab active:scale-[0.96] ${tabActiveClass(viewMode === 'all')}`}
      >
        All
      </button>
      {QUADRANT_ORDER.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={viewMode === key}
          onClick={() => selectView(key)}
          className={`fs-sticky-rail__tab active:scale-[0.96] ${tabActiveClass(viewMode === key)}`}
        >
          {menu[key].title}
        </button>
      ))}
    </>
  );

  return (
    <div
      ref={scrollRef}
      className="flex-grow overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      {/* Flush under Drinks / Menu / Specials — compacts when scrolling */}
      <div
        className={`fs-sticky-rail ${railCompact ? 'fs-sticky-rail--compact' : ''}`}
        role="tablist"
        aria-label="Menu sections"
        style={{
          paddingLeft: RAIL_INSET,
          paddingRight: RAIL_INSET_RIGHT,
        }}
      >
        <div className="max-w-6xl mx-auto fs-sticky-rail__tabs sm:flex-wrap">
          {sectionTabs}
        </div>
      </div>

      <div className="px-4 md:px-6 pb-4 pt-3 safe-left safe-right">
        {viewMode !== 'all' && !isAdmin && (
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 lg:hidden ${theme.textMuted}`}>
            Reading mode — tap All to see the full menu
          </p>
        )}

        {/* Mobile: All = stacked sections; single tab = reading hero */}
        <div className="max-w-6xl mx-auto lg:hidden mb-4">
          {viewMode === 'all' ? (
            <div className="grid grid-cols-1 gap-4">
              {QUADRANT_ORDER.map((key) => renderQuadrant(key))}
            </div>
          ) : (
            <div ref={mobileStageRef} className={scrollMargin}>
              {renderQuadrant(viewMode, { emphasis: 'focus', animate: true })}
            </div>
          )}
        </div>

        {/* Desktop: always 2×2; focus tab dims others */}
        <div className={`max-w-6xl mx-auto hidden lg:grid grid-cols-2 gap-4 items-stretch mb-6 ${desktopDimOthers ? 'gap-5' : ''}`}>
          {QUADRANT_ORDER.map((key) =>
            renderQuadrant(key, {
              emphasis: viewMode === key ? 'focus' : 'default',
              dimmed: desktopDimOthers && viewMode !== key,
            }),
          )}
        </div>

        <div className="max-w-6xl mx-auto border-t border-[color:var(--fs-advisory-border)] px-4 py-4 mb-24">
          <p className={`text-xs leading-relaxed ${theme.text}`}>
            <span className="font-bold">Consumer advisory:</span> Consuming raw or undercooked meats, poultry,
            seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain
            medical conditions. Menu items may contain or come into contact with allergens including wheat, eggs,
            peanuts, tree nuts, milk, soy, fish, and shellfish. Please inform your server of any dietary restrictions
            or allergies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
