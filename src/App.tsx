import React, { useState, useEffect } from 'react';
import { Save, Printer } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Quadrant from './components/Quadrant';
import NavDrawer, { Page } from './components/NavDrawer';
import AboutPage from './components/pages/AboutPage';
import Connect4Page from './components/pages/Connect4Page';
import BookingPage from './components/pages/BookingPage';
import DrinksPage from './components/pages/DrinksPage';
import PrintMenuPage from './components/PrintMenuPage';
import { INITIAL_MENU_DATA, INITIAL_SPECIALS } from './data/menuData';
import { MenuData } from './types';
import { ThemeMode, THEMES } from './theme';
import BgColorPicker from './components/BgColorPicker';

const DRINKS_DATA: Record<string, { name: string; desc: string; price: number; tag?: string; featured?: boolean }[]> = {
  draft: [
    { name: 'Widowmaker Blue Comet', desc: 'New England IPA — 7.1% ABV', price: 8, tag: 'On Draft', featured: true },
    { name: 'Spotted Cow', desc: 'New Glarus — Farmhouse Ale', price: 6, tag: 'Local' },
    { name: 'Two Women', desc: 'New Glarus — Lager', price: 6, tag: 'Local' },
    { name: 'Hazy IPA', desc: 'Rotating Tap', price: 7, tag: 'Rotating' },
    { name: 'Miller Lite', desc: 'American Light Lager', price: 4 },
    { name: 'Coors Light', desc: 'American Light Lager', price: 4 },
    { name: 'Guinness', desc: 'Irish Dry Stout', price: 7 },
  ],
  cocktails: [
    { name: "Tito's Handmade Vodka", desc: 'Well Vodka — Austin, TX', price: 9, tag: 'Well', featured: true },
    { name: 'Old Fashioned', desc: 'Bourbon, bitters, sugar, orange', price: 10, tag: 'House' },
    { name: 'Whiskey Sour', desc: 'Bourbon, lemon, simple syrup, egg white', price: 10 },
    { name: 'Moscow Mule', desc: "Tito's, ginger beer, lime, mint", price: 10, tag: 'Popular' },
    { name: 'Greenbush Marg', desc: 'Tequila, triple sec, lime, jalapeño', price: 11, tag: 'Signature' },
    { name: 'Four Square Spritz', desc: 'Aperol, prosecco, orange', price: 9, tag: 'Signature' },
    { name: 'Ranch Water', desc: 'Tequila, Topo Chico, lime', price: 9 },
    { name: "Tito's Lemonade", desc: "Tito's, lemon, simple syrup, soda", price: 10 },
    { name: 'Cranberry Mule', desc: "Tito's, ginger beer, cranberry, lime", price: 10 },
  ],
  wine: [
    { name: 'Pine & Brown Cabernet', desc: 'Spring Mountain District Reserve — Napa Valley', price: 14, tag: 'Featured', featured: true },
    { name: 'Pinot Grigio', desc: 'Light, crisp, citrus notes', price: 9 },
    { name: 'Sauvignon Blanc', desc: 'Bright, grassy, tropical fruit', price: 9 },
    { name: 'Pinot Noir', desc: 'Medium-bodied, cherry, earthy', price: 10 },
    { name: 'Rosé', desc: 'Dry, floral, strawberry', price: 9 },
    { name: 'Prosecco', desc: 'Sparkling, by the glass', price: 9 },
  ],
  seltzers: [
    { name: 'Viva La Tequila', desc: 'Tequila Seltzer — 4.5% ABV', price: 6, tag: 'Featured', featured: true },
    { name: 'White Claw', desc: 'Black Cherry • Mango • Watermelon • Lime', price: 5, tag: 'Seltzer' },
    { name: 'High Noon', desc: 'Vodka Hard Seltzer — Peach • Pineapple • Watermelon', price: 6, tag: 'Seltzer' },
    { name: 'Sun Cruiser', desc: 'Iced Tea Vodka — Lemon • Peach • Raspberry', price: 6, tag: 'Seltzer' },
    { name: 'Angry Orchard', desc: 'Crisp Apple Hard Cider', price: 5, tag: 'Cider' },
    { name: 'Shacksbury Dry Cider', desc: 'Vermont Craft Dry Cider', price: 6, tag: 'Cider' },
  ],
};

const App = () => {
  const [menu, setMenu] = useState<MenuData>(INITIAL_MENU_DATA);
  const [specials, setSpecials] = useState(INITIAL_SPECIALS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isSaved, setIsSaved] = useState(false);
  const [activePage, setActivePage] = useState<Page>('menu');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [customBgColor, setCustomBgColor] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isAdminRoute = hash === '#/admin';

  const theme = THEMES[themeMode];

  const cycleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'modern';
      if (prev === 'modern') return 'mbta';
      return 'dark';
    });
  };

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const updateItem = (quadrant: string, sectionIdx: number, itemIdx: number, field: string, value: string | number) => {
    const newMenu = { ...menu } as MenuData;
    const key = quadrant as keyof MenuData;
    newMenu[key] = {
      ...newMenu[key],
      sections: newMenu[key].sections.map((s, si) =>
        si === sectionIdx
          ? { ...s, items: s.items.map((item, ii) => ii === itemIdx ? { ...item, [field]: value } : item) }
          : s
      )
    };
    setMenu(newMenu);
  };

  const updateSpecial = (idx: number, field: string, value: string | number) => {
    setSpecials(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const isMenuPage = activePage === 'menu';

  const renderPage = () => {
    switch (activePage) {
      case 'about': return <AboutPage theme={theme} />;
      case 'connect4': return <Connect4Page theme={theme} />;
      case 'booking': return <BookingPage theme={theme} />;
      case 'drinks': return <DrinksPage theme={theme} />;
      default: return null;
    }
  };

  const bgImage = theme.isDark ? '/4bgDark.jpg' : '/4square.jpg';

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 overflow-hidden font-sans relative ${customBgColor ? '' : theme.bg} ${theme.text}`}
      style={customBgColor ? { backgroundColor: customBgColor } : undefined}
    >

      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: theme.isDark ? 0.12 : (themeMode === 'modern' || themeMode === 'mbta' ? 0.04 : 0.15),
        }}
      />

      <Header
        theme={theme}
        isAdmin={isAdmin}
        activePage={activePage}
        showAdminControls={isAdminRoute}
        onCycleTheme={cycleTheme}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        onOpenNav={() => setIsNavOpen(true)}
        onNavigate={setActivePage}
      />

      <NavDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
      />

      {isMenuPage ? (
        <div className="flex-grow overflow-y-auto p-4 md:p-6 no-scrollbar">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-24">
            {(Object.keys(menu) as Array<keyof MenuData>).map((key) => (
              <Quadrant
                key={key}
                id={key}
                data={menu[key]}
                isAdmin={isAdmin}
                theme={theme}
                quadrantTheme={menu[key].color === 'green' ? theme.quadrantGreen : theme.quadrantBlue}
                onUpdateItem={updateItem}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {renderPage()}
        </div>
      )}

      {isMenuPage && (
        <Footer
          specials={specials}
          theme={theme}
          isAdmin={isAdmin}
          onUpdateSpecial={updateSpecial}
        />
      )}

      {isAdminRoute && <BgColorPicker theme={theme} onColorChange={setCustomBgColor} currentColor={customBgColor} />}

      {isAdmin && isMenuPage && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end">
          <button
            onClick={() => setShowPrint(true)}
            className={`w-12 h-12 border-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${theme.isDark ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' : 'bg-emerald-700 text-white border-emerald-600 hover:bg-emerald-600'}`}
            title="Export Printable Menu"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={() => setIsSaved(true)}
            className={`w-12 h-12 border-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${theme.isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}
          >
            <Save size={20} />
          </button>
        </div>
      )}

      {showPrint && (
        <PrintMenuPage
          menu={menu}
          specials={specials}
          drinks={DRINKS_DATA}
          onClose={() => setShowPrint(false)}
        />
      )}

    </div>
  );
};

export default App;
