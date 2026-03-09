import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type UserSex = 'male' | 'female';

export type UserProfile = {
  name: string;
  email: string;
  password: string;
  sex: UserSex;
  bodyweightKg: number;
  createdAt: number;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (name: string, email: string, password: string) => boolean;
  setBodyInfo: (sex: UserSex, bodyweightKg: number) => void;
  login: (email: string, password: string) => boolean;
  signOut: () => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'sex' | 'bodyweightKg'>>) => void;
};

const USER_KEY = 'fitnessapp.userProfile.v1';

const UserContext = createContext<UserContextValue | undefined>(undefined);

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const u = value as UserProfile;
  return (
    typeof u.name === 'string' &&
    typeof u.email === 'string' &&
    typeof u.password === 'string' &&
    (u.sex === 'male' || u.sex === 'female') &&
    typeof u.bodyweightKg === 'number' &&
    typeof u.createdAt === 'number'
  );
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
      createdAt: Date.now(),
    });
    setError(null);
    return true;
  }, []);

  const setBodyInfo = useCallback((sex: UserSex, bodyweightKg: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, sex, bodyweightKg };
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

  const updateProfile = useCallback((updates: Partial<Pick<UserProfile, 'name' | 'sex' | 'bodyweightKg'>>) => {
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
      updateProfile,
    }),
    [user, isLoading, error, signUp, setBodyInfo, login, signOut, updateProfile]
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
