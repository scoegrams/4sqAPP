import React, { useRef } from 'react';
import { MapPin, Phone, Clock, Pencil } from 'lucide-react';
import { Special } from '../types';
import { Theme } from '../theme';

interface FooterProps {
  specials: Special[];
  openHours: string;
  theme: Theme;
  isAdmin: boolean;
  onUpdateSpecial: (idx: number, field: string, value: string | number) => void;
  onOpenSpecialsEditor?: () => void;
  onGoJackpot?: () => void;
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

const Footer: React.FC<FooterProps> = ({
  specials,
  openHours,
  theme,
  isAdmin,
  onUpdateSpecial,
  onOpenSpecialsEditor,
  onGoJackpot,
}) => {
  const doubled = [...specials, ...specials];
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();

  const tickerTextClass = theme.isDark
    ? 'text-[color:var(--fs-footer-marquee-text-dark)]'
    : 'text-[color:var(--fs-footer-marquee-text-light)]';

  const handleSecretTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      onGoJackpot?.();
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 2000);
    }
  };

  return (
    <div className={`z-20 transition-colors duration-300 ${theme.footerBg} ${theme.footerBorder}`}>
      <div className="overflow-hidden whitespace-nowrap border-b border-inherit">
        <div className="flex items-center">
          <button
            onClick={isAdmin ? onOpenSpecialsEditor : undefined}
            className={`shrink-0 px-4 py-3 sm:py-2 font-black text-[9px] uppercase tracking-[0.2em] border-r flex items-center gap-1.5 transition-all min-h-[44px] sm:min-h-0 text-white border-[color:var(--fs-footer-schedule-border)] bg-[var(--fs-footer-schedule-bg)] hover:bg-[var(--fs-footer-schedule-hover-bg)] ${
              !isAdmin ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            Daily Schedule
            {isAdmin && <Pencil size={8} className="opacity-70" />}
          </button>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track">
              {doubled.map((s, i) => (
                <div key={`${s.day}-${i}`} className="flex items-center shrink-0 pr-1">
                  <span
                    className={`${DAY_COLORS[s.day] || 'bg-slate-600'} text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 mx-2`}
                  >
                    {s.day}
                  </span>
                  {isAdmin ? (
                    <>
                      <input
                        value={s.dish}
                        onChange={(e) => onUpdateSpecial(i % specials.length, 'dish', e.target.value)}
                        className={`text-xs font-bold bg-transparent border-b border-dashed w-24 focus:outline-none ${tickerTextClass} border-[color:var(--fs-footer-marquee-input-border)]`}
                      />
                      <span className="text-xs font-black ml-1 text-[color:var(--fs-footer-price-accent)]">$</span>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) =>
                          onUpdateSpecial(i % specials.length, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="text-xs font-black bg-transparent border-b border-dashed w-10 focus:outline-none text-[color:var(--fs-footer-price-accent)] border-[color:var(--fs-footer-marquee-input-border)]"
                      />
                    </>
                  ) : (
                    <span className={`text-xs font-black uppercase tracking-wider ${tickerTextClass}`}>
                      {s.dish}{' '}
                      <span className="text-[color:var(--fs-footer-price-accent)]">${s.price}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 py-3 sm:py-1.5 safe-bottom">
        <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] ${theme.textMuted}`}>
          <MapPin size={10} />
          16 Commercial Street, Braintree MA
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] ${theme.textMuted}`}>
          <Phone size={10} />
          781-848-4448
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] ${theme.textMuted}`}>
          <Clock size={10} />
          Open: {openHours}
        </div>
        <button
          type="button"
          onClick={handleSecretTap}
          className={`text-[9px] font-bold uppercase tracking-[0.15em] select-none focus:outline-none ${theme.textMuted}`}
          aria-hidden="true"
          tabIndex={-1}
        >
          Four Square
        </button>
      </div>
    </div>
  );
};

export default Footer;
