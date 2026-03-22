import React from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { FONT_HAMON } from '../fontTokens';
import { ChalkboardData } from '../types';

interface ChalkboardSpecialsProps {
  data: ChalkboardData;
  isAdmin: boolean;
  onUpdateMeta: (field: 'title' | 'price' | 'subtitle', value: string) => void;
  onUpdateItem: (idx: number, field: 'heading' | 'description', value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onMoveItem: (idx: number, dir: 'up' | 'down') => void;
  onClose: () => void;
}

const CHALK_WHITE = '#f5f5f5';
const CHALK_MINT = '#9ED3C7';
const CHALK_GRAY = '#d8d8d8';
const BOARD_BG = '#2b2b2b';
const BOARD_DARK = '#222222';

const ChalkboardSpecials: React.FC<ChalkboardSpecialsProps> = ({
  data, isAdmin,
  onUpdateMeta, onUpdateItem, onAddItem, onRemoveItem, onMoveItem,
  onClose,
}) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[999] overflow-auto" style={{ background: '#111' }}>
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between px-6 py-3 sticky top-0 z-10"
        style={{ background: '#0f0f0f', borderBottom: '1px solid #333' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: CHALK_MINT, fontFamily: FONT_HAMON }}>
            Chalkboard Specials
          </span>
          <span
            className="text-[11px] tracking-[4px] uppercase font-normal"
            style={{ color: '#666', fontFamily: FONT_HAMON }}
          >
            Print Preview — 8.5 × 11"
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint}
            className="px-5 py-2 text-[11px] font-bold uppercase tracking-[2px]"
            style={{ background: CHALK_MINT, color: BOARD_BG, border: 'none', cursor: 'pointer', fontFamily: FONT_HAMON }}
          >
            Print / Save PDF
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-[2px]"
            style={{ background: '#333', color: '#999', border: 'none', cursor: 'pointer', fontFamily: FONT_HAMON }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Board */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px 48px' }}>
        <div
          id="chalk-root"
          style={{
            width: '8.5in',
            minHeight: '11in',
            background: BOARD_BG,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Chalk texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.02) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.015) 0%, transparent 40%),
              repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)
            `,
          }} />

          {/* Inner border (chalk frame) */}
          <div style={{
            position: 'absolute',
            top: '16px', left: '16px', right: '16px', bottom: '16px',
            border: `2px solid ${CHALK_GRAY}33`,
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', padding: '0.6in 0.65in' }}>

            {/* Bar name — script chalk */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              {isAdmin ? (
                <input
                  value={data.title}
                  onChange={(e) => onUpdateMeta('title', e.target.value)}
                  className="bg-transparent border-none text-center w-full focus:outline-none"
                  style={{ fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '56px', color: CHALK_WHITE, lineHeight: 1.1 }}
                />
              ) : (
                <h1 style={{
                  fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '56px',
                  color: CHALK_WHITE, margin: 0, lineHeight: 1.1,
                  textShadow: '0 0 10px rgba(255,255,255,0.05)',
                }}>
                  {data.title}
                </h1>
              )}
            </div>

            {/* Price banner — mint chalk */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              {isAdmin ? (
                <input
                  value={data.price}
                  onChange={(e) => onUpdateMeta('price', e.target.value)}
                  className="bg-transparent border-none text-center w-full focus:outline-none"
                  style={{ fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '38px', color: CHALK_MINT, letterSpacing: '3px', textTransform: 'uppercase' }}
                />
              ) : (
                <h2 style={{
                  fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '38px',
                  color: CHALK_MINT, margin: 0, letterSpacing: '3px',
                  textTransform: 'uppercase',
                  textShadow: '0 0 15px rgba(158,211,199,0.15)',
                }}>
                  {data.price}
                </h2>
              )}
            </div>

            {/* Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              {isAdmin ? (
                <input
                  value={data.subtitle}
                  onChange={(e) => onUpdateMeta('subtitle', e.target.value)}
                  className="bg-transparent border-none text-center w-full focus:outline-none"
                  style={{ fontFamily: FONT_HAMON, fontWeight: 400, fontSize: '18px', color: CHALK_GRAY, letterSpacing: '4px', textTransform: 'uppercase' }}
                />
              ) : (
                <p style={{
                  fontFamily: FONT_HAMON, fontWeight: 400, fontSize: '18px',
                  color: CHALK_GRAY, margin: 0, letterSpacing: '4px',
                  textTransform: 'uppercase',
                }}>
                  {data.subtitle}
                </p>
              )}
            </div>

            {/* Chalk divider */}
            <div style={{
              height: '2px', margin: '0 auto 36px',
              width: '70%',
              background: `linear-gradient(90deg, transparent, ${CHALK_GRAY}30, ${CHALK_WHITE}20, ${CHALK_GRAY}30, transparent)`,
            }} />

            {/* Special items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {data.items.map((item, idx) => (
                <div key={item.id} style={{ position: 'relative' }}>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="no-print" style={{
                      position: 'absolute', right: '-35px', top: '50%', transform: 'translateY(-50%)',
                      display: 'flex', flexDirection: 'column', gap: '2px',
                    }}>
                      <button onClick={() => onMoveItem(idx, 'up')} className="p-1 hover:opacity-100 opacity-50 transition-opacity">
                        <ChevronUp size={14} color={CHALK_GRAY} />
                      </button>
                      <button onClick={() => onRemoveItem(idx)} className="p-1 hover:opacity-100 opacity-50 transition-opacity">
                        <Trash2 size={12} color="#e57373" />
                      </button>
                      <button onClick={() => onMoveItem(idx, 'down')} className="p-1 hover:opacity-100 opacity-50 transition-opacity">
                        <ChevronDown size={14} color={CHALK_GRAY} />
                      </button>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    justifyContent: item.image ? 'flex-start' : 'center',
                  }}>
                    {/* Photo with hairline 4-square overlay */}
                    {item.image && (
                      <div style={{
                        position: 'relative',
                        width: '80px', height: '80px', flexShrink: 0,
                        borderRadius: '4px', overflow: 'hidden',
                      }}>
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: `${BOARD_BG}90` }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: `${BOARD_BG}90` }} />
                      </div>
                    )}

                    {/* Text content */}
                    <div style={{ textAlign: item.image ? 'left' : 'center', flex: 1 }}>
                      {/* Heading */}
                      {isAdmin ? (
                        <input
                          value={item.heading}
                          onChange={(e) => onUpdateItem(idx, 'heading', e.target.value)}
                          className="bg-transparent border-none w-full focus:outline-none"
                          style={{
                            fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '28px', color: CHALK_WHITE,
                            letterSpacing: '2px', textTransform: 'uppercase',
                            textAlign: item.image ? 'left' : 'center',
                          }}
                        />
                      ) : (
                        <h3 style={{
                          fontFamily: FONT_HAMON, fontWeight: 700, fontSize: '28px',
                          color: CHALK_WHITE, margin: '0 0 8px', letterSpacing: '2px',
                          textTransform: 'uppercase', lineHeight: 1.3,
                          textShadow: '0 0 8px rgba(255,255,255,0.04)',
                        }}>
                          {item.heading}
                        </h3>
                      )}

                      {/* Description */}
                      {isAdmin ? (
                        <input
                          value={item.description}
                          onChange={(e) => onUpdateItem(idx, 'description', e.target.value)}
                          className="bg-transparent border-none w-full focus:outline-none"
                          style={{
                            fontFamily: FONT_HAMON, fontWeight: 400, fontSize: '17px', color: CHALK_GRAY,
                            letterSpacing: '1px',
                            textAlign: item.image ? 'left' : 'center',
                          }}
                        />
                      ) : (
                        <p style={{
                          fontFamily: FONT_HAMON, fontWeight: 400, fontSize: '17px',
                          color: CHALK_GRAY, margin: 0, letterSpacing: '1px',
                          lineHeight: 1.5,
                          maxWidth: item.image ? '100%' : '80%',
                          marginLeft: item.image ? 0 : 'auto',
                          marginRight: item.image ? 0 : 'auto',
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chalk dot divider between items */}
                  {idx < data.items.length - 1 && (
                    <div style={{
                      display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '28px',
                    }}>
                      <span style={{ color: `${CHALK_GRAY}40`, fontSize: '10px' }}>✦</span>
                      <span style={{ color: `${CHALK_MINT}50`, fontSize: '8px', marginTop: '1px' }}>●</span>
                      <span style={{ color: `${CHALK_GRAY}40`, fontSize: '10px' }}>✦</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add item button (admin) */}
            {isAdmin && (
              <div className="no-print" style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  onClick={onAddItem}
                  className="inline-flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-100 opacity-60"
                  style={{ border: `1px dashed ${CHALK_GRAY}40`, color: CHALK_GRAY, fontFamily: FONT_HAMON, fontWeight: 400, fontSize: '15px', background: 'transparent', cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add special
                </button>
              </div>
            )}

            {/* Bottom chalk flourish */}
            <div style={{
              marginTop: '44px',
              height: '2px',
              width: '50%',
              margin: '44px auto 0',
              background: `linear-gradient(90deg, transparent, ${CHALK_GRAY}25, ${CHALK_MINT}20, ${CHALK_GRAY}25, transparent)`,
            }} />

            {/* Chalk dust dots at bottom */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px',
            }}>
              {[CHALK_MINT, CHALK_WHITE, CHALK_MINT, CHALK_WHITE].map((c, i) => (
                <div key={i} style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: c, opacity: 0.25,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChalkboardSpecials;
