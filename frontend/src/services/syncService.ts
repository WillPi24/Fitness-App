import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

export const SYNCED_KEYS = [
  'userProfile',
  'workouts',
  'workoutTemplates',
  'calorieDays',
  'calorieGoal',
  'savedMeals',
  'runs',
  'bodyweightLog',
  'bodyMeasurements',
  'progressPhotos',
  'customPoses',
  'customExercises',
] as const;

export type SyncedDataKey = (typeof SYNCED_KEYS)[number];

const SYNC_TIMESTAMPS_KEY = 'fitnessapp.syncTimestamps.v1';

/** Load locally stored sync timestamps (dataKey → last known remote updated_at). */
async function loadSyncTimestamps(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persist sync timestamps to AsyncStorage. */
async function saveSyncTimestamps(timestamps: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(SYNC_TIMESTAMPS_KEY, JSON.stringify(timestamps)).catch(() => {});
}

/** Upsert a single data blob to Supabase. Fire-and-forget - never throws. */
export async function pushKey(dataKey: SyncedDataKey, data: unknown): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return false;

    const { data: rows, error } = await supabase
      .from('user_data')
      .upsert(
        { user_id: userId, data_key: dataKey, data },
        { onConflict: 'user_id,data_key' },
      )
      .select('updated_at');

    if (error) {
      console.warn(`[sync] push ${dataKey} failed:`, error.message);
      return false;
    }

    // Store the server timestamp so we can detect remote changes later
    if (rows?.[0]?.updated_at) {
      const timestamps = await loadSyncTimestamps();
      timestamps[dataKey] = rows[0].updated_at;
      await saveSyncTimestamps(timestamps);
    }

    return true;
  } catch (e) {
    console.warn(`[sync] push ${dataKey} error:`, e);
    return false;
  }
}

/** Fetch all synced data for the current user. Returns a map of dataKey → data. */
export async function pullAll(): Promise<Record<string, unknown> | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('data_key, data, updated_at')
      .eq('user_id', userId);

    if (error || !data) return null;

    // Store all timestamps so future launches can do incremental checks
    const timestamps: Record<string, string> = {};
    const result: Record<string, unknown> = {};
    for (const row of data) {
      result[row.data_key] = row.data;
      timestamps[row.data_key] = row.updated_at;
    }
    await saveSyncTimestamps(timestamps);

    return result;
  } catch (e) {
    console.warn('[sync] pullAll error:', e);
    return null;
  }
}

/**
 * Lightweight incremental sync. Fetches only keys+timestamps (~500 bytes),
 * compares with locally stored timestamps, and only pulls keys that changed.
 * Returns a map of changed dataKey → data, or null if nothing changed / error.
 */
export async function pullChanged(): Promise<Record<string, unknown> | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return null;

    // 1. Fetch just keys + timestamps (tiny payload)
    const { data: remoteTimestamps, error } = await supabase
      .from('user_data')
      .select('data_key, updated_at')
      .eq('user_id', userId);

    if (error || !remoteTimestamps) return null;

    // 2. Compare with local timestamps
    const localTimestamps = await loadSyncTimestamps();
    const staleKeys: string[] = [];

    for (const row of remoteTimestamps) {
      if (localTimestamps[row.data_key] !== row.updated_at) {
        staleKeys.push(row.data_key);
      }
    }

    if (staleKeys.length === 0) return null; // Nothing changed

    // 3. Pull only the changed keys
    const { data: changedRows, error: pullError } = await supabase
      .from('user_data')
      .select('data_key, data, updated_at')
      .eq('user_id', userId)
      .in('data_key', staleKeys);

    if (pullError || !changedRows) return null;

    // 4. Update local timestamps
    const updatedTimestamps = { ...localTimestamps };
    const result: Record<string, unknown> = {};
    for (const row of changedRows) {
      result[row.data_key] = row.data;
      updatedTimestamps[row.data_key] = row.updated_at;
    }
    await saveSyncTimestamps(updatedTimestamps);

    return result;
  } catch (e) {
    console.warn('[sync] pullChanged error:', e);
    return null;
  }
}

/**
 * Smart sync - used by stores on app launch.
 * On first sign-in (no local timestamps): does a full pullAll.
 * On subsequent launches: does a lightweight pullChanged.
 * Cached so all stores share a single request.
 */
let _syncPromise: Promise<Record<string, unknown> | null> | null = null;

export function ensurePulled(): Promise<Record<string, unknown> | null> {
  if (!_syncPromise) {
    _syncPromise = (async () => {
      const localTimestamps = await loadSyncTimestamps();
      const hasTimestamps = Object.keys(localTimestamps).length > 0;

      if (hasTimestamps) {
        // Incremental: only fetch what changed (~500 bytes check)
        return pullChanged();
      } else {
        // First sync: full pull
        return pullAll();
      }
    })();
  }
  return _syncPromise;
}

export function resetPullCache() {
  _syncPromise = null;
}

export async function clearSyncTimestamps() {
  await AsyncStorage.removeItem(SYNC_TIMESTAMPS_KEY).catch(() => {});
}
