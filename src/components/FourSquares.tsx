import React, { useState, useEffect, useRef } from 'react';

const LOGO_VAR_NAMES = ['--fs-logo-sq-0', '--fs-logo-sq-1', '--fs-logo-sq-2', '--fs-logo-sq-3'] as const;

type Phase = 'cycleIn' | 'hold' | 'cycleOut' | 'greenPop';

const CYCLE_MS = 350;
const HOLD_MS = 4000;
const POP_MS = 400;

const FourSquares: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('cycleIn');
  const [litCount, setLitCount] = useState(0);
  const [greenPop, setGreenPop] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const phaseRef = useRef(phase);
  const litCountRef = useRef(litCount);

  phaseRef.current = phase;
  litCountRef.current = litCount;

  useEffect(() => {
    const run = () => {
      const p = phaseRef.current;
      const n = litCountRef.current;

      if (p === 'cycleIn') {
        if (n < 4) {
          setLitCount((c) => c + 1);
          timeoutRef.current = setTimeout(run, CYCLE_MS);
        } else {
          setPhase('hold');
          timeoutRef.current = setTimeout(run, HOLD_MS);
        }
        return;
      }

      if (p === 'hold') {
        setPhase('cycleOut');
        setLitCount(4);
        timeoutRef.current = setTimeout(run, CYCLE_MS);
        return;
      }

      if (p === 'cycleOut') {
        if (n > 0) {
          setLitCount((c) => c - 1);
          timeoutRef.current = setTimeout(run, CYCLE_MS);
        } else {
          setPhase('greenPop');
          setGreenPop(true);
          timeoutRef.current = setTimeout(() => {
            setGreenPop(false);
            setPhase('cycleIn');
            setLitCount(0);
            timeoutRef.current = setTimeout(run, CYCLE_MS);
          }, POP_MS);
        }
        return;
      }

      if (p === 'greenPop') {
        // scheduled above
      }
    };

    timeoutRef.current = setTimeout(run, CYCLE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex gap-[3px]">
      {LOGO_VAR_NAMES.map((varName, i) => {
        const isLit = phase === 'cycleOut' ? i >= 4 - litCount : i < litCount;
        const showPop = greenPop && i === 0;

        return (
          <div
            key={varName}
            className="w-3.5 h-3.5 transition-all duration-300 ease-out"
            style={{
              backgroundColor: showPop
                ? 'var(--fs-logo-sq-pop)'
                : isLit
                  ? `var(${varName})`
                  : 'var(--fs-logo-sq-muted)',
              opacity: isLit || showPop ? 1 : 0.5,
              transform: showPop ? 'scale(1.35)' : 'scale(1)',
              boxShadow: showPop ? '0 0 8px var(--fs-logo-sq-pop)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default FourSquares;
