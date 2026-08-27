export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAddon?: boolean;
  isNew?: boolean;
}

export interface MenuSection {
  name: string;
  note?: string;
  items: MenuItem[];
}

export interface QuadrantData {
  title: string;
  color: 'green' | 'blue';
  sections: MenuSection[];
}

export interface MenuData {
  apps: QuadrantData;
  mains: QuadrantData;
  burgers: QuadrantData;
  healthy: QuadrantData;
}

export interface Special {
  id?: string;
  day: string;
  dish: string;
  price: number;
  description?: string;
  image?: string;
}

export interface DrinkItem {
  name: string;
  desc: string;
  price: number;
  tag?: string;
  featured?: boolean;
}

export type DrinksData = Record<string, DrinkItem[]>;

export interface TrainSignEvent {
  id: string;
  title: string;
  emoji: string;
}

export type BoardBackgroundFit = 'cover' | 'contain';
export type BoardBackgroundPosition = 'center' | 'top' | 'bottom';

/** TV / tablet display board (`#board`) */
export interface DisplayBoardConfig {
  backgroundImageUrl: string;
  /** Used when main URL is empty or fails to load */
  fallbackImageUrl: string;
  backgroundFit: BoardBackgroundFit;
  backgroundPosition: BoardBackgroundPosition;
  /** 0 = show photo clearly, 100 = very dark scrim for text */
  overlayStrength: number;
  tagline: string;
  /** Prices, weekly panel, primary labels */
  accentColor: string;
  /** “Coming up” events accent */
  highlightColor: string;
}

export interface MenuVersion {
  id?: number;
  timestamp: Date;
  note: string;
  menu: MenuData;
  specials: Special[];
  drinks: DrinksData;
  events?: TrainSignEvent[];
  openHours?: string;
  chalkboard?: ChalkboardData;
  displayBoard?: DisplayBoardConfig;
}

export interface ChalkboardSpecial {
  id: string;
  heading: string;
  description: string;
  image?: string;
}

export interface ChalkboardData {
  title: string;
  price: string;
  subtitle: string;
  items: ChalkboardSpecial[];
  accentColor?: string;
}

export interface CurrentMenuRecord {
  id: 'current';
  menu: MenuData;
  specials: Special[];
  drinks: DrinksData;
  lastSaved: Date;
  events?: TrainSignEvent[];
  openHours?: string;
  chalkboard?: ChalkboardData;
  displayBoard?: DisplayBoardConfig;
}
