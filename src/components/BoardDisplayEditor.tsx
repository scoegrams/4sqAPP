import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { DisplayBoardConfig } from '../types';
import {
  BOARD_COLOR_PRESETS,
  getBoardDisplayUrl,
  boardBackgroundPositionCss,
  boardOverlayCss,
  resolveBoardBackgroundUrl,
  withAlpha,
} from '../lib/boardDisplay';

interface BoardDisplayEditorProps {
  board: DisplayBoardConfig;
  onUpdate: (field: keyof DisplayBoardConfig, value: string | number) => void;
}

const inputClass =
  'w-full px-3 py-2 text-sm border-2 border-[#c4beb5] bg-white focus:outline-none focus:border-[#2d3d2d]';
const labelClass = 'block text-[10px] font-bold uppercase tracking-wider text-[#5c564d] mb-1';

const BoardDisplayEditor: React.FC<BoardDisplayEditorProps> = ({ board, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const boardUrl = getBoardDisplayUrl();
  const previewBg = resolveBoardBackgroundUrl(board);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link for your TV or tablet:', boardUrl);
    }
  };

  const applyPreset = (accent: string, highlight: string) => {
    onUpdate('accentColor', accent);
    onUpdate('highlightColor', highlight);
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-[#5c564d] leading-relaxed">
        Full-screen TV at <code className="text-[10px] bg-white px-1 border border-[#c4beb5]">#board</code>.
        Customize background and colors, then save.
      </p>

      {/* Live mini preview */}
      <div
        className="relative h-28 rounded border-2 border-[#c4beb5] overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${previewBg})`,
            backgroundSize: board.backgroundFit,
            backgroundPosition: boardBackgroundPositionCss(board.backgroundPosition),
          }}
        />
        <div className="absolute inset-0" style={{ background: boardOverlayCss(board.overlayStrength) }} />
        <div className="relative z-10 p-3 flex flex-col justify-end h-full">
          <p className="text-[9px] font-barDisplay font-bold uppercase tracking-widest text-white/80">Preview</p>
          <p className="text-sm font-barDisplay font-bold uppercase" style={{ color: board.accentColor }}>
            Today&apos;s special
          </p>
          <p className="text-[10px] font-barDisplay font-bold uppercase" style={{ color: board.highlightColor }}>
            Coming up
          </p>
        </div>
      </div>

      <fieldset className="space-y-3 border-0 p-0">
        <legend className={labelClass}>Background</legend>

        <div>
          <label className={labelClass}>Image URL</label>
          <input
            type="url"
            value={board.backgroundImageUrl}
            onChange={(e) => onUpdate('backgroundImageUrl', e.target.value)}
            placeholder="https://… game day photo"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Fallback image URL (optional)</label>
          <input
            type="url"
            value={board.fallbackImageUrl}
            onChange={(e) => onUpdate('fallbackImageUrl', e.target.value)}
            placeholder="Leave blank for /4square.jpg"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fit</label>
            <select
              value={board.backgroundFit}
              onChange={(e) => onUpdate('backgroundFit', e.target.value)}
              className={inputClass}
            >
              <option value="cover">Cover (fill screen)</option>
              <option value="contain">Contain (full image)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Focus</label>
            <select
              value={board.backgroundPosition}
              onChange={(e) => onUpdate('backgroundPosition', e.target.value)}
              className={inputClass}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Dark overlay — {board.overlayStrength}%
            <span className="font-normal normal-case tracking-normal text-[#8a847a] ml-1">(text readability)</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={board.overlayStrength}
            onChange={(e) => onUpdate('overlayStrength', Number(e.target.value))}
            className="w-full accent-[#2d3d2d]"
          />
          <div className="flex justify-between text-[9px] text-[#8a847a] mt-0.5">
            <span>Show photo</span>
            <span>Dark scrim</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3 border-0 p-0">
        <legend className={labelClass}>Colors</legend>

        <div className="flex flex-wrap gap-1.5">
          {BOARD_COLOR_PRESETS.map(({ label, accent, highlight }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(accent, highlight)}
              className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-2 border-[#c4beb5] bg-white hover:border-[#2d3d2d] transition-colors"
              title={`${accent} / ${highlight}`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: accent }} />
              <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: highlight }} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Accent — prices &amp; weekly</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={board.accentColor}
                onChange={(e) => onUpdate('accentColor', e.target.value)}
                className="h-9 w-12 shrink-0 cursor-pointer border border-[#c4beb5]"
              />
              <input
                type="text"
                value={board.accentColor}
                onChange={(e) => onUpdate('accentColor', e.target.value)}
                className={`${inputClass} flex-1 font-mono text-xs`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Highlight — coming up</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={board.highlightColor}
                onChange={(e) => onUpdate('highlightColor', e.target.value)}
                className="h-9 w-12 shrink-0 cursor-pointer border border-[#c4beb5]"
              />
              <input
                type="text"
                value={board.highlightColor}
                onChange={(e) => onUpdate('highlightColor', e.target.value)}
                className={`${inputClass} flex-1 font-mono text-xs`}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <div>
        <label className={labelClass}>Tagline</label>
        <input
          type="text"
          value={board.tagline}
          onChange={(e) => onUpdate('tagline', e.target.value)}
          placeholder="Restaurant & Bar · Wed–Sat"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-2 border-[#2d3d2d] bg-[#e8e4dc] text-[#2d3d2d] hover:bg-[#ddd8cf] transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy board link'}
        </button>
        <a
          href={boardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-2 border-[#c4beb5] bg-white text-[#2d3d2d] hover:border-[#2d3d2d] transition-colors"
        >
          <ExternalLink size={13} /> Open board
        </a>
      </div>

      <p className="text-[10px] text-[#8a847a]">
        Marquee events use <span style={{ color: withAlpha(board.highlightColor, 1) }}>highlight</span> color.
        Save after changes so the TV picks them up on refresh.
      </p>
    </div>
  );
};

export default BoardDisplayEditor;
