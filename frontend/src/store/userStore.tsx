import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { supabase } from '../services/supabase';
import { clearSyncTimestamps, pushKey, resetPullCache } from '../services/syncService';

export type UserSex = 'male' | 'female';
export type WeightUnit = 'kg' | 'lbs';
export type TrainingFocus = 'strength' | 'cardio' | 'bodybuilding' | 'general';

export type UserProfile = {
  name: string;
  email: string;
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

type PendingSignUp = { name: string; email: string };

type UserContextValue = {
  user: UserProfile | null;
  pendingSignUp: PendingSignUp | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  verifySignUpOtp: (email: string, token: string) => Promise<boolean>;
  resendSignUpOtp: (email: string) => Promise<boolean>;
  setBodyInfo: (sex: UserSex, bodyweightKg: number, weightUnit: WeightUnit) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  setFocus: (focus: TrainingFocus) => void;
  setEnabledFeatures: (features: string[]) => void;
  toggleFeature: (featureId: string) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'sex' | 'bodyweightKg' | 'weightUnit'>>) => void;
};

const USER_KEY = 'fitnessapp.userProfile.v1';

const STALE_KEYS = [
  'fitnessapp.workouts.v2',
  'fitnessapp.activeWorkout.v1',
  'fitnessapp.workoutTemplates.v1',
  'fitnessapp.calorieDays.v2',
  'fitnessapp.calorieGoal.v1',
  'fitnessapp.draftFoodEntry.v2',
  'fitnessapp.savedMeals.v1',
  'fitnessapp.runs.v1',
  'fitnessapp.activeRun.v1',
  'fitnessapp.bodyweightLog.v1',
  'fitnessapp.bodyMeasurements.v1',
  'fitnessapp.progressPhotos.v1',
  'fitnessapp.customPoses.v1',
  'fitnessapp.customExercises.v1',
];

const UserContext = createContext<UserContextValue | undefined>(undefined);

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const u = value as Record<string, unknown>;
  if (
    typeof u.name === 'string' &&
    typeof u.email === 'string' &&
    (u.sex === 'male' || u.sex === 'female') &&
    typeof u.bodyweightKg === 'number' &&
    typeof u.createdAt === 'number'
  ) {
    if (u.weightUnit !== 'kg' && u.weightUnit !== 'lbs') {
      u.weightUnit = 'kg';
    }
    delete u.password;
    return true;
  }
  return false;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingSignUp, setPendingSignUp] = useState<PendingSignUp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // On mount: check Supabase session, then load local profile
  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (isUserProfile(parsed)) {
            if (session) {
              setUser(parsed);
            }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to AsyncStorage + push to Supabase whenever profile changes
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const save = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
          pushKey('userProfile', user).catch(() => {});
        } else {
          await AsyncStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.error('Failed to save user profile', e);
      }
    };
    save();
  }, [user]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
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

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    });

    if (authError) {
      setError(authError.message);
      return false;
    }

    // Clear old local data so the new account starts clean
    await AsyncStorage.multiRemove(STALE_KEYS).catch(() => {});
    await clearSyncTimestamps();

    // Don't set user profile yet — wait for email verification
    setPendingSignUp({ name: name.trim(), email: email.trim().toLowerCase() });
    setError(null);
    return true;
  }, []);

  const verifySignUpOtp = useCallback(async (email: string, token: string) => {
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (authError) {
      setError(authError.message);
      return false;
    }

    // Email verified — now create the user profile
    const name = pendingSignUp?.name ?? '';
    setUser({
      name,
      email,
      sex: 'male',
      bodyweightKg: 0,
      weightUnit: 'kg',
      createdAt: Date.now(),
    });
    setPendingSignUp(null);
    setError(null);
    return true;
  }, [pendingSignUp]);

  const resendSignUpOtp = useCallback(async (email: string) => {
    const { error: authError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (authError) {
      setError(authError.message);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const setBodyInfo = useCallback((sex: UserSex, bodyweightKg: number, weightUnit: WeightUnit) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, sex, bodyweightKg, weightUnit };
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message);
      return false;
    }

    // Pull profile from Supabase if it exists
    try {
      const { data } = await supabase
        .from('user_data')
        .select('data')
        .eq('data_key', 'userProfile')
        .single();

      if (data?.data && isUserProfile(data.data)) {
        setUser(data.data);
        setError(null);
        return true;
      }
    } catch {}

    // Fall back to local profile
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isUserProfile(parsed)) {
          setUser(parsed);
          setError(null);
          return true;
        }
      }
    } catch {}

    setError('No profile found. Please sign up.');
    return false;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    resetPullCache();
    await clearSyncTimestamps();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const { error: rpcError } = await supabase.rpc('delete_own_account');
      if (rpcError) {
        setError('Failed to delete account. Please try again.');
        return false;
      }

      await AsyncStorage.multiRemove([USER_KEY, ...STALE_KEYS]).catch(() => {});
      await clearSyncTimestamps();
      resetPullCache();
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      return true;
    } catch {
      setError('Failed to delete account. Please try again.');
      return false;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

    if (authError) {
      setError(authError.message);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const verifyPasswordResetOtp = useCallback(async (email: string, token: string) => {
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (authError) {
      setError(authError.message);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

    if (authError) {
      setError(authError.message);
      return false;
    }

    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setError(null);
    return true;
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
      pendingSignUp,
      isLoading,
      error,
      clearError: () => setError(null),
      signUp,
      verifySignUpOtp,
      resendSignUpOtp,
      setBodyInfo,
      login,
      signOut,
      deleteAccount,
      sendPasswordReset,
      verifyPasswordResetOtp,
      updatePassword,
      setFocus,
      setEnabledFeatures,
      toggleFeature,
      updateProfile,
    }),
    [user, pendingSignUp, isLoading, error, signUp, verifySignUpOtp, resendSignUpOtp, setBodyInfo, login, signOut, deleteAccount, sendPasswordReset, verifyPasswordResetOtp, updatePassword, setFocus, setEnabledFeatures, toggleFeature, updateProfile]
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
