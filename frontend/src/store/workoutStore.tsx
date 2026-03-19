import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  weightR?: number;
  repsR?: number;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
  isWarmup?: boolean;
  isUnilateral?: boolean;
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
  weightR?: string;
  repsR?: string;
};

export type DraftWorkoutExercise = {
  id: string;
  name: string;
  sets: DraftWorkoutSet[];
  isWarmup?: boolean;
  isUnilateral?: boolean;
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
  updateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps' | 'weightR' | 'repsR', value: string) => void;
  toggleExerciseWarmup: (exerciseId: string) => void;
  toggleExerciseUnilateral: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  previewWorkoutCompletion: (convertWeight?: (w: number) => number) => WorkoutCompletionPreview | null;
  confirmWorkoutCompletion: (completedWorkout: WorkoutSession) => void;
  importWorkouts: (sessions: WorkoutSession[]) => void;
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

  // ~8 months of training, 3-4 sessions per week alternating push/pull/legs
  const sessions: WorkoutSession[] = [];
  let sessionIndex = 0;

  for (let daysAgo = 240; daysAgo >= 1; daysAgo--) {
    const dayOfWeek = new Date(now.getTime() - daysAgo * 86400000).getDay();
    // Train Mon(1), Tue(2), Thu(4), Fri(5), Sat(6)
    if (dayOfWeek === 0 || dayOfWeek === 3) {
      continue;
    }

    const workoutDate = new Date(now);
    workoutDate.setDate(workoutDate.getDate() - daysAgo);
    const startedAt = workoutDate.getTime();
    const progression = sessionIndex; // progressive overload index

    // Cycle through 3 splits
    const split = sessionIndex % 3;
    let exercises: WorkoutExercise[];

    const p = Math.floor(progression / 3); // slower progression per exercise

    if (split === 0) {
      // Push day
      const bench = 60 + p * 1.5;
      const ohp = 35 + p;
      const incline = 50 + p * 1.5;
      const lateralRaise = 8 + Math.floor(p / 3);
      const tricepPushdown = 25 + Math.floor(p / 2);
      const dip = 0 + Math.floor(p / 2);

      exercises = [
        createDemoExercise(sessionIndex, 0, 'Barbell Bench Press', [
          { weight: bench, reps: 8 },
          { weight: bench, reps: 7 },
          { weight: bench - 5, reps: 10 },
          { weight: bench - 5, reps: 9 },
        ]),
        createDemoExercise(sessionIndex, 1, 'Overhead Press', [
          { weight: ohp, reps: 8 },
          { weight: ohp, reps: 7 },
          { weight: ohp - 2, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 2, 'Incline Dumbbell Press', [
          { weight: incline, reps: 10 },
          { weight: incline, reps: 9 },
          { weight: incline - 4, reps: 12 },
        ]),
        createDemoExercise(sessionIndex, 3, 'Lateral Raise', [
          { weight: lateralRaise, reps: 15 },
          { weight: lateralRaise, reps: 14 },
          { weight: lateralRaise, reps: 12 },
        ]),
        createDemoExercise(sessionIndex, 4, 'Tricep Pushdown', [
          { weight: tricepPushdown, reps: 12 },
          { weight: tricepPushdown, reps: 11 },
          { weight: tricepPushdown, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 5, 'Dips', [
          { weight: dip, reps: 12 },
          { weight: dip, reps: 10 },
        ]),
      ];
    } else if (split === 1) {
      // Pull day
      const deadlift = 100 + p * 2;
      const row = 60 + p * 1.5;
      const pullUp = 0 + Math.floor(p / 2);
      const facePull = 15 + Math.floor(p / 3);
      const hammerCurl = 12 + Math.floor(p / 3);
      const barbellCurl = 25 + Math.floor(p / 2);

      exercises = [
        createDemoExercise(sessionIndex, 0, 'Deadlift', [
          { weight: deadlift, reps: 5 },
          { weight: deadlift, reps: 5 },
          { weight: deadlift - 10, reps: 8 },
        ]),
        createDemoExercise(sessionIndex, 1, 'Barbell Row', [
          { weight: row, reps: 8 },
          { weight: row, reps: 8 },
          { weight: row - 5, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 2, 'Pull-Up', [
          { weight: pullUp, reps: 10 },
          { weight: pullUp, reps: 8 },
          { weight: pullUp, reps: 7 },
        ]),
        createDemoExercise(sessionIndex, 3, 'Face Pull', [
          { weight: facePull, reps: 15 },
          { weight: facePull, reps: 14 },
          { weight: facePull, reps: 12 },
        ]),
        createDemoExercise(sessionIndex, 4, 'Barbell Curl', [
          { weight: barbellCurl, reps: 10 },
          { weight: barbellCurl, reps: 9 },
          { weight: barbellCurl - 5, reps: 12 },
        ]),
        createDemoExercise(sessionIndex, 5, 'Hammer Curl', [
          { weight: hammerCurl, reps: 12 },
          { weight: hammerCurl, reps: 10 },
        ]),
      ];
    } else {
      // Leg day
      const squat = 80 + p * 2;
      const rdl = 80 + p * 2;
      const legPress = 120 + p * 3;
      const legCurl = 30 + p;
      const calfRaise = 40 + p * 1.5;
      const legExtension = 35 + p;

      exercises = [
        createDemoExercise(sessionIndex, 0, 'Barbell Squat', [
          { weight: squat, reps: 6 },
          { weight: squat, reps: 6 },
          { weight: squat - 10, reps: 8 },
          { weight: squat - 10, reps: 8 },
        ]),
        createDemoExercise(sessionIndex, 1, 'Romanian Deadlift', [
          { weight: rdl, reps: 8 },
          { weight: rdl, reps: 8 },
          { weight: rdl - 10, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 2, 'Leg Press', [
          { weight: legPress, reps: 10 },
          { weight: legPress, reps: 10 },
          { weight: legPress, reps: 8 },
        ]),
        createDemoExercise(sessionIndex, 3, 'Leg Curl', [
          { weight: legCurl, reps: 12 },
          { weight: legCurl, reps: 10 },
          { weight: legCurl, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 4, 'Leg Extension', [
          { weight: legExtension, reps: 12 },
          { weight: legExtension, reps: 11 },
          { weight: legExtension, reps: 10 },
        ]),
        createDemoExercise(sessionIndex, 5, 'Standing Calf Raise', [
          { weight: calfRaise, reps: 15 },
          { weight: calfRaise, reps: 14 },
          { weight: calfRaise, reps: 12 },
        ]),
      ];
    }

    const durationMin = 55 + Math.floor(Math.random() * 25);

    sessions.push({
      id: `${DEMO_WORKOUT_ID_PREFIX}${sessionIndex}`,
      date: formatISODate(workoutDate),
      startedAt,
      endedAt: startedAt + durationMin * 60 * 1000,
      exercises,
      personalRecords: [],
    });

    sessionIndex++;
  }

  return sessions.sort((a, b) => b.endedAt - a.endedAt);
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

export function isWorkoutSession(value: unknown): value is WorkoutSession {
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
      if (exercise.isWarmup) return;
      exercise.sets.forEach((set) => {
        const key = normalizeExercise(exercise.name);
        const estimate = estimateOneRepMax(set.weight, set.reps);
        if (!map[key] || estimate > map[key]) {
          map[key] = estimate;
        }
        if (exercise.isUnilateral && set.weightR && set.repsR) {
          const estimateR = estimateOneRepMax(set.weightR, set.repsR);
          if (!map[key] || estimateR > map[key]) {
            map[key] = estimateR;
          }
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
    if (exercise.isWarmup) return;
    let bestSet: WorkoutSet | null = null;
    let bestEstimate = 0;

    for (const set of exercise.sets) {
      const estimate = estimateOneRepMax(set.weight, set.reps);
      if (!bestSet || estimate > bestEstimate) {
        bestSet = set;
        bestEstimate = estimate;
      }
      if (exercise.isUnilateral && set.weightR && set.repsR) {
        const estimateR = estimateOneRepMax(set.weightR, set.repsR);
        if (estimateR > bestEstimate) {
          bestSet = set;
          bestEstimate = estimateR;
        }
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
    field: 'weight' | 'reps' | 'weightR' | 'repsR',
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

  const toggleExerciseWarmup = (exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, isWarmup: !exercise.isWarmup }
            : exercise
        ),
      };
    });
  };

  const toggleExerciseUnilateral = (exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, isUnilateral: !exercise.isUnilateral }
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

  const previewWorkoutCompletion = (convertWeight?: (w: number) => number): WorkoutCompletionPreview | null => {
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
        const rawWeight = Number(set.weight);
        const reps = Number(set.reps);

        if (!Number.isFinite(rawWeight) || rawWeight <= 0 || !Number.isFinite(reps) || reps <= 0) {
          setError('Fill in weight and reps for every set, or remove the empty sets.');
          return null;
        }

        const weight = convertWeight ? convertWeight(rawWeight) : rawWeight;
        const parsedSet: WorkoutSet = { id: set.id, weight, reps };

        if (exercise.isUnilateral) {
          const rawWeightR = Number(set.weightR);
          const repsR = Number(set.repsR);

          if (!Number.isFinite(rawWeightR) || rawWeightR <= 0 || !Number.isFinite(repsR) || repsR <= 0) {
            setError('Fill in both sides for unilateral exercises, or turn off unilateral.');
            return null;
          }

          parsedSet.weightR = convertWeight ? convertWeight(rawWeightR) : rawWeightR;
          parsedSet.repsR = repsR;
        }

        parsedSets.push(parsedSet);
      }

      parsedExercises.push({
        id: exercise.id,
        name: trimmedName,
        sets: parsedSets,
        isWarmup: exercise.isWarmup || undefined,
        isUnilateral: exercise.isUnilateral || undefined,
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

  const importWorkouts = (sessions: WorkoutSession[]) => {
    setWorkouts((prev) => [...prev, ...sessions].sort((a, b) => b.endedAt - a.endedAt));
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
      toggleExerciseWarmup,
      toggleExerciseUnilateral,
      removeSet,
      previewWorkoutCompletion,
      confirmWorkoutCompletion,
      importWorkouts,
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
