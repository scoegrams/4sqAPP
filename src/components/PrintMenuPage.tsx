import React, { useState } from 'react';
import { MenuData, Special } from '../types';

interface PrintMenuPageProps {
  menu: MenuData;
  specials: Special[];
  drinks: Record<string, { name: string; desc: string; price: number; tag?: string; featured?: boolean }[]>;
  onClose: () => void;
}

const SPECIALS_ITEMS = ['Burger', 'Steak Tips', 'Bar Pie'];

const CANNED_BEERS = [
  { name: 'Bud Light',        price: 4 },
  { name: 'Budweiser',        price: 4 },
  { name: 'Miller Lite',      price: 4 },
  { name: 'Coors Light',      price: 4 },
  { name: 'Michelob Ultra',   price: 5 },
  { name: 'Corona Extra',     price: 5 },
  { name: 'Modelo Especial',  price: 5 },
  { name: 'Heineken',         price: 5 },
  { name: 'Blue Moon',        price: 5 },
  { name: 'Sam Adams Lager',  price: 5 },
  { name: 'Truly Hard Seltzer', price: 5 },
  { name: 'White Claw',       price: 5 },
];

const DRINK_LABELS: Record<string, string> = {
  draft:     'Draft Beer',
  cocktails: 'Cocktails',
  wine:      'Wine',
  seltzers:  'Seltzers & Cans',
};

const isSpecialItem = (name: string) =>
  SPECIALS_ITEMS.some(s => name.toLowerCase().includes(s.toLowerCase()));

type Mode = 'dark' | 'light';

const DARK = {
  page:         '#0f172a',
  pageText:     '#f1f5f9',
  cardBg:       '#1e293b',
  cardBorder:   '#334155',
  divider:      '#1e293b',
  sectionLine:  '#334155',
  muted:        '#94a3b8',
  subtle:       '#64748b',
  green:        '#34d399',
  greenBorder:  '#059669',
  blue:         '#60a5fa',
  blueBorder:   '#2563eb',
  amber:        '#fbbf24',
  amberBorder:  '#b45309',
  red:          '#f87171',
  redBorder:    '#991b1b',
  specialChip:  { bg: '#b45309', text: '#fff7ed' },
  tagBg:        '#0f172a',
  previewBg:    '#334155',
};

const LIGHT = {
  page:         '#ffffff',
  pageText:     '#0f172a',
  cardBg:       '#f8fafc',
  cardBorder:   '#e2e8f0',
  divider:      '#e2e8f0',
  sectionLine:  '#cbd5e1',
  muted:        '#64748b',
  subtle:       '#94a3b8',
  green:        '#059669',
  greenBorder:  '#059669',
  blue:         '#2563eb',
  blueBorder:   '#2563eb',
  amber:        '#d97706',
  amberBorder:  '#b45309',
  red:          '#dc2626',
  redBorder:    '#991b1b',
  specialChip:  { bg: '#b45309', text: '#fff7ed' },
  tagBg:        '#ffffff',
  previewBg:    '#1e293b',
};

const PrintMenuPage: React.FC<PrintMenuPageProps> = ({ menu, specials, drinks, onClose }) => {
  const [mode, setMode] = useState<Mode>('light');
  const C = mode === 'dark' ? DARK : LIGHT;

  const handlePrint = () => window.print();

  const displayFont = "'Special Gothic Expanded One', Impact, 'Arial Black', sans-serif";
  const bodyFont    = "'Special Gothic Expanded One', Impact, 'Arial Black', sans-serif";
  const gothicFont  = "'Special Gothic Expanded One', Impact, 'Arial Black', sans-serif";

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
    <div className="fixed inset-0 z-[999] overflow-auto" style={{ background: C.previewBg }}>

      <div className="no-print flex items-center justify-between px-6 py-3 sticky top-0 z-10" style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: gothicFont, fontSize: '18px', color: '#34d399', letterSpacing: '2px' }}>FOUR SQUARE</span>
          <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#94a3b8', fontFamily: "'Libre Baskerville', serif" }}>
            Print Preview — 11 × 17"
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '8px 16px',
              background: mode === 'dark' ? '#1e3a5f' : '#e2e8f0',
              color: mode === 'dark' ? '#60a5fa' : '#0f172a',
              fontSize: '11px',
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: `1px solid ${mode === 'dark' ? '#2563eb' : '#cbd5e1'}`,
              cursor: 'pointer',
            }}
          >
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: '8px 20px', background: '#059669', color: '#fff', fontSize: '11px', fontFamily: "'Libre Baskerville', serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#334155', color: '#94a3b8', fontSize: '11px', fontFamily: "'Libre Baskerville', serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px 48px' }}>
        <div
          id="print-root"
          style={{
            width: '11in',
            minHeight: '17in',
            background: C.page,
            padding: '0.5in 0.6in',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            color: C.pageText,
          }}
        >

          {/* MASTHEAD */}
          <header style={{ borderBottom: `3px solid ${C.greenBorder}`, paddingBottom: '14px', marginBottom: '22px', textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: '52px', lineHeight: 1, fontFamily: gothicFont, letterSpacing: '4px', textTransform: 'uppercase', color: C.pageText }}>
              FOUR SQUARE
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '8px' }}>
              <div style={{ width: '18px', height: '18px', background: C.green }} />
              <div style={{ width: '18px', height: '18px', background: C.blue }} />
              <div style={{ width: '18px', height: '18px', background: C.blue }} />
              <div style={{ width: '18px', height: '18px', background: C.green }} />
            </div>
            <p style={{ margin: 0, fontSize: '11px', letterSpacing: '8px', textTransform: 'uppercase', color: C.muted, fontFamily: gothicFont }}>
              Restaurant &amp; Bar
            </p>
          </header>

          {/* FOOD GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
            {(Object.keys(menu) as Array<keyof typeof menu>).map((key) => {
              const q = menu[key];
              const { accent, border } = SECTION_COLORS[key as string] ?? { accent: C.green, border: C.greenBorder };
              return (
                <div key={key as string} style={{ background: C.cardBg, border: `2px solid ${border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '11px 20px 10px', borderBottom: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <h2 style={{ margin: 0, fontSize: '17px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>
                      {q.title}
                    </h2>
                    <div style={{ width: '40px', height: '2px', background: accent, opacity: 0.4 }} />
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    {q.sections.map((section, si) => (
                      <div key={section.name} style={{ marginBottom: si < q.sections.length - 1 ? '16px' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '9px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent, fontFamily: bodyFont }}>
                            {section.name}
                          </span>
                          {section.note && (
                            <span style={{ fontSize: '10px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont }}>
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
                              padding: '5px 0',
                              borderBottom: idx < section.items.length - 1 ? `1px solid ${C.divider}` : 'none',
                              gap: '12px',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                {item.isAddon && (
                                  <span style={{ fontSize: '10px', color: C.subtle, fontFamily: bodyFont }}>+</span>
                                )}
                                <span style={{ fontSize: '13px', fontFamily: bodyFont, color: item.isAddon ? C.muted : C.pageText, fontWeight: item.isAddon ? 400 : 700 }}>
                                  {item.name}
                                </span>
                                {isSpecialItem(item.name) && (
                                  <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.specialChip.text, background: C.specialChip.bg, padding: '2px 6px', fontFamily: bodyFont }}>
                                    SPECIAL
                                  </span>
                                )}
                                {item.isNew && (
                                  <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', background: '#dc2626', padding: '2px 6px', fontFamily: bodyFont }}>
                                    NEW
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p style={{ margin: '2px 0 0', fontSize: '10px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont, lineHeight: 1.4 }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: displayFont, color: accent, whiteSpace: 'nowrap', paddingTop: '1px' }}>
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

          {/* DAILY SPECIALS */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontFamily: gothicFont, letterSpacing: '4px', textTransform: 'uppercase', color: C.pageText, whiteSpace: 'nowrap' }}>
                Daily Specials
              </h2>
              <div style={{ flex: 1, height: '1px', background: C.sectionLine }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {specials.map((s) => (
                <div key={s.day} style={{ background: C.cardBg, border: `1.5px solid ${C.cardBorder}`, padding: '13px 10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px', fontSize: '9px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: C.muted, fontFamily: bodyFont }}>
                    {s.day}
                  </p>
                  <p style={{ margin: '0 0 7px', fontSize: '13px', fontFamily: displayFont, lineHeight: 1.3, color: C.pageText, fontWeight: 700 }}>
                    {s.dish}
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, fontFamily: displayFont, color: C.green }}>
                    ${s.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DRINKS — 4 COLUMNS */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontFamily: gothicFont, letterSpacing: '4px', textTransform: 'uppercase', color: C.pageText, whiteSpace: 'nowrap' }}>
                Drinks
              </h2>
              <div style={{ flex: 1, height: '1px', background: C.sectionLine }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {Object.entries(drinks).map(([cat, items]) => {
                const { accent, border } = DRINK_COLORS[cat] ?? { accent: C.green, border: C.greenBorder };
                return (
                  <div key={cat} style={{ background: C.cardBg, border: `2px solid ${border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '9px 14px 8px', borderBottom: `2px solid ${border}`, background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <h3 style={{ margin: 0, fontSize: '12px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>
                        {DRINK_LABELS[cat]}
                      </h3>
                    </div>
                    <div style={{ padding: '11px 14px' }}>
                      {items.map((drink, idx) => (
                        <div
                          key={drink.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '4.5px 0',
                            borderBottom: idx < items.length - 1 ? `1px solid ${C.divider}` : 'none',
                            gap: '10px',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontFamily: bodyFont, color: C.pageText, fontWeight: 700, lineHeight: 1.3 }}>
                              {drink.name}
                            </div>
                            {drink.desc && (
                              <div style={{ fontSize: '9px', color: C.subtle, fontStyle: 'italic', fontFamily: bodyFont, marginTop: '1px', lineHeight: 1.3 }}>
                                {drink.desc}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: displayFont, color: accent, whiteSpace: 'nowrap', paddingTop: '1px' }}>
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
          <div style={{ marginBottom: '24px' }}>
            <div style={{ background: C.cardBg, border: `2px solid ${C.blueBorder}`, overflow: 'hidden' }}>
              <div style={{ padding: '9px 20px 8px', borderBottom: `2px solid ${C.blueBorder}`, background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: 0, fontSize: '12px', fontFamily: gothicFont, letterSpacing: '2px', textTransform: 'uppercase', color: C.blue }}>
                  Canned &amp; Bottled Beer
                </h3>
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                {CANNED_BEERS.map((b, idx) => (
                  <div
                    key={b.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      width: '25%',
                      padding: '4px 12px 4px 0',
                      borderBottom: idx < CANNED_BEERS.length - 4 ? `1px solid ${C.divider}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontFamily: bodyFont, color: C.pageText, fontWeight: 700 }}>
                      {b.name}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: displayFont, color: C.blue }}>
                      ${b.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer style={{ borderTop: `2px solid ${C.sectionLine}`, marginTop: '20px', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <div style={{ width: '7px', height: '7px', background: C.green, opacity: 0.7 }} />
                  <div style={{ width: '7px', height: '7px', background: C.blue, opacity: 0.7 }} />
                  <div style={{ width: '7px', height: '7px', background: C.blue, opacity: 0.7 }} />
                  <div style={{ width: '7px', height: '7px', background: C.green, opacity: 0.7 }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, color: C.pageText, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: gothicFont }}>
                    Four Square Restaurant &amp; Bar
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: C.muted, letterSpacing: '1px', fontFamily: gothicFont }}>
                    foursquare.bar
                  </p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: gothicFont, textAlign: 'right' }}>
                Prices subject to change &nbsp;·&nbsp; Please drink responsibly
              </p>
            </div>
            <div style={{ borderTop: `1px solid ${C.sectionLine}`, paddingTop: '8px' }}>
              <p style={{ margin: 0, fontSize: '8px', color: C.subtle, fontFamily: gothicFont, lineHeight: 1.5, letterSpacing: '0.5px' }}>
                <strong style={{ color: C.muted }}>CONSUMER ADVISORY:</strong> Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. Menu items may contain or come into contact with allergens including wheat, eggs, peanuts, tree nuts, milk, soy, fish, and shellfish. Please inform your server of any dietary restrictions or allergies. Four Square Restaurant &amp; Bar is not responsible for errors in dietary descriptions. Prices and menu items are subject to change without notice.
              </p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default PrintMenuPage;
