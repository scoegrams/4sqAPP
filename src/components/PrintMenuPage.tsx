import React, { useState } from 'react';
import { FONT_HAMON } from '../fontTokens';
import { MenuData, Special } from '../types';
import { useDesignTokens } from '../contexts/DesignTokensContext';

interface PrintMenuPageProps {
  menu: MenuData;
  specials: Special[];
  drinks: Record<string, { name: string; desc: string; price: number; tag?: string; featured?: boolean }[]>;
  onClose: () => void;
}

const SPECIALS_ITEMS = ['Burger', 'Steak Tips', 'Bar Pie'];

import { CANNED_BEERS } from '../data/drinksData';

const DRINK_LABELS: Record<string, string> = {
  draft:     'Draft Beer',
  cocktails: 'Cocktails',
  wine:      'Wine',
  seltzers:  'Seltzers & Cans',
};

const isSpecialItem = (name: string) =>
  SPECIALS_ITEMS.some(s => name.toLowerCase().includes(s.toLowerCase()));

type PrintMode = 'theme' | 'clean';

const PrintMenuPage: React.FC<PrintMenuPageProps> = ({ menu, specials, drinks, onClose }) => {
  const [printMode, setPrintMode] = useState<PrintMode>('theme');
  const { effectiveTokens } = useDesignTokens();

  const handlePrint = () => window.print();

  const displayFont = FONT_HAMON;
  const bodyFont    = FONT_HAMON;
  const gothicFont  = FONT_HAMON;

  // ── Build color palette from live design tokens ──────────────────────────
  // 'clean' = white page for ink-saving print, but keeps brand accent colors
  const isClean = printMode === 'clean';

  const C = {
    page:         isClean ? '#ffffff' : effectiveTokens.pageBg,
    pageText:     isClean ? '#0f172a' : effectiveTokens.pageText,
    cardBg:       isClean ? '#f8fafc' : effectiveTokens.cardBg,
    cardBorder:   isClean ? effectiveTokens.borderDefault : effectiveTokens.borderDefault,
    divider:      isClean ? '#e2e8f0' : effectiveTokens.dividerMuted,
    sectionLine:  isClean ? '#cbd5e1' : effectiveTokens.borderDefault,
    muted:        isClean ? '#64748b' : effectiveTokens.textMuted,
    subtle:       isClean ? '#94a3b8' : effectiveTokens.textMuted,
    green:        effectiveTokens.quadrantGreenAccent,
    greenBorder:  effectiveTokens.quadrantGreenBorder,
    blue:         effectiveTokens.quadrantBlueAccent,
    blueBorder:   effectiveTokens.quadrantBlueBorder,
    accent:       effectiveTokens.navActiveText,
    accentBorder: effectiveTokens.navActiveBorder,
    amber:        '#d97706',
    amberBorder:  '#b45309',
    red:          '#dc2626',
    redBorder:    '#991b1b',
    specialChip:  { bg: '#b45309', text: '#fff7ed' },
    previewBg:    isClean ? '#334155' : effectiveTokens.pageBg,
    headerFg:     effectiveTokens.navActiveText,
  };

  const SECTION_COLORS: Record<string, { accent: string; border: string }> = {
    apps:    { accent: C.green, border: C.greenBorder },
    mains:   { accent: C.blue,  border: C.blueBorder  },
    burgers: { accent: C.blue,  border: C.blueBorder  },
    healthy: { accent: C.green, border: C.greenBorder },
  };

  const DRINK_COLORS: Record<string, { accent: string; border: string }> = {
    draft:     { accent: C.blue,  border: C.blueBorder  },
    cocktails: { accent: C.amber, border: C.amberBorder },
    wine:      { accent: C.red,   border: C.redBorder   },
    seltzers:  { accent: C.green, border: C.greenBorder },
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-auto" style={{ background: isClean ? '#1e293b' : effectiveTokens.pageBg }}>

      <div className="no-print flex items-center justify-between px-6 py-3 sticky top-0 z-10" style={{ background: effectiveTokens.headerBg, borderBottom: `1px solid ${effectiveTokens.borderDefault}` }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: gothicFont, fontSize: '18px', color: C.accent, letterSpacing: '2px' }}>FOUR SQUARE</span>
          <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: effectiveTokens.textMuted, fontFamily: FONT_HAMON }}>
            Print Preview — Legal 8.5 × 14"
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrintMode(m => m === 'theme' ? 'clean' : 'theme')}
            style={{
              padding: '8px 16px',
              background: printMode === 'clean' ? effectiveTokens.quadrantGreenBg : effectiveTokens.cardBg,
              color: printMode === 'clean' ? effectiveTokens.quadrantGreenAccent : effectiveTokens.textMuted,
              fontSize: '11px',
              fontFamily: FONT_HAMON,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: `1px solid ${printMode === 'clean' ? effectiveTokens.quadrantGreenBorder : effectiveTokens.borderDefault}`,
              cursor: 'pointer',
            }}
          >
            {printMode === 'clean' ? '← Theme colors' : 'Clean white (print-friendly)'}
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: '8px 20px', background: effectiveTokens.footerScheduleBg, color: '#fff', fontSize: '11px', fontFamily: FONT_HAMON, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: effectiveTokens.cardBg, color: effectiveTokens.textMuted, fontSize: '11px', fontFamily: FONT_HAMON, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: `1px solid ${effectiveTokens.borderDefault}`, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px 48px' }}>
        <div
          id="print-root"
          style={{
            width: '8.5in',
            minHeight: '14in',
            background: C.page,
            padding: '0.3in 0.35in',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            color: C.pageText,
          }}
        >

          {/* MASTHEAD */}
          <header style={{ borderBottom: `3px solid ${C.accentBorder}`, paddingBottom: '10px', marginBottom: '14px', textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '38px', lineHeight: 1, fontFamily: gothicFont, letterSpacing: '3px', textTransform: 'uppercase', color: C.pageText }}>
              FOUR SQUARE
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '6px' }}>
              <div style={{ width: '13px', height: '13px', background: C.green }} />
              <div style={{ width: '13px', height: '13px', background: C.blue }} />
              <div style={{ width: '13px', height: '13px', background: C.blue }} />
              <div style={{ width: '13px', height: '13px', background: C.green }} />
            </div>
            <p style={{ margin: 0, fontSize: '9px', letterSpacing: '7px', textTransform: 'uppercase', color: C.muted, fontFamily: gothicFont }}>
              Restaurant &amp; Bar
            </p>
          </header>

          {/* FOOD GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px', marginBottom: '14px' }}>
            {(Object.keys(menu) as Array<keyof typeof menu>).map((key) => {
              const q = menu[key];
              const { accent, border } = SECTION_COLORS[key as string] ?? { accent: C.green, border: C.greenBorder };
              return (
                <div key={key as string} style={{ background: C.cardBg, border: `2px solid ${border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px 7px', borderBottom: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.cardBg }}>
                    <h2 style={{ margin: 0, fontSize: '13px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>
                      {q.title}
                    </h2>
                    <div style={{ width: '30px', height: '2px', background: accent, opacity: 0.4 }} />
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    {q.sections.map((section, si) => (
                      <div key={section.name} style={{ marginBottom: si < q.sections.length - 1 ? '10px' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent, fontFamily: bodyFont }}>
                            {section.name}
                          </span>
                          {section.note && (
                            <span style={{ fontSize: '9px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont }}>
                              — {section.note}
                            </span>
                          )}
                        </div>
                        {section.items.map((item, idx) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: '3.5px 0',
                              borderBottom: idx < section.items.length - 1 ? `1px solid ${C.divider}` : 'none',
                              gap: '10px',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                {item.isAddon && (
                                  <span style={{ fontSize: '9px', color: C.subtle, fontFamily: bodyFont }}>+</span>
                                )}
                                <span style={{ fontSize: '11px', fontFamily: bodyFont, color: item.isAddon ? C.muted : C.pageText, fontWeight: item.isAddon ? 400 : 700 }}>
                                  {item.name}
                                </span>
                                {isSpecialItem(item.name) && (
                                  <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.specialChip.text, background: C.specialChip.bg, padding: '1px 5px', fontFamily: bodyFont }}>
                                    SPECIAL
                                  </span>
                                )}
                                {item.isNew && (
                                  <span style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', background: '#dc2626', padding: '1px 5px', fontFamily: bodyFont }}>
                                    NEW
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p style={{ margin: '1px 0 0', fontSize: '9px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont, lineHeight: 1.3 }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: displayFont, color: accent, whiteSpace: 'nowrap', paddingTop: '1px' }}>
                              ${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DAILY SPECIALS — hidden for now to fit legal paper
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '9px' }}>
              <h2 style={{ margin: 0, fontSize: '11px', fontFamily: gothicFont, letterSpacing: '4px', textTransform: 'uppercase', color: C.pageText, whiteSpace: 'nowrap' }}>
                Daily Specials
              </h2>
              <div style={{ flex: 1, height: '1px', background: C.sectionLine }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '7px' }}>
              {specials.map((s) => (
                <div key={s.day} style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, padding: '8px 7px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '8px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: C.muted, fontFamily: bodyFont }}>
                    {s.day}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontFamily: displayFont, lineHeight: 1.2, color: C.pageText, fontWeight: 700 }}>
                    {s.dish}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, fontFamily: displayFont, color: C.green }}>
                    ${s.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
          */}

          {/* DRINKS — 4 COLUMNS */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '9px' }}>
              <h2 style={{ margin: 0, fontSize: '11px', fontFamily: gothicFont, letterSpacing: '4px', textTransform: 'uppercase', color: C.pageText, whiteSpace: 'nowrap' }}>
                Drinks
              </h2>
              <div style={{ flex: 1, height: '1px', background: C.sectionLine }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '9px' }}>
              {Object.entries(drinks).map(([cat, items]) => {
                const { accent, border } = DRINK_COLORS[cat] ?? { accent: C.green, border: C.greenBorder };
                return (
                  <div key={cat} style={{ background: C.cardBg, border: `2px solid ${border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '7px 10px 6px', borderBottom: `2px solid ${border}`, background: C.cardBg }}>
                      <h3 style={{ margin: 0, fontSize: '10px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>
                        {DRINK_LABELS[cat]}
                      </h3>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      {items.map((drink, idx) => (
                        <div
                          key={drink.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '3px 0',
                            borderBottom: idx < items.length - 1 ? `1px solid ${C.divider}` : 'none',
                            gap: '8px',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '10px', fontFamily: bodyFont, color: C.pageText, fontWeight: 700, lineHeight: 1.25 }}>
                              {drink.name}
                            </div>
                            {drink.desc && (
                              <div style={{ fontSize: '8px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont, marginTop: '1px', lineHeight: 1.2 }}>
                                {drink.desc}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: displayFont, color: accent, whiteSpace: 'nowrap', paddingTop: '1px' }}>
                            ${drink.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CANNED BEERS STRIP */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ background: C.cardBg, border: `2px solid ${C.blueBorder}`, overflow: 'hidden' }}>
              <div style={{ padding: '7px 14px 6px', borderBottom: `2px solid ${C.blueBorder}`, background: C.cardBg }}>
                <h3 style={{ margin: 0, fontSize: '10px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: C.blue }}>
                  Canned &amp; Bottled Beer
                </h3>
              </div>
              <div style={{ padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                {CANNED_BEERS.map((b, idx) => (
                  <div
                    key={b.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      width: '25%',
                      padding: '3px 10px 3px 0',
                      borderBottom: idx < CANNED_BEERS.length - 4 ? `1px solid ${C.divider}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontFamily: bodyFont, color: C.pageText, fontWeight: 700 }}>
                      {b.name}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: displayFont, color: C.blue }}>
                      ${b.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer style={{ borderTop: `2px solid ${C.sectionLine}`, marginTop: '10px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <div style={{ width: '6px', height: '6px', background: C.green, opacity: 0.7 }} />
                  <div style={{ width: '6px', height: '6px', background: C.blue, opacity: 0.7 }} />
                  <div style={{ width: '6px', height: '6px', background: C.blue, opacity: 0.7 }} />
                  <div style={{ width: '6px', height: '6px', background: C.green, opacity: 0.7 }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: '9px', fontWeight: 700, color: C.pageText, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: gothicFont }}>
                    Four Square Restaurant &amp; Bar
                  </p>
                  <p style={{ margin: 0, fontSize: '8px', color: C.muted, letterSpacing: '1px', fontFamily: gothicFont }}>
                    16 Commercial Street, Braintree MA · 781-848-4448 · Open Wed–Sat
                  </p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '8px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: gothicFont, textAlign: 'right' }}>
                Prices subject to change &nbsp;·&nbsp; Please drink responsibly
              </p>
            </div>
            <div style={{ borderTop: `1px solid ${C.sectionLine}`, paddingTop: '6px' }}>
              <p style={{ margin: 0, fontSize: '7px', color: C.subtle, fontFamily: gothicFont, lineHeight: 1.4, letterSpacing: '0.5px' }}>
                <strong style={{ color: C.muted }}>CONSUMER ADVISORY:</strong> Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. Menu items may contain or come into contact with allergens including wheat, eggs, peanuts, tree nuts, milk, soy, fish, and shellfish. Please inform your server of any dietary restrictions or allergies. Prices and menu items are subject to change without notice.
              </p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default PrintMenuPage;
