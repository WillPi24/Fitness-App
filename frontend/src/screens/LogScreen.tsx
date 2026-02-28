import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { WeeklyMuscleMap } from '../components/WeeklyMuscleMap';
import type { CanonicalBodyPart } from '../components/WeeklyMuscleMap';
import { EXERCISE_OPTIONS } from '../data/exercises';
import type { ExerciseOption } from '../data/exercises';
import {
  DraftWorkout,
  WorkoutCompletionPreview,
  useWorkoutStore,
} from '../store/workoutStore';
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

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = `${minutes}`.padStart(2, '0');
  const paddedSeconds = `${seconds}`.padStart(2, '0');
  return hours > 0
    ? `${hours}:${paddedMinutes}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`;
}

function monthsBetween(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

const bodyPartAliases: Record<string, CanonicalBodyPart> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  quads: 'quads',
  'hams/glutes': 'hamsGlutes',
  'hams / glutes': 'hamsGlutes',
  'hamstrings / glutes': 'hamsGlutes',
  hamstrings: 'hamsGlutes',
  glutes: 'hamsGlutes',
  calves: 'calves',
  triceps: 'triceps',
  biceps: 'biceps',
  forearms: 'forearms',
  forearm: 'forearms',
  'abs/core': 'absCore',
  'abs / core': 'absCore',
  abs: 'absCore',
  core: 'absCore',
};

function normalizeBodyPart(bodyPart: string): CanonicalBodyPart | null {
  const normalized = bodyPart.trim().toLowerCase();
  return bodyPartAliases[normalized] ?? null;
}

function inferBodyPartFromExerciseName(name: string): CanonicalBodyPart | null {
  const normalized = name.trim().toLowerCase();
  if (
    /(tricep|skullcrusher|pushdown|kickback|close[-\s]?grip bench|overhead extension)/.test(normalized)
  ) {
    return 'triceps';
  }
  if (/(bench|chest|pec|fly|pullover)/.test(normalized)) {
    return 'chest';
  }
  if (/(rdl|romanian|stiff[-\s]?leg|hip thrust|glute|leg curl|hamstring|ghr|pull[-\s]?through)/.test(normalized)) {
    return 'hamsGlutes';
  }
  if (/(row|pull[-\s]?up|chin[-\s]?up|pulldown|lat|trap|deadlift)/.test(normalized)) {
    return 'back';
  }
  if (/(overhead press|shoulder|lateral raise|front raise|rear delt|upright row|arnold press)/.test(normalized)) {
    return 'shoulders';
  }
  if (/(squat|leg press|lunge|leg extension|split squat|quad)/.test(normalized)) {
    return 'quads';
  }
  if (/(calf)/.test(normalized)) {
    return 'calves';
  }
  if (/(forearm|wrist\s*curl|reverse\s*curl|wrist\s*roller|grip|farmer'?s\s*carry)/.test(normalized)) {
    return 'forearms';
  }
  if (/(bicep|curl|preacher|hammer)/.test(normalized)) {
    return 'biceps';
  }
  if (/(ab\b|core|oblique|crunch|plank|rollout|woodchopper|leg raise)/.test(normalized)) {
    return 'absCore';
  }
  return null;
}

type TemplateExerciseDraft = {
  id: string;
  name: string;
};

type ExerciseHistoryEntry = {
  workoutId: string;
  date: string;
  startedAt: number;
  topWeight: number;
  topReps: number;
  sets: Array<{ weight: number; reps: number }>;
};

function createTemplateExerciseDraft(name = ''): TemplateExerciseDraft {
  return {
    id: `template-exercise-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
  };
}

function normalizeExerciseName(name: string) {
  return name.trim().toLowerCase();
}

function getTopSet(sets: Array<{ weight: number; reps: number }>) {
  if (sets.length === 0) {
    return null;
  }
  return sets.reduce((best, current) => {
    if (current.weight > best.weight) {
      return current;
    }
    if (current.weight === best.weight && current.reps > best.reps) {
      return current;
    }
    return best;
  });
}

export function LogScreen() {
  const {
    workouts,
    activeWorkout,
    workoutTemplates,
    startWorkout,
    startWorkoutFromTemplate,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    discardActiveWorkout,
    addExercise,
    updateExerciseName,
    removeExercise,
    addSet,
    updateSet,
    previewWorkoutCompletion,
    confirmWorkoutCompletion,
    isLoading,
    error,
    clearError,
  } = useWorkoutStore();

  const today = new Date();
  const todayIso = useMemo(() => formatISODate(today), [today]);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exercisePickerTarget, setExercisePickerTarget] = useState<
    { type: 'new' } | { type: 'edit'; exerciseId: string } | { type: 'template'; templateExerciseId: string } | null
  >(null);
  const [startWorkoutChoiceOpen, setStartWorkoutChoiceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [templateEditorId, setTemplateEditorId] = useState<string | null>(null);
  const [templateEditorName, setTemplateEditorName] = useState('');
  const [templateEditorExercises, setTemplateEditorExercises] = useState<TemplateExerciseDraft[]>([
    createTemplateExerciseDraft(),
  ]);
  const [completionPreview, setCompletionPreview] = useState<WorkoutCompletionPreview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'complete' | 'discard' | null>(null);
  const [timerTick, setTimerTick] = useState(Date.now());
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Record<string, boolean>>({});
  const [exerciseHistoryOpen, setExerciseHistoryOpen] = useState(false);
  const [exerciseHistoryExerciseName, setExerciseHistoryExerciseName] = useState('');
  const [expandedExerciseHistoryIds, setExpandedExerciseHistoryIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!activeWorkout) {
      return;
    }
    setTimerTick(Date.now());
    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.id]);

  const selectedDateObj = useMemo(() => parseISODate(selectedDate), [selectedDate]);
  const monthLabel = useMemo(() => formatMonthYear(selectedDateObj), [selectedDateObj]);
  const selectedDateLabel = useMemo(() => formatShortDate(selectedDateObj), [selectedDateObj]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDateObj);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDateObj]);

  const earliestWorkoutDate = useMemo(() => {
    if (workouts.length === 0) {
      return selectedDate;
    }
    return workouts.reduce((minDate, workout) => (workout.date < minDate ? workout.date : minDate), workouts[0].date);
  }, [workouts, selectedDate]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string; selectedTextColor?: string; dotColor?: string }> = {};
    workouts.forEach((workout) => {
      if (!marks[workout.date]) {
        marks[workout.date] = { marked: true, dotColor: colors.accent };
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
  }, [workouts, selectedDate]);

  const calendarPastRange = useMemo(() => {
    const earliest = parseISODate(earliestWorkoutDate);
    return Math.max(0, monthsBetween(earliest, selectedDateObj));
  }, [earliestWorkoutDate, selectedDateObj]);

  const calendarFutureRange = useMemo(() => {
    const todayDate = new Date();
    return Math.max(0, monthsBetween(selectedDateObj, todayDate));
  }, [selectedDateObj]);

  const weekDateIsoStrings = useMemo(
    () => weekDates.map((date) => formatISODate(date)),
    [weekDates],
  );

  const workoutsForSelectedWeek = useMemo(() => {
    const weekDatesSet = new Set(weekDateIsoStrings);
    return workouts
      .filter((workout) => weekDatesSet.has(workout.date))
      .sort((a, b) => b.startedAt - a.startedAt);
  }, [workouts, weekDateIsoStrings]);

  const exerciseBodyPartLookup = useMemo(() => {
    const lookup = new Map<string, CanonicalBodyPart>();
    EXERCISE_OPTIONS.forEach((option) => {
      const normalizedBodyPart = normalizeBodyPart(option.bodyPart);
      if (!normalizedBodyPart) {
        return;
      }
      lookup.set(option.name.trim().toLowerCase(), normalizedBodyPart);
    });
    return lookup;
  }, []);

  const weeklyBodyPartCounts = useMemo(() => {
    const counts: Partial<Record<CanonicalBodyPart, number>> = {};
    workoutsForSelectedWeek.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const exerciseKey = exercise.name.trim().toLowerCase();
        const bodyPart =
          exerciseBodyPartLookup.get(exerciseKey) ?? inferBodyPartFromExerciseName(exercise.name);
        if (!bodyPart) {
          return;
        }
        counts[bodyPart] = (counts[bodyPart] ?? 0) + 1;
      });
    });
    return counts;
  }, [workoutsForSelectedWeek, exerciseBodyPartLookup]);

  const weeklyPersonalBests = useMemo(() => {
    return workoutsForSelectedWeek
      .flatMap((workout) =>
        workout.personalRecords.map((record) => ({
          ...record,
          workoutId: workout.id,
          workoutDate: workout.date,
          workoutStartedAt: workout.startedAt,
        })),
      )
      .sort((a, b) => b.workoutStartedAt - a.workoutStartedAt);
  }, [workoutsForSelectedWeek]);

  const activeWorkoutForSelected =
    activeWorkout && activeWorkout.date === selectedDate ? activeWorkout : null;
  const activeWorkoutForOtherDay =
    activeWorkout && activeWorkout.date !== selectedDate ? activeWorkout : null;
  const isSelectedDateToday = selectedDate === todayIso;

  const elapsedMs = activeWorkout ? timerTick - activeWorkout.startedAt : 0;

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();
    if (!query) {
      return EXERCISE_OPTIONS;
    }
    const tokens = query.split(/\s+/).filter(Boolean);
    return EXERCISE_OPTIONS.filter((option) => {
      const haystack = `${option.name} ${option.bodyPart} ${option.primaryFocus} ${option.equipment}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [exerciseSearch]);

  const exerciseHistoryEntries = useMemo<ExerciseHistoryEntry[]>(() => {
    const targetExercise = normalizeExerciseName(exerciseHistoryExerciseName);
    if (!targetExercise) {
      return [];
    }

    const entries = workouts.reduce<ExerciseHistoryEntry[]>((acc, workout) => {
      const matchingSets: Array<{ weight: number; reps: number }> = [];

      workout.exercises.forEach((exercise) => {
        if (normalizeExerciseName(exercise.name) !== targetExercise) {
          return;
        }
        exercise.sets.forEach((set) => {
          matchingSets.push({ weight: set.weight, reps: set.reps });
        });
      });

      const topSet = getTopSet(matchingSets);
      if (!topSet) {
        return acc;
      }

      acc.push({
        workoutId: workout.id,
        date: workout.date,
        startedAt: workout.startedAt,
        topWeight: topSet.weight,
        topReps: topSet.reps,
        sets: matchingSets,
      });
      return acc;
    }, []);

    return entries.sort((a, b) => b.startedAt - a.startedAt);
  }, [workouts, exerciseHistoryExerciseName]);

  const openExercisePicker = (
    target: { type: 'new' } | { type: 'edit'; exerciseId: string } | { type: 'template'; templateExerciseId: string }
  ) => {
    setExercisePickerTarget(target);
    setExerciseSearch('');
    setExercisePickerOpen(true);
  };

  const closeExercisePicker = () => {
    const wasTemplatePicker = exercisePickerTarget?.type === 'template';
    setExercisePickerOpen(false);
    setExercisePickerTarget(null);
    setExerciseSearch('');
    if (wasTemplatePicker) {
      setSettingsOpen(true);
    }
  };

  const handleSelectExercise = (name: string) => {
    if (!exercisePickerTarget) {
      return;
    }

    if (exercisePickerTarget.type === 'new') {
      addExercise(selectedDate, name);
    } else if (exercisePickerTarget.type === 'edit') {
      updateExerciseName(exercisePickerTarget.exerciseId, name);
    } else {
      handleUpdateTemplateExercise(exercisePickerTarget.templateExerciseId, name);
    }

    closeExercisePicker();
  };

  const handleUseCustomExercise = () => {
    const trimmed = exerciseSearch.trim();
    if (!trimmed) {
      return;
    }
    handleSelectExercise(trimmed);
  };

  const handleStartWorkout = () => {
    if (!isSelectedDateToday) {
      return;
    }
    clearError();
    setStartWorkoutChoiceOpen(true);
  };

  const handleCloseStartWorkoutChoice = () => {
    setStartWorkoutChoiceOpen(false);
  };

  const handleStartWithoutTemplate = () => {
    setStartWorkoutChoiceOpen(false);
    startWorkout(selectedDate);
  };

  const handleStartWithTemplate = () => {
    setStartWorkoutChoiceOpen(false);
    setTemplatePickerOpen(true);
  };

  const handleCloseTemplatePicker = () => {
    setTemplatePickerOpen(false);
  };

  const resetTemplateEditor = () => {
    setTemplateEditorId(null);
    setTemplateEditorName('');
    setTemplateEditorExercises([createTemplateExerciseDraft()]);
  };

  const handleOpenSettings = () => {
    clearError();
    resetTemplateEditor();
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    resetTemplateEditor();
  };

  const handleAddTemplateExerciseRow = () => {
    setTemplateEditorExercises((prev) => [...prev, createTemplateExerciseDraft()]);
  };

  const handleUpdateTemplateExercise = (exerciseId: string, value: string) => {
    setTemplateEditorExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }
        return {
          ...exercise,
          name: value,
        };
      })
    );
  };

  const handleRemoveTemplateExerciseRow = (exerciseId: string) => {
    setTemplateEditorExercises((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((exercise) => exercise.id !== exerciseId);
    });
  };

  const handlePickTemplateExercise = (exerciseId: string) => {
    setSettingsOpen(false);
    openExercisePicker({ type: 'template', templateExerciseId: exerciseId });
  };

  const handleSaveTemplate = () => {
    const normalizedExercises = templateEditorExercises.map((exercise) => ({
      name: exercise.name,
      setCount: 1,
    }));
    const hasInvalidInput =
      !templateEditorName.trim() ||
      normalizedExercises.length === 0 ||
      normalizedExercises.some((exercise) => !exercise.name.trim());

    clearError();
    if (templateEditorId) {
      updateWorkoutTemplate(templateEditorId, templateEditorName, normalizedExercises);
    } else {
      createWorkoutTemplate(templateEditorName, normalizedExercises);
    }

    if (!hasInvalidInput) {
      resetTemplateEditor();
    }
  };

  const handleEditWorkoutTemplate = (templateId: string) => {
    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setTemplateEditorId(template.id);
    setTemplateEditorName(template.name);
    setTemplateEditorExercises(
      template.exercises.map((exercise) => createTemplateExerciseDraft(exercise.name))
    );
  };

  const handleUseWorkoutTemplate = (templateId: string) => {
    clearError();
    startWorkoutFromTemplate(selectedDate, templateId);
    setTemplatePickerOpen(false);
  };

  const handleOpenExerciseHistory = (exerciseName: string) => {
    const trimmed = exerciseName.trim();
    if (!trimmed) {
      return;
    }
    setExerciseHistoryExerciseName(trimmed);
    setExpandedExerciseHistoryIds({});
    setExerciseHistoryOpen(true);
  };

  const handleCloseExerciseHistory = () => {
    setExerciseHistoryOpen(false);
    setExpandedExerciseHistoryIds({});
  };

  const toggleExerciseHistoryEntry = (workoutId: string) => {
    setExpandedExerciseHistoryIds((current) => ({
      ...current,
      [workoutId]: !current[workoutId],
    }));
  };

  const handleDeleteWorkoutTemplate = (templateId: string) => {
    deleteWorkoutTemplate(templateId);
    if (templateEditorId === templateId) {
      resetTemplateEditor();
    }
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setCompletionPreview(null);
    setConfirmMode(null);
  };

  const handleEndWorkout = () => {
    clearError();
    if (activeWorkout && activeWorkout.exercises.length === 0) {
      setCompletionPreview(null);
      setConfirmMode('discard');
      setConfirmOpen(true);
      return;
    }
    const preview = previewWorkoutCompletion();
    if (preview) {
      setCompletionPreview(preview);
      setConfirmMode('complete');
      setConfirmOpen(true);
    }
  };

  const handleConfirmWorkout = () => {
    if (confirmMode === 'discard') {
      discardActiveWorkout();
      handleCloseConfirm();
      return;
    }
    if (!completionPreview) {
      return;
    }
    confirmWorkoutCompletion(completionPreview.workout);
    handleCloseConfirm();
  };

  const toggleWorkoutExpanded = (workoutId: string) => {
    setExpandedWorkoutIds((current) => ({
      ...current,
      [workoutId]: !current[workoutId],
    }));
  };

  const renderExerciseOption = (item: ExerciseOption) => (
    <Pressable key={item.name} style={styles.optionRow} onPress={() => handleSelectExercise(item.name)}>
      <Text style={styles.optionName}>{item.name}</Text>
      <Text style={styles.optionMeta}>
        {item.bodyPart}
        {item.primaryFocus ? ` - ${item.primaryFocus}` : ''}
      </Text>
      {item.equipment ? <Text style={styles.optionEquipment}>{item.equipment}</Text> : null}
    </Pressable>
  );

  const renderWorkoutExercise = (exercise: DraftWorkout['exercises'][number], index: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name || `Exercise ${index + 1}`}</Text>
        <View style={styles.exerciseActions}>
          <Pressable
            style={styles.exerciseActionButton}
            onPress={() => openExercisePicker({ type: 'edit', exerciseId: exercise.id })}
          >
            <Text style={styles.exerciseAction}>Change</Text>
          </Pressable>
          <Pressable style={styles.exerciseActionButton} onPress={() => removeExercise(exercise.id)}>
            <Text style={styles.exerciseRemove}>Remove</Text>
          </Pressable>
        </View>
      </View>
      {exercise.sets.map((set, setIndex) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
          <View style={styles.setInputs}>
            <View style={styles.setInputWrapper}>
              <TextInput
                style={styles.setInput}
                value={set.weight}
                onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                placeholder="0"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
              <Text style={styles.setInputSuffix}>kg</Text>
            </View>
            <View style={styles.setInputWrapper}>
              <TextInput
                style={styles.setInput}
                value={set.reps}
                onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                placeholder="0"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
              <Text style={styles.setInputSuffix}>reps</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={styles.exerciseFooterActions}>
        <Pressable style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
          <Text style={styles.addSetText}>Add set</Text>
        </Pressable>
        <Pressable style={styles.addSetButton} onPress={() => handleOpenExerciseHistory(exercise.name)}>
          <Text style={styles.addSetText}>History</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
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
              minDate={earliestWorkoutDate}
              maxDate={todayIso}
              pastScrollRange={calendarPastRange}
              futureScrollRange={calendarFutureRange}
              calendarWidth={Math.max(280, windowWidth - spacing.lg * 2)}
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

      <Modal
        visible={exercisePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={closeExercisePicker}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.pickerModalWrapper}
          >
            <View style={styles.pickerModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pick an exercise</Text>
                <Pressable onPress={closeExercisePicker}>
                  <Text style={styles.modalClose}>Close</Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.searchInput}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                placeholder="Search by name, muscle, or equipment"
                placeholderTextColor={colors.muted}
              />
              {exerciseSearch.trim() ? (
                <Pressable style={styles.customOption} onPress={handleUseCustomExercise}>
                  <Text style={styles.customOptionText}>
                    Use custom exercise: "{exerciseSearch.trim()}"
                  </Text>
                </Pressable>
              ) : null}
              <ScrollView contentContainerStyle={styles.optionList} keyboardShouldPersistTaps="handled">
                {filteredExercises.length === 0 ? (
                  <Text style={styles.emptyOptions}>
                    No matches. Try a different search or add a custom exercise.
                  </Text>
                ) : (
                  filteredExercises.map(renderExerciseOption)
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={settingsOpen} transparent animationType="slide" onRequestClose={handleCloseSettings}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.pickerModalWrapper}
          >
            <View style={styles.pickerModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout settings</Text>
                <Pressable onPress={handleCloseSettings}>
                  <Text style={styles.modalClose}>Close</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.settingsContent} keyboardShouldPersistTaps="handled">
                <Card style={styles.settingsSection}>
                  <Text style={styles.sectionTitle}>
                    {templateEditorId ? 'Edit workout template' : 'Build workout template'}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Build workouts here, then start a session from a preset template.
                  </Text>
                  <TextInput
                    style={styles.searchInput}
                    value={templateEditorName}
                    onChangeText={setTemplateEditorName}
                    placeholder="Template name (e.g., Push Day A)"
                    placeholderTextColor={colors.muted}
                  />
                  <View style={styles.templateBuilderList}>
                    {templateEditorExercises.map((exercise, index) => (
                      <View key={exercise.id} style={styles.templateBuilderRow}>
                        <View style={styles.templateBuilderInputs}>
                          <Pressable
                            style={styles.templateExerciseButton}
                            onPress={() => handlePickTemplateExercise(exercise.id)}
                          >
                            <Text
                              style={[
                                styles.templateExerciseButtonText,
                                !exercise.name.trim() ? styles.modalClose : null,
                              ]}
                              numberOfLines={1}
                            >
                              {exercise.name.trim() || `Select exercise ${index + 1}`}
                            </Text>
                          </Pressable>
                        </View>
                        <Pressable
                          onPress={() => handleRemoveTemplateExerciseRow(exercise.id)}
                          disabled={templateEditorExercises.length <= 1}
                        >
                          <Text
                            style={[
                              styles.exerciseRemove,
                              templateEditorExercises.length <= 1 ? styles.disabledText : null,
                            ]}
                          >
                            Remove
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <Pressable style={styles.secondaryButton} onPress={handleAddTemplateExerciseRow}>
                    <Text style={styles.secondaryButtonText}>Add exercise row</Text>
                  </Pressable>
                  <Pressable style={styles.confirmButton} onPress={handleSaveTemplate}>
                    <Text style={styles.confirmButtonText}>
                      {templateEditorId ? 'Update template' : 'Save template'}
                    </Text>
                  </Pressable>
                  {templateEditorId ? (
                    <Pressable style={styles.cancelButton} onPress={resetTemplateEditor}>
                      <Text style={styles.cancelButtonText}>Create another template</Text>
                    </Pressable>
                  ) : null}
                </Card>

                <Card style={styles.settingsSection}>
                  <Text style={styles.sectionTitle}>Saved templates</Text>
                  {workoutTemplates.length === 0 ? (
                    <Text style={styles.emptyText}>No templates yet.</Text>
                  ) : (
                    <View style={styles.templateList}>
                      {workoutTemplates.map((template) => (
                        <View key={template.id} style={styles.templateRow}>
                          <View style={styles.templateInfo}>
                            <Text style={styles.templateName}>{template.name}</Text>
                            <Text style={styles.templateMeta}>{template.exercises.length} exercises</Text>
                            <Text style={styles.templateDetail} numberOfLines={2}>
                              {template.exercises.map((exercise) => exercise.name).join(', ')}
                            </Text>
                          </View>
                          <View style={styles.templateActions}>
                            <Pressable onPress={() => handleEditWorkoutTemplate(template.id)}>
                              <Text style={styles.exerciseAction}>Edit</Text>
                            </Pressable>
                            <Pressable onPress={() => handleDeleteWorkoutTemplate(template.id)}>
                              <Text style={styles.exerciseRemove}>Delete</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={templatePickerOpen} transparent animationType="slide" onRequestClose={handleCloseTemplatePicker}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.pickerModalWrapper}
          >
            <View style={styles.pickerModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Use workout template</Text>
                <Pressable onPress={handleCloseTemplatePicker}>
                  <Text style={styles.modalClose}>Close</Text>
                </Pressable>
              </View>
              {workoutTemplates.length === 0 ? (
                <Text style={styles.emptyText}>No templates yet. Create one in Workout settings.</Text>
              ) : (
                <ScrollView contentContainerStyle={styles.templateList}>
                  {workoutTemplates.map((template) => (
                    <Pressable
                      key={template.id}
                      style={styles.templateRow}
                      onPress={() => handleUseWorkoutTemplate(template.id)}
                    >
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateMeta}>{template.exercises.length} exercises</Text>
                      <Text style={styles.templateDetail} numberOfLines={2}>
                        {template.exercises.map((exercise) => exercise.name).join(', ')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={exerciseHistoryOpen} transparent animationType="slide" onRequestClose={handleCloseExerciseHistory}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.exerciseHistoryModal}>
            <View style={styles.exerciseHistoryModalHeader}>
              <Text style={[styles.modalTitle, styles.exerciseHistoryModalTitle]}>
                {exerciseHistoryExerciseName || 'Exercise'} history
              </Text>
              <Pressable style={styles.exerciseHistoryCloseButton} onPress={handleCloseExerciseHistory}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>
            {exerciseHistoryEntries.length === 0 ? (
              <Text style={styles.emptyOptions}>No history logged for this exercise yet.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.exerciseHistoryList}>
                {exerciseHistoryEntries.map((entry) => (
                  <View key={`${entry.workoutId}-${entry.startedAt}`} style={styles.exerciseHistoryRow}>
                    <Pressable
                      style={styles.exerciseHistoryHeader}
                      onPress={() => toggleExerciseHistoryEntry(entry.workoutId)}
                    >
                      <View style={styles.exerciseHistoryMeta}>
                        <Text style={styles.exerciseHistoryDate}>{formatShortDate(parseISODate(entry.date))}</Text>
                        <Text style={styles.exerciseHistoryTopSet}>
                          Top set: {entry.topWeight} kg x {entry.topReps}
                        </Text>
                      </View>
                      <Feather
                        name={expandedExerciseHistoryIds[entry.workoutId] ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.muted}
                      />
                    </Pressable>
                    {expandedExerciseHistoryIds[entry.workoutId] ? (
                      <View style={styles.exerciseHistorySets}>
                        {entry.sets.map((set, index) => (
                          <Text key={`${entry.workoutId}-set-${index}`} style={styles.exerciseHistorySetRow}>
                            Set {index + 1}: {set.weight} kg x {set.reps}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={startWorkoutChoiceOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStartWorkoutChoice}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Start workout</Text>
            <Text style={styles.sectionSubtitle}>
              Start from a saved template, or begin with an empty workout.
            </Text>
            <Pressable style={styles.confirmButton} onPress={handleStartWithTemplate}>
              <Text style={styles.confirmButtonText}>Use template</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleStartWithoutTemplate}>
              <Text style={styles.secondaryButtonText}>Start Without</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCloseStartWorkoutChoice}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={handleCloseConfirm}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>End workout?</Text>
            <Text style={styles.sectionSubtitle}>
              {confirmMode === 'discard'
                ? 'No exercises were added. End this workout without saving anything?'
                : 'Confirm to save this session and lock it in.'}
            </Text>
            {confirmMode === 'complete' && completionPreview ? (
              completionPreview.personalRecords.length === 0 ? (
                <Text style={styles.emptyText}>No personal bests this time. Keep pushing!</Text>
              ) : (
                <View style={styles.prList}>
                  <Text style={styles.prTitle}>Personal bests</Text>
                  {completionPreview.personalRecords.map((record) => (
                    <View key={record.exercise} style={styles.prRow}>
                      <Text style={styles.prExercise}>{record.exercise}</Text>
                      <Text style={styles.prValue}>
                        {record.weight} kg x {record.reps} (1RM {record.estimated1RM} kg)
                      </Text>
                    </View>
                  ))}
                </View>
              )
            ) : null}
            <Pressable style={styles.confirmButton} onPress={handleConfirmWorkout}>
              <Text style={styles.confirmButtonText}>
                {confirmMode === 'discard' ? 'End without saving' : 'Confirm workout'}
              </Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCloseConfirm}>
              <Text style={styles.cancelButtonText}>Keep editing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Workout logs</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarTopRow}>
            <Pressable style={styles.monthButton} onPress={() => setCalendarOpen(true)}>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <Feather name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
            {!isSelectedDateToday ? (
              <Pressable style={styles.jumpTodayButton} onPress={() => setSelectedDate(todayIso)}>
                <Text style={styles.jumpTodayText}>Jump to today</Text>
              </Pressable>
            ) : null}
          </View>
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

        <Card style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutHeaderCopy}>
              <Text style={styles.sectionTitle}>Workout for {selectedDateLabel}</Text>
              <Text style={styles.sectionSubtitle}>Track sets, reps, and load.</Text>
            </View>
            <View style={styles.workoutHeaderActions}>
              <Pressable
                style={styles.settingsButton}
                onPress={handleOpenSettings}
                accessibilityLabel="Workout settings"
              >
                <Feather name="settings" size={20} color={colors.muted} />
              </Pressable>
              {activeWorkout ? (
                <View style={styles.timerBlock}>
                  <Text style={styles.timerLabel}>Timer</Text>
                  <Text style={styles.timerValue}>{formatDuration(elapsedMs)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {activeWorkoutForOtherDay ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                Workout in progress for {formatShortDate(parseISODate(activeWorkoutForOtherDay.date))}. Finish it to start another day.
              </Text>
              <Pressable style={styles.noticeButton} onPress={() => setSelectedDate(activeWorkoutForOtherDay.date)}>
                <Text style={styles.noticeButtonText}>Jump to active workout</Text>
              </Pressable>
            </View>
          ) : null}

          {!activeWorkoutForSelected && !activeWorkoutForOtherDay ? (
            isSelectedDateToday ? (
              <View style={styles.emptyWorkout}>
                <Text style={styles.emptyText}>No workout in progress.</Text>
                <View style={styles.actionRow}>
                  <Pressable style={styles.primaryButton} onPress={handleStartWorkout}>
                    <Text style={styles.primaryButtonText}>Start workout</Text>
                  </Pressable>
                </View>
              </View>
            ) : null
          ) : activeWorkoutForSelected ? (
            <View style={styles.activeWorkout}>
              {activeWorkoutForSelected.exercises.length > 0
                ? activeWorkoutForSelected.exercises.map(renderWorkoutExercise)
                : null}
              <Pressable style={styles.secondaryButton} onPress={() => openExercisePicker({ type: 'new' })}>
                <Text style={styles.secondaryButtonText}>Add exercise</Text>
              </Pressable>
              <Pressable style={styles.endButton} onPress={handleEndWorkout}>
                <Text style={styles.endButtonText}>End workout</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Workouts this week</Text>
          {isLoading ? (
            <Card>
              <ActivityIndicator color={colors.accent} />
            </Card>
          ) : (
            <>
              <WeeklyMuscleMap bodyPartCounts={weeklyBodyPartCounts} />

              <Card style={styles.weeklyPrCard}>
                <Text style={styles.prTitle}>Personal bests this week</Text>
                {weeklyPersonalBests.length === 0 ? (
                  <Text style={styles.emptyText}>No personal bests this week yet.</Text>
                ) : (
                  weeklyPersonalBests.map((record, index) => (
                    <View key={`${record.workoutId}-${record.exercise}-${index}`} style={styles.weeklyPrRow}>
                      <Text style={styles.weeklyPrMeta}>
                        {record.exercise}:{' '}
                        <Text style={styles.weeklyPrValue}>
                          {record.weight}kg x {record.reps}
                        </Text>
                      </Text>
                    </View>
                  ))
                )}
              </Card>

              {workoutsForSelectedWeek.length === 0 ? (
                <Card>
                  <Text style={styles.emptyText}>No workouts logged for this week.</Text>
                </Card>
              ) : (
                workoutsForSelectedWeek.map((workout, index) => {
                  const isExpanded = Boolean(expandedWorkoutIds[workout.id]);
                  return (
                    <Card key={workout.id} style={styles.historyCard}>
                      <Pressable style={styles.historyHeader} onPress={() => toggleWorkoutExpanded(workout.id)}>
                        <View style={styles.historyHeaderInfo}>
                          <Text style={styles.historyTitle}>Workout {index + 1}</Text>
                          <Text style={styles.historyMeta}>
                            {formatShortDate(parseISODate(workout.date))} - {formatTime(workout.startedAt)} -{' '}
                            {formatDuration(workout.endedAt - workout.startedAt)}
                          </Text>
                        </View>
                        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                      </Pressable>
                      {isExpanded ? (
                        <View style={styles.historyDetails}>
                          {workout.exercises.map((exercise) => (
                            <View key={exercise.id} style={styles.historyExercise}>
                              <Text style={styles.historyExerciseName}>{exercise.name}</Text>
                              <Text style={styles.historyExerciseDetail}>
                                {exercise.sets
                                  .map((set) => `${set.weight} kg x ${set.reps}`)
                                  .join(', ')}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </Card>
                  );
                })
              )}
            </>
          )}
        </View>
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
  pageTitle: {
    ...typography.title,
    color: colors.text,
  },
  calendarCard: {
    gap: spacing.sm,
  },
  calendarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jumpTodayButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
  },
  jumpTodayText: {
    ...typography.label,
    color: colors.accent,
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
  workoutCard: {
    gap: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  workoutHeaderCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,
  },
  workoutHeaderActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    flexShrink: 1,
    maxWidth: '46%',
  },
  settingsButton: {
    padding: spacing.xs,
  },
  settingsContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  settingsSection: {
    gap: spacing.sm,
  },
  templateBuilderList: {
    gap: spacing.sm,
  },
  templateBuilderRow: {
    gap: spacing.xs,
  },
  templateBuilderInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  templateExerciseButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  templateExerciseButtonText: {
    ...typography.body,
    color: colors.text,
  },
  disabledText: {
    opacity: 0.45,
  },
  templateList: {
    gap: spacing.sm,
  },
  templateRow: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  templateInfo: {
    gap: spacing.xs,
  },
  templateName: {
    ...typography.body,
    color: colors.text,
  },
  templateMeta: {
    ...typography.label,
    color: colors.muted,
  },
  templateDetail: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  timerBlock: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  timerLabel: {
    ...typography.label,
    color: colors.muted,
  },
  timerValue: {
    ...typography.headline,
    color: colors.accent,
  },
  noticeCard: {
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.sm,
  },
  noticeText: {
    ...typography.body,
    color: colors.text,
  },
  noticeButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  noticeButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  emptyWorkout: {
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
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
    backgroundColor: colors.accentSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.accent,
    textAlign: 'center',
  },
  activeWorkout: {
    gap: spacing.md,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exerciseActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  exerciseAction: {
    ...typography.label,
    color: colors.accent,
  },
  exerciseRemove: {
    ...typography.label,
    color: colors.danger,
  },
  setRow: {
    gap: spacing.xs,
  },
  setLabel: {
    ...typography.label,
    color: colors.muted,
  },
  setInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  setInputWrapper: {
    width: '44%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
  },
  setInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  setInputSuffix: {
    ...typography.label,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  addSetButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  addSetText: {
    ...typography.label,
    color: colors.accent,
  },
  exerciseFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseHistoryList: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  exerciseHistoryRow: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  exerciseHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseHistoryMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  exerciseHistoryDate: {
    ...typography.label,
    color: colors.muted,
  },
  exerciseHistoryTopSet: {
    ...typography.body,
    color: colors.text,
  },
  exerciseHistorySets: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  exerciseHistorySetRow: {
    ...typography.body,
    color: colors.muted,
  },
  endButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.text,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
  },
  endButtonText: {
    ...typography.label,
    color: '#fff',
  },
  historySection: {
    gap: spacing.md,
  },
  weeklyPrCard: {
    gap: spacing.sm,
  },
  weeklyPrRow: {
    gap: spacing.xs,
  },
  weeklyPrMeta: {
    ...typography.body,
    color: colors.text,
  },
  weeklyPrValue: {
    ...typography.body,
    color: colors.muted,
  },
  historyCard: {
    gap: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  historyHeaderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  historyDetails: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  historyTitle: {
    ...typography.headline,
    color: colors.text,
  },
  historyMeta: {
    ...typography.body,
    color: colors.muted,
  },
  historyExercise: {
    gap: spacing.xs,
  },
  historyExerciseName: {
    ...typography.body,
    color: colors.text,
  },
  historyExerciseDetail: {
    ...typography.body,
    color: colors.muted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'flex-end',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
  },
  calendarModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  pickerModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  pickerModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  confirmModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  exerciseHistoryModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: '80%',
  },
  exerciseHistoryModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  exerciseHistoryModalTitle: {
    flex: 1,
    minWidth: 0,
  },
  exerciseHistoryCloseButton: {
    flexShrink: 0,
    paddingTop: 2,
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
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    ...typography.body,
    color: colors.text,
  },
  customOption: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
  },
  customOptionText: {
    ...typography.body,
    color: colors.accent,
  },
  optionList: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  optionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  optionName: {
    ...typography.body,
    color: colors.text,
  },
  optionMeta: {
    ...typography.body,
    color: colors.muted,
  },
  optionEquipment: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  emptyOptions: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.label,
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: colors.accentSoft,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  prList: {
    gap: spacing.sm,
  },
  prTitle: {
    ...typography.label,
    color: colors.muted,
  },
  prRow: {
    gap: spacing.xs,
  },
  prExercise: {
    ...typography.body,
    color: colors.text,
  },
  prValue: {
    ...typography.body,
    color: colors.muted,
  },
});
