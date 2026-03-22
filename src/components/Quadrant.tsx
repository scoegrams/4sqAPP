import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UtensilsCrossed, Beef, Salad, Pizza, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { QuadrantData, MenuData, MenuItem, MenuSection } from '../types';
import { Theme, QuadrantTheme } from '../theme';

interface QuadrantProps {
  id: keyof MenuData;
  data: QuadrantData;
  isAdmin: boolean;
  theme: Theme;
  quadrantTheme: QuadrantTheme;
  onUpdateItem: (q: keyof MenuData, si: number, ii: number, field: keyof MenuItem, value: string | number | boolean) => void;
  onAddItem: (q: keyof MenuData, si: number) => void;
  onRemoveItem: (q: keyof MenuData, si: number, ii: number) => void;
  onMoveItem: (q: keyof MenuData, si: number, ii: number, dir: 'up' | 'down') => void;
  onUpdateSection: (q: keyof MenuData, si: number, field: keyof MenuSection, value: string) => void;
  onAddSection: (q: keyof MenuData) => void;
  onRemoveSection: (q: keyof MenuData, si: number) => void;
  onMoveSection: (q: keyof MenuData, si: number, dir: 'up' | 'down') => void;
}

const QUADRANT_ICONS: Record<string, LucideIcon> = {
  apps: UtensilsCrossed,
  mains: Pizza,
  burgers: Beef,
  healthy: Salad,
};

const Quadrant: React.FC<QuadrantProps> = ({
  id, data, isAdmin, theme, quadrantTheme,
  onUpdateItem, onAddItem, onRemoveItem, onMoveItem,
  onUpdateSection, onAddSection, onRemoveSection, onMoveSection,
}) => {
  const Icon = QUADRANT_ICONS[id];
  const borderMuted = 'border-[color:var(--fs-divider-muted)]';
  const btnMuted = 'text-[color:var(--fs-btn-muted)] hover:text-[color:var(--fs-btn-muted-hover)]';
  const btnDanger = 'text-red-500/50 hover:text-red-400';
  const adminDashBorder = 'border-[color:var(--fs-input-border)]';

  return (
    <div className={`border-2 overflow-hidden ${quadrantTheme.bg} ${quadrantTheme.border}`}>
      {/* Header */}
      <div className={`px-5 py-3 border-b-2 ${quadrantTheme.border} ${quadrantTheme.headerBg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={quadrantTheme.accent} />}
          <h2 className={`text-sm font-barDisplay font-bold uppercase tracking-[0.2em] ${quadrantTheme.accent}`}>
            {data.title}
          </h2>
        </div>
      </div>

      <div className="px-5 py-4">
        {data.sections.map((section, si) => (
          <div key={`${section.name}-${si}`} className={si < data.sections.length - 1 ? 'mb-5' : ''}>
            {/* Section header */}
            <div className={`flex items-center gap-1 mb-2 pl-2 border-l-2 ${quadrantTheme.border}`}>
              {isAdmin ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => onMoveSection(id, si, 'up')} className={`${btnMuted} transition-colors`} disabled={si === 0}><ChevronUp size={10} /></button>
                    <button onClick={() => onMoveSection(id, si, 'down')} className={`${btnMuted} transition-colors`} disabled={si === data.sections.length - 1}><ChevronDown size={10} /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      value={section.name}
                      onChange={e => onUpdateSection(id, si, 'name', e.target.value)}
                      className={`text-[11px] font-barDisplay font-bold uppercase tracking-[0.15em] bg-transparent border-b border-dashed w-full focus:outline-none ${adminDashBorder} ${theme.text}`}
                    />
                    <input
                      value={section.note || ''}
                      onChange={e => onUpdateSection(id, si, 'note', e.target.value)}
                      placeholder="section note..."
                      className={`text-[9px] uppercase tracking-wider bg-transparent border-b border-dashed w-full focus:outline-none mt-0.5 ${adminDashBorder} opacity-90 ${theme.textMuted}`}
                    />
                  </div>
                  <button onClick={() => onRemoveSection(id, si)} className={`${btnDanger} transition-colors ml-1`}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className={`text-[11px] font-barDisplay font-bold uppercase tracking-[0.15em] ${theme.text}`}>
                    {section.name}
                  </span>
                  {section.note && (
                    <span className={`text-[9px] uppercase tracking-wider ${theme.textMuted}`}>
                      {section.note}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Items */}
            {section.items.map((item, ii) => (
              <div
                key={item.id}
                className={`flex justify-between items-start py-1.5 gap-2 ${
                  ii < section.items.length - 1 ? `border-b ${borderMuted}` : ''
                }`}
              >
                {isAdmin && (
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button onClick={() => onMoveItem(id, si, ii, 'up')} className={`${btnMuted} transition-colors`} disabled={ii === 0}><ChevronUp size={10} /></button>
                    <button onClick={() => onMoveItem(id, si, ii, 'down')} className={`${btnMuted} transition-colors`} disabled={ii === section.items.length - 1}><ChevronDown size={10} /></button>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isAdmin ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          value={item.name}
                          onChange={e => onUpdateItem(id, si, ii, 'name', e.target.value)}
                          className={`text-sm font-bold bg-transparent border-b border-dashed flex-1 min-w-0 focus:outline-none ${adminDashBorder} ${theme.text}`}
                        />
                      </div>
                      <input
                        value={item.description || ''}
                        onChange={e => onUpdateItem(id, si, ii, 'description', e.target.value)}
                        placeholder="description..."
                        className={`text-[10px] italic bg-transparent border-b border-dashed w-full focus:outline-none ${adminDashBorder} ${theme.textMuted}`}
                      />
                      <div className="flex items-center gap-3 pt-0.5">
                        <label className={`flex items-center gap-1 text-[9px] uppercase tracking-wider cursor-pointer ${theme.textMuted}`}>
                          <input type="checkbox" checked={!!item.isAddon} onChange={e => onUpdateItem(id, si, ii, 'isAddon', e.target.checked)} className="w-2.5 h-2.5" />
                          Add-on
                        </label>
                        <label className={`flex items-center gap-1 text-[9px] uppercase tracking-wider cursor-pointer ${theme.textMuted}`}>
                          <input type="checkbox" checked={!!item.isNew} onChange={e => onUpdateItem(id, si, ii, 'isNew', e.target.checked)} className="w-2.5 h-2.5" />
                          New
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.isAddon && <span className={`text-xs ${theme.textMuted}`}>+</span>}
                      <span className={`text-sm uppercase ${item.isAddon ? `${theme.textMuted} font-normal` : `${theme.text} font-bold`}`}>
                        {item.name}
                      </span>
                      {item.isNew && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white bg-red-600 px-1.5 py-0.5">NEW</span>
                      )}
                      {item.description && (
                        <p className={`text-[10px] italic w-full mt-0.5 ${theme.textMuted}`}>{item.description}</p>
                      )}
                    </div>
                  )}
                  {!isAdmin && item.description && null}
                </div>

                <div className="flex items-start gap-1 shrink-0">
                  {isAdmin ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        <span className={`text-sm font-bold ${quadrantTheme.accent}`}>$</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => onUpdateItem(id, si, ii, 'price', parseFloat(e.target.value) || 0)}
                          className={`text-sm font-bold w-14 text-right bg-transparent border-b border-dashed focus:outline-none ${adminDashBorder} ${quadrantTheme.accent}`}
                        />
                      </div>
                      <button onClick={() => onRemoveItem(id, si, ii)} className={`${btnDanger} transition-colors mt-0.5`}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  ) : (
                    <span className={`text-sm font-bold whitespace-nowrap ${quadrantTheme.accent}`}>
                      ${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Add item button */}
            {isAdmin && (
              <button
                onClick={() => onAddItem(id, si)}
                className={`mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${quadrantTheme.accent} opacity-50 hover:opacity-100`}
              >
                <Plus size={10} /> Add Item
              </button>
            )}
          </div>
        ))}

        {/* Add section button */}
        {isAdmin && (
          <button
            onClick={() => onAddSection(id)}
            className={`mt-3 w-full flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest py-2 border border-dashed transition-colors border-[color:var(--fs-input-border)] text-[color:var(--fs-btn-muted)] hover:text-[color:var(--fs-btn-muted-hover)] hover:border-[color:var(--fs-text-muted)]`}
          >
            <Plus size={10} /> Add Section
          </button>
        )}
      </div>
    </div>
  );
};

export default Quadrant;
