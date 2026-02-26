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

export type WorkoutTemplateExercise = {
  id: string;
  name: string;
  setCount: number;
};

export type WorkoutTemplateExerciseInput = {
  name: string;
  setCount: number;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
  createdAt: number;
};

export type WorkoutCompletionPreview = {
  workout: WorkoutSession;
  personalRecords: WorkoutPersonalRecord[];
};

type WorkoutContextValue = {
  workouts: WorkoutSession[];
  activeWorkout: DraftWorkout | null;
  workoutTemplates: WorkoutTemplate[];
  seedDemoWorkouts: () => void;
  clearDemoWorkouts: () => void;
  startWorkout: (date: string) => void;
  startWorkoutFromTemplate: (date: string, templateId: string) => void;
  createWorkoutTemplate: (name: string, exercises: WorkoutTemplateExerciseInput[]) => void;
  updateWorkoutTemplate: (id: string, name: string, exercises: WorkoutTemplateExerciseInput[]) => void;
  deleteWorkoutTemplate: (id: string) => void;
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
const WORKOUT_TEMPLATES_KEY = 'fitnessapp.workoutTemplates.v1';
const DEMO_WORKOUT_ID_PREFIX = 'demo-workout-';

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

function createDraftExerciseFromTemplate(exercise: WorkoutTemplateExercise): DraftWorkoutExercise {
  return {
    id: generateId(),
    name: exercise.name,
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

function formatISODate(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(
    2,
    '0',
  )}`;
}

function createDemoExercise(
  workoutIndex: number,
  exerciseIndex: number,
  name: string,
  sets: Array<{ weight: number; reps: number }>,
): WorkoutExercise {
  return {
    id: `${DEMO_WORKOUT_ID_PREFIX}${workoutIndex}-exercise-${exerciseIndex}`,
    name,
    sets: sets.map((set, setIndex) => ({
      id: `${DEMO_WORKOUT_ID_PREFIX}${workoutIndex}-exercise-${exerciseIndex}-set-${setIndex}`,
      weight: set.weight,
      reps: set.reps,
    })),
  };
}

function isDemoWorkout(workout: WorkoutSession) {
  return workout.id.startsWith(DEMO_WORKOUT_ID_PREFIX);
}

function createDemoWorkouts(): WorkoutSession[] {
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  const daysAgoOffsets = [170, 157, 144, 131, 118, 105, 92, 79, 66, 53, 40, 27, 20, 13, 6];

  const workouts = daysAgoOffsets.map((daysAgo, index) => {
    const workoutDate = new Date(now);
    workoutDate.setDate(workoutDate.getDate() - daysAgo);

    const bench = 55 + index * 2;
    const row = 60 + index * 2;
    const squat = 85 + index * 3;
    const rdl = 90 + index * 3;
    const overheadPress = 35 + index;

    const startedAt = workoutDate.getTime();

    return {
      id: `${DEMO_WORKOUT_ID_PREFIX}${index}`,
      date: formatISODate(workoutDate),
      startedAt,
      endedAt: startedAt + 62 * 60 * 1000,
      exercises: [
        createDemoExercise(index, 0, 'Bench Press', [
          { weight: bench, reps: 8 },
          { weight: bench, reps: 8 },
          { weight: bench - 2, reps: 10 },
        ]),
        createDemoExercise(index, 1, 'Barbell Row', [
          { weight: row, reps: 10 },
          { weight: row, reps: 8 },
          { weight: row - 2, reps: 10 },
        ]),
        createDemoExercise(index, 2, 'Back Squat', [
          { weight: squat, reps: 6 },
          { weight: squat, reps: 6 },
          { weight: squat - 5, reps: 8 },
        ]),
        createDemoExercise(index, 3, 'Romanian Deadlift', [
          { weight: rdl, reps: 8 },
          { weight: rdl, reps: 8 },
          { weight: rdl - 5, reps: 10 },
        ]),
        createDemoExercise(index, 4, 'Overhead Press', [
          { weight: overheadPress, reps: 8 },
          { weight: overheadPress, reps: 8 },
          { weight: overheadPress - 2, reps: 10 },
        ]),
      ],
      personalRecords: [],
    } satisfies WorkoutSession;
  });

  return workouts.sort((a, b) => b.endedAt - a.endedAt);
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

function isWorkoutTemplateExercise(value: unknown): value is WorkoutTemplateExercise {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const exercise = value as WorkoutTemplateExercise;
  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.setCount === 'number' &&
    Number.isFinite(exercise.setCount) &&
    exercise.setCount >= 1
  );
}

function isWorkoutTemplate(value: unknown): value is WorkoutTemplate {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const template = value as WorkoutTemplate;
  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.createdAt === 'number' &&
    Array.isArray(template.exercises) &&
    template.exercises.every(isWorkoutTemplateExercise)
  );
}

function normalizeWorkoutTemplateExercises(
  exercises: WorkoutTemplateExerciseInput[]
): WorkoutTemplateExercise[] | null {
  if (exercises.length === 0) {
    return null;
  }

  const normalized: WorkoutTemplateExercise[] = [];
  for (const exercise of exercises) {
    const trimmedName = exercise.name.trim();
    if (!trimmedName) {
      return null;
    }

    const setCount = Math.max(1, Math.round(exercise.setCount));
    normalized.push({
      id: generateId(),
      name: trimmedName,
      setCount,
    });
  }

  return normalized.length > 0 ? normalized : null;
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

    for (const set of exercise.sets) {
      const estimate = estimateOneRepMax(set.weight, set.reps);
      if (!bestSet || estimate > bestEstimate) {
        bestSet = set;
        bestEstimate = estimate;
      }
    }

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
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const [workoutRaw, activeRaw, templateRaw] = await Promise.all([
          AsyncStorage.getItem(WORKOUTS_KEY),
          AsyncStorage.getItem(ACTIVE_WORKOUT_KEY),
          AsyncStorage.getItem(WORKOUT_TEMPLATES_KEY),
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

        if (templateRaw) {
          const parsedTemplates = JSON.parse(templateRaw);
          if (Array.isArray(parsedTemplates)) {
            const safeTemplates = parsedTemplates
              .filter(isWorkoutTemplate)
              .sort((a, b) => b.createdAt - a.createdAt);
            setWorkoutTemplates(safeTemplates);
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

  useEffect(() => {
    const saveWorkoutTemplates = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(workoutTemplates));
      } catch (saveError) {
        console.error('Failed to save workout templates', saveError);
        setError('Unable to save workout templates.');
      }
    };

    saveWorkoutTemplates();
  }, [workoutTemplates]);

  const startWorkout = (date: string) => {
    if (activeWorkout && activeWorkout.date !== date) {
      setError('Finish your active workout before starting another day.');
      return;
    }

    if (!activeWorkout) {
      setActiveWorkout(createDraftWorkout(date));
    }
  };

  const startWorkoutFromTemplate = (date: string, templateId: string) => {
    if (activeWorkout && activeWorkout.date !== date) {
      setError('Finish your active workout before starting another day.');
      return;
    }

    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!template) {
      setError('Workout template not found.');
      return;
    }

    const templateExercises = template.exercises.map(createDraftExerciseFromTemplate);

    if (activeWorkout && activeWorkout.date === date) {
      if (activeWorkout.exercises.length > 0) {
        setError('Current workout already has exercises. Start fresh to use a template.');
        return;
      }
      setActiveWorkout({
        ...activeWorkout,
        exercises: templateExercises,
      });
    } else {
      const draft = createDraftWorkout(date);
      setActiveWorkout({
        ...draft,
        exercises: templateExercises,
      });
    }

    setError(null);
  };

  const createWorkoutTemplate = (name: string, exercises: WorkoutTemplateExerciseInput[]) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Template name cannot be empty.');
      return;
    }

    const normalizedExercises = normalizeWorkoutTemplateExercises(exercises);
    if (!normalizedExercises) {
      setError('Add at least one named exercise with one or more sets.');
      return;
    }

    const template: WorkoutTemplate = {
      id: generateId(),
      name: trimmedName,
      exercises: normalizedExercises,
      createdAt: Date.now(),
    };

    setWorkoutTemplates((prev) => [template, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    setError(null);
  };

  const updateWorkoutTemplate = (id: string, name: string, exercises: WorkoutTemplateExerciseInput[]) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Template name cannot be empty.');
      return;
    }

    const normalizedExercises = normalizeWorkoutTemplateExercises(exercises);
    if (!normalizedExercises) {
      setError('Add at least one named exercise with one or more sets.');
      return;
    }

    setWorkoutTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? {
              ...template,
              name: trimmedName,
              exercises: normalizedExercises,
            }
          : template
      )
    );
    setError(null);
  };

  const deleteWorkoutTemplate = (id: string) => {
    setWorkoutTemplates((prev) => prev.filter((template) => template.id !== id));
    setError(null);
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

  const seedDemoWorkouts = () => {
    if (!__DEV__) {
      return;
    }
    setWorkouts((prev) => {
      const userWorkouts = prev.filter((workout) => !isDemoWorkout(workout));
      return [...createDemoWorkouts(), ...userWorkouts].sort((a, b) => b.endedAt - a.endedAt);
    });
    setActiveWorkout(null);
    setError(null);
  };

  const clearDemoWorkouts = () => {
    if (!__DEV__) {
      return;
    }
    setWorkouts((prev) => prev.filter((workout) => !isDemoWorkout(workout)));
    setError(null);
  };

  const value = useMemo(
    () => ({
      workouts,
      activeWorkout,
      workoutTemplates,
      seedDemoWorkouts,
      clearDemoWorkouts,
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
      workoutTemplates,
      isLoading,
      error,
      seedDemoWorkouts,
      clearDemoWorkouts,
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
