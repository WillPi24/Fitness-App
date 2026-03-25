import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const PHOTOS_KEY = 'fitnessapp.progressPhotos.v1';
const PHOTOS_DIR = Paths.document + '/progress-photos/';

export type PoseTag =
  | 'Front Relaxed'
  | 'Back Relaxed'
  | 'Side Left'
  | 'Side Right'
  | 'Front Double Bicep'
  | 'Back Double Bicep'
  | 'Custom';

export const POSE_TAGS: PoseTag[] = [
  'Front Relaxed',
  'Back Relaxed',
  'Side Left',
  'Side Right',
  'Front Double Bicep',
  'Back Double Bicep',
  'Custom',
];

export type ProgressPhoto = {
  id: string;
  date: string;
  pose: PoseTag;
  uri: string;
  timestamp: number;
};

type ProgressPhotoContextValue = {
  photos: ProgressPhoto[];
  addPhoto: (photo: Omit<ProgressPhoto, 'id' | 'timestamp'>) => void;
  deletePhoto: (id: string) => Promise<void>;
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

async function ensureDir() {
  try {
    const dir = new File(PHOTOS_DIR);
    if (!dir.exists) {
      dir.create();
    }
  } catch {}
}

export async function savePhotoFile(sourceUri: string): Promise<string> {
  await ensureDir();
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
  const destUri = PHOTOS_DIR + filename;
  const source = new File(sourceUri);
  source.copy(new File(destUri));
  return destUri;
}

export function ProgressPhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PHOTOS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setPhotos(parsed.filter(isProgressPhoto));
          }
        }
      } catch {}
      hasLoadedRef.current = true;
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)).catch(() => {});
  }, [photos]);

  const addPhoto = useCallback((photo: Omit<ProgressPhoto, 'id' | 'timestamp'>) => {
    const entry: ProgressPhoto = {
      ...photo,
      id: generateId(),
      timestamp: Date.now(),
    };
    setPhotos((prev) => [entry, ...prev]);
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      try {
        const file = new File(photo.uri);
        if (file.exists) {
          file.delete();
        }
      } catch {}
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [photos]);

  const value = useMemo(
    () => ({ photos, addPhoto, deletePhoto, isLoading }),
    [photos, addPhoto, deletePhoto, isLoading],
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
