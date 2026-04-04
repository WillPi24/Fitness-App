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
  countGramsPerUnit?: number;
  countUnitLabel?: string;
};

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_FOOD_DETAILS_URL = 'https://api.nal.usda.gov/fdc/v1/food';

type CountServingPreset = {
  pattern: RegExp;
  grams: number;
  label: string;
};

const COUNT_BASED_SERVING_PRESETS: CountServingPreset[] = [
  { pattern: /\bapple\b/, grams: 182, label: 'apple' },
  { pattern: /\bbanana\b/, grams: 118, label: 'banana' },
  { pattern: /\borange\b/, grams: 131, label: 'orange' },
  { pattern: /\bpear\b/, grams: 178, label: 'pear' },
  { pattern: /\bkiwi\b/, grams: 75, label: 'kiwi' },
  { pattern: /\bmango\b/, grams: 200, label: 'mango' },
  { pattern: /\bpeach\b/, grams: 150, label: 'peach' },
  { pattern: /\bplum\b/, grams: 66, label: 'plum' },
  { pattern: /\bapricot\b/, grams: 35, label: 'apricot' },
  { pattern: /\bgrapefruit\b/, grams: 246, label: 'grapefruit' },
  { pattern: /\blemon\b/, grams: 84, label: 'lemon' },
  { pattern: /\blime\b/, grams: 67, label: 'lime' },
  { pattern: /\bavocado\b/, grams: 150, label: 'avocado' },
  { pattern: /\begg\b/, grams: 50, label: 'egg' },
  { pattern: /\bbagel\b/, grams: 95, label: 'bagel' },
  { pattern: /\bcroissant\b/, grams: 57, label: 'croissant' },
  { pattern: /\bmuffin\b/, grams: 113, label: 'muffin' },
  { pattern: /\bdoughnut\b/, grams: 75, label: 'doughnut' },
  { pattern: /\bscone\b/, grams: 61, label: 'scone' },
  { pattern: /\btomato\b/, grams: 123, label: 'tomato' },
  { pattern: /\bonion\b/, grams: 110, label: 'onion' },
  { pattern: /\bcucumber\b/, grams: 301, label: 'cucumber' },
  { pattern: /\bpepper\b/, grams: 119, label: 'pepper' },
  { pattern: /\bcarrot\b/, grams: 61, label: 'carrot' },
  { pattern: /\bchicken breast\b/, grams: 174, label: 'breast' },
  { pattern: /\bchicken thigh\b/, grams: 109, label: 'thigh' },
  { pattern: /\bdrumstick\b/, grams: 71, label: 'drumstick' },
  { pattern: /\bchicken wing\b/, grams: 85, label: 'wing' },
  { pattern: /\bsteak\b/, grams: 227, label: 'steak' },
  { pattern: /\bfillet\b/, grams: 154, label: 'fillet' },
  { pattern: /\bwrap\/tortilla\b/, grams: 62, label: 'wrap' },
  { pattern: /\bpitta bread\b/, grams: 60, label: 'pitta' },
];

export function getCountServingInfo(name: string): { gramsPerUnit: number; unitLabel: string } | null {
  const nameLower = name.toLowerCase();
  const match = COUNT_BASED_SERVING_PRESETS.find((preset) => preset.pattern.test(nameLower));
  if (!match) {
    return null;
  }
  return {
    gramsPerUnit: match.grams,
    unitLabel: match.label,
  };
}

function normalizeServingUnit(unit?: string): string | null {
  const normalizedUnit = (unit || '').trim().toLowerCase();
  if (!normalizedUnit) {
    return null;
  }

  if (['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'].includes(normalizedUnit)) {
    return 'ml';
  }
  if (['g', 'gram', 'grams'].includes(normalizedUnit)) {
    return 'g';
  }
  return null;
}

function inferServingUnitFromUSDACategory(food: USDAFood): 'ml' | 'g' {
  const combinedCategory = `${food.foodCategory ?? ''} ${food.brandedFoodCategory ?? ''}`.toLowerCase();
  if (
    combinedCategory.includes('beverage') ||
    combinedCategory.includes('drink') ||
    combinedCategory.includes('soup') ||
    combinedCategory.includes('fats and oils')
  ) {
    return 'ml';
  }
  return 'g';
}

function resolveUSDAServingUnit(food: USDAFood): 'ml' | 'g' {
  const normalized = normalizeServingUnit(food.servingSizeUnit);
  if (normalized === 'ml' || normalized === 'g') {
    return normalized;
  }
  return inferServingUnitFromUSDACategory(food);
}

function inferDefaultServingSize(name: string, servingUnit: 'g' | 'ml', apiServingSize?: number): number {
  if (Number.isFinite(apiServingSize) && (apiServingSize as number) > 0 && (apiServingSize as number) !== 100) {
    return Math.round(apiServingSize as number);
  }

  if (servingUnit === 'ml') {
    return 100;
  }

  const match = getCountServingInfo(name);
  if (match) {
    return match.gramsPerUnit;
  }

  return 100;
}

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

  return scored.slice(0, 15).map(({ food }, index) => {
    const servingUnit = food.servingUnit ?? 'g';
    const countServing = getCountServingInfo(food.name);
    return {
      id: `simple-${index}-${food.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: inferDefaultServingSize(food.name, servingUnit),
      servingUnit,
      micronutrients: createEmptyMicronutrients(),
      hasMicronutrientData: false,
      countGramsPerUnit: countServing?.gramsPerUnit,
      countUnitLabel: countServing?.unitLabel,
    };
  });
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
  foodCategory?: string;
  brandedFoodCategory?: string;
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

function buildFallbackQueries(name: string): string[] {
  const base = name.trim();
  const noParens = base.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSegment = noParens.split(',')[0]?.trim() || '';
  const noSlashes = firstSegment.replace(/\//g, ' ').replace(/\s+/g, ' ').trim();

  return Array.from(new Set([base, noParens, firstSegment, noSlashes].filter((query) => query.length >= 2)));
}

function getUsdaApiKey(): string | null {
  const apiKey = process.env.EXPO_PUBLIC_USDA_API_KEY?.trim();
  if (!apiKey) {
    console.error('Missing USDA API key. Set EXPO_PUBLIC_USDA_API_KEY in frontend/.env');
    return null;
  }
  return apiKey;
}

async function fetchUsdaMicronutrientsByFdcId(fdcId: number): Promise<Micronutrients | null> {
  try {
    const apiKey = getUsdaApiKey();
    if (!apiKey) {
      return null;
    }

    const response = await fetch(`${USDA_FOOD_DETAILS_URL}/${fdcId}?api_key=${apiKey}`);
    if (!response.ok) {
      return null;
    }
    const details: USDAFoodDetailsResponse = await response.json();
    const normalizedNutrients = normalizeUSDAFoodNutrients(details.foodNutrients || []);
    const micronutrients = micronutrientsFromUSDA(normalizedNutrients);
    return hasMicronutrients(micronutrients) ? micronutrients : null;
  } catch (error) {
    console.error('USDA food details lookup failed:', error);
    return null;
  }
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
    const apiKey = getUsdaApiKey();
    if (!apiKey) {
      return [];
    }

    const requestBody = {
      query: query.trim(),
      pageSize: 20,
      dataType: ['Foundation', 'SR Legacy'], // Prefer whole foods over branded
    };

    const response = await fetch(`${USDA_API_URL}?api_key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data: USDASearchResponse | null = null;
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('USDA API error:', response.status, errorBody);

      // Some USDA keys/tenants reject strict filters; retry unfiltered search.
      if (response.status === 400) {
        const retryResponse = await fetch(`${USDA_API_URL}?api_key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            pageSize: 20,
          }),
        });

        if (!retryResponse.ok) {
          const retryErrorBody = await retryResponse.text();
          console.error('USDA API retry error:', retryResponse.status, retryErrorBody);
          return [];
        }

        data = await retryResponse.json();
      } else {
        return [];
      }
    } else {
      data = await response.json();
    }

    if (!data?.foods || !Array.isArray(data.foods)) {
      return [];
    }

    return data.foods.slice(0, 15).map((food) => {
      const micronutrients = micronutrientsFromUSDA(food.foodNutrients || []);
      const servingUnit = resolveUSDAServingUnit(food);
      const countServing = getCountServingInfo(food.description);
      return {
        id: `usda-${food.fdcId}`,
        name: food.brandName ? `${food.description} (${food.brandName})` : food.description,
        calories: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CALORIES),
        protein: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
        carbs: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CARBS),
        fat: getNutrientValue(food.foodNutrients, NUTRIENT_IDS.FAT),
        servingSize: inferDefaultServingSize(food.description, servingUnit, food.servingSize),
        servingUnit,
        micronutrients,
        hasMicronutrientData: hasMicronutrients(micronutrients),
        countGramsPerUnit: countServing?.gramsPerUnit,
        countUnitLabel: countServing?.unitLabel,
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
    const micronutrients = await fetchUsdaMicronutrientsByFdcId(fdcId);
    if (micronutrients) {
      return {
        ...food,
        micronutrients,
        hasMicronutrientData: true,
      };
    }
  }

  try {
    const fallbackQueries = buildFallbackQueries(food.name);
    for (const query of fallbackQueries) {
      const fallbackResults = await searchFoods(query);
      const best = fallbackResults.find((result) => result.hasMicronutrientData);
      if (best) {
        return {
          ...food,
          micronutrients: best.micronutrients,
          hasMicronutrientData: true,
        };
      }

      // Search results can omit micronutrients; use food-details endpoint for top matches.
      for (const candidate of fallbackResults.slice(0, 3)) {
        const candidateFdcId = parseUsdaFdcId(candidate.id);
        if (candidateFdcId === null) {
          continue;
        }
        const candidateMicronutrients = await fetchUsdaMicronutrientsByFdcId(candidateFdcId);
        if (candidateMicronutrients) {
          return {
            ...food,
            micronutrients: candidateMicronutrients,
            hasMicronutrientData: true,
          };
        }
      }
    }
    return food;
  } catch (error) {
    console.error('Fallback micronutrient lookup failed:', error);
    return food;
  }
}
