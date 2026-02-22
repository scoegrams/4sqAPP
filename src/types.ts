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
  day: string;
  dish: string;
  price: number;
}

export interface DrinkItem {
  name: string;
  desc: string;
  price: number;
  tag?: string;
  featured?: boolean;
}

export type DrinksData = Record<string, DrinkItem[]>;

export interface MenuVersion {
  id?: number;
  timestamp: Date;
  note: string;
  menu: MenuData;
  specials: Special[];
  drinks: DrinksData;
}

export interface CurrentMenuRecord {
  id: 'current';
  menu: MenuData;
  specials: Special[];
  drinks: DrinksData;
  lastSaved: Date;
}
