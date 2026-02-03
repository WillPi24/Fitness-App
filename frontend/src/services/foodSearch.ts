import { SIMPLE_FOODS } from '../data/simpleFoods';

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

const USDA_API_KEY = 'kXRlJsj1eKpL6e5h1vimM2X6sJnV5ZJT4OXH6jDX';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// Simple search - curated list of common foods
export function searchSimpleFoods(query: string): FoodSearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const tokens = queryLower.split(/\s+/).filter(Boolean);

  const matches = SIMPLE_FOODS.filter((food) => {
    const nameLower = food.name.toLowerCase();
    return tokens.every((token) => nameLower.includes(token));
  });

  // Score by how well the name matches
  const scored = matches.map((food) => {
    const nameLower = food.name.toLowerCase();
    let score = 0;

    // Exact match
    if (nameLower === queryLower) score += 100;
    // Starts with query
    if (nameLower.startsWith(queryLower)) score += 50;
    // Shorter names preferred
    score -= food.name.length / 10;

    return { food, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 15).map(({ food }, index) => ({
    id: `simple-${index}-${food.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    servingSize: 100,
    servingUnit: 'g',
  }));
}

type USDANutrient = {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
};

type USDAFood = {
  fdcId: number;
  description: string;
  brandName?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
};

type USDASearchResponse = {
  foods: USDAFood[];
  totalHits: number;
};

function getNutrientValue(nutrients: USDANutrient[], nutrientId: number): number {
  const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
  return nutrient ? Math.round(nutrient.value) : 0;
}

// USDA Nutrient IDs
const NUTRIENT_IDS = {
  CALORIES: 1008,
  PROTEIN: 1003,
  FAT: 1004,
  CARBS: 1005,
};

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: query.trim(),
      pageSize: '20',
      dataType: 'Foundation,SR Legacy', // Prefer whole foods over branded
    });

    const response = await fetch(`${USDA_API_URL}?${params}`);

    if (!response.ok) {
      console.error('USDA API error:', response.status);
      return [];
    }

    const data: USDASearchResponse = await response.json();

    return data.foods.slice(0, 15).map((food) => ({
      id: `usda-${food.fdcId}`,
      name: food.brandName
        ? `${food.description} (${food.brandName})`
        : food.description,
      calories: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CALORIES),
      protein: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
      carbs: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CARBS),
      fat: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.FAT),
      servingSize: food.servingSize || 100,
      servingUnit: food.servingSizeUnit || 'g',
    }));
  } catch (error) {
    console.error('Food search failed:', error);
    return [];
  }
}
