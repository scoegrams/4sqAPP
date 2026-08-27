import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuPage from './components/pages/MenuPage';
import NavDrawer, { Page } from './components/NavDrawer';
import AboutPage from './components/pages/AboutPage';
import BookingPage from './components/pages/BookingPage';
import DrinksPage from './components/pages/DrinksPage';
import SpecialsPage from './components/pages/SpecialsPage';
import JackpotPage from './components/pages/JackpotPage';
import BoardDisplayPage from './components/pages/BoardDisplayPage';
import PrintMenuPage from './components/PrintMenuPage';
import ChalkboardSpecials from './components/ChalkboardSpecials';
import AuthModal from './components/AuthModal';
import { MenuData, MenuItem, MenuSection } from './types';
import { ThemeMode, getTheme } from './theme';
import { useMenuStore } from './hooks/useMenuStore';
import { DesignTokensProvider, useDesignTokens } from './contexts/DesignTokensContext';
import { useAuth } from './contexts/AuthContext';
import { FEATURES } from './config/features';
import { chalkboardItemsFromSpecials } from './lib/specials';

const Connect4Page = FEATURES.connect4
  ? lazy(() => import('./components/pages/Connect4Page'))
  : null;

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
  const { signOut, user, profile } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState<Page>('menu');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [customBgColor, setCustomBgColor] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showChalkboard, setShowChalkboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isBoardMode, setIsBoardMode] = useState(() =>
    typeof window !== 'undefined' && window.location.hash === '#board',
  );

  const isLoggedIn = !!user && !!profile;

  const theme = getTheme(themeMode);
  const isMenuPage = activePage === 'menu';

  const bgImageOpacity = theme.isDark
    ? parseFloat(effectiveTokens.bgImageOpacityDark) || 0.12
    : themeMode === 'modern' || themeMode === 'apple'
      ? parseFloat(effectiveTokens.bgImageOpacitySoft) || 0.04
      : parseFloat(effectiveTokens.bgImageOpacityLight) || 0.15;

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash === '#jackpot') setActivePage('jackpot');
      setIsBoardMode(hash === '#board');
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Auto-open auth modal for handle setup after a new member signs in (Connect 4 only)
  useEffect(() => {
    if (!FEATURES.connect4) return;
    if (isLoggedIn && !profile?.display_name) {
      setShowAuthModal(true);
    }
  }, [isLoggedIn, profile?.display_name]);

  useEffect(() => {
    if (!FEATURES.connect4 && activePage === 'connect4') {
      setActivePage('menu');
    }
  }, [activePage]);

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
        return (
          <AboutPage
            theme={theme}
            specials={store.specials}
            specialsMeta={store.chalkboard}
            openHours={store.openHours}
            onNavigate={setActivePage}
          />
        );

      case 'connect4':
        if (!FEATURES.connect4 || !Connect4Page) {
          return null;
        }
        return (
          <Suspense fallback={
            <div className={`flex items-center justify-center min-h-[40vh] ${theme.text}`}>
              <span className="text-xs font-barDisplay font-bold uppercase tracking-[0.3em] opacity-40">Loading…</span>
            </div>
          }>
            <Connect4Page theme={theme} />
          </Suspense>
        );

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
              store.updateSpecial(idx, field as 'day' | 'dish' | 'price' | 'description' | 'image', value)
            }
            onAddSpecial={store.addSpecial}
            onRemoveSpecial={store.removeSpecial}
            onMoveSpecial={store.moveSpecial}
            onUpdateChalkboardMeta={(field, value) => store.updateChalkboardMeta(field, value)}
            chalkboardMeta={store.chalkboard}
            displayBoard={store.displayBoard}
            onUpdateDisplayBoard={store.updateDisplayBoard}
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
            meta={store.chalkboard}
            specials={store.specials}
            isAdmin={isAdmin}
            onUpdateMeta={(field, value) => store.updateChalkboardMeta(field, value)}
            onUpdateSpecial={(idx, field, value) => store.updateSpecial(idx, field, value)}
            onAddSpecial={store.addSpecial}
            onRemoveSpecial={store.removeSpecial}
            onMoveSpecial={store.moveSpecial}
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

  if (isBoardMode) {
    return (
      <BoardDisplayPage
        board={store.displayBoard}
        specials={store.specials}
        events={store.events}
        openHours={store.openHours}
        specialsHeadline={store.chalkboard.price}
      />
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
        isLoggedIn={isLoggedIn}
        profile={profile}
        onOpenNav={() => setIsNavOpen(true)}
        onNavigate={setActivePage}
        onExitAdmin={() => setIsAdmin(false)}
        onSignOut={signOut}
        onSave={store.save}
        onGoAdmin={() => setActivePage('jackpot')}
        onSignIn={() => setShowAuthModal(true)}
      />

      <NavDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
      />

      {isMenuPage ? (
        <MenuPage
          theme={theme}
          menu={store.menu}
          isAdmin={isAdmin}
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
          data={{
            ...store.chalkboard,
            items: chalkboardItemsFromSpecials(store.specials),
          }}
          isAdmin={isAdmin}
          onUpdateMeta={(field, value) => store.updateChalkboardMeta(field, value)}
          onUpdateItem={(idx, field, value) => store.updateChalkboardItem(idx, field, value)}
          onAddItem={store.addChalkboardItem}
          onRemoveItem={store.removeChalkboardItem}
          onMoveItem={store.moveChalkboardItem}
          onClose={() => setShowChalkboard(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default App;
