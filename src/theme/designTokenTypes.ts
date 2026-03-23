import type { ThemeMode } from './types';

export type { ThemeMode };

/** Every tweakable color / opacity — single source for presets + Theme Studio */
export type DesignTokenKey =
  | 'pageBg'
  | 'pageText'
  | 'textMuted'
  | 'borderDefault'
  | 'bgImageOpacityDark'
  | 'bgImageOpacityLight'
  | 'bgImageOpacitySoft'
  | 'headerBg'
  | 'headerBorder'
  | 'headerWordmark'
  | 'headerTagline'
  | 'headerTaglineBorder'
  | 'headerMenuBtnBg'
  | 'headerMenuBtnBorder'
  | 'headerMenuBtnIcon'
  | 'navStripBg'
  | 'navStripBorderTop'
  | 'navActiveText'
  | 'navActiveBorder'
  | 'navInactiveText'
  | 'navInactiveHoverText'
  | 'navInactiveHoverBorder'
  | 'quadrantGreenBg'
  | 'quadrantGreenBorder'
  | 'quadrantGreenAccent'
  | 'quadrantGreenHeaderBg'
  | 'quadrantBlueBg'
  | 'quadrantBlueBorder'
  | 'quadrantBlueAccent'
  | 'quadrantBlueHeaderBg'
  | 'cardBg'
  | 'dividerMuted'
  | 'footerBg'
  | 'footerBorder'
  | 'footerScheduleBg'
  | 'footerScheduleBorder'
  | 'footerScheduleHoverBg'
  | 'footerPriceAccent'
  | 'footerMarqueeInputBorder'
  | 'footerMarqueeTextOnLight'
  | 'footerMarqueeTextOnDark'
  | 'trainSignBg'
  | 'trainSignBorder'
  | 'trainSignSubtext'
  | 'trainSignPrimary'
  | 'trainSignAccent'
  | 'trainSignEvent'
  | 'drawerScrim'
  | 'drawerBg'
  | 'drawerBorder'
  | 'drawerText'
  | 'drawerActiveBg'
  | 'drawerActiveText'
  | 'drawerInactiveText'
  | 'drawerHoverBg'
  | 'advisoryBorder'
  | 'inputBg'
  | 'inputBorder'
  | 'btnMuted'
  | 'btnMutedHover'
  | 'logoSq0'
  | 'logoSq1'
  | 'logoSq2'
  | 'logoSq3'
  | 'logoSqMuted'
  | 'logoSqPop'
  | 'menuItemFontSize'
  | 'menuItemPaddingY'
  | 'borderRadius'
  | 'navBlur'
  | 'cardShadow';

export type DesignTokens = Record<DesignTokenKey, string>;

export const CSS_VAR_MAP: Record<DesignTokenKey, string> = {
  pageBg: '--fs-page-bg',
  pageText: '--fs-page-text',
  textMuted: '--fs-text-muted',
  borderDefault: '--fs-border',
  bgImageOpacityDark: '--fs-bg-img-opacity-dark',
  bgImageOpacityLight: '--fs-bg-img-opacity-light',
  bgImageOpacitySoft: '--fs-bg-img-opacity-soft',
  headerBg: '--fs-header-bg',
  headerBorder: '--fs-header-border',
  headerWordmark: '--fs-header-wordmark',
  headerTagline: '--fs-header-tagline',
  headerTaglineBorder: '--fs-header-tagline-border',
  headerMenuBtnBg: '--fs-header-menu-btn-bg',
  headerMenuBtnBorder: '--fs-header-menu-btn-border',
  headerMenuBtnIcon: '--fs-header-menu-btn-icon',
  navStripBg: '--fs-nav-strip-bg',
  navStripBorderTop: '--fs-nav-strip-border-top',
  navActiveText: '--fs-nav-active-text',
  navActiveBorder: '--fs-nav-active-border',
  navInactiveText: '--fs-nav-inactive-text',
  navInactiveHoverText: '--fs-nav-inactive-hover-text',
  navInactiveHoverBorder: '--fs-nav-inactive-hover-border',
  quadrantGreenBg: '--fs-quad-green-bg',
  quadrantGreenBorder: '--fs-quad-green-border',
  quadrantGreenAccent: '--fs-quad-green-accent',
  quadrantGreenHeaderBg: '--fs-quad-green-header-bg',
  quadrantBlueBg: '--fs-quad-blue-bg',
  quadrantBlueBorder: '--fs-quad-blue-border',
  quadrantBlueAccent: '--fs-quad-blue-accent',
  quadrantBlueHeaderBg: '--fs-quad-blue-header-bg',
  cardBg: '--fs-card-bg',
  dividerMuted: '--fs-divider-muted',
  footerBg: '--fs-footer-bg',
  footerBorder: '--fs-footer-border',
  footerScheduleBg: '--fs-footer-schedule-bg',
  footerScheduleBorder: '--fs-footer-schedule-border',
  footerScheduleHoverBg: '--fs-footer-schedule-hover-bg',
  footerPriceAccent: '--fs-footer-price-accent',
  footerMarqueeInputBorder: '--fs-footer-marquee-input-border',
  footerMarqueeTextOnLight: '--fs-footer-marquee-text-light',
  footerMarqueeTextOnDark: '--fs-footer-marquee-text-dark',
  trainSignBg: '--fs-train-bg',
  trainSignBorder: '--fs-train-border',
  trainSignSubtext: '--fs-train-subtext',
  trainSignPrimary: '--fs-train-primary',
  trainSignAccent: '--fs-train-accent',
  trainSignEvent: '--fs-train-event',
  drawerScrim: '--fs-drawer-scrim',
  drawerBg: '--fs-drawer-bg',
  drawerBorder: '--fs-drawer-border',
  drawerText: '--fs-drawer-text',
  drawerActiveBg: '--fs-drawer-active-bg',
  drawerActiveText: '--fs-drawer-active-text',
  drawerInactiveText: '--fs-drawer-inactive-text',
  drawerHoverBg: '--fs-drawer-hover-bg',
  advisoryBorder: '--fs-advisory-border',
  inputBg: '--fs-input-bg',
  inputBorder: '--fs-input-border',
  btnMuted: '--fs-btn-muted',
  btnMutedHover: '--fs-btn-muted-hover',
  logoSq0: '--fs-logo-sq-0',
  logoSq1: '--fs-logo-sq-1',
  logoSq2: '--fs-logo-sq-2',
  logoSq3: '--fs-logo-sq-3',
  logoSqMuted: '--fs-logo-sq-muted',
  logoSqPop: '--fs-logo-sq-pop',
  menuItemFontSize: '--fs-menu-item-font-size',
  menuItemPaddingY: '--fs-menu-item-padding-y',
  borderRadius: '--fs-radius',
  navBlur: '--fs-nav-blur',
  cardShadow: '--fs-card-shadow',
};

export const TOKEN_GROUPS: { title: string; keys: DesignTokenKey[] }[] = [
  { title: 'Page & background', keys: ['pageBg', 'pageText', 'textMuted', 'borderDefault', 'bgImageOpacityDark', 'bgImageOpacityLight', 'bgImageOpacitySoft'] },
  { title: 'Header & menu button', keys: ['headerBg', 'headerBorder', 'headerWordmark', 'headerTagline', 'headerTaglineBorder', 'headerMenuBtnBg', 'headerMenuBtnBorder', 'headerMenuBtnIcon'] },
  { title: 'Main nav strip', keys: ['navStripBg', 'navStripBorderTop', 'navActiveText', 'navActiveBorder', 'navInactiveText', 'navInactiveHoverText', 'navInactiveHoverBorder'] },
  { title: 'Menu quadrants (green)', keys: ['quadrantGreenBg', 'quadrantGreenBorder', 'quadrantGreenAccent', 'quadrantGreenHeaderBg'] },
  { title: 'Menu quadrants (blue)', keys: ['quadrantBlueBg', 'quadrantBlueBorder', 'quadrantBlueAccent', 'quadrantBlueHeaderBg'] },
  { title: 'Cards & dividers', keys: ['cardBg', 'dividerMuted', 'inputBg', 'inputBorder', 'btnMuted', 'btnMutedHover'] },
  { title: 'Footer & ticker', keys: ['footerBg', 'footerBorder', 'footerScheduleBg', 'footerScheduleBorder', 'footerScheduleHoverBg', 'footerPriceAccent', 'footerMarqueeInputBorder', 'footerMarqueeTextOnLight', 'footerMarqueeTextOnDark'] },
  { title: 'Train sign', keys: ['trainSignBg', 'trainSignBorder', 'trainSignSubtext', 'trainSignPrimary', 'trainSignAccent', 'trainSignEvent'] },
  { title: 'Drawer (mobile nav)', keys: ['drawerScrim', 'drawerBg', 'drawerBorder', 'drawerText', 'drawerActiveBg', 'drawerActiveText', 'drawerInactiveText', 'drawerHoverBg'] },
  { title: 'Logo squares (header)', keys: ['logoSq0', 'logoSq1', 'logoSq2', 'logoSq3', 'logoSqMuted', 'logoSqPop'] },
  { title: 'Misc', keys: ['advisoryBorder'] },
];

export const TOKEN_LABELS: Record<DesignTokenKey, string> = {
  pageBg: 'Page background',
  pageText: 'Body text',
  textMuted: 'Muted text',
  borderDefault: 'Default border',
  bgImageOpacityDark: 'Bg photo opacity (dark theme)',
  bgImageOpacityLight: 'Bg photo opacity (light theme)',
  bgImageOpacitySoft: 'Bg photo opacity (modern / apple)',
  headerBg: 'Header background',
  headerBorder: 'Header border',
  headerWordmark: 'Wordmark & chrome text',
  headerTagline: 'Tagline',
  headerTaglineBorder: 'Tagline divider',
  headerMenuBtnBg: 'Menu button fill',
  headerMenuBtnBorder: 'Menu button border',
  headerMenuBtnIcon: 'Menu icon color',
  navStripBg: 'Nav strip background',
  navStripBorderTop: 'Nav strip top border',
  navActiveText: 'Nav active text',
  navActiveBorder: 'Nav active underline',
  navInactiveText: 'Nav inactive text',
  navInactiveHoverText: 'Nav hover text',
  navInactiveHoverBorder: 'Nav hover underline',
  quadrantGreenBg: 'Green quadrant panel',
  quadrantGreenBorder: 'Green quadrant border',
  quadrantGreenAccent: 'Green quadrant accent text',
  quadrantGreenHeaderBg: 'Green quadrant header bar',
  quadrantBlueBg: 'Blue quadrant panel',
  quadrantBlueBorder: 'Blue quadrant border',
  quadrantBlueAccent: 'Blue quadrant accent text',
  quadrantBlueHeaderBg: 'Blue quadrant header bar',
  cardBg: 'Card / inset surface',
  dividerMuted: 'List dividers',
  footerBg: 'Footer background',
  footerBorder: 'Footer border',
  footerScheduleBg: 'Daily schedule button',
  footerScheduleBorder: 'Schedule button border',
  footerScheduleHoverBg: 'Schedule button hover',
  footerPriceAccent: 'Price accent',
  footerMarqueeInputBorder: 'Ticker input border (admin)',
  footerMarqueeTextOnLight: 'Ticker text (light footer)',
  footerMarqueeTextOnDark: 'Ticker text (dark footer)',
  trainSignBg: 'Train sign background',
  trainSignBorder: 'Train sign border',
  trainSignSubtext: 'Train sign small lines',
  trainSignPrimary: 'Train sign main line',
  trainSignAccent: 'Train sign accent line',
  trainSignEvent: 'Train sign event text',
  drawerScrim: 'Drawer overlay',
  drawerBg: 'Drawer panel',
  drawerBorder: 'Drawer edge',
  drawerText: 'Drawer labels',
  drawerActiveBg: 'Drawer active row',
  drawerActiveText: 'Drawer active row text',
  drawerInactiveText: 'Drawer row text',
  drawerHoverBg: 'Drawer row hover',
  advisoryBorder: 'Consumer advisory top border',
  inputBg: 'Input background',
  inputBorder: 'Input border',
  btnMuted: 'Muted icon buttons',
  btnMutedHover: 'Muted icon buttons hover',
  logoSq0: 'Logo square 1',
  logoSq1: 'Logo square 2',
  logoSq2: 'Logo square 3',
  logoSq3: 'Logo square 4',
  logoSqMuted: 'Logo squares (dim)',
  logoSqPop: 'Logo pop highlight',
  menuItemFontSize: 'Menu item font size',
  menuItemPaddingY: 'Menu item row padding',
  borderRadius: 'Corner radius',
  navBlur: 'Header glass blur',
  cardShadow: 'Card shadow',
};

export const THEME_STUDIO_ENABLED_KEY = '4sq-design-studio-enabled';
export const THEME_OVERRIDES_KEY = '4sq-design-token-overrides';
