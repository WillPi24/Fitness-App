import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { CanonicalBodyPart } from '../components/WeeklyMuscleMap';
import { ensurePulled, pushKey } from '../services/syncService';

const CUSTOM_EXERCISES_KEY = 'fitnessapp.customExercises.v1';

export type CustomExercise = {
  name: string;
  muscleGroups: [CanonicalBodyPart, ...CanonicalBodyPart[]]; // 1 or 2
};

type CustomExerciseContextValue = {
  customExercises: CustomExercise[];
  addCustomExercise: (exercise: CustomExercise) => void;
  removeCustomExercise: (name: string) => void;
  getCustomMuscleGroups: (name: string) => CanonicalBodyPart[] | null;
  isLoading: boolean;
};

const CustomExerciseContext = createContext<CustomExerciseContextValue | undefined>(undefined);

function isCustomExercise(value: unknown): value is CustomExercise {
  if (!value || typeof value !== 'object') return false;
  const e = value as CustomExercise;
  return (
    typeof e.name === 'string' &&
    Array.isArray(e.muscleGroups) &&
    e.muscleGroups.length >= 1 &&
    e.muscleGroups.every((g: unknown) => typeof g === 'string')
  );
}

export function CustomExerciseProvider({ children }: { children: React.ReactNode }) {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setCustomExercises(parsed.filter(isCustomExercise));
          }
        }
      } catch {}
      hasLoadedRef.current = true;
      setIsLoading(false);

      try {
        const remote = await ensurePulled();
        const remoteExercises = remote?.['customExercises'];
        if (remoteExercises && Array.isArray(remoteExercises)) {
          const valid = remoteExercises.filter(isCustomExercise);
          if (valid.length > 0) setCustomExercises(valid);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises)).catch(() => {});
    pushKey('customExercises', customExercises).catch(() => {});
  }, [customExercises]);

  const addCustomExercise = useCallback((exercise: CustomExercise) => {
    setCustomExercises((prev) => {
      if (prev.some((e) => e.name.toLowerCase() === exercise.name.toLowerCase())) return prev;
      return [...prev, exercise];
    });
  }, []);

  const removeCustomExercise = useCallback((name: string) => {
    setCustomExercises((prev) => prev.filter((e) => e.name !== name));
  }, []);

  const getCustomMuscleGroups = useCallback((name: string): CanonicalBodyPart[] | null => {
    const exercise = customExercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
    return exercise ? [...exercise.muscleGroups] : null;
  }, [customExercises]);

  const value = useMemo(
    () => ({ customExercises, addCustomExercise, removeCustomExercise, getCustomMuscleGroups, isLoading }),
    [customExercises, addCustomExercise, removeCustomExercise, getCustomMuscleGroups, isLoading],
  );

  return (
    <CustomExerciseContext.Provider value={value}>{children}</CustomExerciseContext.Provider>
  );
}

export function useCustomExerciseStore() {
  const context = useContext(CustomExerciseContext);
  if (!context) throw new Error('useCustomExerciseStore must be used within CustomExerciseProvider');
  return context;
}
