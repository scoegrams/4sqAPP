import { DrinksData } from '../types';

export const INITIAL_DRINKS_DATA: DrinksData = {
  draft: [
    { name: 'Widowmaker Blue Comet', desc: 'New England IPA — 7.1% ABV', price: 8, tag: 'On Draft', featured: true },
    { name: 'Spotted Cow', desc: 'New Glarus — Farmhouse Ale', price: 6, tag: 'Local' },
    { name: 'Two Women', desc: 'New Glarus — Lager', price: 6, tag: 'Local' },
    { name: 'Hazy IPA', desc: 'Rotating Tap', price: 7, tag: 'Rotating' },
    { name: 'Miller Lite', desc: 'American Light Lager', price: 4 },
    { name: 'Coors Light', desc: 'American Light Lager', price: 4 },
    { name: 'Guinness', desc: 'Irish Dry Stout', price: 7 },
  ],
  cocktails: [
    { name: "Tito's Handmade Vodka", desc: 'Well Vodka — Austin, TX', price: 9, tag: 'Well', featured: true },
    { name: 'Old Fashioned', desc: 'Bourbon, bitters, sugar, orange', price: 10, tag: 'House' },
    { name: 'Whiskey Sour', desc: 'Bourbon, lemon, simple syrup, egg white', price: 10 },
    { name: 'Moscow Mule', desc: "Tito's, ginger beer, lime, mint", price: 10, tag: 'Popular' },
    { name: 'Greenbush Marg', desc: 'Tequila, triple sec, lime, jalapeño', price: 11, tag: 'Signature' },
    { name: 'Four Square Spritz', desc: 'Aperol, prosecco, orange', price: 9, tag: 'Signature' },
    { name: 'Ranch Water', desc: 'Tequila, Topo Chico, lime', price: 9 },
    { name: "Tito's Lemonade", desc: "Tito's, lemon, simple syrup, soda", price: 10 },
    { name: 'Cranberry Mule', desc: "Tito's, ginger beer, cranberry, lime", price: 10 },
  ],
  wine: [
    { name: 'Pine & Brown Cabernet', desc: 'Spring Mountain District Reserve — Napa Valley', price: 14, tag: 'Featured', featured: true },
    { name: 'Pinot Grigio', desc: 'Light, crisp, citrus notes', price: 9 },
    { name: 'Sauvignon Blanc', desc: 'Bright, grassy, tropical fruit', price: 9 },
    { name: 'Pinot Noir', desc: 'Medium-bodied, cherry, earthy', price: 10 },
    { name: 'Rosé', desc: 'Dry, floral, strawberry', price: 9 },
    { name: 'Prosecco', desc: 'Sparkling, by the glass', price: 9 },
  ],
  seltzers: [
    { name: 'Viva La Tequila', desc: 'Tequila Seltzer — 4.5% ABV', price: 6, tag: 'Featured', featured: true },
    { name: 'White Claw', desc: 'Black Cherry • Mango • Watermelon • Lime', price: 5, tag: 'Seltzer' },
    { name: 'High Noon', desc: 'Vodka Hard Seltzer — Peach • Pineapple • Watermelon', price: 6, tag: 'Seltzer' },
    { name: 'Sun Cruiser', desc: 'Iced Tea Vodka — Lemon • Peach • Raspberry', price: 6, tag: 'Seltzer' },
    { name: 'Angry Orchard', desc: 'Crisp Apple Hard Cider', price: 5, tag: 'Cider' },
    { name: 'Shacksbury Dry Cider', desc: 'Vermont Craft Dry Cider', price: 6, tag: 'Cider' },
  ],
};

export const DRINK_CATEGORY_LABELS: Record<string, string> = {
  draft: 'Draft Beer',
  cocktails: 'Cocktails',
  wine: 'Wine',
  seltzers: 'Seltzers & Cans',
};

export const CANNED_BEERS: { name: string; price: number }[] = [
  { name: 'Bud Light', price: 4 },
  { name: 'Budweiser', price: 4 },
  { name: 'Miller Lite', price: 4 },
  { name: 'Coors Light', price: 4 },
  { name: 'Michelob Ultra', price: 5 },
  { name: 'Corona Extra', price: 5 },
  { name: 'Modelo Especial', price: 5 },
  { name: 'Heineken', price: 5 },
  { name: 'Blue Moon', price: 5 },
  { name: 'Sam Adams Lager', price: 5 },
  { name: 'Truly Hard Seltzer', price: 5 },
  { name: 'White Claw', price: 5 },
];
