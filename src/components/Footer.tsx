import React, { useRef, useState } from 'react';
import { MapPin, Phone, Clock, Pencil } from 'lucide-react';
import { Special } from '../types';
import { specialsForDisplay } from '../lib/specials';
import { Theme } from '../theme';
import { dayTagClass } from '../lib/dayTagColors';

import { JACKPOT_SECRET_TAP_KEY } from '../lib/jackpotPinAuth';

interface FooterProps {
  specials: Special[];
  openHours: string;
  theme: Theme;
  isAdmin: boolean;
  onUpdateSpecial: (idx: number, field: string, value: string | number) => void;
  onOpenSpecialsEditor?: () => void;
  onGoJackpot?: () => void;
}

const Footer: React.FC<FooterProps> = ({
  specials,
  openHours,
  theme,
  isAdmin,
  onUpdateSpecial,
  onOpenSpecialsEditor,
  onGoJackpot,
}) => {
  const displaySpecials = specialsForDisplay(specials);
  const doubled = [...displaySpecials, ...displaySpecials];
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();
  const [secretTapProgress, setSecretTapProgress] = useState(0);

  const tickerTextClass = theme.isDark
    ? 'text-[color:var(--fs-footer-marquee-text-dark)]'
    : 'text-[color:var(--fs-footer-marquee-text-light)]';

  const handleSecretTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setSecretTapProgress(0);
      try {
        sessionStorage.setItem(JACKPOT_SECRET_TAP_KEY, '1');
      } catch {
        /* ignore */
      }
      onGoJackpot?.();
    } else {
      setSecretTapProgress(tapCount.current);
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
        setSecretTapProgress(0);
      }, 2000);
    }
  };

  return (
    <div className={`z-20 transition-colors duration-300 ${theme.footerBg} ${theme.footerBorder}`}>
      <div className="overflow-hidden whitespace-nowrap border-b border-inherit">
        <div className="flex items-center">
          <button
            type="button"
            onClick={isAdmin ? onOpenSpecialsEditor : undefined}
            className={`shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-2 border-r border-inherit text-[8px] sm:text-[9px] font-barDisplay font-bold uppercase tracking-wider sm:tracking-widest ${tickerTextClass} ${
              isAdmin
                ? 'hover:opacity-80 transition-opacity cursor-pointer'
                : 'cursor-default'
            }`}
          >
            Daily Schedule
            {isAdmin && <Pencil size={8} className="opacity-60 shrink-0" aria-hidden />}
          </button>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track">
              {doubled.map((s, i) => {
                const sourceIdx = specials.findIndex(
                  (sp) => (sp.id && sp.id === s.id) || (sp.day === s.day && sp.dish === s.dish),
                );
                const idx = sourceIdx >= 0 ? sourceIdx : i % displaySpecials.length;
                return (
                <div key={`${s.day}-${s.id ?? i}-${i}`} className="flex items-center shrink-0 pr-1">
                  <span
                    className={`${dayTagClass(s.day)} text-white text-[8px] sm:text-[9px] font-barDisplay font-bold uppercase tracking-wider sm:tracking-widest px-1.5 sm:px-2 py-0.5 sm:py-1 mx-1.5 sm:mx-2`}
                  >
                    {s.day}
                  </span>
                  {isAdmin ? (
                    <>
                      <input
                        value={s.dish}
                        onChange={(e) => onUpdateSpecial(idx, 'dish', e.target.value)}
                        className={`text-xs font-bold bg-transparent border-b border-dashed w-24 focus:outline-none ${tickerTextClass} border-[color:var(--fs-footer-marquee-input-border)]`}
                      />
                      <span className="text-xs font-barDisplay font-bold ml-1 text-[color:var(--fs-footer-price-accent)]">$</span>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) =>
                          onUpdateSpecial(idx, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="text-xs font-barDisplay font-bold bg-transparent border-b border-dashed w-10 focus:outline-none text-[color:var(--fs-footer-price-accent)] border-[color:var(--fs-footer-marquee-input-border)]"
                      />
                    </>
                  ) : (
                    <span className={`text-xs font-barDisplay font-bold uppercase tracking-wider ${tickerTextClass}`}>
                      {s.dish}{' '}
                      <span className="text-[color:var(--fs-footer-price-accent)]">${s.price}</span>
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-2.5 safe-bottom">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-5 sm:gap-y-1 text-center sm:text-left max-w-lg sm:max-w-none mx-auto">
          <p className={`flex items-center justify-center sm:justify-start gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] leading-tight ${theme.textMuted}`}>
            <MapPin size={9} className="shrink-0" aria-hidden />
            <span>16 Commercial St, Braintree MA</span>
          </p>
          <p className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] ${theme.textMuted}`}>
            <span className="inline-flex items-center gap-1">
              <Phone size={9} className="shrink-0" aria-hidden />
              781-848-4448
            </span>
            <span className="opacity-40 select-none" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={9} className="shrink-0" aria-hidden />
              <span className="normal-case font-semibold tracking-normal">Open: {openHours}</span>
            </span>
          </p>
          <button
            type="button"
            onClick={handleSecretTap}
            className={`relative text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] select-none focus:outline-none sm:ml-0 transition-all ${
              secretTapProgress > 0
                ? 'text-[color:var(--fs-footer-price-accent)] opacity-100 scale-105'
                : `${theme.textMuted} opacity-80 hover:opacity-100`
            }`}
            aria-label="Four Square"
          >
            Four Square
            {secretTapProgress > 0 && secretTapProgress < 5 && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-barDisplay font-bold tracking-wider text-[color:var(--fs-footer-price-accent)] whitespace-nowrap"
                aria-live="polite"
              >
                {secretTapProgress}/5
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
