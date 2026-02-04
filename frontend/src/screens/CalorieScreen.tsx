import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { FoodSearchResult, searchFoods, searchSimpleFoods } from '../services/foodSearch';
import { CalorieDay, Meal, SavedMeal, SavedMealFood, useCalorieStore } from '../store/calorieStore';
import { colors, spacing, typography } from '../theme';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_STARTS_ON = 1;

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = (day - WEEK_STARTS_ON + 7) % 7;
  start.setDate(start.getDate() - diff);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMonthYear(date: Date) {
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(date: Date) {
  return `${weekDays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function monthsBetween(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export function CalorieScreen() {
  const {
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
    clearError,
  } = useCalorieStore();

  const today = new Date();
  const todayIso = useMemo(() => formatISODate(today), []);
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [foodPickerOpen, setFoodPickerOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const [renamingMealId, setRenamingMealId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [currentMealId, setCurrentMealId] = useState<string | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<FoodSearchResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [simpleSearchEnabled, setSimpleSearchEnabled] = useState(true);
  const [savedMealsOpen, setSavedMealsOpen] = useState(false);
  const [savedMealEditMode, setSavedMealEditMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingSavedMeal, setEditingSavedMeal] = useState<SavedMeal | null>(null);
  const [savedMealName, setSavedMealName] = useState('');
  const [savedMealFoods, setSavedMealFoods] = useState<SavedMealFood[]>([]);
  const [addingFoodToSavedMeal, setAddingFoodToSavedMeal] = useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const selectedDateObj = useMemo(() => parseISODate(selectedDate), [selectedDate]);
  const monthLabel = useMemo(() => formatMonthYear(selectedDateObj), [selectedDateObj]);
  const selectedDateLabel = useMemo(() => formatShortDate(selectedDateObj), [selectedDateObj]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDateObj);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDateObj]);

  const earliestCalorieDate = useMemo(() => {
    if (calorieDays.length === 0) {
      return selectedDate;
    }
    return calorieDays.reduce((minDate, day) => (day.date < minDate ? day.date : minDate), calorieDays[0].date);
  }, [calorieDays, selectedDate]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string; selectedTextColor?: string; dotColor?: string }> = {};
    calorieDays.forEach((day) => {
      if (!marks[day.date]) {
        marks[day.date] = { marked: true, dotColor: colors.accent };
      }
    });
    const existing = marks[selectedDate] ?? {};
    marks[selectedDate] = {
      ...existing,
      selected: true,
      selectedColor: colors.accent,
      selectedTextColor: '#fff',
    };
    return marks;
  }, [calorieDays, selectedDate]);

  const calendarPastRange = useMemo(() => {
    const earliest = parseISODate(earliestCalorieDate);
    return Math.max(0, monthsBetween(earliest, selectedDateObj));
  }, [earliestCalorieDate, selectedDateObj]);

  const calendarFutureRange = useMemo(() => {
    const todayDate = new Date();
    return Math.max(0, monthsBetween(selectedDateObj, todayDate));
  }, [selectedDateObj]);

  const historyDays = useMemo(() => {
    return calorieDays
      .filter((day) => day.date !== selectedDate)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [calorieDays, selectedDate]);

  const dayData = useMemo(() => {
    return calorieDays.find((d) => d.date === selectedDate);
  }, [calorieDays, selectedDate]);

  const totals = useMemo(() => {
    if (!dayData) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return dayData.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [dayData]);

  const calorieProgress = Math.min((totals.calories / dailyGoal) * 100, 100);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchingFoods(true);
    try {
      if (simpleSearchEnabled) {
        // Use local curated list - instant results
        const results = searchSimpleFoods(query);
        setSearchResults(results);
      } else {
        // Use USDA API - more comprehensive
        const results = await searchFoods(query);
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearchingFoods(false);
    }
  }, [simpleSearchEnabled]);

  const handleAddMeal = () => {
    const mealId = addMeal(selectedDate);
    setCurrentMealId(mealId);
    startNewEntry(mealId);
    setSearchQuery('');
    setSearchResults([]);
    setFoodPickerOpen(true);
  };

  const handleAddFoodToMeal = (mealId: string) => {
    setCurrentMealId(mealId);
    startNewEntry(mealId);
    setSearchQuery('');
    setSearchResults([]);
    setFoodPickerOpen(true);
  };

  const handleSelectSearchResult = (food: FoodSearchResult) => {
    updateDraftEntry('name', food.name);
    updateDraftEntry('calories', String(food.calories));
    updateDraftEntry('protein', String(food.protein));
    updateDraftEntry('carbs', String(food.carbs));
    updateDraftEntry('fat', String(food.fat));
    updateDraftEntry('servingSize', String(food.servingSize));
    updateDraftEntry('servings', '1');
    // Store base values per 100g for recalculation
    updateDraftEntry('baseCalories', food.calories);
    updateDraftEntry('baseProtein', food.protein);
    updateDraftEntry('baseCarbs', food.carbs);
    updateDraftEntry('baseFat', food.fat);
    setFoodPickerOpen(false);
    setEntryModalOpen(true);
  };

  const handleOpenScanner = () => {
    setFoodPickerOpen(false);
    setScannerOpen(true);
    setScanned(false);
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);
    const success = await populateFromBarcode(barcode);
    setEntryModalOpen(true);
    if (!success) {
      setScanned(false);
    }
  };

  const handleManualEntry = () => {
    setFoodPickerOpen(false);
    setScannerOpen(false);
    setEntryModalOpen(true);
  };

  const handleFoodNameChange = useCallback((text: string) => {
    updateDraftEntry('name', text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 2) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await searchFoods(text);
        setNameSuggestions(results.slice(0, 5));
      } catch (err) {
        console.error('Suggestion search failed:', err);
        setNameSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  }, [updateDraftEntry]);

  const handleSelectSuggestion = (food: FoodSearchResult) => {
    updateDraftEntry('name', food.name);
    updateDraftEntry('calories', String(food.calories));
    updateDraftEntry('protein', String(food.protein));
    updateDraftEntry('carbs', String(food.carbs));
    updateDraftEntry('fat', String(food.fat));
    updateDraftEntry('servingSize', String(food.servingSize));
    // Store base values per 100g for recalculation
    updateDraftEntry('baseCalories', food.calories);
    updateDraftEntry('baseProtein', food.protein);
    updateDraftEntry('baseCarbs', food.carbs);
    updateDraftEntry('baseFat', food.fat);
    setNameSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSaveEntry = () => {
    saveFoodEntry(selectedDate);
    setEntryModalOpen(false);
    setScanned(false);
    setCurrentMealId(null);
    setNameSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCancelEntry = () => {
    cancelDraftEntry();
    setEntryModalOpen(false);
    setScannerOpen(false);
    setFoodPickerOpen(false);
    setScanned(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentMealId(null);
    setNameSuggestions([]);
    setShowSuggestions(false);
  };

  const handleServingSizeChange = (value: string) => {
    updateDraftEntry('servingSize', value);

    // Recalculate macros if we have base values (food was selected from database)
    if (draftEntry?.baseCalories !== undefined) {
      const newSize = Number(value) || 0;
      const multiplier = newSize / 100;

      updateDraftEntry('calories', String(Math.round(draftEntry.baseCalories * multiplier)));
      updateDraftEntry('protein', String(Math.round(draftEntry.baseProtein! * multiplier)));
      updateDraftEntry('carbs', String(Math.round(draftEntry.baseCarbs! * multiplier)));
      updateDraftEntry('fat', String(Math.round(draftEntry.baseFat! * multiplier)));
    }
  };

  const handleDeleteFood = (mealId: string, foodId: string) => {
    removeFoodItem(selectedDate, mealId, foodId);
  };

  const handleDeleteMeal = (mealId: string) => {
    removeMeal(selectedDate, mealId);
  };

  const handleOpenSettings = () => {
    setGoalInput(String(dailyGoal));
    setSettingsOpen(true);
  };

  const handleSaveGoal = () => {
    const goal = Number(goalInput);
    if (goal > 0) {
      setDailyGoal(goal);
      setSettingsOpen(false);
    }
  };

  const handleStartRename = (meal: Meal) => {
    setRenamingMealId(meal.id);
    setRenameInput(meal.name);
  };

  const handleSaveRename = () => {
    if (renamingMealId && renameInput.trim()) {
      renameMeal(selectedDate, renamingMealId, renameInput);
    }
    setRenamingMealId(null);
    setRenameInput('');
  };

  const handleOpenSavedMeals = () => {
    setFoodPickerOpen(false);
    setSavedMealEditMode('list');
    setSavedMealsOpen(true);
  };

  const handleCloseSavedMeals = () => {
    setSavedMealsOpen(false);
    setSavedMealEditMode('list');
    setEditingSavedMeal(null);
    setSavedMealName('');
    setSavedMealFoods([]);
    setAddingFoodToSavedMeal(false);
  };

  const handleStartCreateSavedMeal = () => {
    setSavedMealEditMode('create');
    setSavedMealName('');
    setSavedMealFoods([]);
  };

  const handleStartEditSavedMeal = (meal: SavedMeal) => {
    setEditingSavedMeal(meal);
    setSavedMealName(meal.name);
    setSavedMealFoods([...meal.foods]);
    setSavedMealEditMode('edit');
  };

  const handleSaveSavedMeal = () => {
    if (savedMealEditMode === 'create') {
      createSavedMeal(savedMealName, savedMealFoods);
    } else if (savedMealEditMode === 'edit' && editingSavedMeal) {
      updateSavedMeal(editingSavedMeal.id, savedMealName, savedMealFoods);
    }
    setSavedMealEditMode('list');
    setEditingSavedMeal(null);
    setSavedMealName('');
    setSavedMealFoods([]);
  };

  const handleDeleteSavedMeal = (id: string) => {
    deleteSavedMeal(id);
  };

  const handleUseSavedMeal = (meal: SavedMeal) => {
    if (currentMealId) {
      addSavedMealToDay(meal.id, selectedDate, currentMealId);
      handleCloseSavedMeals();
    }
  };

  const handleAddFoodToSavedMealTemplate = () => {
    setAddingFoodToSavedMeal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectFoodForSavedMeal = (food: FoodSearchResult) => {
    const newFood: SavedMealFood = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servings: 1,
    };
    setSavedMealFoods((prev) => [...prev, newFood]);
    setAddingFoodToSavedMeal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFoodFromSavedMeal = (foodId: string) => {
    setSavedMealFoods((prev) => prev.filter((f) => f.id !== foodId));
  };

  const getSavedMealTotals = (foods: SavedMealFood[]) => {
    return foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories * food.servings,
        protein: acc.protein + food.protein * food.servings,
        carbs: acc.carbs + food.carbs * food.servings,
        fat: acc.fat + food.fat * food.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const renderMealCard = (meal: Meal) => {
    const mealCalories = meal.foods.reduce((sum, f) => sum + f.calories, 0);
    const isRenaming = renamingMealId === meal.id;

    return (
      <Card key={meal.id} style={styles.mealCard}>
        <View style={styles.mealHeader}>
          {isRenaming ? (
            <View style={styles.renameRow}>
              <TextInput
                style={styles.renameInput}
                value={renameInput}
                onChangeText={setRenameInput}
                autoFocus
                onSubmitEditing={handleSaveRename}
                onBlur={handleSaveRename}
              />
              <Pressable onPress={handleSaveRename}>
                <Feather name="check" size={20} color={colors.accent} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.mealTitleRow} onPress={() => handleStartRename(meal)}>
              <Text style={styles.mealTitle}>{meal.name}</Text>
              <Feather name="edit-2" size={14} color={colors.muted} />
            </Pressable>
          )}
          <View style={styles.mealActions}>
            <Text style={styles.mealCalories}>{mealCalories} kcal</Text>
            <Pressable onPress={() => handleDeleteMeal(meal.id)} hitSlop={8}>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {meal.foods.length === 0 ? (
          <Text style={styles.emptyText}>No foods logged</Text>
        ) : (
          meal.foods.map((food) => (
            <View key={food.id} style={styles.foodRow}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>
                  {food.name}
                  {food.brand ? ` (${food.brand})` : ''}
                </Text>
                <Text style={styles.foodMacros}>
                  {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                </Text>
              </View>
              <Pressable onPress={() => handleDeleteFood(meal.id, food.id)} hitSlop={8}>
                <Feather name="x" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}

        <Pressable style={styles.addToMealButton} onPress={() => handleAddFoodToMeal(meal.id)}>
          <Feather name="plus" size={16} color={colors.accent} />
          <Text style={styles.addToMealText}>Add food</Text>
        </Pressable>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Settings Modal (Calorie Goal) */}
      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setSettingsOpen(false)} />
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Calorie Goal</Text>
              <Pressable onPress={() => setSettingsOpen(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>
            <Text style={styles.settingsLabel}>
              Set your daily calorie target. This will be remembered.
            </Text>
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={colors.muted}
            />
            <Pressable style={styles.saveButton} onPress={handleSaveGoal}>
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={calendarOpen} transparent animationType="slide" onRequestClose={() => setCalendarOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick a date</Text>
              <Pressable onPress={() => setCalendarOpen(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>
            <CalendarList
              current={selectedDate}
              minDate={earliestCalorieDate}
              maxDate={todayIso}
              pastScrollRange={calendarPastRange}
              futureScrollRange={calendarFutureRange}
              horizontal
              pagingEnabled
              enableSwipeMonths
              hideExtraDays
              firstDay={WEEK_STARTS_ON}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarOpen(false);
              }}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.muted,
                textSectionTitleDisabledColor: colors.muted,
                dayTextColor: colors.text,
                todayTextColor: colors.accent,
                monthTextColor: colors.text,
                textMonthFontFamily: typography.headline.fontFamily,
                textMonthFontSize: typography.headline.fontSize,
                textDayFontFamily: typography.body.fontFamily,
                textDayFontSize: typography.body.fontSize,
                textDayHeaderFontFamily: typography.label.fontFamily,
                textDayHeaderFontSize: typography.label.fontSize,
                selectedDayBackgroundColor: colors.accent,
                selectedDayTextColor: '#fff',
                arrowColor: colors.accent,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Food Picker Modal */}
      <Modal visible={foodPickerOpen} animationType="slide" onRequestClose={handleCancelEntry}>
        <View style={[styles.foodPickerContainer, { paddingTop: insets.top }]}>
          <View style={styles.foodPickerHeader}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <Pressable onPress={handleCancelEntry}>
              <Text style={styles.modalClose}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search foods (e.g., chicken breast)"
              placeholderTextColor={colors.muted}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Feather name="x" size={20} color={colors.muted} />
              </Pressable>
            )}
          </View>

          <View style={styles.searchToggleRow}>
            <View style={styles.searchToggleInfo}>
              <Text style={styles.searchToggleLabel}>Simple search</Text>
              <Text style={styles.searchToggleHint}>
                {simpleSearchEnabled ? 'Common foods only' : 'Full USDA database'}
              </Text>
            </View>
            <Switch
              value={simpleSearchEnabled}
              onValueChange={(value) => {
                setSimpleSearchEnabled(value);
                if (searchQuery) {
                  handleSearch(searchQuery);
                }
              }}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={simpleSearchEnabled ? colors.accent : colors.muted}
            />
          </View>

          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionButton} onPress={handleOpenScanner}>
              <Feather name="camera" size={20} color={colors.accent} />
              <Text style={styles.quickActionText}>Scan Barcode</Text>
            </Pressable>
            <Pressable style={styles.quickActionButton} onPress={handleOpenSavedMeals}>
              <Feather name="bookmark" size={20} color={colors.accent} />
              <Text style={styles.quickActionText}>Saved Meals</Text>
            </Pressable>
          </View>

          {isSearchingFoods ? (
            <View style={styles.searchLoading}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.searchLoadingText}>Searching...</Text>
            </View>
          ) : searchQuery.length > 0 && searchResults.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No foods found for "{searchQuery}"</Text>
              <Text style={styles.noResultsHint}>Try a different search or enter manually</Text>
            </View>
          ) : (
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((food) => (
                <Pressable
                  key={food.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(food)}
                >
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text style={styles.searchResultMacros}>
                      {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                    </Text>
                  </View>
                </Pressable>
              ))}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsFooter}>
                  <Text style={styles.searchResultsFooterText}>
                    Tap a food to add it
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide" onRequestClose={handleCancelEntry}>
        <View style={styles.scannerContainer}>
          <View style={[styles.scannerHeader, { paddingTop: insets.top + spacing.md }]}>
            <Text style={styles.scannerTitle}>Scan Barcode</Text>
            <Pressable onPress={handleCancelEntry}>
              <Text style={styles.modalClose}>Cancel</Text>
            </Pressable>
          </View>

          {!permission?.granted ? (
            <View style={styles.permissionPrompt}>
              <Feather name="camera-off" size={48} color={colors.muted} />
              <Text style={styles.permissionText}>
                Camera access is needed to scan barcodes
              </Text>
              <Pressable style={styles.primaryButton} onPress={requestPermission}>
                <Text style={styles.primaryButtonText}>Grant Permission</Text>
              </Pressable>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
              }}
              onBarcodeScanned={scanned ? undefined : (result) => handleBarcodeScan(result.data)}
            />
          )}

          <View style={[styles.scannerFooter, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={styles.scannerHint}>Position barcode within the frame</Text>
            <Pressable style={styles.secondaryButton} onPress={handleManualEntry}>
              <Text style={styles.secondaryButtonText}>Enter Manually</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Food Entry Form Modal */}
      <Modal visible={entryModalOpen} transparent animationType="slide" onRequestClose={handleCancelEntry}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.entryModalWrapper}
          >
            <View style={styles.entryModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {draftEntry?.barcode ? 'Confirm Details' : 'Add Food'}
                </Text>
                <Pressable onPress={handleCancelEntry}>
                  <Text style={styles.modalClose}>Cancel</Text>
                </Pressable>
              </View>

              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={colors.accent} size="large" />
                  <Text style={styles.loadingText}>Looking up product...</Text>
                </View>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled">
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Food Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={draftEntry?.name || ''}
                      onChangeText={handleFoodNameChange}
                      placeholder="e.g., Chicken Breast"
                      placeholderTextColor={colors.muted}
                      onFocus={() => {
                        if (draftEntry?.name && draftEntry.name.length >= 2) {
                          setShowSuggestions(true);
                        }
                      }}
                    />
                    {showSuggestions && (
                      <View style={styles.suggestionsContainer}>
                        {isLoadingSuggestions ? (
                          <View style={styles.suggestionLoading}>
                            <ActivityIndicator color={colors.accent} size="small" />
                          </View>
                        ) : nameSuggestions.length > 0 ? (
                          nameSuggestions.map((food) => (
                            <Pressable
                              key={food.id}
                              style={styles.suggestionItem}
                              onPress={() => handleSelectSuggestion(food)}
                            >
                              <View style={styles.suggestionInfo}>
                                <Text style={styles.suggestionName} numberOfLines={1}>
                                  {food.name}
                                </Text>
                                <Text style={styles.suggestionMacros}>
                                  {food.calories} kcal | P: {food.protein}g
                                </Text>
                              </View>
                            </Pressable>
                          ))
                        ) : draftEntry?.name && draftEntry.name.length >= 2 ? (
                          <Text style={styles.noSuggestions}>No suggestions found</Text>
                        ) : null}
                      </View>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Brand (optional)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={draftEntry?.brand || ''}
                      onChangeText={(v) => updateDraftEntry('brand', v)}
                      placeholder="e.g., Sainsbury's"
                      placeholderTextColor={colors.muted}
                    />
                  </View>

                  <Text style={styles.formSectionTitle}>Nutrition per serving</Text>

                  <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Calories *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.calories || ''}
                        onChangeText={(v) => updateDraftEntry('calories', v)}
                        placeholder="kcal"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Protein (g)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.protein || ''}
                        onChangeText={(v) => updateDraftEntry('protein', v)}
                        placeholder="0"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Carbs (g)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.carbs || ''}
                        onChangeText={(v) => updateDraftEntry('carbs', v)}
                        placeholder="0"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Fat (g)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.fat || ''}
                        onChangeText={(v) => updateDraftEntry('fat', v)}
                        placeholder="0"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Serving Size (g)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.servingSize || ''}
                        onChangeText={handleServingSizeChange}
                        placeholder="100"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.formGroupHalf}>
                      <Text style={styles.formLabel}>Servings</Text>
                      <TextInput
                        style={styles.formInput}
                        value={draftEntry?.servings || ''}
                        onChangeText={(v) => updateDraftEntry('servings', v)}
                        placeholder="1"
                        placeholderTextColor={colors.muted}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Pressable style={styles.saveButton} onPress={handleSaveEntry}>
                    <Text style={styles.saveButtonText}>Save Food</Text>
                  </Pressable>
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Saved Meals Modal */}
      <Modal visible={savedMealsOpen} animationType="slide" onRequestClose={handleCloseSavedMeals}>
        <View style={[styles.foodPickerContainer, { paddingTop: insets.top }]}>
          <View style={styles.foodPickerHeader}>
            <Text style={styles.modalTitle}>
              {savedMealEditMode === 'list'
                ? 'Saved Meals'
                : savedMealEditMode === 'create'
                ? 'New Saved Meal'
                : 'Edit Saved Meal'}
            </Text>
            <Pressable
              onPress={
                savedMealEditMode === 'list'
                  ? handleCloseSavedMeals
                  : () => {
                      setSavedMealEditMode('list');
                      setAddingFoodToSavedMeal(false);
                    }
              }
            >
              <Text style={styles.modalClose}>
                {savedMealEditMode === 'list' ? 'Cancel' : 'Back'}
              </Text>
            </Pressable>
          </View>

          {savedMealEditMode === 'list' && !addingFoodToSavedMeal && (
            <ScrollView style={styles.savedMealsList}>
              {savedMeals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="bookmark" size={48} color={colors.muted} />
                  <Text style={styles.emptyStateText}>No saved meals yet</Text>
                  <Text style={styles.emptyStateHint}>
                    Create meal templates to quickly add your favorite combinations
                  </Text>
                </View>
              ) : (
                savedMeals.map((meal) => {
                  const mealTotals = getSavedMealTotals(meal.foods);
                  return (
                    <Pressable
                      key={meal.id}
                      style={styles.savedMealItem}
                      onPress={() => handleUseSavedMeal(meal)}
                    >
                      <View style={styles.savedMealInfo}>
                        <Text style={styles.savedMealName}>{meal.name}</Text>
                        <Text style={styles.savedMealStats}>
                          {mealTotals.calories} kcal • {meal.foods.length}{' '}
                          {meal.foods.length === 1 ? 'item' : 'items'}
                        </Text>
                        <Text style={styles.savedMealMacros}>
                          P: {mealTotals.protein}g C: {mealTotals.carbs}g F: {mealTotals.fat}g
                        </Text>
                      </View>
                      <View style={styles.savedMealActions}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleStartEditSavedMeal(meal);
                          }}
                          hitSlop={8}
                        >
                          <Feather name="edit-2" size={18} color={colors.muted} />
                        </Pressable>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedMeal(meal.id);
                          }}
                          hitSlop={8}
                        >
                          <Feather name="trash-2" size={18} color={colors.danger} />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
              )}
              <Pressable style={styles.createSavedMealButton} onPress={handleStartCreateSavedMeal}>
                <Feather name="plus" size={20} color={colors.accent} />
                <Text style={styles.createSavedMealText}>Create New Meal</Text>
              </Pressable>
            </ScrollView>
          )}

          {(savedMealEditMode === 'create' || savedMealEditMode === 'edit') &&
            !addingFoodToSavedMeal && (
              <ScrollView style={styles.savedMealEditor}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Meal Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={savedMealName}
                    onChangeText={setSavedMealName}
                    placeholder="e.g., My Breakfast"
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <Text style={styles.savedMealSectionTitle}>Foods</Text>
                {savedMealFoods.length === 0 ? (
                  <Text style={styles.emptyText}>No foods added yet</Text>
                ) : (
                  savedMealFoods.map((food) => (
                    <View key={food.id} style={styles.savedMealFoodItem}>
                      <View style={styles.savedMealFoodInfo}>
                        <Text style={styles.savedMealFoodName}>{food.name}</Text>
                        <Text style={styles.savedMealFoodMacros}>
                          {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F:{' '}
                          {food.fat}g
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleRemoveFoodFromSavedMeal(food.id)}
                        hitSlop={8}
                      >
                        <Feather name="x" size={20} color={colors.danger} />
                      </Pressable>
                    </View>
                  ))
                )}

                <Pressable
                  style={styles.addFoodToSavedMealButton}
                  onPress={handleAddFoodToSavedMealTemplate}
                >
                  <Feather name="plus" size={18} color={colors.accent} />
                  <Text style={styles.addFoodToSavedMealText}>Add Food</Text>
                </Pressable>

                {savedMealFoods.length > 0 && (
                  <View style={styles.savedMealTotals}>
                    <Text style={styles.savedMealTotalsTitle}>Total</Text>
                    <Text style={styles.savedMealTotalsText}>
                      {getSavedMealTotals(savedMealFoods).calories} kcal
                    </Text>
                    <Text style={styles.savedMealTotalsMacros}>
                      P: {getSavedMealTotals(savedMealFoods).protein}g C:{' '}
                      {getSavedMealTotals(savedMealFoods).carbs}g F:{' '}
                      {getSavedMealTotals(savedMealFoods).fat}g
                    </Text>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.saveButton,
                    (!savedMealName.trim() || savedMealFoods.length === 0) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveSavedMeal}
                  disabled={!savedMealName.trim() || savedMealFoods.length === 0}
                >
                  <Text style={styles.saveButtonText}>
                    {savedMealEditMode === 'create' ? 'Save Meal' : 'Update Meal'}
                  </Text>
                </Pressable>
              </ScrollView>
            )}

          {addingFoodToSavedMeal && (
            <View style={styles.addFoodToSavedMealContainer}>
              <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={colors.muted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search foods"
                  placeholderTextColor={colors.muted}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <Feather name="x" size={20} color={colors.muted} />
                  </Pressable>
                )}
              </View>

              {isSearchingFoods ? (
                <View style={styles.searchLoading}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : (
                <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
                  {searchResults.map((food) => (
                    <Pressable
                      key={food.id}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectFoodForSavedMeal(food)}
                    >
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {food.name}
                        </Text>
                        <Text style={styles.searchResultMacros}>
                          {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F:{' '}
                          {food.fat}g
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              <View style={styles.addFoodToSavedMealFooter}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setAddingFoodToSavedMeal(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Week Selector */}
        <View style={styles.calendarCard}>
          <Pressable style={styles.monthButton} onPress={() => setCalendarOpen(true)}>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Feather name="chevron-down" size={18} color={colors.muted} />
          </Pressable>
          <View style={styles.weekRow}>
            {weekDates.map((date) => {
              const iso = formatISODate(date);
              const isToday = iso === todayIso;
              const isSelected = iso === selectedDate;
              return (
                <Pressable
                  key={iso}
                  style={[
                    styles.weekDay,
                    isSelected ? styles.weekDaySelected : null,
                    isToday && !isSelected ? styles.weekDayToday : null,
                  ]}
                  onPress={() => setSelectedDate(iso)}
                >
                  <Text style={[styles.weekDayLabel, isSelected ? styles.weekDayLabelSelected : null]}>
                    {weekDays[date.getDay()]}
                  </Text>
                  <Text style={[styles.weekDayNumber, isSelected ? styles.weekDayNumberSelected : null]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {/* Daily Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.sectionTitle}>Daily Summary</Text>
              <Text style={styles.sectionSubtitle}>{selectedDateLabel}</Text>
            </View>
            <Pressable style={styles.settingsButton} onPress={handleOpenSettings}>
              <Feather name="settings" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.calorieSection}>
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieValue}>{totals.calories}</Text>
              <Text style={styles.calorieGoal}>/ {dailyGoal} kcal</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calorieProgress}%` }]} />
            </View>
            <Text style={styles.calorieRemaining}>
              {dailyGoal - totals.calories > 0
                ? `${dailyGoal - totals.calories} kcal remaining`
                : 'Goal reached!'}
            </Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totals.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </Card>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={styles.sectionTitle}>Meals</Text>
            <Pressable style={styles.addMealButton} onPress={handleAddMeal}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addMealButtonText}>Add Meal</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <Card>
              <ActivityIndicator color={colors.accent} />
            </Card>
          ) : !dayData || dayData.meals.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No meals logged yet. Tap "Add Meal" to get started.</Text>
            </Card>
          ) : (
            dayData.meals.map(renderMealCard)
          )}
        </View>

        {/* History Section */}
        {historyDays.length > 0 && (
          <View style={styles.historySection}>
            <Pressable
              style={styles.historyHeader}
              onPress={() => setHistoryExpanded(!historyExpanded)}
            >
              <Text style={styles.sectionTitle}>Meal History</Text>
              <Feather
                name={historyExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
            {historyExpanded && (
              <View style={styles.historyList}>
                {historyDays.map((day) => {
                  const dayDate = parseISODate(day.date);
                  const dayLabel = formatShortDate(dayDate);
                  const dayTotals = day.meals.reduce(
                    (acc, meal) => {
                      meal.foods.forEach((food) => {
                        acc.calories += food.calories;
                        acc.protein += food.protein;
                        acc.carbs += food.carbs;
                        acc.fat += food.fat;
                      });
                      return acc;
                    },
                    { calories: 0, protein: 0, carbs: 0, fat: 0 }
                  );

                  return (
                    <Pressable
                      key={day.date}
                      onPress={() => setSelectedDate(day.date)}
                    >
                      <Card style={styles.historyCard}>
                        <View style={styles.historyCardHeader}>
                          <Text style={styles.historyDate}>{dayLabel}</Text>
                          <Text style={styles.historyCalories}>{dayTotals.calories} kcal</Text>
                        </View>
                        <Text style={styles.historyMacros}>
                          P: {dayTotals.protein}g | C: {dayTotals.carbs}g | F: {dayTotals.fat}g
                        </Text>
                        <View style={styles.historyMeals}>
                          {day.meals.map((meal) => (
                            <View key={meal.id} style={styles.historyMealRow}>
                              <Text style={styles.historyMealName}>{meal.name}</Text>
                              <Text style={styles.historyMealFoods}>
                                {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'} -{' '}
                                {meal.foods.reduce((sum, f) => sum + f.calories, 0)} kcal
                              </Text>
                            </View>
                          ))}
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  calendarCard: {
    gap: spacing.sm,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthLabel: {
    ...typography.headline,
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  weekDay: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  weekDaySelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  weekDayToday: {
    borderColor: colors.accent,
  },
  weekDayLabel: {
    ...typography.label,
    color: colors.muted,
  },
  weekDayLabelSelected: {
    color: '#fff',
  },
  weekDayNumber: {
    ...typography.body,
    color: colors.text,
  },
  weekDayNumberSelected: {
    color: '#fff',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingsButton: {
    padding: spacing.xs,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.muted,
  },
  calorieSection: {
    gap: spacing.sm,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  calorieValue: {
    ...typography.title,
    color: colors.text,
  },
  calorieGoal: {
    ...typography.body,
    color: colors.muted,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.accentSoft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  calorieRemaining: {
    ...typography.body,
    color: colors.muted,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  macroItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroValue: {
    ...typography.headline,
    color: colors.text,
  },
  macroLabel: {
    ...typography.label,
    color: colors.muted,
  },
  mealsSection: {
    gap: spacing.md,
  },
  mealsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  addMealButtonText: {
    ...typography.label,
    color: '#fff',
  },
  mealCard: {
    gap: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealTitle: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.text,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mealCalories: {
    ...typography.body,
    color: colors.muted,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  foodInfo: {
    flex: 1,
    gap: 2,
  },
  foodName: {
    ...typography.body,
    color: colors.text,
  },
  foodMacros: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
  },
  addToMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
  },
  addToMealText: {
    ...typography.label,
    color: colors.accent,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalDismiss: {
    flex: 1,
  },
  settingsModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalClose: {
    ...typography.label,
    color: colors.muted,
  },
  settingsLabel: {
    ...typography.body,
    color: colors.muted,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerTitle: {
    ...typography.headline,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  permissionPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  permissionText: {
    ...typography.body,
    color: '#fff',
    textAlign: 'center',
  },
  scannerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerHint: {
    ...typography.body,
    color: '#fff',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
  },
  primaryButtonText: {
    ...typography.label,
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  entryModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  entryModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  formSectionTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    ...typography.body,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.label,
    color: '#fff',
  },
  foodPickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  foodPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  searchToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchToggleInfo: {
    flex: 1,
  },
  searchToggleLabel: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.text,
  },
  searchToggleHint: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
  },
  quickActionText: {
    ...typography.label,
    color: colors.accent,
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchLoadingText: {
    ...typography.body,
    color: colors.muted,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  noResultsText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  noResultsHint: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchResultInfo: {
    flex: 1,
    gap: 2,
  },
  searchResultName: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.text,
  },
  searchResultMacros: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  searchResultsFooter: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  searchResultsFooterText: {
    ...typography.body,
    color: colors.muted,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  suggestionLoading: {
    padding: spacing.md,
    alignItems: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionInfo: {
    flex: 1,
    gap: 2,
  },
  suggestionName: {
    ...typography.body,
    color: colors.text,
  },
  suggestionMacros: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
  },
  noSuggestions: {
    ...typography.body,
    color: colors.muted,
    padding: spacing.sm,
    textAlign: 'center',
  },
  historySection: {
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyCard: {
    gap: spacing.sm,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    ...typography.headline,
    color: colors.text,
  },
  historyCalories: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.accent,
  },
  historyMacros: {
    ...typography.body,
    color: colors.muted,
  },
  historyMeals: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyMealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyMealName: {
    ...typography.body,
    color: colors.text,
  },
  historyMealFoods: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
  },
  savedMealsList: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    ...typography.headline,
    color: colors.text,
  },
  emptyStateHint: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  savedMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedMealInfo: {
    flex: 1,
    gap: 2,
  },
  savedMealName: {
    ...typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.text,
  },
  savedMealStats: {
    ...typography.body,
    fontSize: 13,
    color: colors.accent,
  },
  savedMealMacros: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
  },
  savedMealActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  createSavedMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  createSavedMealText: {
    ...typography.label,
    color: colors.accent,
  },
  savedMealEditor: {
    flex: 1,
    padding: spacing.lg,
  },
  savedMealSectionTitle: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  savedMealFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedMealFoodInfo: {
    flex: 1,
    gap: 2,
  },
  savedMealFoodName: {
    ...typography.body,
    color: colors.text,
  },
  savedMealFoodMacros: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
  },
  addFoodToSavedMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  addFoodToSavedMealText: {
    ...typography.label,
    color: colors.accent,
  },
  savedMealTotals: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  savedMealTotalsTitle: {
    ...typography.label,
    color: colors.muted,
  },
  savedMealTotalsText: {
    ...typography.headline,
    color: colors.text,
  },
  savedMealTotalsMacros: {
    ...typography.body,
    color: colors.muted,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  addFoodToSavedMealContainer: {
    flex: 1,
  },
  addFoodToSavedMealFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
