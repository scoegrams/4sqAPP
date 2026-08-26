import React, { useState, useEffect } from 'react';
import { Save, Printer, History, RotateCcw, Check, AlertCircle, PencilLine } from 'lucide-react';
import { Theme } from '../theme';
import Button from './ui/Button';

interface AdminToolbarProps {
  theme: Theme;
  isDirty: boolean;
  lastSaved: Date | null;
  onSave: (note: string) => Promise<void>;
  onDiscard: () => void;
  onPrint: () => void;
  onChalkboard: () => void;
  onHistory: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  theme, isDirty, lastSaved, onSave, onDiscard, onPrint, onChalkboard, onHistory,
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

  const bg = theme.isDark ? 'bg-slate-900 border-slate-700' : theme.mode === 'apple' ? 'bg-[#1d1d1f] border-[#3a3a3c]' : 'bg-white border-slate-300';
  const mutedText = theme.isDark ? 'text-slate-400' : 'text-slate-500';
  const iconBtnClass = theme.isDark
    ? 'border-slate-600 text-white hover:border-slate-400'
    : 'border-slate-300 text-slate-700 hover:border-slate-500';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 border-2 min-w-[200px] ${bg}`}
      style={{ borderRadius: 'var(--fs-radius)', boxShadow: 'var(--fs-card-shadow)' }}
    >
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

      <div className="flex items-center p-1.5 gap-1">
        <Button
          onClick={handleSave}
          disabled={saving || !isDirty}
          loading={saving}
          title="Save & create version"
          size="xs"
          className={
            isDirty
              ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 border-2'
              : `${mutedText} border-transparent`
          }
        >
          <Save size={11} />
          {saving ? 'Saving…' : 'Save'}
        </Button>

        <Button
          onClick={onDiscard}
          disabled={!isDirty}
          variant="secondary"
          size="iconSm"
          iconOnly
          title="Discard unsaved changes"
          className={isDirty ? iconBtnClass : 'border-transparent opacity-40'}
        >
          <RotateCcw size={13} />
        </Button>

        <div className={`w-px h-5 mx-0.5 ${theme.isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <Button
          onClick={onPrint}
          variant="secondary"
          size="iconSm"
          iconOnly
          title="Print / Export PDF"
          className={`${iconBtnClass} hover:border-emerald-500 hover:text-emerald-400`}
        >
          <Printer size={13} />
        </Button>

        <Button
          onClick={onChalkboard}
          variant="secondary"
          size="iconSm"
          iconOnly
          title="Chalkboard Specials"
          className={`${iconBtnClass} hover:border-amber-500 hover:text-amber-400`}
        >
          <PencilLine size={13} />
        </Button>

        <Button
          onClick={onHistory}
          variant="secondary"
          size="iconSm"
          iconOnly
          title="Version history"
          className={`${iconBtnClass} hover:border-blue-500 hover:text-blue-400`}
        >
          <History size={13} />
        </Button>
      </div>

      {lastSaved && !isDirty && (
        <div className={`px-3 py-1 border-t text-[8px] ${theme.isDark ? 'border-slate-700' : 'border-slate-200'} ${mutedText}`}>
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
