import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
};

export type WorkoutPersonalRecord = {
  exercise: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  previousBest: number;
};

export type WorkoutSession = {
  id: string;
  date: string;
  startedAt: number;
  endedAt: number;
  exercises: WorkoutExercise[];
  personalRecords: WorkoutPersonalRecord[];
};

export type DraftWorkoutSet = {
  id: string;
  weight: string;
  reps: string;
};

export type DraftWorkoutExercise = {
  id: string;
  name: string;
  sets: DraftWorkoutSet[];
};

export type DraftWorkout = {
  id: string;
  date: string;
  startedAt: number;
  exercises: DraftWorkoutExercise[];
};

export type WorkoutCompletionPreview = {
  workout: WorkoutSession;
  personalRecords: WorkoutPersonalRecord[];
};

type WorkoutContextValue = {
  workouts: WorkoutSession[];
  activeWorkout: DraftWorkout | null;
  startWorkout: (date: string) => void;
  discardActiveWorkout: () => void;
  addExercise: (date: string, name: string) => void;
  updateExerciseName: (exerciseId: string, name: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  previewWorkoutCompletion: () => WorkoutCompletionPreview | null;
  confirmWorkoutCompletion: (completedWorkout: WorkoutSession) => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const WORKOUTS_KEY = 'fitnessapp.workouts.v2';
const ACTIVE_WORKOUT_KEY = 'fitnessapp.activeWorkout.v1';

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function estimateOneRepMax(weight: number, reps: number) {
  return weight * (1 + reps / 30);
}

function normalizeExercise(name: string) {
  return name.trim().toLowerCase();
}

function createDraftSet(): DraftWorkoutSet {
  return {
    id: generateId(),
    weight: '',
    reps: '',
  };
}

function createDraftExercise(name: string): DraftWorkoutExercise {
  return {
    id: generateId(),
    name,
    sets: [createDraftSet()],
  };
}

function createDraftWorkout(date: string): DraftWorkout {
  return {
    id: generateId(),
    date,
    startedAt: Date.now(),
    exercises: [],
  };
}

function isWorkoutSet(value: unknown): value is WorkoutSet {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const set = value as WorkoutSet;
  return (
    typeof set.id === 'string' &&
    typeof set.weight === 'number' &&
    typeof set.reps === 'number'
  );
}

function isWorkoutExercise(value: unknown): value is WorkoutExercise {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const exercise = value as WorkoutExercise;
  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    Array.isArray(exercise.sets) &&
    exercise.sets.every(isWorkoutSet)
  );
}

function isWorkoutSession(value: unknown): value is WorkoutSession {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const workout = value as WorkoutSession;
  return (
    typeof workout.id === 'string' &&
    typeof workout.date === 'string' &&
    typeof workout.startedAt === 'number' &&
    typeof workout.endedAt === 'number' &&
    Array.isArray(workout.exercises) &&
    workout.exercises.every(isWorkoutExercise)
  );
}

function isDraftSet(value: unknown): value is DraftWorkoutSet {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const set = value as DraftWorkoutSet;
  return (
    typeof set.id === 'string' &&
    typeof set.weight === 'string' &&
    typeof set.reps === 'string'
  );
}

function isDraftExercise(value: unknown): value is DraftWorkoutExercise {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const exercise = value as DraftWorkoutExercise;
  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    Array.isArray(exercise.sets) &&
    exercise.sets.every(isDraftSet)
  );
}

function isDraftWorkout(value: unknown): value is DraftWorkout {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const workout = value as DraftWorkout;
  return (
    typeof workout.id === 'string' &&
    typeof workout.date === 'string' &&
    typeof workout.startedAt === 'number' &&
    Array.isArray(workout.exercises) &&
    workout.exercises.every(isDraftExercise)
  );
}

function getBestEstimatesByExercise(workouts: WorkoutSession[]) {
  const map: Record<string, number> = {};
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const estimate = estimateOneRepMax(set.weight, set.reps);
        const key = normalizeExercise(exercise.name);
        if (!map[key] || estimate > map[key]) {
          map[key] = estimate;
        }
      });
    });
  });
  return map;
}

function buildPersonalRecords(
  workout: WorkoutSession,
  previousBestMap: Record<string, number>
): WorkoutPersonalRecord[] {
  const records: WorkoutPersonalRecord[] = [];

  workout.exercises.forEach((exercise) => {
    let bestSet: WorkoutSet | null = null;
    let bestEstimate = 0;

    exercise.sets.forEach((set) => {
      const estimate = estimateOneRepMax(set.weight, set.reps);
      if (!bestSet || estimate > bestEstimate) {
        bestSet = set;
        bestEstimate = estimate;
      }
    });

    const previousBest = previousBestMap[normalizeExercise(exercise.name)] ?? 0;
    if (bestSet && bestEstimate > previousBest) {
      records.push({
        exercise: exercise.name,
        weight: bestSet.weight,
        reps: bestSet.reps,
        estimated1RM: Math.round(bestEstimate),
        previousBest: Math.round(previousBest),
      });
    }
  });

  return records.sort((a, b) => b.estimated1RM - a.estimated1RM);
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<DraftWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const [workoutRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(WORKOUTS_KEY),
          AsyncStorage.getItem(ACTIVE_WORKOUT_KEY),
        ]);

        if (workoutRaw) {
          const parsed = JSON.parse(workoutRaw);
          if (Array.isArray(parsed)) {
            const safeWorkouts = parsed.filter(isWorkoutSession).sort((a, b) => b.endedAt - a.endedAt);
            setWorkouts(safeWorkouts);
          }
        }

        if (activeRaw) {
          const parsedActive = JSON.parse(activeRaw);
          if (isDraftWorkout(parsedActive)) {
            setActiveWorkout(parsedActive);
          }
        }
      } catch (loadError) {
        console.error('Failed to load workouts', loadError);
        setError('Unable to load workout history. Your data is safe.');
      } finally {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  useEffect(() => {
    const saveWorkouts = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
      } catch (saveError) {
        console.error('Failed to save workouts', saveError);
        setError('Unable to save workout history. Please try again.');
      }
    };

    saveWorkouts();
  }, [workouts]);

  useEffect(() => {
    const saveActiveWorkout = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        if (activeWorkout) {
          await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
        } else {
          await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
        }
      } catch (saveError) {
        console.error('Failed to save active workout', saveError);
        setError('Unable to save your workout in progress.');
      }
    };

    saveActiveWorkout();
  }, [activeWorkout]);

  const startWorkout = (date: string) => {
    if (activeWorkout && activeWorkout.date !== date) {
      setError('Finish your active workout before starting another day.');
      return;
    }

    if (!activeWorkout) {
      setActiveWorkout(createDraftWorkout(date));
    }
  };

  const discardActiveWorkout = () => {
    setActiveWorkout(null);
    setError(null);
  };

  const addExercise = (date: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Exercise name is required.');
      return;
    }

    if (activeWorkout && activeWorkout.date !== date) {
      setError('Finish your active workout before logging another day.');
      return;
    }

    setActiveWorkout((prev) => {
      const draft = prev ?? createDraftWorkout(date);
      return {
        ...draft,
        exercises: [...draft.exercises, createDraftExercise(trimmed)],
      };
    });
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, name } : exercise
        ),
      };
    });
  };

  const removeExercise = (exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.filter((exercise) => exercise.id !== exerciseId),
      };
    });
  };

  const addSet = (exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, createDraftSet()] }
            : exercise
        ),
      };
    });
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) =>
                  set.id === setId ? { ...set, [field]: value } : set
                ),
              }
            : exercise
        ),
      };
    });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }
          const nextSets = exercise.sets.filter((set) => set.id !== setId);
          return {
            ...exercise,
            sets: nextSets.length > 0 ? nextSets : [createDraftSet()],
          };
        }),
      };
    });
  };

  const previewWorkoutCompletion = (): WorkoutCompletionPreview | null => {
    if (!activeWorkout) {
      setError('Start a workout to log sets.');
      return null;
    }

    if (activeWorkout.exercises.length === 0) {
      setError('Add at least one exercise before finishing.');
      return null;
    }

    const parsedExercises: WorkoutExercise[] = [];

    for (const exercise of activeWorkout.exercises) {
      const trimmedName = exercise.name.trim();
      if (!trimmedName) {
        setError('Exercise names cannot be empty.');
        return null;
      }

      if (exercise.sets.length === 0) {
        setError('Each exercise needs at least one set.');
        return null;
      }

      const parsedSets: WorkoutSet[] = [];

      for (const set of exercise.sets) {
        const weight = Number(set.weight);
        const reps = Number(set.reps);

        if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
          setError('Fill in weight and reps for every set, or remove the empty sets.');
          return null;
        }

        parsedSets.push({
          id: set.id,
          weight,
          reps,
        });
      }

      parsedExercises.push({
        id: exercise.id,
        name: trimmedName,
        sets: parsedSets,
      });
    }

    const workout: WorkoutSession = {
      id: activeWorkout.id,
      date: activeWorkout.date,
      startedAt: activeWorkout.startedAt,
      endedAt: Date.now(),
      exercises: parsedExercises,
      personalRecords: [],
    };

    const previousBestMap = getBestEstimatesByExercise(workouts);
    const personalRecords = buildPersonalRecords(workout, previousBestMap);
    workout.personalRecords = personalRecords;

    return {
      workout,
      personalRecords,
    };
  };

  const confirmWorkoutCompletion = (completedWorkout: WorkoutSession) => {
    setWorkouts((prev) => [completedWorkout, ...prev].sort((a, b) => b.endedAt - a.endedAt));
    setActiveWorkout(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      workouts,
      activeWorkout,
      startWorkout,
      discardActiveWorkout,
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
      clearError: () => setError(null),
    }),
    [
      workouts,
      activeWorkout,
      isLoading,
      error,
    ]
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkoutStore() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutStore must be used within a WorkoutProvider');
  }
  return context;
}
