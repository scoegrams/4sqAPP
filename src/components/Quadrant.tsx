import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UtensilsCrossed, Beef, Salad, Pizza, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { QuadrantData, MenuData, MenuItem, MenuSection } from '../types';
import { Theme, QuadrantTheme } from '../theme';
import Button from './ui/Button';

interface QuadrantProps {
  id: keyof MenuData;
  data: QuadrantData;
  isAdmin: boolean;
  theme: Theme;
  quadrantTheme: QuadrantTheme;
  emphasis?: 'default' | 'focus';
  dimmed?: boolean;
  className?: string;
  onFocusRequest?: () => void;
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
  emphasis = 'default',
  dimmed = false,
  className = '',
  onFocusRequest,
  onUpdateItem, onAddItem, onRemoveItem, onMoveItem,
  onUpdateSection, onAddSection, onRemoveSection, onMoveSection,
}) => {
  const Icon = QUADRANT_ICONS[id];
  const borderMuted = 'border-[color:var(--fs-divider-muted)]';
  const adminDashBorder = 'border-[color:var(--fs-input-border)]';
  const inFocus = emphasis === 'focus';
  const sectionLabel = inFocus ? 'text-sm tracking-[0.12em]' : 'text-[11px] tracking-[0.15em]';
  const sectionNote = inFocus ? 'text-[11px]' : 'text-[9px]';
  const itemDescription = inFocus ? 'text-xs mt-1' : 'text-[10px] mt-0.5';

  return (
    <div
      className={[
        'border-2 overflow-hidden',
        quadrantTheme.bg,
        quadrantTheme.border,
        dimmed ? 'opacity-45 saturate-75 scale-[0.985] pointer-events-none' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        borderRadius: 'var(--fs-radius)',
        boxShadow: 'var(--fs-card-shadow)',
        ...(inFocus
          ? ({
              '--fs-menu-item-font-size': 'clamp(1rem, 4.2vw, 1.125rem)',
              '--fs-menu-item-padding-y': '0.625rem',
            } as React.CSSProperties)
          : {}),
      }}
    >
      {/* Header */}
      <div className={`px-5 py-3 border-b-2 ${quadrantTheme.border} ${quadrantTheme.headerBg} flex items-center justify-between`}>
        {onFocusRequest ? (
          <button
            type="button"
            onClick={onFocusRequest}
            className="flex items-center gap-2 text-left min-h-[44px] -my-1 flex-1 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fs-nav-active-border)]"
            aria-label={`Read ${data.title} menu larger`}
          >
            {Icon && <Icon size={inFocus ? 18 : 14} className={quadrantTheme.accent} />}
            <h2 className={`${inFocus ? 'text-base' : 'text-sm'} font-barDisplay font-bold uppercase tracking-[0.2em] ${quadrantTheme.accent}`}>
              {data.title}
            </h2>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {Icon && <Icon size={inFocus ? 18 : 14} className={quadrantTheme.accent} />}
            <h2 className={`${inFocus ? 'text-base' : 'text-sm'} font-barDisplay font-bold uppercase tracking-[0.2em] ${quadrantTheme.accent}`}>
              {data.title}
            </h2>
          </div>
        )}
      </div>

      <div className={`px-5 ${inFocus ? 'py-5' : 'py-4'}`}>
        {data.sections.map((section, si) => (
          <div key={`${section.name}-${si}`} className={si < data.sections.length - 1 ? 'mb-5' : ''}>
            {/* Section header */}
            <div className={`flex items-center gap-1 mb-2 pl-2 border-l-2 ${quadrantTheme.border}`}>
              {isAdmin ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <Button type="button" variant="muted" size="iconSm" iconOnly onClick={() => onMoveSection(id, si, 'up')} disabled={si === 0}><ChevronUp size={10} /></Button>
                    <Button type="button" variant="muted" size="iconSm" iconOnly onClick={() => onMoveSection(id, si, 'down')} disabled={si === data.sections.length - 1}><ChevronDown size={10} /></Button>
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
                  <Button type="button" variant="dangerGhost" size="iconSm" iconOnly onClick={() => onRemoveSection(id, si)} className="ml-1">
                    <Trash2 size={11} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`${sectionLabel} font-barDisplay font-bold uppercase ${theme.text}`}>
                    {section.name}
                  </span>
                  {section.note && (
                    <span className={`${sectionNote} uppercase tracking-wider ${theme.textMuted}`}>
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
                className={`flex justify-between items-start gap-2 ${
                  ii < section.items.length - 1 ? `border-b ${borderMuted}` : ''
                }`}
                style={{ paddingTop: 'var(--fs-menu-item-padding-y)', paddingBottom: 'var(--fs-menu-item-padding-y)' }}
              >
                {isAdmin && (
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <Button type="button" variant="muted" size="iconSm" iconOnly onClick={() => onMoveItem(id, si, ii, 'up')} disabled={ii === 0}><ChevronUp size={10} /></Button>
                    <Button type="button" variant="muted" size="iconSm" iconOnly onClick={() => onMoveItem(id, si, ii, 'down')} disabled={ii === section.items.length - 1}><ChevronDown size={10} /></Button>
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
                      {item.isAddon && <span className={`text-sm ${theme.textMuted}`}>+</span>}
                      <span
                        className={`uppercase ${item.isAddon ? `${theme.textMuted} font-normal` : `${theme.text} font-bold`}`}
                        style={{ fontSize: 'var(--fs-menu-item-font-size)' }}
                      >
                        {item.name}
                      </span>
                      {item.isNew && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white bg-red-600 px-1.5 py-0.5">NEW</span>
                      )}
                      {item.description && (
                        <p className={`${itemDescription} italic w-full ${theme.textMuted}`}>{item.description}</p>
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
                      <Button type="button" variant="dangerGhost" size="iconSm" iconOnly onClick={() => onRemoveItem(id, si, ii)} className="mt-0.5">
                        <Trash2 size={12} />
                      </Button>
                    </>
                  ) : (
                    <span className={`font-bold whitespace-nowrap ${quadrantTheme.accent}`} style={{ fontSize: 'var(--fs-menu-item-font-size)' }}>
                      ${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Add item button */}
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onAddItem(id, si)}
                className={`mt-2 ${quadrantTheme.accent} opacity-50 hover:opacity-100 normal-case`}
              >
                <Plus size={10} /> Add Item
              </Button>
            )}
          </div>
        ))}

        {/* Add section button */}
        {isAdmin && (
          <Button
            type="button"
            variant="dashed"
            size="xs"
            onClick={() => onAddSection(id)}
            className="mt-3"
          >
            <Plus size={10} /> Add Section
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quadrant;
