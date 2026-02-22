import { MenuData, Special } from '../types';

export const INITIAL_MENU_DATA: MenuData = {
  apps: {
    title: 'Apps',
    color: 'green',
    sections: [
      {
        name: 'Tenders & Wings',
        note: 'Any sauce or dry rub',
        items: [
          { id: 'a1', name: 'Tenders (4 pcs)', price: 11 },
          { id: 'a2', name: 'Tenders (8 pcs)', price: 21 },
          { id: 'a3', name: 'Wings (6 pcs)', price: 12 },
          { id: 'a4', name: 'Wings (10 pcs)', price: 21 },
          { id: 'a5', name: 'Add Fries', price: 5, isAddon: true },
        ],
      },
      {
        name: 'Sides & Shareables',
        items: [
          { id: 'a6', name: 'Shoestring / Waffle / Sweet Potato Fries', description: '5–6', price: 5 },
          { id: 'a7', name: 'Beer Battered Onion Rings', price: 8 },
          { id: 'a8', name: 'Mozzarella Sticks', price: 9 },
          { id: 'a9', name: 'Spinach Artichoke Dip', price: 11 },
          { id: 'a10', name: 'Steak Tip Eggrolls', price: 16 },
          { id: 'a11', name: 'Four Square Sampler', price: 25 },
        ],
      },
    ],
  },
  mains: {
    title: 'Mains & Pizza',
    color: 'blue',
    sections: [
      {
        name: 'Mains',
        note: 'Served with 2 sides',
        items: [
          { id: 'm1', name: 'Steak Tip Dinner', price: 26 },
          { id: 'm2', name: '½ Grill Special', price: 24 },
          { id: 'm3', name: 'Chicken A La King', price: 22 },
        ],
      },
      {
        name: 'Bar Pizzas',
        note: '10" Thin Crust',
        items: [
          { id: 'm4', name: 'Cheese / Pepperoni', description: '$9–$10', price: 9 },
          { id: 'm5', name: 'Veggie / Hawaiian', price: 13 },
          { id: 'm6', name: 'Buffalo / BBQ Chicken', price: 14 },
          { id: 'm7', name: 'Big Mac / Bruschetta', price: 15 },
        ],
      },
    ],
  },
  burgers: {
    title: 'Burgers & Subs',
    color: 'blue',
    sections: [
      {
        name: 'Burgers',
        note: 'On house-made brioche | w/ fries',
        items: [
          { id: 'b1', name: 'Classic Burger', price: 14 },
          { id: 'b2', name: 'Camp Fire Burger', price: 16 },
          { id: 'b3', name: 'Big Mac Attack', price: 18.5 },
          { id: 'b4', name: 'Veggie Burger', price: 14, isNew: true },
        ],
      },
      {
        name: 'Subs & Chicken',
        note: 'On fresh-baked rolls',
        items: [
          { id: 'b5', name: 'Steak Tip Sub', price: 18 },
          { id: 'b6', name: 'Chicken Parm Sub', price: 14 },
          { id: 'b7', name: 'Chicken Sandwich', description: 'Grilled or Crispy', price: 14 },
        ],
      },
    ],
  },
  healthy: {
    title: 'Healthy',
    color: 'green',
    sections: [
      {
        name: 'Salads & Wraps',
        items: [
          { id: 'h1', name: 'House Salad', price: 11 },
          { id: 'h2', name: 'Caesar Salad', price: 13 },
          { id: 'h3', name: 'Greek Salad', price: 14 },
          { id: 'h4', name: 'Weekly Special', price: 10 },
          { id: 'h5', name: 'Add Protein', description: 'Chicken (+9) | Steak Tips (+12) | Shrimp (+14)', price: 9, isAddon: true },
        ],
      },
      {
        name: 'Soups',
        note: 'Served in our 4 Square Crock',
        items: [
          { id: 'h6', name: 'Soup of the Week', price: 10 },
        ],
      },
    ],
  },
};

export const INITIAL_SPECIALS: Special[] = [
  { day: 'Mon', dish: 'Meatloaf', price: 15 },
  { day: 'Tue', dish: 'Tacos', price: 12 },
  { day: 'Wed', dish: 'Wings', price: 18 },
  { day: 'Thu', dish: 'Prime Rib', price: 28 },
  { day: 'Fri', dish: 'Fish Fry', price: 19 },
  { day: 'Sat', dish: "Chef's Catch", price: 24 },
  { day: 'Sun', dish: 'Family Roast', price: 22 },
];
