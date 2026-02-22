import React from 'react';
import { Theme } from '../theme';

interface BgColorPickerProps {
  theme: Theme;
  onColorChange: (color: string | null) => void;
  currentColor: string | null;
}

const PRESETS = [
  null,
  '#0f172a',
  '#1e293b',
  '#18181b',
  '#1c1917',
  '#1a1a2e',
  '#0c0a09',
  '#ffffff',
  '#f8fafc',
  '#f5f5f4',
  '#fef2f2',
  '#eff6ff',
  '#ecfdf5',
];

const BgColorPicker: React.FC<BgColorPickerProps> = ({ theme, onColorChange, currentColor }) => {
  return (
    <div className={`fixed bottom-4 left-4 z-50 p-3 border-2 shadow-lg ${theme.isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
      <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 ${theme.textMuted}`}>Background</p>
      <div className="flex flex-wrap gap-1.5 max-w-[160px]">
        {PRESETS.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 border-2 transition-all ${
              currentColor === color ? 'border-emerald-400 scale-110' : theme.isDark ? 'border-slate-600' : 'border-slate-300'
            }`}
            style={{ background: color || (theme.isDark ? '#020617' : '#f5f5f4') }}
            title={color || 'Theme default'}
          />
        ))}
      </div>
    </div>
  );
};

export default BgColorPicker;
