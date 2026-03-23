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
import JackpotPage from './components/pages/JackpotPage';
import PrintMenuPage from './components/PrintMenuPage';
import ChalkboardSpecials from './components/ChalkboardSpecials';
import { MenuData, MenuItem, MenuSection } from './types';
import { ThemeMode, getTheme } from './theme';
import { useMenuStore } from './hooks/useMenuStore';
import { DesignTokensProvider, useDesignTokens } from './contexts/DesignTokensContext';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  return (
    <DesignTokensProvider themeMode={themeMode} setThemeMode={setThemeMode}>
      <AppInner themeMode={themeMode} setThemeMode={setThemeMode} />
    </DesignTokensProvider>
  );
};

interface AppInnerProps {
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}

const AppInner: React.FC<AppInnerProps> = ({ themeMode, setThemeMode }) => {
  const store = useMenuStore();
  const { effectiveTokens } = useDesignTokens();
  const { signOut } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState<Page>('menu');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [customBgColor, setCustomBgColor] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showChalkboard, setShowChalkboard] = useState(false);

  const theme = getTheme(themeMode);
  const isMenuPage = activePage === 'menu';

  const bgImageOpacity = theme.isDark
    ? parseFloat(effectiveTokens.bgImageOpacityDark) || 0.12
    : themeMode === 'modern' || themeMode === 'apple'
      ? parseFloat(effectiveTokens.bgImageOpacitySoft) || 0.04
      : parseFloat(effectiveTokens.bgImageOpacityLight) || 0.15;

  useEffect(() => {
    const go = () => {
      if (window.location.hash === '#jackpot') setActivePage('jackpot');
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  useEffect(() => {
    if (activePage === 'jackpot') {
      window.location.hash = 'jackpot';
    } else if (window.location.hash === '#jackpot') {
      history.replaceState(null, '', window.location.pathname);
    }
  }, [activePage]);

  const cycleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'modern';
      if (prev === 'modern') return 'apple';
      return 'dark';
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'about':
        return <AboutPage theme={theme} onNavigate={setActivePage} />;

      case 'connect4':
        return <Connect4Page theme={theme} />;

      case 'booking':
        return <BookingPage theme={theme} />;

      case 'jackpot':
        return (
          <JackpotPage
            theme={theme}
            themeMode={themeMode}
            isAdmin={isAdmin}
            isDirty={store.isDirty}
            lastSaved={store.lastSaved}
            customBgColor={customBgColor}
            specials={store.specials}
            openHours={store.openHours}
            events={store.events}
            onToggleAdmin={() => setIsAdmin((prev) => !prev)}
            onCycleTheme={cycleTheme}
            onSetTheme={setThemeMode}
            onSave={store.save}
            onDiscard={store.discard}
            onPrint={() => setShowPrint(true)}
            onChalkboard={() => setShowChalkboard(true)}
            onColorChange={setCustomBgColor}
            onUpdateSpecial={(idx, field, value) =>
              store.updateSpecial(idx, field as 'day' | 'dish' | 'price', value)
            }
            onUpdateOpenHours={store.setOpenHours}
            onUpdateEvent={(idx, field, value) => store.updateEvent(idx, field, value)}
            onAddEvent={store.addEvent}
            onRemoveEvent={store.removeEvent}
            onMoveEvent={store.moveEvent}
            onRestoreVersion={store.restoreVersion}
          />
        );

      case 'drinks':
        return (
          <DrinksPage
            theme={theme}
            drinks={store.drinks}
            isAdmin={isAdmin}
            onUpdateDrinkItem={(cat, idx, field, value) =>
              store.updateDrinkItem(cat, idx, field as string, value)
            }
            onAddDrinkItem={store.addDrinkItem}
            onRemoveDrinkItem={store.removeDrinkItem}
          />
        );

      case 'specials':
        return (
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

      default:
        return null;
    }
  };

  const bgImage = theme.isDark ? '/4bgDark.jpg' : '/4square.jpg';

  if (store.isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme.bg} ${theme.text}`}>
        <span className="text-xs font-barDisplay font-bold uppercase tracking-[0.3em] opacity-40">Loading…</span>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen h-screen flex flex-col transition-colors duration-300 overflow-hidden font-bar relative safe-top safe-bottom ${customBgColor ? '' : theme.bg} ${theme.text}`}
      style={customBgColor ? { backgroundColor: customBgColor } : undefined}
    >
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: bgImageOpacity,
        }}
      />

      <Header
        theme={theme}
        activePage={activePage}
        trainSignEvents={store.events}
        isAdmin={isAdmin}
        isDirty={store.isDirty}
        isSaving={store.isSaving}
        onOpenNav={() => setIsNavOpen(true)}
        onNavigate={setActivePage}
        onExitAdmin={() => setIsAdmin(false)}
        onSignOut={signOut}
        onSave={store.save}
        onGoAdmin={() => setActivePage('jackpot')}
      />

      <NavDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
      />

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

          <div className="max-w-6xl mx-auto border-t border-[color:var(--fs-advisory-border)] px-4 py-4 mb-24">
            <p className={`text-xs leading-relaxed ${theme.text}`}>
              <span className="font-bold">Consumer advisory:</span> Consuming raw or undercooked meats, poultry,
              seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain
              medical conditions. Menu items may contain or come into contact with allergens including wheat, eggs,
              peanuts, tree nuts, milk, soy, fish, and shellfish. Please inform your server of any dietary restrictions
              or allergies.
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
          onOpenSpecialsEditor={() => setActivePage('jackpot')}
          onGoJackpot={() => setActivePage('jackpot')}
        />
      )}

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
