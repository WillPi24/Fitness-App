import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ensurePulled, pushKey } from '../services/syncService';

const BODYWEIGHT_KEY = 'fitnessapp.bodyweightLog.v1';

export type BodyweightEntry = {
  id: string;
  date: string;
  weightKg: number;
  timestamp: number;
};

type BodyweightContextValue = {
  entries: BodyweightEntry[];
  addEntry: (weightKg: number, date?: string) => void;
  deleteEntry: (id: string) => void;
  isLoading: boolean;
};

const BodyweightContext = createContext<BodyweightContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function isBodyweightEntry(value: unknown): value is BodyweightEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as BodyweightEntry;
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    typeof e.weightKg === 'number' &&
    typeof e.timestamp === 'number'
  );
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BodyweightProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<BodyweightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BODYWEIGHT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setEntries(parsed.filter(isBodyweightEntry));
          }
        }
      } catch {}
      hasLoadedRef.current = true;
      setIsLoading(false);

      // Pull remote data (shared single request across all stores)
      try {
        const remote = await ensurePulled();
        const remoteEntries = remote?.['bodyweightLog'];
        if (remoteEntries && Array.isArray(remoteEntries)) {
          const valid = remoteEntries.filter(isBodyweightEntry);
          if (valid.length > 0) setEntries(valid);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(BODYWEIGHT_KEY, JSON.stringify(entries)).catch(() => {});
    pushKey('bodyweightLog', entries).catch(() => {});
  }, [entries]);

  const addEntry = useCallback((weightKg: number, date?: string) => {
    const entry: BodyweightEntry = {
      id: generateId(),
      date: date ?? todayISO(),
      weightKg,
      timestamp: Date.now(),
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, deleteEntry, isLoading }),
    [entries, addEntry, deleteEntry, isLoading],
  );

  return (
    <BodyweightContext.Provider value={value}>{children}</BodyweightContext.Provider>
  );
}

export function useBodyweightStore() {
  const context = useContext(BodyweightContext);
  if (!context) throw new Error('useBodyweightStore must be used within BodyweightProvider');
  return context;
}
