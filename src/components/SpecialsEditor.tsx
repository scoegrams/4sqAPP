import React from 'react';
import { X, CalendarDays } from 'lucide-react';
import { Special } from '../types';
import { Theme } from '../theme';

interface SpecialsEditorProps {
  isOpen: boolean;
  specials: Special[];
  openHours: string;
  onUpdateOpenHours: (value: string) => void;
  theme: Theme;
  onUpdate: (idx: number, field: keyof Special, value: string | number) => void;
  onClose: () => void;
}

const DAY_COLORS: Record<string, string> = {
  Mon: 'bg-blue-600',
  Tue: 'bg-teal-600',
  Wed: 'bg-emerald-600',
  Thu: 'bg-orange-600',
  Fri: 'bg-red-600',
  Sat: 'bg-purple-600',
  Sun: 'bg-rose-600',
};

const SpecialsEditor: React.FC<SpecialsEditorProps> = ({ isOpen, specials, openHours, onUpdateOpenHours, theme, onUpdate, onClose }) => {
  const isDark = theme.isDark || theme.mode === 'apple';
  const panelBg = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const inputBorder = isDark ? 'border-white/25 text-white placeholder:text-white/30' : 'border-black/25 placeholder:text-black/30';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out border-r-2 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${panelBg} ${borderColor}`}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${borderColor} shrink-0`}>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
            <span className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>Daily Specials</span>
          </div>
          <button onClick={onClose} className={theme.textMuted}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          <div className={`p-3 border ${isDark ? 'border-emerald-700/50 bg-emerald-950/30' : 'border-emerald-200 bg-emerald-50/80'}`}>
            <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>We're open (hours text)</label>
            <input
              value={openHours}
              onChange={e => onUpdateOpenHours(e.target.value)}
              placeholder="e.g. 4-1am Wed thru Saturday"
              className={`w-full mt-1 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${theme.text}`}
            />
          </div>
          {specials.map((s, i) => (
            <div key={s.day} className={`p-3 border ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${DAY_COLORS[s.day] || 'bg-slate-600'} text-white text-[9px] font-black uppercase tracking-widest px-2 py-1`}>
                  {s.day}
                </span>
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
                  <label className={`text-[8px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Price</label>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>$</span>
                    <input
                      type="number"
                      value={s.price}
                      onChange={e => onUpdate(i, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-20 mt-0.5 text-sm font-bold bg-transparent border-b border-dashed focus:outline-none ${inputBorder} ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`px-4 py-3 border-t-2 ${borderColor} shrink-0`}>
          <p className={`text-[9px] ${theme.textMuted}`}>Changes auto-apply to the display and PDF.</p>
        </div>
      </div>
    </>
  );
};

export default SpecialsEditor;
