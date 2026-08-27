import React, { useMemo } from 'react';
import { X, CalendarDays, Plus, Trash2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import type { ChalkboardData, Special } from '../types';
import { Theme } from '../theme';
import { SPECIAL_DAYS, duplicateSpecialDays } from '../lib/specials';
import { dayTagClass } from '../lib/dayTagColors';
import Button from './ui/Button';

interface SpecialsEditorProps {
  isOpen: boolean;
  specials: Special[];
  meta: Pick<ChalkboardData, 'title' | 'price' | 'subtitle'>;
  openHours: string;
  isDirty?: boolean;
  onUpdateOpenHours: (value: string) => void;
  onUpdateMeta: (field: 'title' | 'price' | 'subtitle', value: string) => void;
  theme: Theme;
  onUpdate: (idx: number, field: keyof Special, value: string | number) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: 'up' | 'down') => void;
  onClose: () => void;
}

const META_LABELS: Record<'title' | 'price' | 'subtitle', string> = {
  title: 'Board title',
  price: 'Price line',
  subtitle: 'Hours / subtitle',
};

const SpecialsEditor: React.FC<SpecialsEditorProps> = ({
  isOpen,
  specials,
  meta,
  openHours,
  isDirty,
  onUpdateOpenHours,
  onUpdateMeta,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
  onClose,
  theme,
}) => {
  const isDark = theme.isDark || theme.mode === 'apple';
  const panelBg = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const inputBorder = isDark ? 'border-white/25 text-white placeholder:text-white/30' : 'border-black/25 placeholder:text-black/30';
  const dupDays = useMemo(() => duplicateSpecialDays(specials), [specials]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-[min(22rem,92vw)] z-50 transform transition-transform duration-300 ease-in-out border-r-2 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${panelBg} ${borderColor}`}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${borderColor} shrink-0`}>
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={14} className={`shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-barDisplay font-bold uppercase tracking-widest truncate ${theme.text}`}>
              Lunch specials
            </span>
          </div>
          <button type="button" onClick={onClose} className={theme.textMuted} aria-label="Close editor">
            <X size={16} />
          </button>
        </div>

        {isDirty && (
          <div className={`flex items-start gap-2 px-4 py-2 border-b ${isDark ? 'border-amber-500/30 bg-amber-950/40' : 'border-amber-200 bg-amber-50'}`}>
            <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
            <p className={`text-[10px] leading-snug ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              Unsaved — use <strong>Save version</strong> on the admin panel so guests see your changes.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          <p className={`text-[10px] leading-relaxed ${theme.textMuted}`}>
            Powers the footer ticker, Specials chalkboard, About page, and print PDF.
          </p>

          <div className={`p-3 border space-y-3 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Chalkboard header</p>
            {(['title', 'price', 'subtitle'] as const).map((field) => (
              <div key={field}>
                <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>
                  {META_LABELS[field]}
                </label>
                <input
                  value={meta[field]}
                  onChange={(e) => onUpdateMeta(field, e.target.value)}
                  className={`w-full mt-0.5 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${theme.text}`}
                />
              </div>
            ))}
          </div>

          <div className={`p-3 border ${isDark ? 'border-emerald-700/50 bg-emerald-950/30' : 'border-emerald-200 bg-emerald-50/80'}`}>
            <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Open hours</label>
            <input
              value={openHours}
              onChange={e => onUpdateOpenHours(e.target.value)}
              placeholder="4PM–1AM · Wed through Sat"
              className={`w-full mt-1 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${theme.text}`}
            />
          </div>

          {dupDays.length > 0 && (
            <div className={`p-2.5 border text-[10px] ${isDark ? 'border-red-500/40 text-red-300 bg-red-950/30' : 'border-red-200 text-red-700 bg-red-50'}`}>
              Duplicate days: {dupDays.join(', ')} — only one special per day shows clearly on the board.
            </div>
          )}

          {specials.map((s, i) => (
            <div key={s.id ?? `${s.day}-${i}`} className={`p-3 border relative ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <select
                  value={s.day}
                  onChange={(e) => onUpdate(i, 'day', e.target.value)}
                  className={`text-[9px] font-barDisplay font-bold uppercase tracking-widest px-2 py-1 border-0 ${dayTagClass(s.day)} text-white`}
                >
                  {[...SPECIAL_DAYS, 'Sun', 'Mon', 'Tue'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => onMove(i, 'up')} disabled={i === 0} className={`p-1 disabled:opacity-30 ${theme.textMuted}`} aria-label="Move up">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => onMove(i, 'down')} disabled={i === specials.length - 1} className={`p-1 disabled:opacity-30 ${theme.textMuted}`} aria-label="Move down">
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => onRemove(i)} disabled={specials.length <= 1} className="p-1 text-red-500 disabled:opacity-30" aria-label="Remove special">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Dish</label>
                  <input
                    value={s.dish}
                    onChange={e => onUpdate(i, 'dish', e.target.value)}
                    className={`w-full mt-0.5 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${theme.text}`}
                  />
                </div>
                <div>
                  <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Description</label>
                  <textarea
                    value={s.description ?? ''}
                    onChange={e => onUpdate(i, 'description', e.target.value)}
                    rows={2}
                    className={`w-full mt-0.5 text-xs bg-transparent border-b border-dashed focus:outline-none resize-y ${inputBorder} ${theme.text}`}
                  />
                </div>
                <div>
                  <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Price</label>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={s.price}
                      onChange={e => onUpdate(i, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-20 mt-0.5 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="dashed" size="xs" onClick={onAdd} className="border-slate-400">
            <Plus size={12} /> Add special
          </Button>
        </div>

        <div className={`px-4 py-3 border-t-2 ${borderColor} shrink-0 space-y-2`}>
          <p className={`text-[9px] ${theme.textMuted}`}>
            Add photos on the <strong>Specials</strong> page while in admin mode.
          </p>
        </div>
      </div>
    </>
  );
};

export default SpecialsEditor;
