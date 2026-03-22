import React, { useRef } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Printer, ImagePlus, X } from 'lucide-react';
import { FONT_HAMON } from '../../fontTokens';
import { Theme } from '../../theme';
import { ChalkboardData, ChalkboardSpecial } from '../../types';

interface SpecialsPageProps {
  theme: Theme;
  data: ChalkboardData;
  isAdmin: boolean;
  onUpdateMeta: (field: 'title' | 'price' | 'subtitle', value: string) => void;
  onUpdateItem: (idx: number, field: keyof ChalkboardSpecial, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onMoveItem: (idx: number, dir: 'up' | 'down') => void;
  onPrintChalkboard: () => void;
}

const CHALK_WHITE = '#f5f5f5';
const CHALK_MINT = '#9ED3C7';
const CHALK_GRAY = '#c0c0c0';
const BOARD_BG = '#2b2b2b';

const CHALK_SMUDGES = [
  { top: '8%', left: '5%', w: 120, h: 40, rot: -8, opacity: 0.018 },
  { top: '35%', right: '3%', w: 90, h: 50, rot: 12, opacity: 0.015 },
  { top: '62%', left: '8%', w: 150, h: 30, rot: -3, opacity: 0.02 },
  { top: '85%', right: '10%', w: 80, h: 60, rot: 6, opacity: 0.012 },
];

const ITEM_ROTATIONS = [-0.4, 0.3, -0.2, 0.5, -0.3, 0.4];

const ItemPhotoSquares: React.FC<{
  image?: string;
  isAdmin: boolean;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}> = ({ image, isAdmin, onUpload, onRemove }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onUpload(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (image) {
    return (
      <div className="relative shrink-0">
        <div className="relative w-28 sm:w-36 aspect-square rounded-lg overflow-hidden shadow-lg shadow-black/30">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: `${BOARD_BG}70` }} />
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: `${BOARD_BG}70` }} />
          </div>
        </div>
        {isAdmin && (
          <button onClick={onRemove} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 transition-colors">
            <X size={12} />
          </button>
        )}
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="shrink-0">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-28 sm:w-36 aspect-square rounded-lg flex flex-col items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
        style={{ border: `2px dashed ${CHALK_MINT}30`, background: `${CHALK_MINT}06` }}
        title="Add photo"
      >
        <ImagePlus size={22} style={{ color: `${CHALK_MINT}60` }} className="group-hover:scale-110 transition-transform" />
        <span className="font-bar text-xs font-normal" style={{ color: `${CHALK_GRAY}80` }}>
          Add photo
        </span>
      </button>
    </div>
  );
};

const SpecialsPage: React.FC<SpecialsPageProps> = ({
  theme, data, isAdmin,
  onUpdateMeta, onUpdateItem, onAddItem, onRemoveItem, onMoveItem,
  onPrintChalkboard,
}) => {
  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: BOARD_BG }}>

      {/* Chalk texture — grain + smudges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 15% 8%, rgba(255,255,255,0.025) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 90%, rgba(255,255,255,0.015) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(158,211,199,0.008) 0%, transparent 60%),
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)
        `,
      }} />

      {/* Chalk dust smudge patches */}
      {CHALK_SMUDGES.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: s.top, left: s.left, right: (s as Record<string, unknown>).right as string | undefined,
            width: s.w, height: s.h,
            transform: `rotate(${s.rot}deg)`,
            background: `radial-gradient(ellipse, rgba(255,255,255,${s.opacity}) 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      ))}

      {/* Wooden ledge at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-3" style={{
        background: 'linear-gradient(to bottom, #3d3530, #2a221e)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
      }} />

      <div className="relative px-4 sm:px-8 pt-8 pb-16 max-w-3xl mx-auto">

        {/* Print button */}
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onPrintChalkboard}
              className="flex items-center gap-2 px-5 py-2.5 font-bar text-sm font-normal tracking-widest uppercase transition-all active:scale-95 hover:scale-[1.02] rounded-lg"
              style={{ color: CHALK_MINT, border: `2px solid ${CHALK_MINT}40`, background: 'rgba(158,211,199,0.06)' }}
            >
              <Printer size={15} />
              Preview & Print
            </button>
          </div>
        )}

        {/* ═══ TITLE BLOCK ═══ */}
        <div className="text-center mb-3 relative">
          {/* Hand-drawn underline smudge */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1" style={{
            background: `linear-gradient(90deg, transparent 5%, ${CHALK_MINT}18 20%, ${CHALK_MINT}25 50%, ${CHALK_MINT}18 80%, transparent 95%)`,
            filter: 'blur(1px)',
          }} />

          {isAdmin ? (
            <input
              value={data.title}
              onChange={(e) => onUpdateMeta('title', e.target.value)}
              className="bg-transparent border-none text-center w-full focus:outline-none"
              style={{ fontFamily: FONT_HAMON, fontWeight: 700, fontSize: 'clamp(52px, 10vw, 80px)', color: CHALK_WHITE, textShadow: '2px 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.03)', lineHeight: 1 }}
            />
          ) : (
            <h1 style={{
              fontFamily: FONT_HAMON, fontWeight: 700, fontSize: 'clamp(52px, 10vw, 80px)',
              color: CHALK_WHITE, margin: 0, lineHeight: 1,
              textShadow: '2px 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.03)',
            }}>
              {data.title}
            </h1>
          )}
        </div>

        {/* Brand squares */}
        <div className="flex gap-1 justify-center mb-5">
          {[CHALK_MINT, CHALK_WHITE, CHALK_WHITE, CHALK_MINT].map((c, i) => (
            <div key={i} className="w-2 h-2" style={{ backgroundColor: c, opacity: 0.3 }} />
          ))}
        </div>

        {/* ═══ PRICE BANNER ═══ */}
        <div className="text-center mb-2 relative">
          {/* Chalk highlight bar behind text */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[85%] rounded-md" style={{
            background: `linear-gradient(90deg, transparent, ${CHALK_MINT}08, ${CHALK_MINT}10, ${CHALK_MINT}08, transparent)`,
          }} />
          {isAdmin ? (
            <input
              value={data.price}
              onChange={(e) => onUpdateMeta('price', e.target.value)}
              className="bg-transparent border-none text-center w-full focus:outline-none relative"
              style={{ fontFamily: FONT_HAMON, fontWeight: 700, fontSize: 'clamp(28px, 6vw, 44px)', color: CHALK_MINT, letterSpacing: '4px', textTransform: 'uppercase', textShadow: `0 0 25px ${CHALK_MINT}25, 2px 2px 6px rgba(0,0,0,0.3)` }}
            />
          ) : (
            <h2 className="relative" style={{
              fontFamily: FONT_HAMON, fontWeight: 700, fontSize: 'clamp(28px, 6vw, 44px)',
              color: CHALK_MINT, margin: 0, letterSpacing: '4px',
              textTransform: 'uppercase',
              textShadow: `0 0 25px ${CHALK_MINT}25, 2px 2px 6px rgba(0,0,0,0.3)`,
            }}>
              {data.price}
            </h2>
          )}
        </div>

        {/* Subtitle */}
        <div className="text-center mb-2">
          {isAdmin ? (
            <input
              value={data.subtitle}
              onChange={(e) => onUpdateMeta('subtitle', e.target.value)}
              className="bg-transparent border-none text-center w-full focus:outline-none"
              style={{ fontFamily: FONT_HAMON, fontWeight: 400, fontSize: 'clamp(16px, 3vw, 22px)', color: CHALK_GRAY, letterSpacing: '5px', textTransform: 'uppercase' }}
            />
          ) : (
            <p style={{
              fontFamily: FONT_HAMON, fontWeight: 400, fontSize: 'clamp(16px, 3vw, 22px)',
              color: CHALK_GRAY, margin: 0, letterSpacing: '5px', textTransform: 'uppercase',
            }}>
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Date + day-of-week indicator */}
        {(() => {
          const now = new Date();
          const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const jsDay = now.getDay();
          const dayMap: Record<number, number> = { 3: 0, 4: 1, 5: 2, 6: 3, 0: 4 };
          const activeIdx = dayMap[jsDay] ?? -1;
          const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          return (
            <div className="mt-5 mb-2 text-center">
              <p className="font-bar text-sm font-normal tracking-[3px] mb-3" style={{ color: `${CHALK_GRAY}70` }}>
                {dateStr}
              </p>
              <div className="flex justify-center gap-3 sm:gap-5">
                {days.map((d, i) => {
                  const isToday = i === activeIdx;
                  return (
                    <div key={d} className="flex flex-col items-center gap-1">
                      <span
                        className="font-bar text-sm sm:text-base font-normal uppercase tracking-widest"
                        style={{
                          color: isToday ? CHALK_MINT : `${CHALK_GRAY}50`,
                          textShadow: isToday ? `0 0 12px ${CHALK_MINT}30` : 'none',
                        }}
                      >
                        {d}
                      </span>
                      {isToday && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHALK_MINT, boxShadow: `0 0 6px ${CHALK_MINT}60` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Big chalk divider */}
        <div className="my-8 relative">
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${CHALK_WHITE}12 25%, ${CHALK_WHITE}20 50%, ${CHALK_WHITE}12 75%, transparent 95%)` }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="flex gap-[5px] items-center">
              {[CHALK_GRAY, CHALK_GRAY, CHALK_GRAY, CHALK_GRAY].map((c, i) => (
                <div key={i} className="w-2 h-2" style={{ backgroundColor: c, opacity: 0.18 }} />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SPECIALS ITEMS ═══ */}
        <div className="space-y-8 sm:space-y-10">
          {data.items.map((item, idx) => {
            const rot = ITEM_ROTATIONS[idx % ITEM_ROTATIONS.length];
            return (
              <div key={item.id} className="relative group" style={{ transform: `rotate(${rot}deg)` }}>

                {/* Admin controls — float left */}
                {isAdmin && (
                  <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => onMoveItem(idx, 'up')} className="p-1 hover:opacity-100 opacity-60 transition-opacity">
                      <ChevronUp size={16} color={CHALK_GRAY} />
                    </button>
                    <button onClick={() => onRemoveItem(idx)} className="p-1 hover:opacity-100 opacity-60 transition-opacity">
                      <Trash2 size={13} color="#e57373" />
                    </button>
                    <button onClick={() => onMoveItem(idx, 'down')} className="p-1 hover:opacity-100 opacity-60 transition-opacity">
                      <ChevronDown size={16} color={CHALK_GRAY} />
                    </button>
                  </div>
                )}

                {/* Item card */}
                <div
                  className="rounded-xl px-5 sm:px-8 py-6 sm:py-8 relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${CHALK_WHITE}08`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Chalk smudge glow per card */}
                  <div className="absolute -top-4 -right-4 w-32 h-32 pointer-events-none" style={{
                    background: `radial-gradient(ellipse, ${CHALK_MINT}04 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                  }} />

                  <div className={`flex items-center gap-6 sm:gap-8 relative ${!item.image && !isAdmin ? 'flex-col text-center' : ''}`}>

                    {/* Photo */}
                    <ItemPhotoSquares
                      image={item.image}
                      isAdmin={isAdmin}
                      onUpload={(dataUrl) => onUpdateItem(idx, 'image', dataUrl)}
                      onRemove={() => onUpdateItem(idx, 'image', '')}
                    />

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      {isAdmin ? (
                        <>
                          <input
                            value={item.heading}
                            onChange={(e) => onUpdateItem(idx, 'heading', e.target.value)}
                            className={`bg-transparent border-none w-full focus:outline-none ${item.image ? 'text-left' : 'text-center'}`}
                            style={{
                              fontFamily: FONT_HAMON,
                              fontWeight: 700,
                              fontSize: 'clamp(22px, 4vw, 34px)',
                              color: CHALK_WHITE,
                              letterSpacing: '2px',
                              textTransform: 'uppercase',
                              textShadow: '1px 1px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.02)',
                            }}
                            placeholder="Heading..."
                          />
                          <input
                            value={item.description}
                            onChange={(e) => onUpdateItem(idx, 'description', e.target.value)}
                            className={`bg-transparent border-none w-full focus:outline-none mt-2 ${item.image ? 'text-left' : 'text-center'}`}
                            style={{
                              fontFamily: FONT_HAMON,
                              fontWeight: 400,
                              fontSize: 'clamp(16px, 2.5vw, 20px)',
                              color: CHALK_GRAY,
                              letterSpacing: '1px',
                            }}
                            placeholder="Description..."
                          />
                        </>
                      ) : (
                        <>
                          <h3 style={{
                            fontFamily: FONT_HAMON,
                            fontWeight: 700,
                            fontSize: 'clamp(22px, 4vw, 34px)',
                            color: CHALK_WHITE,
                            margin: '0 0 8px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            textShadow: '1px 1px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.02)',
                          }}>
                            {item.heading}
                          </h3>
                          <p style={{
                            fontFamily: FONT_HAMON,
                            fontWeight: 400,
                            fontSize: 'clamp(16px, 2.5vw, 20px)',
                            color: CHALK_GRAY,
                            margin: 0, letterSpacing: '1px', lineHeight: 1.6,
                          }}>
                            {item.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add special */}
        {isAdmin && (
          <button
            onClick={onAddItem}
            className="w-full mt-8 py-4 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl"
            style={{
              fontFamily: FONT_HAMON,
              fontWeight: 400,
              fontSize: '18px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              border: `2px dashed ${CHALK_GRAY}25`,
              color: CHALK_GRAY,
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <Plus size={18} />
            Add Special
          </button>
        )}

        {/* Bottom — address & flourish */}
        <div className="mt-12 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${CHALK_WHITE}10, transparent)` }} />
            <div className="flex gap-3 items-center">
              <div className="flex gap-[5px] items-center">
                {[CHALK_GRAY, CHALK_GRAY, CHALK_GRAY, CHALK_GRAY].map((c, i) => (
                  <div key={i} className="w-2 h-2" style={{ backgroundColor: c, opacity: 0.18 }} />
                ))}
              </div>            </div>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${CHALK_WHITE}10, transparent)` }} />
          </div>

          <div className="text-center space-y-1.5">
            <p className="font-bar text-sm font-normal tracking-[2px]" style={{ color: `${CHALK_WHITE}55` }}>
              16 Commercial Street · Weymouth Landing · Braintree, MA
            </p>
            <p className="font-bar text-sm font-normal tracking-[2px]" style={{ color: `${CHALK_MINT}60` }}>
              foursquare.bar &nbsp;·&nbsp; 781-848-4448
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {[CHALK_MINT, CHALK_WHITE, CHALK_MINT, CHALK_WHITE, CHALK_MINT].map((c, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: c, opacity: 0.15 + (i % 2) * 0.1 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialsPage;
