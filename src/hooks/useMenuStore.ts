import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../db';
import { MenuData, Special, DrinksData, MenuVersion, MenuItem, MenuSection, TrainSignEvent, ChalkboardData, ChalkboardSpecial, DisplayBoardConfig } from '../types';
import { INITIAL_MENU_DATA } from '../data/menuData';
import { INITIAL_DRINKS_DATA } from '../data/drinksData';
import {
  INITIAL_SPECIALS,
  defaultChalkboardMeta,
  normalizeSpecials,
} from '../lib/specials';
import { DEFAULT_DISPLAY_BOARD, normalizeDisplayBoard } from '../lib/boardDisplay';

const DEFAULT_TRAIN_EVENTS: TrainSignEvent[] = [
  { id: 'evt-1', title: 'KARAOKE WEDNESDAY', emoji: '🎤' },
  { id: 'evt-2', title: 'SATURDAY NIGHT DJ PARTY', emoji: '🪩' },
];

const DEFAULT_OPEN_HOURS = '4PM–1AM · Wed through Sat';

const DEFAULT_CHALKBOARD: ChalkboardData = defaultChalkboardMeta();

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
  const [displayBoard, setDisplayBoard] = useState<DisplayBoardConfig>(() => deepClone(DEFAULT_DISPLAY_BOARD));
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const savedRef = useRef({ menu, specials, drinks, events: [] as TrainSignEvent[], openHours: DEFAULT_OPEN_HOURS, chalkboard: deepClone(DEFAULT_CHALKBOARD) as ChalkboardData, displayBoard: deepClone(DEFAULT_DISPLAY_BOARD) as DisplayBoardConfig });

  // Load from DB on mount
  useEffect(() => {
    db.current_menu.get('current').then((record) => {
      if (record) {
        const loadedEvents = record.events?.length ? record.events : deepClone(DEFAULT_TRAIN_EVENTS);
        const loadedOpenHours = record.openHours ?? DEFAULT_OPEN_HOURS;
        const loadedChalkboard = defaultChalkboardMeta(record.chalkboard);
        const loadedDisplayBoard = normalizeDisplayBoard(record.displayBoard);
        const loadedSpecials = normalizeSpecials(record.specials, record.chalkboard);
        setMenu(record.menu);
        setSpecials(loadedSpecials);
        setDrinks(record.drinks);
        setEvents(deepClone(loadedEvents));
        setOpenHours(loadedOpenHours);
        setChalkboard(loadedChalkboard);
        setDisplayBoard(loadedDisplayBoard);
        setLastSaved(record.lastSaved ? new Date(record.lastSaved) : null);
        savedRef.current = { menu: record.menu, specials: loadedSpecials, drinks: record.drinks, events: loadedEvents, openHours: loadedOpenHours, chalkboard: loadedChalkboard, displayBoard: loadedDisplayBoard };
      } else {
        savedRef.current = { menu: deepClone(INITIAL_MENU_DATA), specials: deepClone(INITIAL_SPECIALS), drinks: deepClone(INITIAL_DRINKS_DATA), events: deepClone(DEFAULT_TRAIN_EVENTS), openHours: DEFAULT_OPEN_HOURS, chalkboard: deepClone(DEFAULT_CHALKBOARD), displayBoard: deepClone(DEFAULT_DISPLAY_BOARD) };
      }
    }).finally(() => setIsLoading(false));
  }, []);

  // Track dirty state
  useEffect(() => {
    if (!isLoading) {
      setIsDirty(JSON.stringify({ menu, specials, drinks, events, openHours, chalkboard, displayBoard }) !== JSON.stringify(savedRef.current));
    }
  }, [menu, specials, drinks, events, openHours, chalkboard, displayBoard, isLoading]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = useCallback(async (note = '') => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const now = new Date();
      const snapshot = { menu: deepClone(menu), specials: deepClone(specials), drinks: deepClone(drinks), events: deepClone(events), openHours, chalkboard: deepClone(chalkboard), displayBoard: deepClone(displayBoard) };
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
  }, [menu, specials, drinks, events, openHours, chalkboard, displayBoard]);

  // ── Discard ─────────────────────────────────────────────────────────────────
  const discard = useCallback(() => {
    setMenu(deepClone(savedRef.current.menu));
    setSpecials(deepClone(savedRef.current.specials));
    setDrinks(deepClone(savedRef.current.drinks));
    setEvents(deepClone(savedRef.current.events));
    setOpenHours(savedRef.current.openHours);
    setChalkboard(deepClone(savedRef.current.chalkboard));
    setDisplayBoard(deepClone(savedRef.current.displayBoard));
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
    setDisplayBoard(normalizeDisplayBoard(version.displayBoard));
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

  const addSpecial = useCallback(() => {
    setSpecials(prev => [
      ...prev,
      {
        id: genId(),
        day: 'Wed',
        dish: 'New Special',
        price: 12,
        description: '',
      },
    ]);
  }, []);

  const removeSpecial = useCallback((idx: number) => {
    setSpecials(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const moveSpecial = useCallback((idx: number, direction: 'up' | 'down') => {
    setSpecials(prev => {
      const next = [...prev];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
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
    const fieldMap: Partial<Record<keyof ChalkboardSpecial, keyof Special>> = {
      heading: 'dish',
      description: 'description',
      image: 'image',
    };
    const specialField = fieldMap[field];
    if (!specialField) return;
    setSpecials(prev => prev.map((s, i) => i === idx ? { ...s, [specialField]: value } : s));
  }, []);

  const addChalkboardItem = useCallback(() => {
    addSpecial();
  }, [addSpecial]);

  const removeChalkboardItem = useCallback((idx: number) => {
    removeSpecial(idx);
  }, [removeSpecial]);

  const moveChalkboardItem = useCallback((idx: number, direction: 'up' | 'down') => {
    moveSpecial(idx, direction);
  }, [moveSpecial]);

  const updateDisplayBoard = useCallback((field: keyof DisplayBoardConfig, value: string | number) => {
    setDisplayBoard(prev => normalizeDisplayBoard({ ...prev, [field]: value }));
  }, []);

  return {
    menu, specials, drinks, events, openHours, setOpenHours,
    chalkboard, setChalkboard, displayBoard, updateDisplayBoard,
    updateChalkboardMeta, updateChalkboardItem, addChalkboardItem, removeChalkboardItem, moveChalkboardItem,
    isDirty, isLoading, isSaving, saveError, lastSaved,
    save, discard, restoreVersion,
    updateItem, addItem, removeItem, moveItem,
    updateSection, addSection, removeSection, moveSection,
    updateSpecial, addSpecial, removeSpecial, moveSpecial,
    updateDrinkItem, addDrinkItem, removeDrinkItem,
    updateEvent, addEvent, removeEvent, moveEvent,
  };
}
