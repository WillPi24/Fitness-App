import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servings: number;
  timestamp: number;
};

export type Meal = {
  id: string;
  name: string;
  foods: FoodItem[];
};

export type CalorieDay = {
  date: string;
  meals: Meal[];
};

export type DraftFoodEntry = {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servingSize: string;
  servings: string;
  targetMealId: string;
  // Base values per 100g for recalculation when serving size changes
  baseCalories?: number;
  baseProtein?: number;
  baseCarbs?: number;
  baseFat?: number;
};

export type SavedMealFood = {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servings: number;
};

export type SavedMeal = {
  id: string;
  name: string;
  foods: SavedMealFood[];
  createdAt: number;
};

type CalorieContextValue = {
  calorieDays: CalorieDay[];
  draftEntry: DraftFoodEntry | null;
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
  addMeal: (date: string, name?: string) => string;
  renameMeal: (date: string, mealId: string, name: string) => void;
  removeMeal: (date: string, mealId: string) => void;
  startNewEntry: (mealId: string) => void;
  updateDraftEntry: <K extends keyof DraftFoodEntry>(field: K, value: DraftFoodEntry[K]) => void;
  populateFromBarcode: (barcode: string) => Promise<boolean>;
  saveFoodEntry: (date: string) => void;
  cancelDraftEntry: () => void;
  removeFoodItem: (date: string, mealId: string, foodId: string) => void;
  // Saved meals
  savedMeals: SavedMeal[];
  createSavedMeal: (name: string, foods: SavedMealFood[]) => void;
  updateSavedMeal: (id: string, name: string, foods: SavedMealFood[]) => void;
  deleteSavedMeal: (id: string) => void;
  addSavedMealToDay: (savedMealId: string, date: string, targetMealId: string) => void;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  clearError: () => void;
};

const CALORIE_DAYS_KEY = 'fitnessapp.calorieDays.v2';
const DAILY_GOAL_KEY = 'fitnessapp.calorieGoal.v1';
const DRAFT_ENTRY_KEY = 'fitnessapp.draftFoodEntry.v2';
const SAVED_MEALS_KEY = 'fitnessapp.savedMeals.v1';

const CalorieContext = createContext<CalorieContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createDraftEntry(targetMealId: string): DraftFoodEntry {
  return {
    id: generateId(),
    name: '',
    brand: '',
    barcode: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '100',
    servings: '1',
    targetMealId,
    baseCalories: undefined,
    baseProtein: undefined,
    baseCarbs: undefined,
    baseFat: undefined,
  };
}

function isFoodItem(value: unknown): value is FoodItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const item = value as FoodItem;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.calories === 'number' &&
    typeof item.protein === 'number' &&
    typeof item.carbs === 'number' &&
    typeof item.fat === 'number' &&
    typeof item.servingSize === 'number' &&
    typeof item.servings === 'number' &&
    typeof item.timestamp === 'number'
  );
}

function isMeal(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const meal = value as Meal;
  return (
    typeof meal.id === 'string' &&
    typeof meal.name === 'string' &&
    Array.isArray(meal.foods) &&
    meal.foods.every(isFoodItem)
  );
}

function isCalorieDay(value: unknown): value is CalorieDay {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const day = value as CalorieDay;
  return (
    typeof day.date === 'string' &&
    Array.isArray(day.meals) &&
    day.meals.every(isMeal)
  );
}

function isDraftFoodEntry(value: unknown): value is DraftFoodEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as DraftFoodEntry;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.brand === 'string' &&
    typeof entry.barcode === 'string' &&
    typeof entry.calories === 'string' &&
    typeof entry.protein === 'string' &&
    typeof entry.carbs === 'string' &&
    typeof entry.fat === 'string' &&
    typeof entry.servingSize === 'string' &&
    typeof entry.servings === 'string' &&
    typeof entry.targetMealId === 'string'
  );
}

function isSavedMealFood(value: unknown): value is SavedMealFood {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const food = value as SavedMealFood;
  return (
    typeof food.id === 'string' &&
    typeof food.name === 'string' &&
    typeof food.calories === 'number' &&
    typeof food.protein === 'number' &&
    typeof food.carbs === 'number' &&
    typeof food.fat === 'number' &&
    typeof food.servingSize === 'number' &&
    typeof food.servings === 'number'
  );
}

function isSavedMeal(value: unknown): value is SavedMeal {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const meal = value as SavedMeal;
  return (
    typeof meal.id === 'string' &&
    typeof meal.name === 'string' &&
    Array.isArray(meal.foods) &&
    meal.foods.every(isSavedMealFood) &&
    typeof meal.createdAt === 'number'
  );
}

export function CalorieProvider({ children }: { children: React.ReactNode }) {
  const [calorieDays, setCalorieDays] = useState<CalorieDay[]>([]);
  const [draftEntry, setDraftEntry] = useState<DraftFoodEntry | null>(null);
  const [dailyGoal, setDailyGoalState] = useState<number>(2000);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [daysRaw, goalRaw, draftRaw, savedMealsRaw] = await Promise.all([
          AsyncStorage.getItem(CALORIE_DAYS_KEY),
          AsyncStorage.getItem(DAILY_GOAL_KEY),
          AsyncStorage.getItem(DRAFT_ENTRY_KEY),
          AsyncStorage.getItem(SAVED_MEALS_KEY),
        ]);

        if (daysRaw) {
          const parsed = JSON.parse(daysRaw);
          if (Array.isArray(parsed)) {
            const safeDays = parsed.filter(isCalorieDay);
            setCalorieDays(safeDays);
          }
        }

        if (goalRaw) {
          const parsedGoal = JSON.parse(goalRaw);
          if (typeof parsedGoal === 'number' && parsedGoal > 0) {
            setDailyGoalState(parsedGoal);
          }
        }

        if (draftRaw) {
          const parsedDraft = JSON.parse(draftRaw);
          if (isDraftFoodEntry(parsedDraft)) {
            setDraftEntry(parsedDraft);
          }
        }

        if (savedMealsRaw) {
          const parsedMeals = JSON.parse(savedMealsRaw);
          if (Array.isArray(parsedMeals)) {
            const safeMeals = parsedMeals.filter(isSavedMeal);
            setSavedMeals(safeMeals);
          }
        }
      } catch (loadError) {
        console.error('Failed to load calorie data', loadError);
        setError('Unable to load calorie history. Your data is safe.');
      } finally {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveCalorieDays = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(CALORIE_DAYS_KEY, JSON.stringify(calorieDays));
      } catch (saveError) {
        console.error('Failed to save calorie days', saveError);
        setError('Unable to save calorie history. Please try again.');
      }
    };

    saveCalorieDays();
  }, [calorieDays]);

  useEffect(() => {
    const saveDraftEntry = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        if (draftEntry) {
          await AsyncStorage.setItem(DRAFT_ENTRY_KEY, JSON.stringify(draftEntry));
        } else {
          await AsyncStorage.removeItem(DRAFT_ENTRY_KEY);
        }
      } catch (saveError) {
        console.error('Failed to save draft entry', saveError);
        setError('Unable to save food entry in progress.');
      }
    };

    saveDraftEntry();
  }, [draftEntry]);

  useEffect(() => {
    const saveDailyGoal = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(dailyGoal));
      } catch (saveError) {
        console.error('Failed to save daily goal', saveError);
      }
    };

    saveDailyGoal();
  }, [dailyGoal]);

  useEffect(() => {
    const saveSavedMeals = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(savedMeals));
      } catch (saveError) {
        console.error('Failed to save saved meals', saveError);
        setError('Unable to save meal templates.');
      }
    };

    saveSavedMeals();
  }, [savedMeals]);

  const setDailyGoal = (goal: number) => {
    if (goal > 0) {
      setDailyGoalState(goal);
    }
  };

  const addMeal = (date: string, name?: string): string => {
    const mealId = generateId();

    setCalorieDays((prev) => {
      const existing = prev.find((day) => day.date === date);
      const mealNumber = existing ? existing.meals.length + 1 : 1;
      const mealName = name || `Meal ${mealNumber}`;
      const newMeal: Meal = { id: mealId, name: mealName, foods: [] };

      if (existing) {
        return prev.map((day) =>
          day.date === date
            ? { ...day, meals: [...day.meals, newMeal] }
            : day
        );
      }
      return [...prev, { date, meals: [newMeal] }];
    });

    return mealId;
  };

  const renameMeal = (date: string, mealId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Meal name cannot be empty.');
      return;
    }

    setCalorieDays((prev) =>
      prev.map((day) =>
        day.date === date
          ? {
              ...day,
              meals: day.meals.map((meal) =>
                meal.id === mealId ? { ...meal, name: trimmed } : meal
              ),
            }
          : day
      )
    );
  };

  const removeMeal = (date: string, mealId: string) => {
    setCalorieDays((prev) =>
      prev
        .map((day) =>
          day.date === date
            ? { ...day, meals: day.meals.filter((m) => m.id !== mealId) }
            : day
        )
        .filter((day) => day.meals.length > 0)
    );
  };

  const startNewEntry = (mealId: string) => {
    setDraftEntry(createDraftEntry(mealId));
    setError(null);
  };

  const updateDraftEntry = <K extends keyof DraftFoodEntry>(
    field: K,
    value: DraftFoodEntry[K]
  ) => {
    setDraftEntry((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
  };

  const populateFromBarcode = async (barcode: string): Promise<boolean> => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'FitnessApp - React Native - Version 1.0',
          },
        }
      );

      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        setError('Product not found. Try manual entry.');
        return false;
      }

      const { product } = data;
      const nutriments = product.nutriments || {};

      setDraftEntry((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          barcode,
          name: product.product_name || prev.name,
          brand: product.brands || '',
          calories: String(Math.round(nutriments['energy-kcal_100g'] || 0)),
          protein: String(Math.round(nutriments.proteins_100g || 0)),
          carbs: String(Math.round(nutriments.carbohydrates_100g || 0)),
          fat: String(Math.round(nutriments.fat_100g || 0)),
          servingSize: '100',
        };
      });

      return true;
    } catch (err) {
      console.error('Failed to fetch product', err);
      setError('Unable to fetch product info. Check your connection.');
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const saveFoodEntry = (date: string) => {
    if (!draftEntry) {
      setError('No food entry to save.');
      return;
    }

    const name = draftEntry.name.trim();
    if (!name) {
      setError('Food name is required.');
      return;
    }

    const calories = Number(draftEntry.calories);
    if (!Number.isFinite(calories) || calories < 0) {
      setError('Enter a valid calorie amount.');
      return;
    }

    const protein = Number(draftEntry.protein) || 0;
    const carbs = Number(draftEntry.carbs) || 0;
    const fat = Number(draftEntry.fat) || 0;
    const servingSize = Number(draftEntry.servingSize) || 100;
    const servings = Number(draftEntry.servings) || 1;

    const foodItem: FoodItem = {
      id: draftEntry.id,
      name,
      brand: draftEntry.brand || undefined,
      barcode: draftEntry.barcode || undefined,
      calories: Math.round(calories * servings),
      protein: Math.round(protein * servings),
      carbs: Math.round(carbs * servings),
      fat: Math.round(fat * servings),
      servingSize,
      servings,
      timestamp: Date.now(),
    };

    setCalorieDays((prev) => {
      const existingDay = prev.find((day) => day.date === date);

      if (!existingDay) {
        // Create day with meal containing this food
        const newMeal: Meal = { id: draftEntry.targetMealId, name: 'Meal 1', foods: [foodItem] };
        return [...prev, { date, meals: [newMeal] }];
      }

      const mealExists = existingDay.meals.some((m) => m.id === draftEntry.targetMealId);

      if (mealExists) {
        // Add food to existing meal
        return prev.map((day) =>
          day.date === date
            ? {
                ...day,
                meals: day.meals.map((meal) =>
                  meal.id === draftEntry.targetMealId
                    ? { ...meal, foods: [...meal.foods, foodItem] }
                    : meal
                ),
              }
            : day
        );
      } else {
        // Meal was deleted, create new one
        const mealNumber = existingDay.meals.length + 1;
        const newMeal: Meal = { id: draftEntry.targetMealId, name: `Meal ${mealNumber}`, foods: [foodItem] };
        return prev.map((day) =>
          day.date === date
            ? { ...day, meals: [...day.meals, newMeal] }
            : day
        );
      }
    });

    setDraftEntry(null);
    setError(null);
  };

  const cancelDraftEntry = () => {
    setDraftEntry(null);
    setError(null);
  };

  const removeFoodItem = (date: string, mealId: string, foodId: string) => {
    setCalorieDays((prev) =>
      prev
        .map((day) =>
          day.date === date
            ? {
                ...day,
                meals: day.meals
                  .map((meal) =>
                    meal.id === mealId
                      ? { ...meal, foods: meal.foods.filter((f) => f.id !== foodId) }
                      : meal
                  )
                  .filter((meal) => meal.foods.length > 0),
              }
            : day
        )
        .filter((day) => day.meals.length > 0)
    );
  };

  const createSavedMeal = (name: string, foods: SavedMealFood[]) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Meal name cannot be empty.');
      return;
    }
    if (foods.length === 0) {
      setError('Add at least one food to the meal.');
      return;
    }

    const newMeal: SavedMeal = {
      id: generateId(),
      name: trimmed,
      foods,
      createdAt: Date.now(),
    };

    setSavedMeals((prev) => [...prev, newMeal]);
  };

  const updateSavedMeal = (id: string, name: string, foods: SavedMealFood[]) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Meal name cannot be empty.');
      return;
    }
    if (foods.length === 0) {
      setError('Add at least one food to the meal.');
      return;
    }

    setSavedMeals((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, name: trimmed, foods } : meal
      )
    );
  };

  const deleteSavedMeal = (id: string) => {
    setSavedMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const addSavedMealToDay = (savedMealId: string, date: string, targetMealId: string) => {
    const savedMeal = savedMeals.find((m) => m.id === savedMealId);
    if (!savedMeal) {
      setError('Saved meal not found.');
      return;
    }

    const foodItems: FoodItem[] = savedMeal.foods.map((food) => ({
      id: generateId(),
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servings: food.servings,
      timestamp: Date.now(),
    }));

    setCalorieDays((prev) => {
      const existingDay = prev.find((day) => day.date === date);

      if (!existingDay) {
        const newMeal: Meal = { id: targetMealId, name: 'Meal 1', foods: foodItems };
        return [...prev, { date, meals: [newMeal] }];
      }

      const mealExists = existingDay.meals.some((m) => m.id === targetMealId);

      if (mealExists) {
        return prev.map((day) =>
          day.date === date
            ? {
                ...day,
                meals: day.meals.map((meal) =>
                  meal.id === targetMealId
                    ? { ...meal, foods: [...meal.foods, ...foodItems] }
                    : meal
                ),
              }
            : day
        );
      } else {
        const mealNumber = existingDay.meals.length + 1;
        const newMeal: Meal = { id: targetMealId, name: `Meal ${mealNumber}`, foods: foodItems };
        return prev.map((day) =>
          day.date === date ? { ...day, meals: [...day.meals, newMeal] } : day
        );
      }
    });
  };

  const value = useMemo(
    () => ({
      calorieDays,
      draftEntry,
      dailyGoal,
      setDailyGoal,
      addMeal,
      renameMeal,
      removeMeal,
      startNewEntry,
      updateDraftEntry,
      populateFromBarcode,
      saveFoodEntry,
      cancelDraftEntry,
      removeFoodItem,
      savedMeals,
      createSavedMeal,
      updateSavedMeal,
      deleteSavedMeal,
      addSavedMealToDay,
      isLoading,
      isSearching,
      error,
      clearError: () => setError(null),
    }),
    [calorieDays, draftEntry, dailyGoal, savedMeals, isLoading, isSearching, error]
  );

  return <CalorieContext.Provider value={value}>{children}</CalorieContext.Provider>;
}

export function useCalorieStore() {
  const context = useContext(CalorieContext);
  if (!context) {
    throw new Error('useCalorieStore must be used within a CalorieProvider');
  }
  return context;
}
