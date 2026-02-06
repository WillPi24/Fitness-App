import { SIMPLE_FOODS } from '../data/simpleFoods';
import {
  Micronutrients,
  createEmptyMicronutrients,
  hasMicronutrients,
  micronutrientsFromUSDA,
} from '../nutrition/micronutrients';

export type FoodSearchResult = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  micronutrients: Micronutrients;
  hasMicronutrientData: boolean;
};

const USDA_API_KEY = 'kXRlJsj1eKpL6e5h1vimM2X6sJnV5ZJT4OXH6jDX';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_FOOD_DETAILS_URL = 'https://api.nal.usda.gov/fdc/v1/food';

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
    micronutrients: createEmptyMicronutrients(),
    hasMicronutrientData: false,
  }));
}

type USDANutrient = {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName?: string;
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

type USDAFoodDetailsNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  amount?: number;
  unitName?: string;
  nutrient?: {
    id?: number;
    name?: string;
    unitName?: string;
  };
};

type USDAFoodDetailsResponse = {
  foodNutrients?: USDAFoodDetailsNutrient[];
};

function getNutrientValue(nutrients: USDANutrient[], nutrientId: number): number {
  const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
  return nutrient ? Math.round(nutrient.value) : 0;
}

function normalizeUSDAFoodNutrients(nutrients: USDAFoodDetailsNutrient[]): USDANutrient[] {
  return nutrients.reduce<USDANutrient[]>((acc, nutrient) => {
    const nutrientId = nutrient.nutrientId ?? nutrient.nutrient?.id;
    const value = nutrient.value ?? nutrient.amount;
    if (typeof nutrientId !== 'number' || typeof value !== 'number') {
      return acc;
    }
    acc.push({
      nutrientId,
      nutrientName: nutrient.nutrientName ?? nutrient.nutrient?.name ?? '',
      value,
      unitName: nutrient.unitName ?? nutrient.nutrient?.unitName,
    });
    return acc;
  }, []);
}

function parseUsdaFdcId(foodId: string): number | null {
  if (!foodId.startsWith('usda-')) {
    return null;
  }
  const parsed = Number(foodId.replace('usda-', ''));
  return Number.isFinite(parsed) ? parsed : null;
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

    return data.foods.slice(0, 15).map((food) => {
      const micronutrients = micronutrientsFromUSDA(food.foodNutrients || []);
      return {
        id: `usda-${food.fdcId}`,
        name: food.brandName ? `${food.description} (${food.brandName})` : food.description,
        calories: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CALORIES),
        protein: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
        carbs: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CARBS),
        fat: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.FAT),
        servingSize: food.servingSize || 100,
        servingUnit: food.servingSizeUnit || 'g',
        micronutrients,
        hasMicronutrientData: hasMicronutrients(micronutrients),
      };
    });
  } catch (error) {
    console.error('Food search failed:', error);
    return [];
  }
}

export async function hydrateFoodMicronutrients(food: FoodSearchResult): Promise<FoodSearchResult> {
  if (food.hasMicronutrientData) {
    return food;
  }

  const fdcId = parseUsdaFdcId(food.id);
  if (fdcId !== null) {
    try {
      const response = await fetch(`${USDA_FOOD_DETAILS_URL}/${fdcId}?api_key=${USDA_API_KEY}`);
      if (response.ok) {
        const details: USDAFoodDetailsResponse = await response.json();
        const normalizedNutrients = normalizeUSDAFoodNutrients(details.foodNutrients || []);
        const micronutrients = micronutrientsFromUSDA(normalizedNutrients);
        if (hasMicronutrients(micronutrients)) {
          return {
            ...food,
            micronutrients,
            hasMicronutrientData: true,
          };
        }
      }
    } catch (error) {
      console.error('USDA food details lookup failed:', error);
    }
  }

  try {
    const fallbackResults = await searchFoods(food.name);
    const best = fallbackResults.find((result) => result.hasMicronutrientData);
    if (!best) {
      return food;
    }
    return {
      ...food,
      micronutrients: best.micronutrients,
      hasMicronutrientData: true,
    };
  } catch (error) {
    console.error('Fallback micronutrient lookup failed:', error);
    return food;
  }
}
