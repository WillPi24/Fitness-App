import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { snapRouteToRoads } from '../services/routeSnapping';
import {
  type PaceKeeperCueState,
  loadPaceKeeperSettings,
  maybeSpeakPaceKeeperCue,
} from '../services/paceKeeper';
import { isNativePaceKeeperAvailable, stopNativePaceKeeper, syncNativePaceKeeper } from '../services/nativePaceKeeper';

export type RunPoint = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  timestamp: number;
};

type KalmanAxisState = {
  x: number;
  v: number;
  p00: number;
  p01: number;
  p10: number;
  p11: number;
};

type GPSKalmanState = {
  lat: KalmanAxisState;
  lon: KalmanAxisState;
  timestamp: number;
};

export type RunSplit = {
  km: number;
  timeMs: number;
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
  segmentBreaks?: number[];
  manualDistanceMeters?: number;
  splits?: RunSplit[];
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
  segmentBreaks?: number[];
  lastPoint?: RunPoint;
  manualDistanceMeters?: number;
  lastUpdatedAt: number;
  kalmanState?: GPSKalmanState;
  splits?: RunSplit[];
  paceKeeperCueState?: PaceKeeperCueState;
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
  importRuns: (sessions: RunSession[]) => void;
  seedDemoRuns: () => void;
  clearDemoRuns: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const RUNS_KEY = 'fitnessapp.runs.v1';
const ACTIVE_RUN_KEY = 'fitnessapp.activeRun.v1';
const APP_STATE_KEY = 'fitnessapp.appState.v1';
const RUN_LOCATION_TASK = 'fitnessapp.runLocationTask.v1';
const LOCATION_ACCURACY_METERS = 20;
const MAX_SPEED_MPS = 15;
const METERS_PER_DEGREE_LAT = 111_320;
const ACCEL_NOISE_MPS2 = 2.0;

const DEMO_RUN_ID_PREFIX = 'demo-run-';

const RunContext = createContext<RunContextValue | undefined>(undefined);

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function isDemoRun(run: RunSession) {
  return run.id.startsWith(DEMO_RUN_ID_PREFIX);
}

function createDemoRuns(): RunSession[] {
  const now = new Date();
  now.setHours(7, 30, 0, 0);

  const sessions: RunSession[] = [];
  let runIndex = 0;

  // ~8 months of running, 2-3 runs per week (Tue, Thu, Sun)
  for (let daysAgo = 240; daysAgo >= 1; daysAgo--) {
    const day = new Date(now.getTime() - daysAgo * 86400000).getDay();
    // Run on Tue(2), Thu(4), Sun(0)
    if (day !== 0 && day !== 2 && day !== 4) {
      continue;
    }

    const runDate = new Date(now);
    runDate.setDate(runDate.getDate() - daysAgo);
    const startedAt = runDate.getTime();

    // Gradual improvement: pace goes from ~6.5 min/km down to ~5.2 min/km
    // Distance increases from ~3km to ~7km
    const progressFactor = runIndex / 80; // 0 → ~1 over the period
    const baseDistanceKm = 3 + progressFactor * 4;
    // Add some variance
    const variance = 0.8 + Math.sin(runIndex * 1.7) * 0.2;
    const distanceKm = baseDistanceKm * variance;
    const distanceMeters = Math.round(distanceKm * 1000);

    const basePaceMinPerKm = 6.5 - progressFactor * 1.3;
    const paceVariance = 1 + Math.sin(runIndex * 2.3) * 0.08;
    const paceMinPerKm = basePaceMinPerKm * paceVariance;
    const durationMs = Math.round(distanceKm * paceMinPerKm * 60000);

    // Alternate between outdoor runs and some indoor treadmill sessions
    const isIndoor = runIndex % 7 === 3;
    const activities = ['Run', 'Run', 'Run', 'Walk', 'Run'];
    const activity = isIndoor ? 'Treadmill' : activities[runIndex % activities.length];

    sessions.push({
      id: `${DEMO_RUN_ID_PREFIX}${runIndex}`,
      date: formatISODate(runDate),
      type: isIndoor ? 'indoor' : 'outdoor',
      activity,
      startedAt,
      endedAt: startedAt + durationMs,
      durationMs,
      distanceMeters,
      route: [],
      manualDistanceMeters: isIndoor ? distanceMeters : undefined,
    });

    runIndex++;
  }

  return sessions.sort((a, b) => b.startedAt - a.startedAt);
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

export function isRunSession(value: unknown): value is RunSession {
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

function initKalman(point: RunPoint): GPSKalmanState {
  const accMeters = point.accuracy ?? 10;
  const accLatDeg = accMeters / METERS_PER_DEGREE_LAT;
  const cosLat = Math.cos((point.latitude * Math.PI) / 180);
  const accLonDeg = accMeters / (METERS_PER_DEGREE_LAT * cosLat);

  return {
    lat: {
      x: point.latitude,
      v: 0,
      p00: accLatDeg * accLatDeg,
      p01: 0,
      p10: 0,
      p11: (accLatDeg * accLatDeg) / 4,
    },
    lon: {
      x: point.longitude,
      v: 0,
      p00: accLonDeg * accLonDeg,
      p01: 0,
      p10: 0,
      p11: (accLonDeg * accLonDeg) / 4,
    },
    timestamp: point.timestamp,
  };
}

function kalmanPredictAxis(s: KalmanAxisState, dt: number, qScale: number): KalmanAxisState {
  const dt2 = dt * dt;
  const dt3 = dt2 * dt;
  return {
    x: s.x + s.v * dt,
    v: s.v,
    p00: s.p00 + dt * (s.p10 + s.p01) + dt2 * s.p11 + (qScale * dt3) / 3,
    p01: s.p01 + dt * s.p11 + (qScale * dt2) / 2,
    p10: s.p10 + dt * s.p11 + (qScale * dt2) / 2,
    p11: s.p11 + qScale * dt,
  };
}

function kalmanUpdateAxis(s: KalmanAxisState, z: number, r: number): KalmanAxisState {
  const y = z - s.x;
  const invS = 1 / (s.p00 + r);
  const k0 = s.p00 * invS;
  const k1 = s.p10 * invS;
  return {
    x: s.x + k0 * y,
    v: s.v + k1 * y,
    p00: s.p00 - k0 * s.p00,
    p01: s.p01 - k0 * s.p01,
    p10: s.p10 - k1 * s.p00,
    p11: s.p11 - k1 * s.p01,
  };
}

function kalmanSmooth(
  state: GPSKalmanState,
  point: RunPoint
): { smoothed: RunPoint; nextState: GPSKalmanState } {
  const dt = (point.timestamp - state.timestamp) / 1000;
  if (dt <= 0) {
    return { smoothed: point, nextState: state };
  }

  const accMeters = point.accuracy ?? 10;
  const cosLat = Math.cos((point.latitude * Math.PI) / 180);
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * cosLat;

  const rLat = Math.pow(accMeters / METERS_PER_DEGREE_LAT, 2);
  const rLon = Math.pow(accMeters / metersPerDegreeLon, 2);
  const qLat = Math.pow(ACCEL_NOISE_MPS2 / METERS_PER_DEGREE_LAT, 2);
  const qLon = Math.pow(ACCEL_NOISE_MPS2 / metersPerDegreeLon, 2);

  const predLat = kalmanPredictAxis(state.lat, dt, qLat);
  const predLon = kalmanPredictAxis(state.lon, dt, qLon);
  const newLat = kalmanUpdateAxis(predLat, point.latitude, rLat);
  const newLon = kalmanUpdateAxis(predLon, point.longitude, rLon);

  return {
    smoothed: {
      latitude: newLat.x,
      longitude: newLon.x,
      altitude: point.altitude,
      accuracy: point.accuracy,
      speed: point.speed,
      timestamp: point.timestamp,
    },
    nextState: {
      lat: newLat,
      lon: newLon,
      timestamp: point.timestamp,
    },
  };
}

function appendLocations(activeRun: ActiveRun, locations: Location.LocationObject[]) {
  let distanceMeters = activeRun.distanceMeters;
  const route = [...activeRun.route];
  let lastPoint = activeRun.lastPoint ?? route[route.length - 1];
  let kalmanState = activeRun.kalmanState ?? null;
  const splits: RunSplit[] = activeRun.splits ? [...activeRun.splits] : [];
  let nextKm = splits.length > 0 ? splits[splits.length - 1].km + 1 : 1;

  locations.forEach((location) => {
    if (!location?.coords) {
      return;
    }
    const accuracy = location.coords.accuracy ?? 0;
    if (accuracy > LOCATION_ACCURACY_METERS) {
      return;
    }
    const rawPoint = toRunPoint(location);
    if (lastPoint && rawPoint.timestamp <= lastPoint.timestamp) {
      return;
    }

    // Reject points that imply impossible speed (GPS jumps)
    if (lastPoint) {
      const dt = (rawPoint.timestamp - lastPoint.timestamp) / 1000;
      if (dt > 0) {
        const dist = haversineDistanceMeters(lastPoint, rawPoint);
        if (dist / dt > MAX_SPEED_MPS) {
          return;
        }
      }
    }

    // Apply Kalman smoothing
    let point: RunPoint;
    if (!kalmanState) {
      kalmanState = initKalman(rawPoint);
      point = rawPoint;
    } else {
      const result = kalmanSmooth(kalmanState, rawPoint);
      point = result.smoothed;
      kalmanState = result.nextState;
    }

    const prevDistance = distanceMeters;
    if (lastPoint) {
      distanceMeters += haversineDistanceMeters(lastPoint, point);
    }
    route.push(point);

    // Check for km boundary crossings
    while (distanceMeters >= nextKm * 1000) {
      const segDist = distanceMeters - prevDistance;
      const overshoot = distanceMeters - nextKm * 1000;
      const ratio = segDist > 0 ? (segDist - overshoot) / segDist : 1;
      const dt = lastPoint ? point.timestamp - lastPoint.timestamp : 0;
      const crossTime = (lastPoint ? lastPoint.timestamp : point.timestamp) + dt * ratio;
      splits.push({ km: nextKm, timeMs: crossTime - activeRun.startedAt });
      nextKm++;
    }

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
    splits,
    kalmanState: kalmanState ?? undefined,
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
      const [activeRaw, runsRaw, appStateRaw] = await Promise.all([
        AsyncStorage.getItem(ACTIVE_RUN_KEY),
        AsyncStorage.getItem(RUNS_KEY),
        AsyncStorage.getItem(APP_STATE_KEY),
      ]);
      if (!activeRaw) {
        return;
      }
      const parsed = JSON.parse(activeRaw);
      if (!isActiveRun(parsed) || parsed.type !== 'outdoor' || parsed.isPaused) {
        return;
      }
      let next = appendLocations(parsed, locations);
      const parsedRuns = runsRaw ? JSON.parse(runsRaw) : [];
      const safeRuns = Array.isArray(parsedRuns) ? parsedRuns.filter(isRunSession) : [];
      const settings = await loadPaceKeeperSettings();

      if (Platform.OS === 'ios' && isNativePaceKeeperAvailable()) {
        syncNativePaceKeeper(next, safeRuns, settings, false);
      } else if (appStateRaw !== 'active') {
        next = await maybeSpeakPaceKeeperCue(next, safeRuns, Date.now(), settings);
      }
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
  const [appState, setAppState] = useState(AppState.currentState);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.setItem(APP_STATE_KEY, AppState.currentState).catch(() => {});
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
      AsyncStorage.setItem(APP_STATE_KEY, nextState).catch(() => {});
    });
    return () => subscription.remove();
  }, []);

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
      timeInterval: 1000,
      distanceInterval: 1,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Tracking your run',
        notificationBody: 'Helm is recording your route and distance.',
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
      return undefined;
    }

    if (Platform.OS === 'ios' && isNativePaceKeeperAvailable()) {
      return undefined;
    }

    const tick = async () => {
      if (AppState.currentState !== 'active') {
        return;
      }

      try {
        const activeRaw = await AsyncStorage.getItem(ACTIVE_RUN_KEY);
        if (!activeRaw) {
          return;
        }
        const parsed = JSON.parse(activeRaw);
        if (!isActiveRun(parsed) || parsed.id !== activeRun.id || parsed.isPaused) {
          return;
        }

        const settings = await loadPaceKeeperSettings();
        const next = await maybeSpeakPaceKeeperCue(parsed, runs, Date.now(), settings);
        if (next !== parsed) {
          await persistActiveRun(next);
        }
      } catch (paceKeeperError) {
        console.error('Failed to run pace keeper', paceKeeperError);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeRun?.id, activeRun?.isPaused, activeRun?.type, runs, persistActiveRun]);

  useEffect(() => {
    if (!(Platform.OS === 'ios' && isNativePaceKeeperAvailable())) {
      return undefined;
    }

    if (!activeRun || activeRun.type !== 'outdoor') {
      stopNativePaceKeeper();
      return undefined;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const settings = await loadPaceKeeperSettings();
        if (!cancelled) {
          syncNativePaceKeeper(activeRun, runs, settings, appState === 'active');
        }
      } catch {}
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [activeRun, runs, appState]);

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
        paceKeeperCueState: {
          lastTimeCueIndex: 0,
          lastDistanceCueIndex: 0,
        },
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
    const breaks = [...(activeRun.segmentBreaks ?? [])];
    if (activeRun.route.length > 0) {
      breaks.push(activeRun.route.length);
    }
    await persistActiveRun({
      ...activeRun,
      segmentStartedAt: now,
      isPaused: false,
      segmentBreaks: breaks,
      lastPoint: undefined,
      kalmanState: undefined,
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
      segmentBreaks: activeRun.segmentBreaks,
      manualDistanceMeters: activeRun.manualDistanceMeters,
      splits: activeRun.splits,
    };

    setRuns((prev) => [completed, ...prev].sort((a, b) => b.startedAt - a.startedAt));
    await persistActiveRun(null);

    // Snap route to roads in the background (non-blocking)
    if (completed.type === 'outdoor' && completed.route.length >= 2) {
      snapRouteToRoads(completed.route).then((snapped) => {
        if (snapped && snapped.length >= 2) {
          setRuns((prev) =>
            prev.map((r) =>
              r.id === completed.id ? { ...r, route: snapped } : r,
            ),
          );
        }
      }).catch(() => {});
    }
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

  const seedDemoRuns = useCallback(() => {
    if (!__DEV__) {
      return;
    }
    setRuns((prev) => {
      const userRuns = prev.filter((run) => !isDemoRun(run));
      return [...createDemoRuns(), ...userRuns].sort((a, b) => b.startedAt - a.startedAt);
    });
  }, []);

  const clearDemoRuns = useCallback(() => {
    if (!__DEV__) {
      return;
    }
    setRuns((prev) => prev.filter((run) => !isDemoRun(run)));
  }, []);

  const importRuns = useCallback((sessions: RunSession[]) => {
    setRuns((prev) => [...prev, ...sessions].sort((a, b) => b.startedAt - a.startedAt));
  }, []);

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
      importRuns,
      seedDemoRuns,
      clearDemoRuns,
      isLoading,
      error,
      clearError: () => setError(null),
    }),
    [runs, activeRun, startRun, pauseRun, resumeRun, finishRun, discardRun, updateIndoorDistance, importRuns, seedDemoRuns, clearDemoRuns, isLoading, error]
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
