import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../db';
import { MenuData, Special, DrinksData, MenuVersion, MenuItem, MenuSection, TrainSignEvent, ChalkboardData, ChalkboardSpecial } from '../types';
import { INITIAL_MENU_DATA, INITIAL_SPECIALS } from '../data/menuData';
import { INITIAL_DRINKS_DATA } from '../data/drinksData';

const DEFAULT_TRAIN_EVENTS: TrainSignEvent[] = [
  { id: 'evt-1', title: 'KARAOKE WEDNESDAY', emoji: '🎤' },
  { id: 'evt-2', title: 'SATURDAY NIGHT DJ PARTY', emoji: '🪩' },
];

const DEFAULT_OPEN_HOURS = '4-1am Wed thru Saturday';

const DEFAULT_CHALKBOARD: ChalkboardData = {
  title: 'Four Square',
  price: '$12 Lunch Specials',
  subtitle: 'Wednesday–Saturday from 4PM–1AM',
  items: [
    { id: 'cb-1', heading: 'Bar Pizza', description: 'Our signature thin-crust bar pie with house sauce and mozzarella' },
    { id: 'cb-2', heading: 'Steak Tips', description: 'Marinated sirloin tips with fries and house slaw' },
    { id: 'cb-3', heading: 'Classic Cheeseburger', description: 'Our classic cheeseburger & fries' },
    { id: 'cb-4', heading: 'Fish & Chips', description: 'Beer-battered cod with fries, tartar sauce & slaw' },
  ],
};

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
  const [events, setEvents] = useState<TrainSignEvent[]>(() => deepClone(DEFAULT_TRAIN_EVENTS));
  const [openHours, setOpenHours] = useState<string>(DEFAULT_OPEN_HOURS);
  const [chalkboard, setChalkboard] = useState<ChalkboardData>(() => deepClone(DEFAULT_CHALKBOARD));
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const savedRef = useRef({ menu, specials, drinks, events: [] as TrainSignEvent[], openHours: DEFAULT_OPEN_HOURS, chalkboard: deepClone(DEFAULT_CHALKBOARD) as ChalkboardData });

  // Load from DB on mount
  useEffect(() => {
    db.current_menu.get('current').then((record) => {
      if (record) {
        const loadedEvents = record.events?.length ? record.events : deepClone(DEFAULT_TRAIN_EVENTS);
        const loadedOpenHours = record.openHours ?? DEFAULT_OPEN_HOURS;
        const loadedChalkboard = record.chalkboard ?? deepClone(DEFAULT_CHALKBOARD);
        setMenu(record.menu);
        setSpecials(record.specials);
        setDrinks(record.drinks);
        setEvents(deepClone(loadedEvents));
        setOpenHours(loadedOpenHours);
        setChalkboard(deepClone(loadedChalkboard));
        setLastSaved(record.lastSaved ? new Date(record.lastSaved) : null);
        savedRef.current = { menu: record.menu, specials: record.specials, drinks: record.drinks, events: loadedEvents, openHours: loadedOpenHours, chalkboard: loadedChalkboard };
      } else {
        savedRef.current = { menu: deepClone(INITIAL_MENU_DATA), specials: deepClone(INITIAL_SPECIALS), drinks: deepClone(INITIAL_DRINKS_DATA), events: deepClone(DEFAULT_TRAIN_EVENTS), openHours: DEFAULT_OPEN_HOURS, chalkboard: deepClone(DEFAULT_CHALKBOARD) };
      }
    }).finally(() => setIsLoading(false));
  }, []);

  // Track dirty state
  useEffect(() => {
    if (!isLoading) {
      setIsDirty(JSON.stringify({ menu, specials, drinks, events, openHours, chalkboard }) !== JSON.stringify(savedRef.current));
    }
  }, [menu, specials, drinks, events, openHours, chalkboard, isLoading]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = useCallback(async (note = '') => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const now = new Date();
      const snapshot = { menu: deepClone(menu), specials: deepClone(specials), drinks: deepClone(drinks), events: deepClone(events), openHours, chalkboard: deepClone(chalkboard) };
      await db.current_menu.put({ id: 'current', ...snapshot, lastSaved: now });
      await db.menu_versions.add({ timestamp: now, note: note || `Saved ${now.toLocaleString()}`, ...snapshot });
      savedRef.current = { ...snapshot };
      setLastSaved(now);
      setIsDirty(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [menu, specials, drinks, events, openHours, chalkboard]);

  // ── Discard ─────────────────────────────────────────────────────────────────
  const discard = useCallback(() => {
    setMenu(deepClone(savedRef.current.menu));
    setSpecials(deepClone(savedRef.current.specials));
    setDrinks(deepClone(savedRef.current.drinks));
    setEvents(deepClone(savedRef.current.events));
    setOpenHours(savedRef.current.openHours);
    setChalkboard(deepClone(savedRef.current.chalkboard));
    setIsDirty(false);
  }, []);

  // ── Restore from version ────────────────────────────────────────────────────
  const restoreVersion = useCallback(async (version: MenuVersion) => {
    setMenu(deepClone(version.menu));
    setSpecials(deepClone(version.specials));
    setDrinks(deepClone(version.drinks));
    setEvents(version.events?.length ? deepClone(version.events) : deepClone(DEFAULT_TRAIN_EVENTS));
    setOpenHours(version.openHours ?? DEFAULT_OPEN_HOURS);
    if (version.chalkboard) setChalkboard(deepClone(version.chalkboard));
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
      (next[quadrant].sections[sectionIdx] as unknown as Record<string, unknown>)[field] = value;
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

  // ── TRAIN SIGN EVENTS ───────────────────────────────────────────────────────
  const updateEvent = useCallback((idx: number, field: keyof TrainSignEvent, value: string) => {
    setEvents(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }, []);

  const addEvent = useCallback(() => {
    setEvents(prev => [...prev, { id: genId(), title: 'NEW EVENT', emoji: '✨' }]);
  }, []);

  const removeEvent = useCallback((idx: number) => {
    setEvents(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const moveEvent = useCallback((idx: number, direction: 'up' | 'down') => {
    setEvents(prev => {
      const next = [...prev];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  // ── CHALKBOARD SPECIALS CRUD ─────────────────────────────────────────────────
  const updateChalkboardMeta = useCallback((field: 'title' | 'price' | 'subtitle' | 'accentColor', value: string) => {
    setChalkboard(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateChalkboardItem = useCallback((idx: number, field: keyof ChalkboardSpecial, value: string) => {
    setChalkboard(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  }, []);

  const addChalkboardItem = useCallback(() => {
    setChalkboard(prev => ({
      ...prev,
      items: [...prev.items, { id: genId(), heading: 'New Special', description: 'Description here' }],
    }));
  }, []);

  const removeChalkboardItem = useCallback((idx: number) => {
    setChalkboard(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }, []);

  const moveChalkboardItem = useCallback((idx: number, direction: 'up' | 'down') => {
    setChalkboard(prev => {
      const items = [...prev.items];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= items.length) return prev;
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...prev, items };
    });
  }, []);

  return {
    menu, specials, drinks, events, openHours, setOpenHours,
    chalkboard, setChalkboard,
    updateChalkboardMeta, updateChalkboardItem, addChalkboardItem, removeChalkboardItem, moveChalkboardItem,
    isDirty, isLoading, isSaving, saveError, lastSaved,
    save, discard, restoreVersion,
    updateItem, addItem, removeItem, moveItem,
    updateSection, addSection, removeSection, moveSection,
    updateSpecial,
    updateDrinkItem, addDrinkItem, removeDrinkItem,
    updateEvent, addEvent, removeEvent, moveEvent,
  };
}
