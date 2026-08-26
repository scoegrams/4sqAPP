import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Theme } from '../../theme';
import { DrinksData, DrinkItem } from '../../types';
import {
  DRINK_CATEGORY_ORDER,
  DRINK_TAB_LABELS,
  CANNED_BEERS,
} from '../../data/drinksData';

interface DrinksPageProps {
  theme: Theme;
  drinks: DrinksData;
  isAdmin?: boolean;
  onUpdateDrinkItem?: (category: string, idx: number, field: keyof DrinkItem, value: string | number | boolean) => void;
  onAddDrinkItem?: (category: string) => void;
  onRemoveDrinkItem?: (category: string, idx: number) => void;
}

type DrinkCat = (typeof DRINK_CATEGORY_ORDER)[number];

type CategoryColors = {
  border: string;
  header: string;
  accent: string;
};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

const DrinksPage: React.FC<DrinksPageProps> = ({
  theme, drinks, isAdmin,
  onUpdateDrinkItem, onAddDrinkItem, onRemoveDrinkItem,
}) => {
  const isWide = useMediaQuery('(min-width: 1024px)');

  const categories = useMemo(
    () => DRINK_CATEGORY_ORDER.filter((k): k is DrinkCat => Array.isArray(drinks[k])),
    [drinks],
  );

  const [activeCat, setActiveCat] = useState<DrinkCat>(() => categories[0] ?? 'draft');
  const sectionRefs = useRef<Partial<Record<string, HTMLDivElement | null>>>({});
  const mobileStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (categories.length && !categories.includes(activeCat)) {
      setActiveCat(categories[0]!);
    }
  }, [categories, activeCat]);

  const onDrinkTab = useCallback((cat: DrinkCat) => {
    setActiveCat(cat);
    if (isWide) {
      requestAnimationFrame(() => {
        sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      mobileStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isWide]);

  /* Desktop: highlight tab for section in view */
  useEffect(() => {
    if (!isWide) return;

    const nodes = categories
      .map((cat) => sectionRefs.current[cat])
      .filter((el): el is HTMLDivElement => !!el);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const id = best.target.id.replace('drinks-section-', '') as DrinkCat;
        if (categories.includes(id)) setActiveCat(id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [categories, isWide]);

  const isApple = theme.mode === 'apple';
  const cardBg = theme.isDark ? 'bg-slate-800/60 border-slate-700' : isApple ? 'bg-white border-[#d2d2d7]' : 'bg-white border-slate-200';
  const headerBg = theme.isDark ? 'border-slate-700 bg-slate-800/80' : isApple ? 'border-[#d2d2d7] bg-[#f5f5f7]' : 'border-slate-200 bg-slate-50';
  const inputBorder = theme.isDark ? 'border-white/25 text-white' : 'border-black/25';

  const categoryColors: CategoryColors[] = [
    { border: theme.isDark ? 'border-emerald-700' : 'border-emerald-600', header: theme.isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-600', accent: theme.isDark ? 'text-emerald-400' : 'text-emerald-700' },
    { border: theme.isDark ? 'border-blue-700' : 'border-blue-600', header: theme.isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-600', accent: theme.isDark ? 'text-blue-400' : 'text-blue-700' },
    { border: theme.isDark ? 'border-amber-700/80' : 'border-amber-600', header: theme.isDark ? 'bg-amber-900/20 border-amber-700/80' : 'bg-amber-50 border-amber-600', accent: theme.isDark ? 'text-amber-400' : 'text-amber-700' },
    { border: theme.isDark ? 'border-emerald-700' : 'border-emerald-600', header: theme.isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-600', accent: theme.isDark ? 'text-emerald-400' : 'text-emerald-700' },
  ];

  const colorsFor = (cat: DrinkCat) => {
    const i = categories.indexOf(cat);
    return categoryColors[i >= 0 ? i % categoryColors.length : 0]!;
  };

  const renderDrinkList = (cat: DrinkCat, colors: CategoryColors, mobileHero = false) => {
    const items = drinks[cat];
    return (
      <div className={`flex-1 min-h-0 overflow-y-auto no-scrollbar ${mobileHero ? 'px-3 py-3 sm:px-4 sm:py-4' : 'px-2.5 py-2.5 sm:px-3 sm:py-3'}`}>
        {items.map((drink, idx) => (
          <div
            key={`${drink.name}-${idx}`}
            className={`flex justify-between items-start gap-2 ${mobileHero ? 'py-2.5 sm:py-3' : 'py-1.5 sm:py-2'} ${idx < items.length - 1 ? `border-b ${theme.isDark ? 'border-white/10' : 'border-black/10'}` : ''}`}
          >
            <div className="flex-1 min-w-0">
              {isAdmin ? (
                <div className="space-y-0.5">
                  <input
                    value={drink.name}
                    onChange={e => onUpdateDrinkItem?.(cat, idx, 'name', e.target.value)}
                    className={`${mobileHero ? 'text-base sm:text-lg' : 'text-sm'} font-bold bg-transparent border-b border-dashed w-full focus:outline-none ${inputBorder} ${theme.text}`}
                  />
                  <input
                    value={drink.desc}
                    onChange={e => onUpdateDrinkItem?.(cat, idx, 'desc', e.target.value)}
                    placeholder="description..."
                    className={`text-[10px] italic bg-transparent border-b border-dashed w-full focus:outline-none ${theme.isDark ? 'border-white/20 text-white/60' : 'border-black/20 text-slate-500'}`}
                  />
                  <div className="flex items-center gap-2 pt-0.5">
                    <label className={`flex items-center gap-1 text-[9px] uppercase tracking-wider cursor-pointer ${theme.textMuted}`}>
                      <input type="checkbox" checked={!!drink.tag} onChange={e => onUpdateDrinkItem?.(cat, idx, 'tag', e.target.checked ? (drink.tag || 'Tag') : '')} className="w-2.5 h-2.5" />
                      Tag:
                    </label>
                    {drink.tag !== undefined && (
                      <input
                        value={drink.tag || ''}
                        onChange={e => onUpdateDrinkItem?.(cat, idx, 'tag', e.target.value)}
                        placeholder="tag..."
                        className={`text-[9px] font-bold uppercase tracking-wider bg-transparent border-b border-dashed w-16 focus:outline-none ${inputBorder} ${colors.accent}`}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className={`${mobileHero ? 'text-base sm:text-lg' : 'text-sm'} font-bold leading-snug block ${theme.text}`}>{drink.name}</span>
                  {drink.desc && (
                    <p className={`${mobileHero ? 'text-xs sm:text-sm' : 'text-[10px]'} italic leading-snug ${theme.textMuted}`}>{drink.desc}</p>
                  )}
                  {drink.tag && (
                    <span
                      className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider border ${colors.border} ${colors.accent} px-1 py-0.5 inline-block leading-none`}
                    >
                      {drink.tag}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-start gap-1 shrink-0">
              {isAdmin ? (
                <>
                  <div className="flex items-center gap-0.5">
                    <span className={`${mobileHero ? 'text-base' : 'text-sm'} font-bold ${colors.accent}`}>$</span>
                    <input
                      type="number"
                      value={drink.price}
                      onChange={e => onUpdateDrinkItem?.(cat, idx, 'price', parseFloat(e.target.value) || 0)}
                      className={`${mobileHero ? 'text-base w-16' : 'text-sm w-14'} font-bold text-right bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${colors.accent}`}
                    />
                  </div>
                  <button type="button" onClick={() => onRemoveDrinkItem?.(cat, idx)} className="text-red-500/50 hover:text-red-400 transition-colors mt-0.5">
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <span className={`${mobileHero ? 'text-base sm:text-lg' : 'text-sm'} font-bold ${colors.accent}`}>${drink.price}</span>
              )}
            </div>
          </div>
        ))}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onAddDrinkItem?.(cat)}
            className={`mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${colors.accent} opacity-50 hover:opacity-100`}
          >
            <Plus size={10} /> Add Item
          </button>
        )}
      </div>
    );
  };

  const renderCategoryCard = (cat: DrinkCat, colors: CategoryColors, opts?: { mobileHero?: boolean; hideOnMobile?: boolean }) => {
    const { mobileHero = false, hideOnMobile = false } = opts ?? {};
    return (
      <div
        id={`drinks-section-${cat}`}
        ref={el => { sectionRefs.current[cat] = el; }}
        role="tabpanel"
        aria-labelledby={`drinks-tab-${cat}`}
        hidden={!isWide && !mobileHero && hideOnMobile}
        className={[
          'border-2 overflow-hidden min-h-0 flex flex-col',
          cardBg,
          colors.border,
          mobileHero ? 'drinks-tv-enter min-h-[min(58vh,520px)] max-h-[min(62vh,560px)] shadow-lg' : 'scroll-mt-[3.5rem] sm:scroll-mt-[4rem] lg:scroll-mt-5',
          hideOnMobile ? 'hidden lg:flex' : '',
          mobileHero ? 'lg:hidden' : '',
        ].filter(Boolean).join(' ')}
      >
        {renderDrinkList(cat, colors, mobileHero)}
      </div>
    );
  };

  const activeColors = colorsFor(activeCat);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 pb-4">
      <div
        className={`sticky top-0 z-10 relative -mx-4 sm:-mx-6 px-3 sm:px-6 py-1 sm:py-2 mb-2 sm:mb-3 fs-sticky-rail`}
        role="tablist"
        aria-label="Drink categories"
      >
        <div className="flex flex-nowrap w-full justify-stretch gap-0.5 sm:justify-center sm:gap-2 pb-0">
          {categories.map(cat => {
            const isActive = activeCat === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                id={`drinks-tab-${cat}`}
                onClick={() => onDrinkTab(cat)}
                className={`flex-1 min-w-0 min-h-[34px] sm:min-h-[40px] sm:flex-none sm:shrink-0 px-1 sm:px-4 py-0.5 sm:py-1.5 rounded-md font-barDisplay font-bold uppercase tracking-[0.04em] sm:tracking-[0.18em] text-[8px] sm:text-[11px] border sm:border-2 transition-all duration-200 active:scale-[0.96] whitespace-nowrap text-center leading-tight ${
                  isActive
                    ? theme.isDark
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : isApple
                        ? 'border-[#0071e3] bg-white text-[#0071e3] shadow-sm'
                        : 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : theme.isDark
                      ? 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {DRINK_TAB_LABELS[cat as keyof typeof DRINK_TAB_LABELS] ?? cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: one category above the fold — TV channel switch */}
      <div ref={mobileStageRef} className="lg:hidden mb-3 scroll-mt-[3.5rem]">
        <div key={activeCat}>
          {renderCategoryCard(activeCat, activeColors, { mobileHero: true })}
        </div>
      </div>

      {/* Desktop: all categories in a row; tabs scroll & highlight */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3">
        {categories.map((cat) => renderCategoryCard(cat, colorsFor(cat), { hideOnMobile: true }))}
      </div>

      <div className={`mt-4 sm:mt-5 border-2 overflow-hidden ${cardBg} ${theme.isDark ? 'border-blue-700' : 'border-blue-600'}`}>
        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 border-b-2 ${headerBg} ${theme.isDark ? 'border-blue-700 bg-blue-900/30' : 'border-blue-600 bg-blue-50'}`}>
          <h3 className={`text-[10px] sm:text-xs font-barDisplay font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-tight ${theme.isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Canned &amp; Bottled Beer
          </h3>
        </div>
        <div className="px-3 py-2.5 sm:p-4 flex flex-wrap gap-x-6 sm:gap-x-8 gap-y-1.5 sm:gap-y-2">
          {CANNED_BEERS.map((b) => (
            <div key={b.name} className="flex justify-between items-baseline w-[calc(50%-0.5rem)] sm:w-[calc(25%-0.5rem)] min-w-[120px] sm:min-w-[140px]">
              <span className={`text-sm font-bold ${theme.text}`}>{b.name}</span>
              <span className={`text-sm font-bold ${theme.isDark ? 'text-blue-400' : 'text-blue-700'}`}>${b.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrinksPage;
