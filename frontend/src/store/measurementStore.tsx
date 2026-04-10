import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ensurePulled, pushKey } from '../services/syncService';

const MEASUREMENTS_KEY = 'fitnessapp.bodyMeasurements.v1';

export type MeasurementType =
  | 'Left Arm'
  | 'Right Arm'
  | 'Chest'
  | 'Waist'
  | 'Hips'
  | 'Glutes'
  | 'Left Quad'
  | 'Right Quad'
  | 'Left Calf'
  | 'Right Calf'
  | 'Shoulders'
  | 'Neck';

export const MEASUREMENT_TYPES: MeasurementType[] = [
  'Chest',
  'Waist',
  'Hips',
  'Glutes',
  'Shoulders',
  'Neck',
  'Left Arm',
  'Right Arm',
  'Left Quad',
  'Right Quad',
  'Left Calf',
  'Right Calf',
];

export type MeasurementEntry = {
  id: string;
  date: string;
  type: MeasurementType;
  valueCm: number;
  timestamp: number;
};

type MeasurementContextValue = {
  measurements: MeasurementEntry[];
  addMeasurement: (type: MeasurementType, valueCm: number, date?: string) => void;
  deleteMeasurement: (id: string) => void;
  isLoading: boolean;
};

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function isMeasurementEntry(value: unknown): value is MeasurementEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as MeasurementEntry;
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    typeof e.type === 'string' &&
    typeof e.valueCm === 'number' &&
    typeof e.timestamp === 'number'
  );
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MEASUREMENTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setMeasurements(parsed.filter(isMeasurementEntry));
          }
        }
      } catch {}
      hasLoadedRef.current = true;
      setIsLoading(false);

      try {
        const remote = await ensurePulled();
        const remoteMeasurements = remote?.['bodyMeasurements'];
        if (remoteMeasurements && Array.isArray(remoteMeasurements)) {
          const valid = remoteMeasurements.filter(isMeasurementEntry);
          if (valid.length > 0) setMeasurements(valid);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(measurements)).catch(() => {});
    pushKey('bodyMeasurements', measurements).catch(() => {});
  }, [measurements]);

  const addMeasurement = useCallback((type: MeasurementType, valueCm: number, date?: string) => {
    const entry: MeasurementEntry = {
      id: generateId(),
      date: date ?? todayISO(),
      type,
      valueCm,
      timestamp: Date.now(),
    };
    setMeasurements((prev) => [entry, ...prev]);
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({ measurements, addMeasurement, deleteMeasurement, isLoading }),
    [measurements, addMeasurement, deleteMeasurement, isLoading],
  );

  return (
    <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>
  );
}

export function useMeasurementStore() {
  const context = useContext(MeasurementContext);
  if (!context) throw new Error('useMeasurementStore must be used within MeasurementProvider');
  return context;
}
