import type { ChalkboardData, Special } from '../types';

/** Days the bar runs specials (matches open hours). */
export const SPECIAL_DAYS = ['Wed', 'Thu', 'Fri', 'Sat'] as const;

export const DEFAULT_SPECIALS_META: Pick<ChalkboardData, 'title' | 'price' | 'subtitle' | 'accentColor'> = {
  title: 'Four Square',
  price: '$12 Lunch Specials',
  subtitle: 'Wednesday–Saturday · 4PM–1AM',
  accentColor: '#9ED3C7',
};

export const INITIAL_SPECIALS: Special[] = [
  {
    id: 'sp-wed',
    day: 'Wed',
    dish: 'Bar Pizza',
    price: 12,
    description: 'Thin-crust bar pie with house sauce and mozzarella',
  },
  {
    id: 'sp-thu',
    day: 'Thu',
    dish: 'Steak Tips',
    price: 12,
    description: 'Marinated sirloin tips with fries and house slaw',
  },
  {
    id: 'sp-fri',
    day: 'Fri',
    dish: 'Classic Cheeseburger',
    price: 12,
    description: 'Classic cheeseburger and fries',
  },
  {
    id: 'sp-sat',
    day: 'Sat',
    dish: 'Fish & Chips',
    price: 12,
    description: 'Beer-battered cod, fries, tartar, and slaw',
  },
];

const LEGACY_PLACEHOLDER_DISHES = new Set(['Meatloaf', 'Tacos', 'Wings', 'Prime Rib', 'Fish Fry', "Chef's Catch", 'Family Roast']);

export function isLegacyPlaceholderSpecials(specials: Special[]): boolean {
  return specials.some((s) => LEGACY_PLACEHOLDER_DISHES.has(s.dish));
}

/** One-time merge: old chalkboard item list → unified specials rows. */
export function specialsFromChalkboardItems(items: ChalkboardData['items']): Special[] {
  return items.map((item, i) => ({
    id: item.id,
    day: SPECIAL_DAYS[i] ?? 'Wed',
    dish: item.heading,
    price: 12,
    description: item.description,
    image: item.image,
  }));
}

export function normalizeSpecials(
  specials: Special[] | undefined,
  chalkboard: ChalkboardData | undefined,
): Special[] {
  const base = specials?.length ? specials : INITIAL_SPECIALS;

  if (isLegacyPlaceholderSpecials(base) && chalkboard?.items?.length) {
    return specialsFromChalkboardItems(chalkboard.items);
  }

  return base.map((s, i) => ({
    ...s,
    id: s.id ?? `sp-${s.day.toLowerCase()}-${i}`,
  }));
}

export function defaultChalkboardMeta(chalkboard?: ChalkboardData): ChalkboardData {
  return {
    title: chalkboard?.title ?? DEFAULT_SPECIALS_META.title,
    price: chalkboard?.price ?? DEFAULT_SPECIALS_META.price,
    subtitle: chalkboard?.subtitle ?? DEFAULT_SPECIALS_META.subtitle,
    accentColor: chalkboard?.accentColor ?? DEFAULT_SPECIALS_META.accentColor,
    items: [],
  };
}

export function specialForToday(specials: Special[], now = new Date()): Special | undefined {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = dayNames[now.getDay()];
  return specials.find((s) => s.day === today && s.dish.trim());
}

export function specialsForDisplay(specials: Special[]): Special[] {
  return specials.filter((s) => s.dish.trim());
}

export function duplicateSpecialDays(specials: Special[]): string[] {
  const counts = new Map<string, number>();
  for (const s of specials) {
    counts.set(s.day, (counts.get(s.day) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([day]) => day);
}

export function chalkboardItemsFromSpecials(specials: Special[]) {
  return specialsForDisplay(specials).map((s) => ({
    id: s.id ?? s.day,
    heading: s.dish,
    description: s.description ?? '',
    image: s.image,
  }));
}
