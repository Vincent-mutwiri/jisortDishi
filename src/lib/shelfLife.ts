/**
 * Shelf life data (in days) for common food items.
 * Sources: FDA, USDA FoodKeeper, StillTasty.com guidelines.
 * Each entry: { pantry?: number, fridge?: number }
 * undefined means "not recommended" for that storage type.
 */
export interface ShelfLifeEntry {
  keywords: string[];
  pantry?: number;   // days at room temperature
  fridge?: number;   // days refrigerated
  category: string;
}

export const SHELF_LIFE_DB: ShelfLifeEntry[] = [
  // Dairy
  { keywords: ['milk', 'maziwa'], pantry: undefined, fridge: 7, category: 'Dairy' },
  { keywords: ['eggs', 'mayai'], pantry: 21, fridge: 35, category: 'Dairy' },
  { keywords: ['butter', "siagi"], pantry: 2, fridge: 30, category: 'Dairy' },
  { keywords: ['cheese', 'jibini'], pantry: undefined, fridge: 21, category: 'Dairy' },
  { keywords: ['yogurt', 'mtindi'], pantry: undefined, fridge: 14, category: 'Dairy' },
  { keywords: ['cream', 'cream'], pantry: undefined, fridge: 5, category: 'Dairy' },

  // Meat & Fish
  { keywords: ['chicken', 'kuku'], pantry: undefined, fridge: 2, category: 'Meat' },
  { keywords: ['beef', 'nyama', 'meat'], pantry: undefined, fridge: 3, category: 'Meat' },
  { keywords: ['pork', 'nguruwe'], pantry: undefined, fridge: 3, category: 'Meat' },
  { keywords: ['fish', 'samaki', 'tilapia', 'cod', 'salmon'], pantry: undefined, fridge: 2, category: 'Fish' },
  { keywords: ['shrimp', 'prawns', 'kamba'], pantry: undefined, fridge: 2, category: 'Fish' },
  { keywords: ['minced', 'ground beef'], pantry: undefined, fridge: 2, category: 'Meat' },
  { keywords: ['sausage', 'sosej'], pantry: undefined, fridge: 5, category: 'Meat' },

  // Vegetables
  { keywords: ['tomato', 'nyanya'], pantry: 7, fridge: 14, category: 'Vegetables' },
  { keywords: ['onion', 'vitunguu'], pantry: 60, fridge: 30, category: 'Vegetables' },
  { keywords: ['garlic', 'kitunguu saumu'], pantry: 120, fridge: 14, category: 'Vegetables' },
  { keywords: ['potato', 'viazi'], pantry: 30, fridge: 60, category: 'Vegetables' },
  { keywords: ['carrot', 'karoti'], pantry: 7, fridge: 21, category: 'Vegetables' },
  { keywords: ['spinach', 'sukuma', 'kale', 'managu', 'kunde'], pantry: 2, fridge: 7, category: 'Vegetables' },
  { keywords: ['cabbage', 'kabichi'], pantry: 5, fridge: 14, category: 'Vegetables' },
  { keywords: ['broccoli', 'cauliflower'], pantry: 2, fridge: 7, category: 'Vegetables' },
  { keywords: ['pepper', 'pilipili', 'capsicum'], pantry: 5, fridge: 14, category: 'Vegetables' },
  { keywords: ['cucumber', 'tango'], pantry: 3, fridge: 7, category: 'Vegetables' },
  { keywords: ['lettuce', 'salad'], pantry: 2, fridge: 7, category: 'Vegetables' },
  { keywords: ['corn', 'mahindi'], pantry: 1, fridge: 3, category: 'Vegetables' },
  { keywords: ['avocado', 'parachichi'], pantry: 5, fridge: 7, category: 'Fruits' },
  { keywords: ['mushroom', 'uyoga'], pantry: 2, fridge: 7, category: 'Vegetables' },
  { keywords: ['celery', 'leek'], pantry: 3, fridge: 14, category: 'Vegetables' },

  // Fruits
  { keywords: ['banana', 'ndizi'], pantry: 7, fridge: 14, category: 'Fruits' },
  { keywords: ['mango', 'embe'], pantry: 5, fridge: 14, category: 'Fruits' },
  { keywords: ['apple', 'tofaa'], pantry: 14, fridge: 42, category: 'Fruits' },
  { keywords: ['orange', 'chungwa'], pantry: 14, fridge: 30, category: 'Fruits' },
  { keywords: ['lemon', 'ndimu'], pantry: 14, fridge: 30, category: 'Fruits' },
  { keywords: ['watermelon', 'tikiti'], pantry: 14, fridge: 7, category: 'Fruits' },
  { keywords: ['pineapple', 'nanasi'], pantry: 3, fridge: 7, category: 'Fruits' },
  { keywords: ['strawberry', 'berry'], pantry: 1, fridge: 5, category: 'Fruits' },
  { keywords: ['grapes', 'zabibu'], pantry: 2, fridge: 7, category: 'Fruits' },

  // Grains & Dry goods
  { keywords: ['rice', 'wali', 'mchele'], pantry: 730, fridge: undefined, category: 'Grains' },
  { keywords: ['flour', 'unga'], pantry: 180, fridge: 365, category: 'Grains' },
  { keywords: ['bread', 'mkate'], pantry: 7, fridge: 14, category: 'Grains' },
  { keywords: ['pasta', 'noodles', 'spaghetti'], pantry: 730, fridge: undefined, category: 'Grains' },
  { keywords: ['ugali', 'maize flour', 'sembe'], pantry: 180, fridge: undefined, category: 'Grains' },
  { keywords: ['oats', 'porridge'], pantry: 365, fridge: undefined, category: 'Grains' },

  // Legumes
  { keywords: ['beans', 'maharagwe'], pantry: 365, fridge: 5, category: 'Legumes' },
  { keywords: ['lentils', 'dengu'], pantry: 365, fridge: undefined, category: 'Legumes' },
  { keywords: ['peas', 'mbaazi', 'njegere'], pantry: 3, fridge: 7, category: 'Legumes' },
  { keywords: ['chickpeas', 'garbanzo'], pantry: 365, fridge: undefined, category: 'Legumes' },

  // Oils & Condiments
  { keywords: ['oil', 'mafuta'], pantry: 365, fridge: undefined, category: 'Pantry Staples' },
  { keywords: ['vinegar'], pantry: 1825, fridge: undefined, category: 'Pantry Staples' },
  { keywords: ['salt', 'chumvi'], pantry: 3650, fridge: undefined, category: 'Pantry Staples' },
  { keywords: ['sugar', 'sukari'], pantry: 730, fridge: undefined, category: 'Pantry Staples' },
  { keywords: ['honey', 'asali'], pantry: 3650, fridge: undefined, category: 'Pantry Staples' },
  { keywords: ['sauce', 'ketchup', 'tomato paste'], pantry: 30, fridge: 180, category: 'Condiments' },
  { keywords: ['jam', 'jelly'], pantry: 30, fridge: 180, category: 'Condiments' },
  { keywords: ['mayonnaise', 'mayo'], pantry: undefined, fridge: 60, category: 'Condiments' },

  // Beverages
  { keywords: ['juice', 'maji ya matunda'], pantry: 7, fridge: 7, category: 'Beverages' },
  { keywords: ['soda', 'soft drink'], pantry: 180, fridge: 5, category: 'Beverages' },
];

/**
 * Look up shelf life for a food item by name.
 * Returns the best matching entry or null.
 */
export function lookupShelfLife(name: string): ShelfLifeEntry | null {
  const lower = name.toLowerCase().trim();
  if (!lower) return null;

  // Exact/starts-with match first
  for (const entry of SHELF_LIFE_DB) {
    if (entry.keywords.some(k => lower === k || lower.startsWith(k) || k.startsWith(lower))) {
      return entry;
    }
  }
  // Partial contains match
  for (const entry of SHELF_LIFE_DB) {
    if (entry.keywords.some(k => lower.includes(k) || k.includes(lower))) {
      return entry;
    }
  }
  return null;
}

/**
 * Calculate the expiry date string (YYYY-MM-DD) given a stored date and days.
 */
export function calcExpiry(storedDate: string, days: number): string {
  const d = new Date(storedDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Today's date as YYYY-MM-DD
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}
