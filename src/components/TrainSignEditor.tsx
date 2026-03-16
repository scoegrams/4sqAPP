import React from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';

interface TrainSignEditorProps {
  isOpen: boolean;
  events: TrainSignEvent[];
  theme: Theme;
  onUpdate: (idx: number, field: keyof TrainSignEvent, value: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: 'up' | 'down') => void;
  onClose: () => void;
}

const TrainSignEditor: React.FC<TrainSignEditorProps> = ({
  isOpen, events, theme, onUpdate, onAdd, onRemove, onMove, onClose,
}) => {
  const isDark = theme.isDark || theme.mode === 'apple';
  const panelBg = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out border-l-2 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${panelBg} ${borderColor}`}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${borderColor} shrink-0`}>
          <span className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>
            Sign events
          </span>
          <button onClick={onClose} className={theme.textMuted}><X size={16} /></button>
        </div>
        <div className="p-3 text-[10px] text-center border-b border-inherit shrink-0">
          <p className={theme.textMuted}>
            Main sign (Weymouth Landing) shows 45s, then each event 5s, then repeats.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
          {events.map((evt, i) => (
            <div
              key={evt.id}
              className={`p-3 border ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-center gap-1 mb-2">
                <div className="flex flex-col">
                  <button type="button" onClick={() => onMove(i, 'up')} disabled={i === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp size={12} /></button>
                  <button type="button" onClick={() => onMove(i, 'down')} disabled={i === events.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown size={12} /></button>
                </div>
                <input
                  value={evt.emoji}
                  onChange={e => onUpdate(i, 'emoji', e.target.value)}
                  placeholder="🎤"
                  className="w-10 text-center text-lg bg-transparent border-b border-dashed focus:outline-none border-inherit"
                />
                <input
                  value={evt.title}
                  onChange={e => onUpdate(i, 'title', e.target.value)}
                  placeholder="KARAOKE WEDNESDAY"
                  className={`flex-1 min-w-0 text-[11px] font-bold uppercase tracking-wider bg-transparent border-b border-dashed focus:outline-none ${isDark ? 'border-white/25 text-white' : 'border-black/25'}`}
                />
                <button type="button" onClick={() => onRemove(i)} className="text-red-500/60 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            className={`w-full py-2 border border-dashed text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${isDark ? 'border-white/30 text-white/60 hover:text-white hover:border-white/50' : 'border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400'}`}
          >
            <Plus size={12} /> Add event
          </button>
        </div>
      </div>
    </>
  );
};

export default TrainSignEditor;
