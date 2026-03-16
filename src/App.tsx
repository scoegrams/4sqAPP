import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Quadrant from './components/Quadrant';
import NavDrawer, { Page } from './components/NavDrawer';
import AboutPage from './components/pages/AboutPage';
import Connect4Page from './components/pages/Connect4Page';
import BookingPage from './components/pages/BookingPage';
import DrinksPage from './components/pages/DrinksPage';
import SpecialsPage from './components/pages/SpecialsPage';
import PrintMenuPage from './components/PrintMenuPage';
import ChalkboardSpecials from './components/ChalkboardSpecials';
import AdminToolbar from './components/AdminToolbar';
import VersionHistory from './components/VersionHistory';
import SpecialsEditor from './components/SpecialsEditor';
import TrainSignEditor from './components/TrainSignEditor';
import BgColorPicker from './components/BgColorPicker';
import { MenuData, MenuItem, MenuSection } from './types';
import { ThemeMode, THEMES } from './theme';
import { useMenuStore } from './hooks/useMenuStore';

const App = () => {
  const store = useMenuStore();

  const [isAdmin, setIsAdmin] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activePage, setActivePage] = useState<Page>('menu');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [customBgColor, setCustomBgColor] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showChalkboard, setShowChalkboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSpecialsEditor, setShowSpecialsEditor] = useState(false);
  const [showTrainSignEditor, setShowTrainSignEditor] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isAdminRoute = hash === '#/admin';

  const theme = THEMES[themeMode];

  const handleAdminClick = () => {
    if (hash !== '#/admin') {
      window.location.hash = '#/admin';
      setIsAdmin(true);
    } else {
      setIsAdmin((prev) => !prev);
    }
  };

  const cycleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'modern';
      if (prev === 'modern') return 'apple';
      return 'dark';
    });
  };

  const isMenuPage = activePage === 'menu';

  const renderPage = () => {
    switch (activePage) {
      case 'about': return <AboutPage theme={theme} onNavigate={(page) => setActivePage(page)} />;
      case 'connect4': return <Connect4Page theme={theme} />;
      case 'booking': return <BookingPage theme={theme} />;
      case 'drinks': return (
        <DrinksPage
          theme={theme}
          drinks={store.drinks}
          isAdmin={isAdmin}
          onUpdateDrinkItem={(cat, idx, field, value) => store.updateDrinkItem(cat, idx, field as string, value)}
          onAddDrinkItem={store.addDrinkItem}
          onRemoveDrinkItem={store.removeDrinkItem}
        />
      );
      case 'specials': return (
        <SpecialsPage
          theme={theme}
          data={store.chalkboard}
          isAdmin={isAdmin}
          onUpdateMeta={(field, value) => store.updateChalkboardMeta(field, value)}
          onUpdateItem={(idx, field, value) => store.updateChalkboardItem(idx, field, value)}
          onAddItem={store.addChalkboardItem}
          onRemoveItem={store.removeChalkboardItem}
          onMoveItem={store.moveChalkboardItem}
          onPrintChalkboard={() => setShowChalkboard(true)}
        />
      );
      default: return null;
    }
  };

  const bgImage = theme.isDark ? '/4bgDark.jpg' : '/4square.jpg';

  if (store.isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme.bg} ${theme.text}`}>
        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Loading…</span>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen h-screen flex flex-col transition-colors duration-300 overflow-hidden font-sans relative safe-top safe-bottom ${customBgColor ? '' : theme.bg} ${theme.text}`}
      style={customBgColor ? { backgroundColor: customBgColor } : undefined}
    >
      {/* Background image */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: theme.isDark ? 0.12 : (themeMode === 'modern' || themeMode === 'apple' ? 0.04 : 0.15),
        }}
      />

      <Header
        theme={theme}
        isAdmin={isAdmin}
        activePage={activePage}
        showAdminControls={isAdminRoute}
        trainSignEvents={store.events}
        onOpenTrainSignEditor={() => setShowTrainSignEditor(true)}
        onCycleTheme={cycleTheme}
        onToggleAdmin={handleAdminClick}
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

      {/* Main content */}
      {isMenuPage ? (
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 md:p-6 no-scrollbar safe-left safe-right">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-6">
            {(Object.keys(store.menu) as Array<keyof MenuData>).map((key) => (
              <Quadrant
                key={key}
                id={key}
                data={store.menu[key]}
                isAdmin={isAdmin}
                theme={theme}
                quadrantTheme={store.menu[key].color === 'green' ? theme.quadrantGreen : theme.quadrantBlue}
                onUpdateItem={(q, si, ii, field, value) =>
                  store.updateItem(q, si, ii, field as keyof MenuItem, value)
                }
                onAddItem={store.addItem}
                onRemoveItem={store.removeItem}
                onMoveItem={store.moveItem}
                onUpdateSection={(q, si, field, value) =>
                  store.updateSection(q, si, field as keyof MenuSection, value)
                }
                onAddSection={store.addSection}
                onRemoveSection={store.removeSection}
                onMoveSection={store.moveSection}
              />
            ))}
          </div>

          {/* Consumer advisory — below the menu, above the footer */}
          <div className={`max-w-6xl mx-auto border-t px-4 py-3 mb-24 ${theme.isDark ? 'border-white/10' : theme.mode === 'apple' ? 'border-[#d2d2d7]' : 'border-black/10'}`}>
            <p className={`text-[8px] leading-relaxed ${theme.textMuted}`}>
              <span className="font-bold">Consumer advisory:</span> Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. Menu items may contain or come into contact with allergens including wheat, eggs, peanuts, tree nuts, milk, soy, fish, and shellfish. Please inform your server of any dietary restrictions or allergies.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto overflow-x-hidden no-scrollbar safe-left safe-right">
          {renderPage()}
        </div>
      )}

      {isMenuPage && (
        <Footer
          specials={store.specials}
          openHours={store.openHours}
          theme={theme}
          isAdmin={isAdmin}
          onUpdateSpecial={(idx, field, value) =>
            store.updateSpecial(idx, field as 'day' | 'dish' | 'price', value)
          }
          onOpenSpecialsEditor={() => setShowSpecialsEditor(true)}
        />
      )}

      {/* Admin overlays */}
      {isAdminRoute && (
        <BgColorPicker theme={theme} onColorChange={setCustomBgColor} currentColor={customBgColor} />
      )}

      {isAdmin && (
        <AdminToolbar
          theme={theme}
          isDirty={store.isDirty}
          lastSaved={store.lastSaved}
          onSave={store.save}
          onDiscard={store.discard}
          onPrint={() => setShowPrint(true)}
          onChalkboard={() => setShowChalkboard(true)}
          onHistory={() => setShowHistory(true)}
        />
      )}

      {/* Drawers & modals */}
      <VersionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={store.restoreVersion}
        theme={theme}
      />

      <SpecialsEditor
        isOpen={showSpecialsEditor && isAdmin}
        specials={store.specials}
        openHours={store.openHours}
        onUpdateOpenHours={(v) => store.setOpenHours(v)}
        theme={theme}
        onUpdate={(idx, field, value) =>
          store.updateSpecial(idx, field as 'day' | 'dish' | 'price', value)
        }
        onClose={() => setShowSpecialsEditor(false)}
      />

      <TrainSignEditor
        isOpen={showTrainSignEditor && isAdmin}
        events={store.events}
        theme={theme}
        onUpdate={(idx, field, value) => store.updateEvent(idx, field, value)}
        onAdd={store.addEvent}
        onRemove={store.removeEvent}
        onMove={store.moveEvent}
        onClose={() => setShowTrainSignEditor(false)}
      />

      {showPrint && (
        <PrintMenuPage
          menu={store.menu}
          specials={store.specials}
          drinks={store.drinks}
          onClose={() => setShowPrint(false)}
        />
      )}

      {showChalkboard && (
        <ChalkboardSpecials
          data={store.chalkboard}
          isAdmin={isAdmin}
          onUpdateMeta={(field, value) => store.updateChalkboardMeta(field, value)}
          onUpdateItem={(idx, field, value) => store.updateChalkboardItem(idx, field, value)}
          onAddItem={store.addChalkboardItem}
          onRemoveItem={store.removeChalkboardItem}
          onMoveItem={store.moveChalkboardItem}
          onClose={() => setShowChalkboard(false)}
        />
      )}
    </div>
  );
};

export default App;
