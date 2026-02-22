import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../db';
import { MenuData, Special, DrinksData, MenuVersion, MenuItem, MenuSection } from '../types';
import { INITIAL_MENU_DATA, INITIAL_SPECIALS } from '../data/menuData';
import { INITIAL_DRINKS_DATA } from '../data/drinksData';

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useMenuStore() {
  const [menu, setMenu] = useState<MenuData>(deepClone(INITIAL_MENU_DATA));
  const [specials, setSpecials] = useState<Special[]>(deepClone(INITIAL_SPECIALS));
  const [drinks, setDrinks] = useState<DrinksData>(deepClone(INITIAL_DRINKS_DATA));
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const savedRef = useRef({ menu, specials, drinks });

  // Load from DB on mount
  useEffect(() => {
    db.current_menu.get('current').then((record) => {
      if (record) {
        setMenu(record.menu);
        setSpecials(record.specials);
        setDrinks(record.drinks);
        setLastSaved(record.lastSaved);
        savedRef.current = { menu: record.menu, specials: record.specials, drinks: record.drinks };
      }
    }).finally(() => setIsLoading(false));
  }, []);

  // Track dirty state
  useEffect(() => {
    if (!isLoading) {
      setIsDirty(JSON.stringify({ menu, specials, drinks }) !== JSON.stringify(savedRef.current));
    }
  }, [menu, specials, drinks, isLoading]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = useCallback(async (note = '') => {
    const now = new Date();
    const snapshot = { menu: deepClone(menu), specials: deepClone(specials), drinks: deepClone(drinks) };
    await db.current_menu.put({ id: 'current', ...snapshot, lastSaved: now });
    await db.menu_versions.add({ timestamp: now, note: note || `Saved ${now.toLocaleString()}`, ...snapshot });
    savedRef.current = snapshot;
    setLastSaved(now);
    setIsDirty(false);
  }, [menu, specials, drinks]);

  // ── Discard ─────────────────────────────────────────────────────────────────
  const discard = useCallback(() => {
    setMenu(deepClone(savedRef.current.menu));
    setSpecials(deepClone(savedRef.current.specials));
    setDrinks(deepClone(savedRef.current.drinks));
    setIsDirty(false);
  }, []);

  // ── Restore from version ────────────────────────────────────────────────────
  const restoreVersion = useCallback(async (version: MenuVersion) => {
    setMenu(deepClone(version.menu));
    setSpecials(deepClone(version.specials));
    setDrinks(deepClone(version.drinks));
    setIsDirty(true);
  }, []);

  // ── MENU ITEM CRUD ──────────────────────────────────────────────────────────
  const updateItem = useCallback((
    quadrant: keyof MenuData,
    sectionIdx: number,
    itemIdx: number,
    field: keyof MenuItem,
    value: string | number | boolean
  ) => {
    setMenu(prev => {
      const next = deepClone(prev);
      next[quadrant].sections[sectionIdx].items[itemIdx] = {
        ...next[quadrant].sections[sectionIdx].items[itemIdx],
        [field]: value,
      };
      return next;
    });
  }, []);

  const addItem = useCallback((quadrant: keyof MenuData, sectionIdx: number) => {
    setMenu(prev => {
      const next = deepClone(prev);
      next[quadrant].sections[sectionIdx].items.push({
        id: genId(),
        name: 'New Item',
        price: 0,
      });
      return next;
    });
  }, []);

  const removeItem = useCallback((quadrant: keyof MenuData, sectionIdx: number, itemIdx: number) => {
    setMenu(prev => {
      const next = deepClone(prev);
      next[quadrant].sections[sectionIdx].items.splice(itemIdx, 1);
      return next;
    });
  }, []);

  const moveItem = useCallback((quadrant: keyof MenuData, sectionIdx: number, itemIdx: number, direction: 'up' | 'down') => {
    setMenu(prev => {
      const next = deepClone(prev);
      const items = next[quadrant].sections[sectionIdx].items;
      const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return prev;
      [items[itemIdx], items[targetIdx]] = [items[targetIdx], items[itemIdx]];
      return next;
    });
  }, []);

  // ── SECTION CRUD ─────────────────────────────────────────────────────────────
  const updateSection = useCallback((
    quadrant: keyof MenuData,
    sectionIdx: number,
    field: keyof MenuSection,
    value: string
  ) => {
    setMenu(prev => {
      const next = deepClone(prev);
      (next[quadrant].sections[sectionIdx] as Record<string, unknown>)[field] = value;
      return next;
    });
  }, []);

  const addSection = useCallback((quadrant: keyof MenuData) => {
    setMenu(prev => {
      const next = deepClone(prev);
      next[quadrant].sections.push({ name: 'New Section', items: [] });
      return next;
    });
  }, []);

  const removeSection = useCallback((quadrant: keyof MenuData, sectionIdx: number) => {
    setMenu(prev => {
      const next = deepClone(prev);
      next[quadrant].sections.splice(sectionIdx, 1);
      return next;
    });
  }, []);

  const moveSection = useCallback((quadrant: keyof MenuData, sectionIdx: number, direction: 'up' | 'down') => {
    setMenu(prev => {
      const next = deepClone(prev);
      const sections = next[quadrant].sections;
      const targetIdx = direction === 'up' ? sectionIdx - 1 : sectionIdx + 1;
      if (targetIdx < 0 || targetIdx >= sections.length) return prev;
      [sections[sectionIdx], sections[targetIdx]] = [sections[targetIdx], sections[sectionIdx]];
      return next;
    });
  }, []);

  // ── SPECIALS CRUD ─────────────────────────────────────────────────────────────
  const updateSpecial = useCallback((idx: number, field: keyof Special, value: string | number) => {
    setSpecials(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }, []);

  // ── DRINKS CRUD ───────────────────────────────────────────────────────────────
  const updateDrinkItem = useCallback((category: string, idx: number, field: string, value: string | number | boolean) => {
    setDrinks(prev => ({
      ...prev,
      [category]: prev[category].map((d, i) => i === idx ? { ...d, [field]: value } : d),
    }));
  }, []);

  const addDrinkItem = useCallback((category: string) => {
    setDrinks(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { name: 'New Drink', desc: '', price: 0 }],
    }));
  }, []);

  const removeDrinkItem = useCallback((category: string, idx: number) => {
    setDrinks(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== idx),
    }));
  }, []);

  return {
    menu, specials, drinks,
    isDirty, isLoading, lastSaved,
    save, discard, restoreVersion,
    updateItem, addItem, removeItem, moveItem,
    updateSection, addSection, removeSection, moveSection,
    updateSpecial,
    updateDrinkItem, addDrinkItem, removeDrinkItem,
  };
}
