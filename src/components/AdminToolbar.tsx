import React, { useState, useEffect } from 'react';
import { Save, Printer, History, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { Theme } from '../theme';

interface AdminToolbarProps {
  theme: Theme;
  isDirty: boolean;
  lastSaved: Date | null;
  onSave: (note: string) => Promise<void>;
  onDiscard: () => void;
  onPrint: () => void;
  onHistory: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  theme, isDirty, lastSaved, onSave, onDiscard, onPrint, onHistory,
}) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isDirty) setExpanded(true);
  }, [isDirty]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(note);
    setNote('');
    setSaving(false);
    setSavedFlash(true);
    setExpanded(false);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const bg = theme.isDark ? 'bg-slate-900 border-slate-700' : theme.mode === 'mbta' ? 'bg-[#231F20] border-[#DA291C]' : 'bg-white border-slate-300';
  const mutedText = theme.isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`fixed bottom-4 right-4 z-50 border-2 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] ${bg} min-w-[200px]`}>
      {/* Dirty indicator bar */}
      {isDirty && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border-b border-amber-500/30">
          <AlertCircle size={10} className="text-amber-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Unsaved changes</span>
        </div>
      )}

      {savedFlash && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border-b border-emerald-500/30">
          <Check size={10} className="text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Saved!</span>
        </div>
      )}

      {/* Save note input (when expanded/dirty) */}
      {expanded && isDirty && (
        <div className="px-3 pt-2 pb-1">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Version note (optional)..."
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className={`w-full text-[10px] bg-transparent border-b border-dashed focus:outline-none ${theme.isDark ? 'border-white/30 text-white placeholder:text-white/30' : 'border-black/30 placeholder:text-black/30'} ${theme.text}`}
          />
        </div>
      )}

      {/* Button row */}
      <div className="flex items-center p-1.5 gap-1">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          title="Save & create version"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all border ${
            isDirty
              ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
              : `${mutedText} border-transparent cursor-not-allowed opacity-40`
          }`}
        >
          <Save size={11} />
          {saving ? 'Saving…' : 'Save'}
        </button>

        <button
          onClick={onDiscard}
          disabled={!isDirty}
          title="Discard unsaved changes"
          className={`p-1.5 border transition-all ${
            isDirty
              ? `${theme.isDark ? 'border-slate-600 text-white hover:border-slate-400' : 'border-slate-300 text-slate-700 hover:border-slate-500'}`
              : 'border-transparent opacity-40 cursor-not-allowed'
          } ${mutedText}`}
        >
          <RotateCcw size={13} />
        </button>

        <div className={`w-px h-5 mx-0.5 ${theme.isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <button
          onClick={onPrint}
          title="Print / Export PDF"
          className={`p-1.5 border transition-all ${theme.isDark ? 'border-slate-600 text-white hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'}`}
        >
          <Printer size={13} />
        </button>

        <button
          onClick={onHistory}
          title="Version history"
          className={`p-1.5 border transition-all ${theme.isDark ? 'border-slate-600 text-white hover:border-blue-500 hover:text-blue-400' : 'border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-700'}`}
        >
          <History size={13} />
        </button>
      </div>

      {/* Last saved timestamp */}
      {lastSaved && !isDirty && (
        <div className={`px-3 py-1 border-t text-[8px] ${theme.isDark ? 'border-slate-700' : 'border-slate-200'} ${mutedText}`}>
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
