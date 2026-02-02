import { UK_FOODS } from '../data/ukFoods';

export type FoodSearchResult = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
};

export function searchFoods(query: string): FoodSearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const tokens = queryLower.split(/\s+/).filter(Boolean);

  const matches = UK_FOODS.filter((food) => {
    const nameLower = food.name.toLowerCase();
    return tokens.every((token) => nameLower.includes(token));
  });

  // Sort by relevance (exact match first, then shorter names)
  matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === queryLower ? 0 : 1;
    const bExact = b.name.toLowerCase() === queryLower ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    return a.name.length - b.name.length;
  });

  return matches.slice(0, 15).map((food, index) => ({
    id: `uk-${index}-${food.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    servingSize: 100,
    servingUnit: 'g',
  }));
}
