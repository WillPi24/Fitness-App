import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type RunPoint = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  timestamp: number;
};

export type RunSession = {
  id: string;
  date: string;
  type: 'outdoor' | 'indoor';
  activity?: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  distanceMeters: number;
  route: RunPoint[];
  manualDistanceMeters?: number;
};

export type ActiveRun = {
  id: string;
  date: string;
  type: 'outdoor' | 'indoor';
  activity?: string;
  startedAt: number;
  segmentStartedAt: number;
  elapsedMs: number;
  isPaused: boolean;
  distanceMeters: number;
  route: RunPoint[];
  lastPoint?: RunPoint;
  manualDistanceMeters?: number;
  lastUpdatedAt: number;
};

type RunContextValue = {
  runs: RunSession[];
  activeRun: ActiveRun | null;
  startRun: (type: 'outdoor' | 'indoor', activity?: string) => Promise<boolean>;
  pauseRun: () => Promise<void>;
  resumeRun: () => Promise<void>;
  finishRun: () => Promise<void>;
  discardRun: () => Promise<void>;
  updateIndoorDistance: (meters: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const RUNS_KEY = 'fitnessapp.runs.v1';
const ACTIVE_RUN_KEY = 'fitnessapp.activeRun.v1';
const RUN_LOCATION_TASK = 'fitnessapp.runLocationTask.v1';
const LOCATION_ACCURACY_METERS = 50;

const RunContext = createContext<RunContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isRunPoint(value: unknown): value is RunPoint {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const point = value as RunPoint;
  return (
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    typeof point.timestamp === 'number'
  );
}

function isRunSession(value: unknown): value is RunSession {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const run = value as RunSession;
  return (
    typeof run.id === 'string' &&
    typeof run.date === 'string' &&
    (run.type === 'outdoor' || run.type === 'indoor') &&
    (run.activity === undefined || typeof run.activity === 'string') &&
    typeof run.startedAt === 'number' &&
    typeof run.endedAt === 'number' &&
    typeof run.durationMs === 'number' &&
    typeof run.distanceMeters === 'number' &&
    Array.isArray(run.route) &&
    run.route.every(isRunPoint)
  );
}

function isActiveRun(value: unknown): value is ActiveRun {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const run = value as ActiveRun;
  return (
    typeof run.id === 'string' &&
    typeof run.date === 'string' &&
    (run.type === 'outdoor' || run.type === 'indoor') &&
    (run.activity === undefined || typeof run.activity === 'string') &&
    typeof run.startedAt === 'number' &&
    typeof run.segmentStartedAt === 'number' &&
    typeof run.elapsedMs === 'number' &&
    typeof run.isPaused === 'boolean' &&
    typeof run.distanceMeters === 'number' &&
    Array.isArray(run.route) &&
    run.route.every(isRunPoint) &&
    typeof run.lastUpdatedAt === 'number'
  );
}

function toRunPoint(location: Location.LocationObject): RunPoint {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude ?? null,
    accuracy: location.coords.accuracy ?? null,
    speed: location.coords.speed ?? null,
    timestamp: location.timestamp,
  };
}

function haversineDistanceMeters(a: RunPoint, b: RunPoint) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(h)));
}

function appendLocations(activeRun: ActiveRun, locations: Location.LocationObject[]) {
  let distanceMeters = activeRun.distanceMeters;
  const route = [...activeRun.route];
  let lastPoint = activeRun.lastPoint ?? route[route.length - 1];

  locations.forEach((location) => {
    if (!location?.coords) {
      return;
    }
    const accuracy = location.coords.accuracy ?? 0;
    if (accuracy > LOCATION_ACCURACY_METERS) {
      return;
    }
    const point = toRunPoint(location);
    if (lastPoint && point.timestamp <= lastPoint.timestamp) {
      return;
    }
    if (lastPoint) {
      distanceMeters += haversineDistanceMeters(lastPoint, point);
    }
    route.push(point);
    lastPoint = point;
  });

  if (route.length === activeRun.route.length) {
    return activeRun;
  }

  return {
    ...activeRun,
    route,
    lastPoint,
    distanceMeters,
    lastUpdatedAt: Date.now(),
  };
}

if (!TaskManager.isTaskDefined(RUN_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations?: Location.LocationObject[] }>(RUN_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Run location task error', error);
      return;
    }

    const locations = data?.locations ?? [];
    if (locations.length === 0) {
      return;
    }

    try {
      const activeRaw = await AsyncStorage.getItem(ACTIVE_RUN_KEY);
      if (!activeRaw) {
        return;
      }
      const parsed = JSON.parse(activeRaw);
      if (!isActiveRun(parsed) || parsed.type !== 'outdoor' || parsed.isPaused) {
        return;
      }
      const next = appendLocations(parsed, locations);
      if (next !== parsed) {
        await AsyncStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(next));
      }
    } catch (taskError) {
      console.error('Failed to persist run locations', taskError);
    }
  });
}

export function RunProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const persistActiveRun = useCallback(async (next: ActiveRun | null) => {
    try {
      if (next) {
        await AsyncStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(next));
      } else {
        await AsyncStorage.removeItem(ACTIVE_RUN_KEY);
      }
      setActiveRun(next);
    } catch (persistError) {
      console.error('Failed to persist active run', persistError);
      setError('Unable to save your active run.');
    }
  }, []);

  const ensureLocationPermissions = useCallback(async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      setError('Turn on Location Services to track your run.');
      return false;
    }

    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      setError('Location permission is required to track runs.');
      return false;
    }

    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status !== Location.PermissionStatus.GRANTED) {
      setError('Allow "Always" location permission to track runs with the screen locked.');
      return false;
    }

    return true;
  }, []);

  const startLocationUpdates = useCallback(async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(RUN_LOCATION_TASK);
    }

    await Location.startLocationUpdatesAsync(RUN_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 5,
      deferredUpdatesInterval: 5000,
      deferredUpdatesDistance: 5,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Tracking your run',
        notificationBody: 'FitnessApp is recording your route and distance.',
        notificationColor: '#E4572E',
      },
    });
  }, []);

  const stopLocationUpdates = useCallback(async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(RUN_LOCATION_TASK);
    }
  }, []);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const [runsRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(RUNS_KEY),
          AsyncStorage.getItem(ACTIVE_RUN_KEY),
        ]);

        if (runsRaw) {
          const parsed = JSON.parse(runsRaw);
          if (Array.isArray(parsed)) {
            const safeRuns = parsed.filter(isRunSession).sort((a, b) => b.startedAt - a.startedAt);
            setRuns(safeRuns);
          }
        }

        if (activeRaw) {
          const parsedActive = JSON.parse(activeRaw);
          if (isActiveRun(parsedActive)) {
            setActiveRun(parsedActive);
          }
        }
      } catch (loadError) {
        console.error('Failed to load runs', loadError);
        setError('Unable to load run history.');
      } finally {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    };

    loadRuns();
  }, []);

  useEffect(() => {
    const saveRuns = async () => {
      if (!hasLoadedRef.current) {
        return;
      }
      try {
        await AsyncStorage.setItem(RUNS_KEY, JSON.stringify(runs));
      } catch (saveError) {
        console.error('Failed to save runs', saveError);
        setError('Unable to save run history.');
      }
    };

    saveRuns();
  }, [runs]);

  useEffect(() => {
    if (!activeRun || activeRun.type !== 'outdoor' || activeRun.isPaused) {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const activeRaw = await AsyncStorage.getItem(ACTIVE_RUN_KEY);
        if (!activeRaw) {
          return;
        }
        const parsed = JSON.parse(activeRaw);
        if (!isActiveRun(parsed)) {
          return;
        }
        if (!activeRun || parsed.lastUpdatedAt > activeRun.lastUpdatedAt) {
          setActiveRun(parsed);
        }
      } catch (syncError) {
        console.error('Failed to sync active run', syncError);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRun]);

  useEffect(() => {
    if (!activeRun || activeRun.type !== 'outdoor' || activeRun.isPaused) {
      return;
    }

    const ensureUpdates = async () => {
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK);
        if (!hasStarted) {
          await startLocationUpdates();
        }
      } catch (syncError) {
        console.error('Failed to restart location updates', syncError);
      }
    };

    ensureUpdates();
  }, [activeRun, startLocationUpdates]);

  const startRun = useCallback(
    async (type: 'outdoor' | 'indoor', activity?: string) => {
      if (activeRun) {
        setError('Finish or discard the active run before starting a new one.');
        return false;
      }

      setError(null);

      if (type === 'outdoor') {
        const ok = await ensureLocationPermissions();
        if (!ok) {
          return false;
        }
      }

      const now = Date.now();
      const selectedActivity =
        typeof activity === 'string' && activity.trim().length > 0
          ? activity.trim()
          : type === 'outdoor'
            ? 'Run'
            : 'Treadmill';
      let nextRun: ActiveRun = {
        id: generateId(),
        date: formatISODate(new Date(now)),
        type,
        activity: selectedActivity,
        startedAt: now,
        segmentStartedAt: now,
        elapsedMs: 0,
        isPaused: false,
        distanceMeters: 0,
        route: [],
        lastUpdatedAt: now,
      };

      if (type === 'outdoor') {
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          nextRun = appendLocations(nextRun, [current]);
        } catch (positionError) {
          console.warn('Unable to get starting location', positionError);
        }
      }

      await persistActiveRun(nextRun);

      if (type === 'outdoor') {
        try {
          await startLocationUpdates();
        } catch (startError) {
          console.error('Failed to start location updates', startError);
          setError('Unable to start GPS tracking.');
          return false;
        }
      }

      return true;
    },
    [activeRun, ensureLocationPermissions, persistActiveRun, startLocationUpdates]
  );

  const pauseRun = useCallback(async () => {
    if (!activeRun) {
      setError('No active run to pause.');
      return;
    }

    const now = Date.now();
    const elapsedMs = activeRun.elapsedMs + (activeRun.isPaused ? 0 : now - activeRun.segmentStartedAt);

    if (activeRun.type === 'outdoor') {
      await stopLocationUpdates();
    }

    await persistActiveRun({
      ...activeRun,
      elapsedMs,
      isPaused: true,
      lastUpdatedAt: now,
    });
  }, [activeRun, persistActiveRun, stopLocationUpdates]);

  const resumeRun = useCallback(async () => {
    if (!activeRun) {
      setError('No active run to resume.');
      return;
    }

    if (activeRun.type === 'outdoor') {
      const ok = await ensureLocationPermissions();
      if (!ok) {
        return;
      }
      await startLocationUpdates();
    }

    const now = Date.now();
    await persistActiveRun({
      ...activeRun,
      segmentStartedAt: now,
      isPaused: false,
      lastUpdatedAt: now,
    });
  }, [activeRun, ensureLocationPermissions, persistActiveRun, startLocationUpdates]);

  const updateIndoorDistance = useCallback(
    async (meters: number) => {
      if (!activeRun || activeRun.type !== 'indoor') {
        return;
      }
      const now = Date.now();
      await persistActiveRun({
        ...activeRun,
        manualDistanceMeters: meters,
        lastUpdatedAt: now,
      });
    },
    [activeRun, persistActiveRun]
  );

  const finishRun = useCallback(async () => {
    if (!activeRun) {
      setError('No active run to finish.');
      return;
    }

    const now = Date.now();
    const durationMs =
      activeRun.elapsedMs + (activeRun.isPaused ? 0 : now - activeRun.segmentStartedAt);
    const distanceMeters =
      activeRun.type === 'indoor'
        ? activeRun.manualDistanceMeters ?? 0
        : activeRun.distanceMeters;

    if (activeRun.type === 'outdoor') {
      await stopLocationUpdates();
    }

    const completed: RunSession = {
      id: activeRun.id,
      date: activeRun.date,
      type: activeRun.type,
      activity: activeRun.activity,
      startedAt: activeRun.startedAt,
      endedAt: now,
      durationMs,
      distanceMeters,
      route: activeRun.route,
      manualDistanceMeters: activeRun.manualDistanceMeters,
    };

    setRuns((prev) => [completed, ...prev].sort((a, b) => b.startedAt - a.startedAt));
    await persistActiveRun(null);
  }, [activeRun, persistActiveRun, stopLocationUpdates]);

  const discardRun = useCallback(async () => {
    if (!activeRun) {
      return;
    }
    if (activeRun.type === 'outdoor') {
      await stopLocationUpdates();
    }
    await persistActiveRun(null);
  }, [activeRun, persistActiveRun, stopLocationUpdates]);

  const value = useMemo(
    () => ({
      runs,
      activeRun,
      startRun,
      pauseRun,
      resumeRun,
      finishRun,
      discardRun,
      updateIndoorDistance,
      isLoading,
      error,
      clearError: () => setError(null),
    }),
    [runs, activeRun, startRun, pauseRun, resumeRun, finishRun, discardRun, updateIndoorDistance, isLoading, error]
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRunStore() {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error('useRunStore must be used within a RunProvider');
  }
  return context;
}
