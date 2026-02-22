import Dexie, { type Table } from 'dexie';
import { MenuVersion, CurrentMenuRecord } from './types';

export class FourSquareDB extends Dexie {
  current_menu!: Table<CurrentMenuRecord, string>;
  menu_versions!: Table<MenuVersion, number>;

  constructor() {
    super('FourSquareDB');
    this.version(1).stores({
      current_menu: 'id',
      menu_versions: '++id, timestamp',
    });
  }
}

export const db = new FourSquareDB();
