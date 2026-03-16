import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Clock, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { MenuVersion } from '../types';
import { Theme } from '../theme';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: MenuVersion) => void;
  theme: Theme;
}

function summarizeChanges(a: MenuVersion, b: MenuVersion): string[] {
  const lines: string[] = [];
  // Count items
  const countItems = (m: MenuVersion['menu']) =>
    Object.values(m).reduce((acc: number, q) => acc + q.sections.reduce((s: number, sec: { items: unknown[] }) => s + sec.items.length, 0), 0);
  const countSpecials = (v: MenuVersion) => v.specials.length;

  const aItems = countItems(a.menu);
  const bItems = countItems(b.menu);
  if (aItems !== bItems) lines.push(`Menu items: ${aItems} → ${bItems}`);

  // Check for price changes (spot check first 5 items)
  let priceChanges = 0;
  (Object.keys(a.menu) as (keyof typeof a.menu)[]).forEach(key => {
    a.menu[key].sections.forEach((sec, si) => {
      sec.items.forEach((item, ii) => {
        const bItem = b.menu[key]?.sections[si]?.items[ii];
        if (bItem && item.price !== bItem.price) priceChanges++;
      });
    });
  });
  if (priceChanges > 0) lines.push(`${priceChanges} price change${priceChanges > 1 ? 's' : ''}`);

  if (lines.length === 0) lines.push('Minor edits');
  return lines;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ isOpen, onClose, onRestore, theme }) => {
  const [versions, setVersions] = useState<MenuVersion[]>([]);
  const [selected, setSelected] = useState<MenuVersion | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<MenuVersion | null>(null);

  useEffect(() => {
    if (isOpen) {
      db.menu_versions.orderBy('timestamp').reverse().limit(50).toArray().then(setVersions);
    }
  }, [isOpen]);

  const handleRestore = (v: MenuVersion) => {
    onRestore(v);
    setRestoreConfirm(null);
    onClose();
  };

  const isDark = theme.isDark || theme.mode === 'apple';
  const panelBg = isDark ? 'bg-slate-900' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50';
  const selectedBg = isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300';

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
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${borderColor} shrink-0`}>
          <div className="flex items-center gap-2">
            <Clock size={14} className={theme.isDark ? 'text-blue-400' : 'text-blue-600'} />
            <span className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>Version History</span>
          </div>
          <button onClick={onClose} className={theme.textMuted}>
            <X size={16} />
          </button>
        </div>

        {versions.length === 0 ? (
          <div className={`flex-1 flex items-center justify-center text-center px-6 ${theme.textMuted}`}>
            <div>
              <Clock size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest">No saved versions yet</p>
              <p className="text-[10px] mt-1">Save changes to create a version snapshot.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {versions.map((v, idx) => {
              const isSelected = selected?.id === v.id;
              const prevVersion = idx < versions.length - 1 ? versions[idx + 1] : v;
              const summary = summarizeChanges(prevVersion, v);

              return (
                <div key={v.id}>
                  <button
                    onClick={() => setSelected(isSelected ? null : v)}
                    className={`w-full text-left px-4 py-3 border-b transition-all ${borderColor} ${rowHover} ${isSelected ? selectedBg + ' border-l-2' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold ${theme.text} truncate`}>
                          {v.note || `Version ${(v.id ?? 0)}`}
                        </p>
                        <p className={`text-[9px] mt-0.5 ${theme.textMuted}`}>
                          {new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}
                          {new Date(v.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {summary.map((s, i) => (
                            <span key={i} className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${isDark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'}`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight size={12} className={`${theme.textMuted} mt-0.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded restore action */}
                  {isSelected && (
                    <div className={`px-4 py-3 border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      {restoreConfirm?.id === v.id ? (
                        <div className="space-y-2">
                          <p className={`text-[10px] font-bold ${theme.text}`}>
                            This will replace your current unsaved state. Continue?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestore(v)}
                              className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => setRestoreConfirm(null)}
                              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-colors ${isDark ? 'border-slate-600 text-white/60 hover:text-white' : 'border-slate-300 text-slate-500 hover:text-slate-700'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRestoreConfirm(v)}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          <RotateCcw size={10} />
                          Restore this version
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={`px-4 py-2 border-t-2 ${borderColor} shrink-0`}>
          <p className={`text-[9px] ${theme.textMuted}`}>{versions.length} version{versions.length !== 1 ? 's' : ''} stored locally</p>
        </div>
      </div>
    </>
  );
};

export default VersionHistory;
