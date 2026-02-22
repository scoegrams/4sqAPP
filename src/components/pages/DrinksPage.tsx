import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Theme } from '../../theme';
import { DrinksData, DrinkItem } from '../../types';
import { DRINK_CATEGORY_LABELS } from '../../data/drinksData';

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
  const isMbta = theme.mode === 'mbta';
  const accent = isMbta ? 'text-[#00843D]' : theme.isDark ? 'text-emerald-400' : 'text-emerald-700';
  const accentBorder = isMbta ? 'border-[#00843D]' : theme.isDark ? 'border-emerald-700' : 'border-emerald-600';
  const cardBg = theme.isDark ? 'bg-slate-800/60 border-slate-700' : isMbta ? 'bg-white/5 border-white/15' : 'bg-white border-slate-200';
  const headerBg = theme.isDark ? 'border-slate-700 bg-slate-800/80' : isMbta ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50';
  const inputBorder = theme.isDark ? 'border-white/25 text-white' : 'border-black/25';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className={`text-2xl font-black uppercase tracking-[0.15em] mb-6 ${accent}`}>Drinks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(drinks).map(([cat, items]) => (
          <div key={cat} className={`border-2 overflow-hidden ${cardBg}`}>
            <div className={`px-4 py-2.5 border-b-2 ${headerBg}`}>
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${accent}`}>
                {DRINK_CATEGORY_LABELS[cat] || cat}
              </h3>
            </div>
            <div className="p-4">
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
                              className={`text-[9px] font-bold uppercase tracking-wider bg-transparent border-b border-dashed w-16 focus:outline-none ${inputBorder} ${accent}`}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm font-bold ${theme.text}`}>{drink.name}</span>
                        {drink.desc && <p className={`text-[10px] italic ${theme.textMuted}`}>{drink.desc}</p>}
                        {drink.tag && (
                          <span className={`text-[8px] font-bold uppercase tracking-widest border ${accentBorder} ${accent} px-1.5 py-0.5 mt-0.5 inline-block`}>
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
                          <span className={`text-sm font-bold ${accent}`}>$</span>
                          <input
                            type="number"
                            value={drink.price}
                            onChange={e => onUpdateDrinkItem?.(cat, idx, 'price', parseFloat(e.target.value) || 0)}
                            className={`text-sm font-bold w-14 text-right bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${accent}`}
                          />
                        </div>
                        <button onClick={() => onRemoveDrinkItem?.(cat, idx)} className="text-red-500/50 hover:text-red-400 transition-colors mt-0.5">
                          <Trash2 size={12} />
                        </button>
                      </>
                    ) : (
                      <span className={`text-sm font-bold ${accent}`}>${drink.price}</span>
                    )}
                  </div>
                </div>
              ))}
              {isAdmin && (
                <button
                  onClick={() => onAddDrinkItem?.(cat)}
                  className={`mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${accent} opacity-50 hover:opacity-100`}
                >
                  <Plus size={10} /> Add Item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrinksPage;
