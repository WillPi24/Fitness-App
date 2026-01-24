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
  View,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
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

export function LogScreen() {
  const {
    workouts,
    activeWorkout,
    startWorkout,
    addExercise,
    updateExerciseName,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    previewWorkoutCompletion,
    confirmWorkoutCompletion,
    isLoading,
    error,
    clearError,
  } = useWorkoutStore();

  const today = new Date();
  const todayIso = useMemo(() => formatISODate(today), [today]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exercisePickerTarget, setExercisePickerTarget] = useState<
    { type: 'new' } | { type: 'edit'; exerciseId: string } | null
  >(null);
  const [completionPreview, setCompletionPreview] = useState<WorkoutCompletionPreview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timerTick, setTimerTick] = useState(Date.now());

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

  const workoutsForSelected = useMemo(() => {
    return workouts
      .filter((workout) => workout.date === selectedDate)
      .sort((a, b) => b.startedAt - a.startedAt);
  }, [workouts, selectedDate]);

  const activeWorkoutForSelected =
    activeWorkout && activeWorkout.date === selectedDate ? activeWorkout : null;
  const activeWorkoutForOtherDay =
    activeWorkout && activeWorkout.date !== selectedDate ? activeWorkout : null;

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

  const openExercisePicker = (target: { type: 'new' } | { type: 'edit'; exerciseId: string }) => {
    setExercisePickerTarget(target);
    setExerciseSearch('');
    setExercisePickerOpen(true);
  };

  const handleSelectExercise = (name: string) => {
    if (!exercisePickerTarget) {
      return;
    }

    if (exercisePickerTarget.type === 'new') {
      addExercise(selectedDate, name);
    } else {
      updateExerciseName(exercisePickerTarget.exerciseId, name);
    }

    setExercisePickerOpen(false);
    setExercisePickerTarget(null);
    setExerciseSearch('');
  };

  const handleUseCustomExercise = () => {
    const trimmed = exerciseSearch.trim();
    if (!trimmed) {
      return;
    }
    handleSelectExercise(trimmed);
  };

  const handleStartWorkout = () => {
    clearError();
    startWorkout(selectedDate);
  };

  const handleEndWorkout = () => {
    clearError();
    const preview = previewWorkoutCompletion();
    if (preview) {
      setCompletionPreview(preview);
      setConfirmOpen(true);
    }
  };

  const handleConfirmWorkout = () => {
    if (!completionPreview) {
      return;
    }
    confirmWorkoutCompletion(completionPreview.workout);
    setConfirmOpen(false);
    setCompletionPreview(null);
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
          <Pressable onPress={() => openExercisePicker({ type: 'edit', exerciseId: exercise.id })}>
            <Text style={styles.exerciseAction}>Change</Text>
          </Pressable>
          <Pressable onPress={() => removeExercise(exercise.id)}>
            <Text style={styles.exerciseRemove}>Remove</Text>
          </Pressable>
        </View>
      </View>
      {exercise.sets.map((set, setIndex) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
          <View style={styles.setInputs}>
            <TextInput
              style={styles.setInput}
              value={set.weight}
              onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
              placeholder="kg"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.setInput}
              value={set.reps}
              onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
              placeholder="reps"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />
          </View>
          <Pressable onPress={() => removeSet(exercise.id, set.id)}>
            <Text style={styles.setRemove}>Delete</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
        <Text style={styles.addSetText}>Add set</Text>
      </Pressable>
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

      <Modal visible={exercisePickerOpen} transparent animationType="slide" onRequestClose={() => setExercisePickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick an exercise</Text>
              <Pressable onPress={() => setExercisePickerOpen(false)}>
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
        </View>
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>End workout?</Text>
            <Text style={styles.sectionSubtitle}>Confirm to save this session and lock it in.</Text>
            {completionPreview ? (
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
              <Text style={styles.confirmButtonText}>Confirm workout</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setConfirmOpen(false)}>
              <Text style={styles.cancelButtonText}>Keep editing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        <Card style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View>
              <Text style={styles.sectionTitle}>Workout for {selectedDateLabel}</Text>
              <Text style={styles.sectionSubtitle}>Track sets, reps, and load.</Text>
            </View>
            {activeWorkout ? (
              <View style={styles.timerBlock}>
                <Text style={styles.timerLabel}>Timer</Text>
                <Text style={styles.timerValue}>{formatDuration(elapsedMs)}</Text>
              </View>
            ) : null}
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
            <View style={styles.emptyWorkout}>
              <Text style={styles.emptyText}>No workout in progress.</Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.primaryButton} onPress={handleStartWorkout}>
                  <Text style={styles.primaryButtonText}>Start workout</Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => openExercisePicker({ type: 'new' })}
                >
                  <Text style={styles.secondaryButtonText}>Add exercise</Text>
                </Pressable>
              </View>
            </View>
          ) : activeWorkoutForSelected ? (
            <View style={styles.activeWorkout}>
              {activeWorkoutForSelected.exercises.length === 0 ? (
                <Text style={styles.emptyText}>Add your first exercise to get started.</Text>
              ) : (
                activeWorkoutForSelected.exercises.map(renderWorkoutExercise)
              )}
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
          <Text style={styles.sectionTitle}>History for {selectedDateLabel}</Text>
          {isLoading ? (
            <Card>
              <ActivityIndicator color={colors.accent} />
            </Card>
          ) : workoutsForSelected.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No workouts logged for this day.</Text>
            </Card>
          ) : (
            workoutsForSelected.map((workout, index) => (
              <Card key={workout.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Workout {index + 1}</Text>
                  <Text style={styles.historyMeta}>
                    {formatTime(workout.startedAt)} - {formatDuration(workout.endedAt - workout.startedAt)}
                  </Text>
                </View>
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
                {workout.personalRecords.length > 0 ? (
                  <View style={styles.historyPrBlock}>
                    <Text style={styles.prTitle}>Personal bests</Text>
                    {workout.personalRecords.map((record) => (
                      <Text key={record.exercise} style={styles.historyPrItem}>
                        {record.exercise}: {record.weight} kg x {record.reps} (1RM {record.estimated1RM} kg)
                      </Text>
                    ))}
                  </View>
                ) : null}
              </Card>
            ))
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
  workoutCard: {
    gap: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
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
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.accent,
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
    gap: spacing.sm,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    ...typography.body,
    color: colors.text,
  },
  setRemove: {
    ...typography.label,
    color: colors.danger,
    alignSelf: 'flex-start',
  },
  addSetButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  addSetText: {
    ...typography.label,
    color: colors.accent,
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
  historyCard: {
    gap: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
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
  historyPrBlock: {
    backgroundColor: colors.accentSoft,
    padding: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  historyPrItem: {
    ...typography.body,
    color: colors.text,
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
  pickerModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  confirmModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 20,
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
