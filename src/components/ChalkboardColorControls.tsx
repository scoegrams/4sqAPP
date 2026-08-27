import React from 'react';
import type { ChalkboardData } from '../types';
import {
  CHALK_PALETTE,
  BOARD_BG_PALETTE,
  type ChalkboardMetaField,
} from '../lib/chalkboardTheme';

type MetaPick = Pick<ChalkboardData, 'accentColor' | 'backgroundColor' | 'invertText'>;

interface ChalkboardColorControlsProps {
  meta: MetaPick;
  onUpdateMeta: (field: ChalkboardMetaField, value: string | boolean) => void;
  mutedLabelColor?: string;
}

const Swatch: React.FC<{
  value: string;
  active: boolean;
  title: string;
  onClick: () => void;
}> = ({ value, active, title, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="transition-all active:scale-90 shrink-0"
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: value,
      border: active ? '2px solid white' : '2px solid transparent',
      boxShadow: active ? `0 0 0 1px ${value}, 0 0 8px ${value}60` : 'none',
      opacity: active ? 1 : 0.65,
    }}
  />
);

const ChalkboardColorControls: React.FC<ChalkboardColorControlsProps> = ({
  meta,
  onUpdateMeta,
  mutedLabelColor = '#888',
}) => {
  const accent = meta.accentColor ?? '#9ED3C7';
  const bg = meta.backgroundColor ?? '#2b2b2b';
  const invert = meta.invertText ?? false;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bar text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: mutedLabelColor }}>
          Chalk
        </span>
        <div className="flex gap-1.5 items-center">
          {CHALK_PALETTE.map(({ label, value }) => (
            <Swatch
              key={value}
              value={value}
              title={label}
              active={accent === value}
              onClick={() => onUpdateMeta('accentColor', value)}
            />
          ))}
          <label title="Custom chalk color" className="relative cursor-pointer shrink-0" style={{ width: 20, height: 20 }}>
            <input
              type="color"
              value={accent}
              onChange={(e) => onUpdateMeta('accentColor', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-5 h-5 rounded-full border flex items-center justify-center text-[7px] font-bold"
              style={{ borderColor: `${mutedLabelColor}80`, background: accent, color: invert ? '#141414' : '#2b2b2b' }}
            >
              +
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bar text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: mutedLabelColor }}>
          Board
        </span>
        <div className="flex gap-1.5 items-center">
          {BOARD_BG_PALETTE.map(({ label, value }) => (
            <Swatch
              key={value}
              value={value}
              title={label}
              active={bg === value}
              onClick={() => onUpdateMeta('backgroundColor', value)}
            />
          ))}
          <label title="Custom board color" className="relative cursor-pointer shrink-0" style={{ width: 20, height: 20 }}>
            <input
              type="color"
              value={bg}
              onChange={(e) => onUpdateMeta('backgroundColor', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-5 h-5 rounded-full border flex items-center justify-center text-[7px] font-bold"
              style={{ borderColor: `${mutedLabelColor}80`, background: bg, color: invert ? '#141414' : '#f5f5f5' }}
            >
              +
            </div>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={invert}
          onChange={(e) => onUpdateMeta('invertText', e.target.checked)}
          className="w-3.5 h-3.5 accent-[#9ED3C7]"
        />
        <span className="font-bar text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: mutedLabelColor }}>
          Invert text
        </span>
      </label>
    </div>
  );
};

export default ChalkboardColorControls;
