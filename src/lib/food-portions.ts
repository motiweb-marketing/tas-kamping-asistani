/** Kişi başı yetişkin porsiyonları (gram). Çocuklar ayrı çarpanla hesaplanır. */
export const CHILD_PORTION_FACTOR = 0.7;
export const VEG_WASTE_FACTOR = 1.15;

export interface DishIngredientRule {
  dishKeywords: RegExp;
  ingredients: { name: string; gramsPerAdult: number }[];
}

/** Menü metninde yemek tespiti → malzeme ihtiyacı (gram/kişi/öğün). */
export const DISH_INGREDIENT_RULES: DishIngredientRule[] = [
  {
    dishKeywords: /menemen/i,
    ingredients: [
      { name: 'Domates', gramsPerAdult: 130 },
      { name: 'Biber', gramsPerAdult: 60 },
      { name: 'Yumurta', gramsPerAdult: 100 },
    ],
  },
  {
    dishKeywords: /çoban\s*salata|salata(?!lık|lik)/i,
    ingredients: [
      { name: 'Domates', gramsPerAdult: 100 },
      { name: 'Salatalık', gramsPerAdult: 80 },
      { name: 'Yeşillik', gramsPerAdult: 50 },
      { name: 'Soğan', gramsPerAdult: 25 },
    ],
  },
  {
    dishKeywords: /ızgara|grill|mangal.*tavuk|tavuk.*ızgara/i,
    ingredients: [{ name: 'Tavuk', gramsPerAdult: 240 }],
  },
  {
    dishKeywords: /köfte/i,
    ingredients: [{ name: 'Kıyma', gramsPerAdult: 180 }],
  },
  {
    dishKeywords: /pilav/i,
    ingredients: [
      { name: 'Pirinç', gramsPerAdult: 80 },
      { name: 'Ayçiçek yağı', gramsPerAdult: 15 },
    ],
  },
  {
    dishKeywords: /makarna|spagetti/i,
    ingredients: [{ name: 'Makarna', gramsPerAdult: 100 }],
  },
  {
    dishKeywords: /sucuk|salam/i,
    ingredients: [{ name: 'Sucuk/Salam', gramsPerAdult: 40 }],
  },
  {
    dishKeywords: /peynir/i,
    ingredients: [{ name: 'Peynir', gramsPerAdult: 50 }],
  },
  {
    dishKeywords: /zeytin/i,
    ingredients: [{ name: 'Zeytin', gramsPerAdult: 30 }],
  },
];

export const INGREDIENT_SECTION_HINTS: Record<string, string> = {
  Domates: 'Sebze & Meyve',
  Salatalık: 'Sebze & Meyve',
  Yeşillik: 'Sebze & Meyve',
  Biber: 'Sebze & Meyve',
  Soğan: 'Sebze & Meyve',
  Tavuk: 'Et & Tavuk',
  Kıyma: 'Et & Tavuk',
  Pirinç: 'Kuru Gıda',
  Makarna: 'Kuru Gıda',
};

export function effectivePeopleGrams(
  adults: number,
  children: number
): number {
  return adults + children * CHILD_PORTION_FACTOR;
}

export function gramsToKg(grams: number): number {
  const kg = (grams * VEG_WASTE_FACTOR) / 1000;
  return Math.round(kg * 10) / 10;
}

export function formatKgDisplay(kg: number): string {
  return `${kg} kg`;
}
