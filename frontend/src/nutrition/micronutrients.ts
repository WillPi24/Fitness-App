export type MicronutrientKey =
  | 'vitaminA'
  | 'vitaminC'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'thiamin'
  | 'riboflavin'
  | 'niacin'
  | 'vitaminB6'
  | 'folate'
  | 'vitaminB12'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'phosphorus'
  | 'potassium'
  | 'sodium'
  | 'zinc'
  | 'copper'
  | 'manganese'
  | 'selenium';

export type Micronutrients = Record<MicronutrientKey, number>;

export type MicronutrientTargetType = 'minimum' | 'maximum';

export type MicronutrientConfig = {
  key: MicronutrientKey;
  label: string;
  unit: 'mg' | 'mcg';
  dailyTarget: number;
  targetType: MicronutrientTargetType;
};

export const MICRONUTRIENT_CONFIG: MicronutrientConfig[] = [
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg', dailyTarget: 900, targetType: 'minimum' },
  { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg', dailyTarget: 1.2, targetType: 'minimum' },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg', dailyTarget: 1.3, targetType: 'minimum' },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg', dailyTarget: 16, targetType: 'minimum' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', dailyTarget: 1.7, targetType: 'minimum' },
  { key: 'folate', label: 'Folate (B9)', unit: 'mcg', dailyTarget: 400, targetType: 'minimum' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg', dailyTarget: 2.4, targetType: 'minimum' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', dailyTarget: 90, targetType: 'minimum' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg', dailyTarget: 15, targetType: 'minimum' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', dailyTarget: 15, targetType: 'minimum' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg', dailyTarget: 120, targetType: 'minimum' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', dailyTarget: 1000, targetType: 'minimum' },
  { key: 'iron', label: 'Iron', unit: 'mg', dailyTarget: 18, targetType: 'minimum' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', dailyTarget: 420, targetType: 'minimum' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', dailyTarget: 700, targetType: 'minimum' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', dailyTarget: 4700, targetType: 'minimum' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', dailyTarget: 2300, targetType: 'maximum' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', dailyTarget: 11, targetType: 'minimum' },
  { key: 'copper', label: 'Copper', unit: 'mg', dailyTarget: 0.9, targetType: 'minimum' },
  { key: 'manganese', label: 'Manganese', unit: 'mg', dailyTarget: 2.3, targetType: 'minimum' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg', dailyTarget: 55, targetType: 'minimum' },
];

const EMPTY_MICRONUTRIENTS: Micronutrients = {
  vitaminA: 0,
  vitaminC: 0,
  vitaminD: 0,
  vitaminE: 0,
  vitaminK: 0,
  thiamin: 0,
  riboflavin: 0,
  niacin: 0,
  vitaminB6: 0,
  folate: 0,
  vitaminB12: 0,
  calcium: 0,
  iron: 0,
  magnesium: 0,
  phosphorus: 0,
  potassium: 0,
  sodium: 0,
  zinc: 0,
  copper: 0,
  manganese: 0,
  selenium: 0,
};

const OPEN_FOOD_FACTS_KEYS: Record<MicronutrientKey, string> = {
  vitaminA: 'vitamin-a',
  vitaminC: 'vitamin-c',
  vitaminD: 'vitamin-d',
  vitaminE: 'vitamin-e',
  vitaminK: 'vitamin-k',
  thiamin: 'vitamin-b1',
  riboflavin: 'vitamin-b2',
  niacin: 'vitamin-pp',
  vitaminB6: 'vitamin-b6',
  folate: 'vitamin-b9',
  vitaminB12: 'vitamin-b12',
  calcium: 'calcium',
  iron: 'iron',
  magnesium: 'magnesium',
  phosphorus: 'phosphorus',
  potassium: 'potassium',
  sodium: 'sodium',
  zinc: 'zinc',
  copper: 'copper',
  manganese: 'manganese',
  selenium: 'selenium',
};

const OPEN_FOOD_FACTS_DEFAULT_UNITS: Record<MicronutrientKey, string> = {
  vitaminA: 'mcg',
  vitaminC: 'mg',
  vitaminD: 'mcg',
  vitaminE: 'mg',
  vitaminK: 'mcg',
  thiamin: 'mg',
  riboflavin: 'mg',
  niacin: 'mg',
  vitaminB6: 'mg',
  folate: 'mcg',
  vitaminB12: 'mcg',
  calcium: 'mg',
  iron: 'mg',
  magnesium: 'mg',
  phosphorus: 'mg',
  potassium: 'mg',
  sodium: 'g',
  zinc: 'mg',
  copper: 'mg',
  manganese: 'mg',
  selenium: 'mcg',
};

const USDA_IDS: Record<MicronutrientKey, number> = {
  vitaminA: 1106,
  vitaminC: 1162,
  vitaminD: 1114,
  vitaminE: 1109,
  vitaminK: 1185,
  thiamin: 1165,
  riboflavin: 1166,
  niacin: 1167,
  vitaminB6: 1175,
  folate: 1177,
  vitaminB12: 1178,
  calcium: 1087,
  iron: 1089,
  magnesium: 1090,
  phosphorus: 1091,
  potassium: 1092,
  sodium: 1093,
  zinc: 1095,
  copper: 1098,
  manganese: 1101,
  selenium: 1103,
};

type USDAFoodNutrient = {
  nutrientId: number;
  value: number;
  unitName?: string;
};

function roundMicronutrient(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeUnit(unit?: string): string {
  return (unit || '')
    .toLowerCase()
    .replace('\u00b5', 'u')
    .replace('\u03bc', 'u')
    .trim();
}

function convertIUToMicrograms(key: MicronutrientKey, value: number): number | null {
  if (key === 'vitaminA') {
    return value * 0.3;
  }
  if (key === 'vitaminD') {
    return value * 0.025;
  }
  return null;
}

function convertToTargetUnit(
  key: MicronutrientKey,
  value: number,
  fromUnit: string,
  toUnit: 'mg' | 'mcg'
): number | null {
  const normalizedFrom = normalizeUnit(fromUnit);
  if (!Number.isFinite(value)) {
    return null;
  }
  if (toUnit === 'mg') {
    if (normalizedFrom === 'mg') return value;
    if (normalizedFrom === 'g') return value * 1000;
    if (normalizedFrom === 'ug' || normalizedFrom === 'mcg') return value / 1000;
    if (normalizedFrom === 'iu') {
      const micrograms = convertIUToMicrograms(key, value);
      return micrograms === null ? null : micrograms / 1000;
    }
    return null;
  }

  if (normalizedFrom === 'mcg' || normalizedFrom === 'ug') return value;
  if (normalizedFrom === 'mg') return value * 1000;
  if (normalizedFrom === 'g') return value * 1_000_000;
  if (normalizedFrom === 'iu') return convertIUToMicrograms(key, value);
  return null;
}

export function createEmptyMicronutrients(): Micronutrients {
  return { ...EMPTY_MICRONUTRIENTS };
}

export function normalizeMicronutrients(
  micronutrients?: Partial<Record<MicronutrientKey, number>> | null
): Micronutrients {
  const normalized = createEmptyMicronutrients();
  if (!micronutrients) {
    return normalized;
  }
  MICRONUTRIENT_CONFIG.forEach(({ key }) => {
    const value = micronutrients[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      normalized[key] = roundMicronutrient(Math.max(0, value));
    }
  });
  return normalized;
}

export function hasMicronutrients(micronutrients: Micronutrients): boolean {
  return MICRONUTRIENT_CONFIG.some(({ key }) => micronutrients[key] > 0);
}

export function scaleMicronutrients(micronutrients: Micronutrients, factor: number): Micronutrients {
  const scaled = createEmptyMicronutrients();
  MICRONUTRIENT_CONFIG.forEach(({ key }) => {
    scaled[key] = roundMicronutrient(Math.max(0, micronutrients[key] * factor));
  });
  return scaled;
}

export function addMicronutrients(base: Micronutrients, next: Micronutrients): Micronutrients {
  const total = createEmptyMicronutrients();
  MICRONUTRIENT_CONFIG.forEach(({ key }) => {
    total[key] = roundMicronutrient(base[key] + next[key]);
  });
  return total;
}

export function micronutrientsFromUSDA(nutrients: USDAFoodNutrient[]): Micronutrients {
  const result = createEmptyMicronutrients();
  MICRONUTRIENT_CONFIG.forEach(({ key, unit }) => {
    const nutrient = nutrients.find((item) => item.nutrientId === USDA_IDS[key]);
    if (!nutrient || typeof nutrient.value !== 'number') {
      return;
    }
    const converted = convertToTargetUnit(key, nutrient.value, nutrient.unitName || unit, unit);
    if (converted !== null) {
      result[key] = roundMicronutrient(Math.max(0, converted));
    }
  });
  return result;
}

type OpenFoodFactsNutriments = Record<string, unknown>;

function toNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function micronutrientsFromOpenFoodFacts(nutriments: OpenFoodFactsNutriments): Micronutrients {
  const result = createEmptyMicronutrients();
  MICRONUTRIENT_CONFIG.forEach(({ key, unit }) => {
    const openFoodFactsKey = OPEN_FOOD_FACTS_KEYS[key];
    const rawValue = toNumericValue(nutriments[`${openFoodFactsKey}_100g`]);
    if (rawValue === null) {
      return;
    }
    const rawUnitValue = nutriments[`${openFoodFactsKey}_unit`];
    const fromUnit =
      typeof rawUnitValue === 'string' && rawUnitValue.trim().length > 0
        ? rawUnitValue
        : OPEN_FOOD_FACTS_DEFAULT_UNITS[key];
    const converted = convertToTargetUnit(key, rawValue, fromUnit, unit);
    if (converted !== null) {
      result[key] = roundMicronutrient(Math.max(0, converted));
    }
  });
  return result;
}

export function formatMicronutrientValue(value: number, unit: 'mg' | 'mcg'): string {
  if (value >= 1000 && unit === 'mg') {
    return value.toFixed(0);
  }
  if (value >= 100) {
    return value.toFixed(0);
  }
  return value.toFixed(1);
}
