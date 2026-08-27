import React, { useEffect, useState } from 'react';
import FourSquares from '../FourSquares';
import { DisplayBoardConfig, Special, TrainSignEvent } from '../../types';
import { specialForToday, specialsForDisplay } from '../../lib/specials';
import {
  boardBackgroundPositionCss,
  boardOverlayCss,
  resolveBoardBackgroundUrl,
  withAlpha,
} from '../../lib/boardDisplay';

interface BoardDisplayPageProps {
  board: DisplayBoardConfig;
  specials: Special[];
  events: TrainSignEvent[];
  openHours: string;
  specialsHeadline: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BoardDisplayPage: React.FC<BoardDisplayPageProps> = ({
  board,
  specials,
  events,
  openHours,
  specialsHeadline,
}) => {
  const now = new Date();
  const todayShort = DAY_SHORT[now.getDay()];
  const todayName = DAY_NAMES[now.getDay()];
  const todaySpecial = specialForToday(specials, now);
  const weekSpecials = specialsForDisplay(specials);
  const [eventIndex, setEventIndex] = useState(0);

  const accent = board.accentColor;
  const highlight = board.highlightColor;
  const bgUrl = resolveBoardBackgroundUrl(board);

  useEffect(() => {
    if (events.length <= 1) return;
    const id = window.setInterval(() => {
      setEventIndex((i) => (i + 1) % events.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [events.length]);

  const activeEvent = events[eventIndex] ?? events[0];

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden select-none" style={{ backgroundColor: '#0a0f0d', color: '#fff' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: board.backgroundFit,
          backgroundPosition: boardBackgroundPositionCss(board.backgroundPosition),
          backgroundRepeat: 'no-repeat',
          transform: board.backgroundFit === 'cover' ? 'scale(1.03)' : undefined,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{ background: boardOverlayCss(board.overlayStrength) }}
        aria-hidden
      />

      <div className="relative z-10 h-full flex flex-col p-[clamp(1.25rem,3vw,2.5rem)] pb-[clamp(1rem,2.5vw,2rem)]">
        <header className="flex items-start justify-between gap-4 shrink-0 mb-[clamp(1rem,3vh,2rem)]">
          <div>
            <p
              className="font-barDisplay font-bold leading-[0.88] tracking-[0.06em] text-[clamp(1.75rem,4.5vw,2.75rem)]"
              aria-label="Four Square"
            >
              <span className="block">FOUR</span>
              <span className="block">SQUARE</span>
            </p>
            <FourSquares unit="0.22em" className="mt-1 opacity-90" />
            <p
              className="mt-2 text-[clamp(0.65rem,1.4vw,0.85rem)] uppercase tracking-[0.25em] font-barDisplay font-bold"
              style={{ color: withAlpha(accent, 0.75) }}
            >
              {board.tagline}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[clamp(0.6rem,1.2vw,0.75rem)] uppercase tracking-[0.2em] text-white/50 font-barDisplay font-bold">
              {todayName}
            </p>
            <p
              className="text-[clamp(0.75rem,1.5vw,0.95rem)] font-barDisplay font-bold tracking-wide"
              style={{ color: withAlpha(accent, 0.95) }}
            >
              {openHours}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[clamp(1rem,3vw,2rem)]">
          <section className="flex flex-col justify-center min-h-0">
            <p
              className="text-[clamp(0.65rem,1.3vw,0.8rem)] uppercase tracking-[0.35em] font-barDisplay font-bold mb-2"
              style={{ color: accent }}
            >
              {todaySpecial ? `Today · ${todayShort}` : 'This week'}
            </p>
            {todaySpecial ? (
              <div className="space-y-[clamp(0.5rem,1.5vh,1rem)]">
                <h1
                  className="font-barDisplay font-bold uppercase leading-[0.95] tracking-[0.04em] text-[clamp(2rem,6.5vw,4.5rem)]"
                  style={{ textShadow: '0 4px 24px rgba(0,0,0,0.45)' }}
                >
                  {todaySpecial.dish}
                </h1>
                <p className="text-[clamp(1.75rem,4vw,3rem)] font-barDisplay font-bold" style={{ color: accent }}>
                  ${todaySpecial.price % 1 === 0 ? todaySpecial.price : todaySpecial.price.toFixed(2)}
                </p>
                {todaySpecial.description && (
                  <p className="max-w-xl text-[clamp(0.95rem,2vw,1.25rem)] leading-snug text-white/75">
                    {todaySpecial.description}
                  </p>
                )}
                <p className="text-[clamp(0.7rem,1.2vw,0.85rem)] uppercase tracking-[0.2em] text-white/45 font-barDisplay font-bold pt-1">
                  {specialsHeadline}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h1 className="font-barDisplay font-bold uppercase text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.06em] text-white/90">
                  {specialsHeadline}
                </h1>
                <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] text-white/65 max-w-lg">
                  We&apos;re closed Mon–Tue. Lunch specials run Wed–Sat — see this week below.
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)] min-h-0">
            {events.length > 0 && (
              <section
                className="rounded-lg border bg-black/35 backdrop-blur-sm p-[clamp(0.85rem,2vw,1.25rem)] flex-1 flex flex-col justify-center"
                style={{ borderColor: withAlpha(highlight, 0.35) }}
                aria-live="polite"
              >
                <p
                  className="text-[clamp(0.55rem,1.1vw,0.7rem)] uppercase tracking-[0.3em] font-barDisplay font-bold mb-3"
                  style={{ color: withAlpha(highlight, 0.95) }}
                >
                  Coming up
                </p>
                {activeEvent && (
                  <div key={activeEvent.id} className="board-event-enter flex items-start gap-3">
                    <span className="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none" aria-hidden>
                      {activeEvent.emoji}
                    </span>
                    <p className="font-barDisplay font-bold uppercase tracking-[0.06em] leading-tight text-[clamp(1.1rem,2.8vw,1.75rem)]">
                      {activeEvent.title}
                    </p>
                  </div>
                )}
                {events.length > 1 && (
                  <div className="flex gap-1.5 mt-4">
                    {events.map((e, i) => (
                      <span
                        key={e.id}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: i === eventIndex ? '1.5rem' : '0.5rem',
                          backgroundColor: i === eventIndex ? accent : 'rgba(255,255,255,0.25)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section
              className="rounded-lg p-[clamp(0.75rem,1.8vw,1rem)] shrink-0"
              style={{
                border: `1px solid ${withAlpha(accent, 0.35)}`,
                backgroundColor: withAlpha(accent, 0.12),
              }}
            >
              <p
                className="text-[clamp(0.55rem,1vw,0.65rem)] uppercase tracking-[0.25em] font-barDisplay font-bold mb-2"
                style={{ color: withAlpha(accent, 0.85) }}
              >
                Weekly lunch
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {weekSpecials.map((s) => {
                  const isToday = s.day === todayShort;
                  return (
                    <li
                      key={s.id ?? s.day}
                      className="flex items-baseline justify-between gap-2 text-[clamp(0.7rem,1.4vw,0.85rem)]"
                      style={{ color: isToday ? withAlpha(accent, 0.95) : 'rgba(255,255,255,0.7)' }}
                    >
                      <span className="font-barDisplay font-bold uppercase tracking-wide truncate">
                        <span className="text-white/45 mr-1">{s.day}</span>
                        {s.dish}
                      </span>
                      <span className="font-barDisplay font-bold shrink-0" style={{ color: accent }}>
                        ${s.price}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDisplayPage;
