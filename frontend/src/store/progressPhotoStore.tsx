import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ensurePulled, pushKey } from '../services/syncService';

const PHOTOS_KEY = 'fitnessapp.progressPhotos.v1';
const CUSTOM_POSES_KEY = 'fitnessapp.customPoses.v1';

export const DEFAULT_POSES = [
  'Front Double Biceps',
  'Front Lat Spread',
  'Side Chest',
  'Back Double Biceps',
  'Back Lat Spread',
  'Side Triceps',
  'Abdominals and Thighs',
  'Most Muscular',
] as const;

export type ProgressPhoto = {
  id: string;
  date: string;
  pose: string;
  uri: string;
  timestamp: number;
};

type ProgressPhotoContextValue = {
  photos: ProgressPhoto[];
  addPhoto: (photo: Omit<ProgressPhoto, 'id' | 'timestamp'>) => void;
  deletePhoto: (id: string) => Promise<void>;
  customPoses: string[];
  addCustomPose: (name: string) => void;
  removeCustomPose: (name: string) => void;
  allPoses: string[];
  isLoading: boolean;
};

const ProgressPhotoContext = createContext<ProgressPhotoContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function isProgressPhoto(value: unknown): value is ProgressPhoto {
  if (!value || typeof value !== 'object') return false;
  const p = value as ProgressPhoto;
  return (
    typeof p.id === 'string' &&
    typeof p.date === 'string' &&
    typeof p.pose === 'string' &&
    typeof p.uri === 'string' &&
    typeof p.timestamp === 'number'
  );
}

export async function savePhotoFile(sourceUri: string): Promise<string> {
  return sourceUri;
}

export function ProgressPhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [customPoses, setCustomPoses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawPhotos, rawPoses] = await Promise.all([
          AsyncStorage.getItem(PHOTOS_KEY),
          AsyncStorage.getItem(CUSTOM_POSES_KEY),
        ]);
        if (rawPhotos) {
          const parsed = JSON.parse(rawPhotos);
          if (Array.isArray(parsed)) {
            setPhotos(parsed.filter(isProgressPhoto));
          }
        }
        if (rawPoses) {
          const parsed = JSON.parse(rawPoses);
          if (Array.isArray(parsed)) {
            setCustomPoses(parsed.filter((p: unknown) => typeof p === 'string'));
          }
        }
      } catch {}
      hasLoadedRef.current = true;
      setIsLoading(false);

      try {
        const remote = await ensurePulled();
        const remotePhotos = remote?.['progressPhotos'];
        if (remotePhotos && Array.isArray(remotePhotos)) {
          const valid = remotePhotos.filter(isProgressPhoto);
          if (valid.length > 0) setPhotos(valid);
        }
        const remotePoses = remote?.['customPoses'];
        if (remotePoses && Array.isArray(remotePoses)) {
          const valid = remotePoses.filter((p: unknown) => typeof p === 'string');
          if (valid.length > 0) setCustomPoses(valid);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)).catch(() => {});
    pushKey('progressPhotos', photos).catch(() => {});
  }, [photos]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(CUSTOM_POSES_KEY, JSON.stringify(customPoses)).catch(() => {});
    pushKey('customPoses', customPoses).catch(() => {});
  }, [customPoses]);

  const addPhoto = useCallback((photo: Omit<ProgressPhoto, 'id' | 'timestamp'>) => {
    const entry: ProgressPhoto = {
      ...photo,
      id: generateId(),
      timestamp: Date.now(),
    };
    setPhotos((prev) => [entry, ...prev]);
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCustomPose = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomPoses((prev) => {
      if (prev.includes(trimmed) || (DEFAULT_POSES as readonly string[]).includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  }, []);

  const removeCustomPose = useCallback((name: string) => {
    setCustomPoses((prev) => prev.filter((p) => p !== name));
  }, []);

  const allPoses = useMemo(
    () => [...DEFAULT_POSES, ...customPoses],
    [customPoses],
  );

  const value = useMemo(
    () => ({ photos, addPhoto, deletePhoto, customPoses, addCustomPose, removeCustomPose, allPoses, isLoading }),
    [photos, addPhoto, deletePhoto, customPoses, addCustomPose, removeCustomPose, allPoses, isLoading],
  );

  return (
    <ProgressPhotoContext.Provider value={value}>{children}</ProgressPhotoContext.Provider>
  );
}

export function useProgressPhotoStore() {
  const context = useContext(ProgressPhotoContext);
  if (!context) throw new Error('useProgressPhotoStore must be used within ProgressPhotoProvider');
  return context;
}
