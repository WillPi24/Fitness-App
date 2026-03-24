import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type UserSex = 'male' | 'female';
export type WeightUnit = 'kg' | 'lbs';
export type TrainingFocus = 'strength' | 'cardio' | 'bodybuilding' | 'general';

export type UserProfile = {
  name: string;
  email: string;
  password: string;
  sex: UserSex;
  bodyweightKg: number;
  weightUnit: WeightUnit;
  focus?: TrainingFocus;
  enabledFeatures?: string[];
  createdAt: number;
};

const KG_TO_LBS = 2.20462;

export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  if (unit === 'lbs') return Math.round(kg * KG_TO_LBS * 10) / 10;
  return Math.round(kg * 10) / 10;
}

export function fromDisplayWeight(value: number, unit: WeightUnit): number {
  if (unit === 'lbs') return Math.round((value / KG_TO_LBS) * 10) / 10;
  return Math.round(value * 10) / 10;
}

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (name: string, email: string, password: string) => boolean;
  setBodyInfo: (sex: UserSex, bodyweightKg: number, weightUnit: WeightUnit) => void;
  login: (email: string, password: string) => boolean;
  signOut: () => void;
  setFocus: (focus: TrainingFocus) => void;
  setEnabledFeatures: (features: string[]) => void;
  toggleFeature: (featureId: string) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'sex' | 'bodyweightKg' | 'weightUnit'>>) => void;
};

const USER_KEY = 'fitnessapp.userProfile.v1';

const UserContext = createContext<UserContextValue | undefined>(undefined);

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const u = value as Record<string, unknown>;
  if (
    typeof u.name === 'string' &&
    typeof u.email === 'string' &&
    typeof u.password === 'string' &&
    (u.sex === 'male' || u.sex === 'female') &&
    typeof u.bodyweightKg === 'number' &&
    typeof u.createdAt === 'number'
  ) {
    // Migrate: add weightUnit if missing (existing profiles default to kg)
    if (u.weightUnit !== 'kg' && u.weightUnit !== 'lbs') {
      (u as Record<string, unknown>).weightUnit = 'kg';
    }
    return true;
  }
  return false;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (isUserProfile(parsed)) {
            setUser(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load user profile', e);
      } finally {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const save = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.error('Failed to save user profile', e);
      }
    };
    save();
  }, [user]);

  const signUp = useCallback((name: string, email: string, password: string) => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    setUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      sex: 'male',
      bodyweightKg: 0,
      weightUnit: 'kg',
      createdAt: Date.now(),
    });
    setError(null);
    return true;
  }, []);

  const setBodyInfo = useCallback((sex: UserSex, bodyweightKg: number, weightUnit: WeightUnit) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, sex, bodyweightKg, weightUnit };
    });
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (!user) {
      setError('No account found. Please sign up first.');
      return false;
    }
    if (email.trim().toLowerCase() !== user.email || password !== user.password) {
      setError('Incorrect email or password.');
      return false;
    }
    setError(null);
    return true;
  }, [user]);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const setFocus = useCallback((focus: TrainingFocus) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, focus };
    });
  }, []);

  const setEnabledFeatures = useCallback((features: string[]) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, enabledFeatures: features };
    });
  }, []);

  const toggleFeature = useCallback((featureId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const current = prev.enabledFeatures ?? [];
      const next = current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId];
      return { ...prev, enabledFeatures: next };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<UserProfile, 'name' | 'sex' | 'bodyweightKg' | 'weightUnit'>>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      clearError: () => setError(null),
      signUp,
      setBodyInfo,
      login,
      signOut,
      setFocus,
      setEnabledFeatures,
      toggleFeature,
      updateProfile,
    }),
    [user, isLoading, error, signUp, setBodyInfo, login, signOut, setFocus, setEnabledFeatures, toggleFeature, updateProfile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserProvider');
  }
  return context;
}

export function useFeatureEnabled(featureId: string): boolean {
  const { user } = useUserStore();
  return user?.enabledFeatures?.includes(featureId) ?? false;
}
