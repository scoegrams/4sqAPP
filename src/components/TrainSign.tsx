import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../theme';
import { TrainSignEvent } from '../types';

const MAIN_DURATION_MS = 45 * 1000;
const EVENT_DURATION_MS = 5 * 1000;

interface TrainSignProps {
  theme: Theme;
  events: TrainSignEvent[];
  isAdmin?: boolean;
  onEditClick?: () => void;
}

const TrainSign: React.FC<TrainSignProps> = ({ theme, events, isAdmin, onEditClick }) => {
  const [phase, setPhase] = useState<'main' | 'event'>('main');
  const [eventIndex, setEventIndex] = useState(0);
  const [scrollKey, setScrollKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isApple = theme.mode === 'apple';

  useEffect(() => {
    const run = () => {
      if (phase === 'main') {
        timeoutRef.current = setTimeout(() => {
          if (events.length === 0) {
            timeoutRef.current = setTimeout(run, MAIN_DURATION_MS);
            return;
          }
          setEventIndex(0);
          setScrollKey((k) => k + 1);
          setPhase('event');
          timeoutRef.current = setTimeout(run, EVENT_DURATION_MS);
        }, MAIN_DURATION_MS);
        return;
      }

      if (phase === 'event') {
        if (eventIndex < events.length - 1) {
          setEventIndex((i) => i + 1);
          setScrollKey((k) => k + 1);
          timeoutRef.current = setTimeout(run, EVENT_DURATION_MS);
        } else {
          setPhase('main');
          timeoutRef.current = setTimeout(run, MAIN_DURATION_MS);
        }
      }
    };

    timeoutRef.current = setTimeout(run, phase === 'main' ? MAIN_DURATION_MS : EVENT_DURATION_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, eventIndex, events.length]);

  const containerClass = `hidden md:flex flex-col items-end justify-center leading-tight px-3 py-1.5 font-bold uppercase overflow-hidden min-h-[2.5rem] ${
    isApple
      ? 'bg-white/[0.07] text-white border border-white/15'
      : theme.isDark
      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
      : theme.mode === 'modern'
      ? 'bg-[#2b6777] text-white border border-[#2b6777]'
      : 'bg-black/[0.06] border border-slate-300/40 ' + theme.text
  }`;

  const currentEvent = phase === 'event' && events[eventIndex] ? events[eventIndex] : null;

  return (
    <button
      type="button"
      onClick={isAdmin ? onEditClick : undefined}
      className={`${containerClass} ${isAdmin ? 'cursor-pointer hover:opacity-90 transition-opacity' : 'cursor-default'}`}
      title={isAdmin ? 'Edit sign events' : undefined}
    >
      {phase === 'main' ? (
        <div key="main" className="flex flex-col items-end animate-fade-in text-left">
          <span className={`text-[7px] tracking-[0.3em] ${isApple ? 'text-white/50' : theme.textMuted}`}>GREENBUSH LINE · QUINCY CTR</span>
          <span className={`text-[11px] font-bold tracking-[0.12em] leading-tight mt-0.5 ${isApple ? 'text-white' : theme.isDark ? 'text-emerald-400' : theme.mode === 'modern' ? 'text-white' : theme.text}`}>WEYMOUTH LANDING / E. BRAINTREE</span>
          <span className={`text-[7px] tracking-[0.3em] mt-0.5 ${isApple ? 'text-[#0071e3]' : theme.isDark ? 'text-emerald-400' : theme.mode === 'modern' ? 'text-white/90' : theme.quadrantGreen.accent}`}>ZONE 2 · $7.50</span>
        </div>
      ) : currentEvent ? (
        <div
          key={scrollKey}
          className={`flex flex-col items-end animate-slide-up text-[10px] tracking-[0.15em] whitespace-nowrap ${isApple ? 'text-[#0071e3]' : theme.isDark ? 'text-emerald-400' : theme.mode === 'modern' ? 'text-white' : theme.text}`}
        >
          {currentEvent.emoji} {currentEvent.title}
        </div>
      ) : null}
    </button>
  );
};

export default TrainSign;
