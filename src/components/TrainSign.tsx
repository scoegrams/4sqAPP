import React from 'react';
import { Theme } from '../theme';

interface TrainSignProps {
  theme: Theme;
}

const TrainSign: React.FC<TrainSignProps> = ({ theme }) => {
  const isMbta = theme.mode === 'mbta';

  return (
    <div
      className={`hidden md:flex flex-col items-end leading-tight px-3 py-1.5 font-bold uppercase ${
        isMbta
          ? 'bg-black text-[#FFC72C] border border-[#FFC72C]/40'
          : theme.isDark
          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
          : theme.mode === 'modern'
          ? 'bg-[#2b6777] text-white border border-[#2b6777]'
          : 'bg-slate-900 text-emerald-400 border border-slate-900'
      }`}
    >
      <span className="text-[7px] tracking-[0.3em] opacity-60">Greenbush Line</span>
      <span className="text-[10px] tracking-[0.15em]">Weymouth Landing / E. Braintree</span>
      <span className={`text-[7px] tracking-[0.3em] ${isMbta ? 'text-white/60' : 'opacity-60'}`}>Zone 1</span>
    </div>
  );
};

export default TrainSign;
