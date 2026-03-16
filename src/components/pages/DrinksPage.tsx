import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Theme } from '../../theme';
import { DrinksData, DrinkItem } from '../../types';
import { DRINK_CATEGORY_LABELS, CANNED_BEERS } from '../../data/drinksData';

interface DrinksPageProps {
  theme: Theme;
  drinks: DrinksData;
  isAdmin?: boolean;
  onUpdateDrinkItem?: (category: string, idx: number, field: keyof DrinkItem, value: string | number | boolean) => void;
  onAddDrinkItem?: (category: string) => void;
  onRemoveDrinkItem?: (category: string, idx: number) => void;
}

const DrinksPage: React.FC<DrinksPageProps> = ({
  theme, drinks, isAdmin,
  onUpdateDrinkItem, onAddDrinkItem, onRemoveDrinkItem,
}) => {
  const isApple = theme.mode === 'apple';
  const accent = isApple ? 'text-[#0071e3]' : theme.isDark ? 'text-emerald-400' : 'text-emerald-700';
  const accentBorder = isApple ? 'border-[#0071e3]' : theme.isDark ? 'border-emerald-700' : 'border-emerald-600';
  const cardBg = theme.isDark ? 'bg-slate-800/60 border-slate-700' : isApple ? 'bg-white border-[#d2d2d7]' : 'bg-white border-slate-200';
  const headerBg = theme.isDark ? 'border-slate-700 bg-slate-800/80' : isApple ? 'border-[#d2d2d7] bg-[#f5f5f7]' : 'border-slate-200 bg-slate-50';
  const inputBorder = theme.isDark ? 'border-white/25 text-white' : 'border-black/25';

  const categoryColors = [
    { border: theme.isDark ? 'border-emerald-700' : 'border-emerald-600', header: theme.isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-600', accent: theme.isDark ? 'text-emerald-400' : 'text-emerald-700' },
    { border: theme.isDark ? 'border-blue-700' : 'border-blue-600', header: theme.isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-600', accent: theme.isDark ? 'text-blue-400' : 'text-blue-700' },
    { border: theme.isDark ? 'border-amber-700/80' : 'border-amber-600', header: theme.isDark ? 'bg-amber-900/20 border-amber-700/80' : 'bg-amber-50 border-amber-600', accent: theme.isDark ? 'text-amber-400' : 'text-amber-700' },
    { border: theme.isDark ? 'border-emerald-700' : 'border-emerald-600', header: theme.isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-600', accent: theme.isDark ? 'text-emerald-400' : 'text-emerald-700' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h2 className={`text-2xl font-black uppercase tracking-[0.15em] mb-6 ${accent}`}>Drinks</h2>
      {/* Four rectangles across on web, 2x2 on tablet, stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(drinks).map(([cat, items], i) => {
          const colors = categoryColors[i % categoryColors.length];
          return (
          <div key={cat} className={`border-2 overflow-hidden min-h-0 flex flex-col ${cardBg} ${colors.border}`}>
            <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 shrink-0 ${colors.header} ${colors.border}`}>
              <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] ${colors.accent}`}>
                {DRINK_CATEGORY_LABELS[cat] || cat}
              </h3>
            </div>
            <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {items.map((drink, idx) => (
                <div
                  key={`${drink.name}-${idx}`}
                  className={`flex justify-between items-start py-2 gap-2 ${idx < items.length - 1 ? `border-b ${theme.isDark ? 'border-white/10' : 'border-black/10'}` : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    {isAdmin ? (
                      <div className="space-y-0.5">
                        <input
                          value={drink.name}
                          onChange={e => onUpdateDrinkItem?.(cat, idx, 'name', e.target.value)}
                          className={`text-sm font-bold bg-transparent border-b border-dashed w-full focus:outline-none ${inputBorder} ${theme.text}`}
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
                      <>
                        <span className={`text-sm font-bold ${theme.text}`}>{drink.name}</span>
                        {drink.desc && <p className={`text-[10px] italic ${theme.textMuted}`}>{drink.desc}</p>}
                        {drink.tag && (
                          <span className={`text-[8px] font-bold uppercase tracking-widest border ${colors.border} ${colors.accent} px-1.5 py-0.5 mt-0.5 inline-block`}>
                            {drink.tag}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    {isAdmin ? (
                      <>
                        <div className="flex items-center gap-0.5">
                          <span className={`text-sm font-bold ${colors.accent}`}>$</span>
                          <input
                            type="number"
                            value={drink.price}
                            onChange={e => onUpdateDrinkItem?.(cat, idx, 'price', parseFloat(e.target.value) || 0)}
                            className={`text-sm font-bold w-14 text-right bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${colors.accent}`}
                          />
                        </div>
                        <button onClick={() => onRemoveDrinkItem?.(cat, idx)} className="text-red-500/50 hover:text-red-400 transition-colors mt-0.5">
                          <Trash2 size={12} />
                        </button>
                      </>
                    ) : (
                      <span className={`text-sm font-bold ${colors.accent}`}>${drink.price}</span>
                    )}
                  </div>
                </div>
              ))}
              {isAdmin && (
                <button
                  onClick={() => onAddDrinkItem?.(cat)}
                  className={`mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${colors.accent} opacity-50 hover:opacity-100`}
                >
                  <Plus size={10} /> Add Item
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Canned & Bottled Beer strip — matches menu export */}
      <div className={`mt-6 border-2 overflow-hidden ${cardBg} ${theme.isDark ? 'border-blue-700' : 'border-blue-600'}`}>
        <div className={`px-4 py-2.5 border-b-2 ${headerBg} ${theme.isDark ? 'border-blue-700 bg-blue-900/30' : 'border-blue-600 bg-blue-50'}`}>
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme.isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Canned &amp; Bottled Beer
          </h3>
        </div>
        <div className="p-4 flex flex-wrap gap-x-8 gap-y-2">
          {CANNED_BEERS.map((b) => (
            <div key={b.name} className="flex justify-between items-baseline w-[calc(25%-0.5rem)] min-w-[140px]">
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
