import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as Speech from 'expo-speech';

import type { ActiveRun, RunSession } from '../store/runStore';

// ─── Types ───

export type PaceKeeperTrigger =
  | { type: 'distance'; meters: number }
  | { type: 'time'; seconds: number };

export type PaceKeeperTarget =
  | { type: 'pb'; targetDistanceMeters: number }
  | { type: 'manual'; paceSecondsPerKm: number };

export type PaceKeeperSettings = {
  enabled: boolean;
  trigger: PaceKeeperTrigger;
  target: PaceKeeperTarget;
};

export type PaceKeeperCueState = {
  lastTimeCueIndex: number;
  lastDistanceCueIndex: number;
};

export const DEFAULT_PB_TARGET_DISTANCE_METERS = 5000;

export const DEFAULT_SETTINGS: PaceKeeperSettings = {
  enabled: false,
  trigger: { type: 'distance', meters: 1000 },
  target: { type: 'pb', targetDistanceMeters: DEFAULT_PB_TARGET_DISTANCE_METERS },
};

export const SETTINGS_KEY = 'fitnessapp.paceKeeperSettings.v1';

const DEFAULT_CUE_STATE: PaceKeeperCueState = {
  lastTimeCueIndex: 0,
  lastDistanceCueIndex: 0,
};
const MIN_REFERENCE_DISTANCE_METERS = 1000;
const MIN_SIMILAR_DISTANCE_WINDOW_METERS = 1000;
const SIMILAR_DISTANCE_WINDOW_RATIO = 0.2;

let audioConfigured = false;

// ─── Logic ───

export function shouldSpeak(
  settings: PaceKeeperSettings,
  distanceMeters: number,
  elapsedMs: number,
  lastSpokeAtDistance: number,
  lastSpokeAtTime: number,
  isPaused: boolean,
): boolean {
  if (!settings.enabled || isPaused) return false;
  if (distanceMeters < 100) return false; // Wait for meaningful data

  if (settings.trigger.type === 'distance') {
    return distanceMeters - lastSpokeAtDistance >= settings.trigger.meters;
  }
  return elapsedMs - lastSpokeAtTime >= settings.trigger.seconds * 1000;
}

function parseStoredSettings(value: unknown): PaceKeeperSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const parsed = value as Partial<PaceKeeperSettings>;
  const enabled = typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled;

  const trigger = (() => {
    if (parsed.trigger?.type === 'distance' && typeof parsed.trigger.meters === 'number') {
      return { type: 'distance', meters: parsed.trigger.meters } satisfies PaceKeeperTrigger;
    }
    if (parsed.trigger?.type === 'time' && typeof parsed.trigger.seconds === 'number') {
      return { type: 'time', seconds: parsed.trigger.seconds } satisfies PaceKeeperTrigger;
    }
    return DEFAULT_SETTINGS.trigger;
  })();

  const target = (() => {
    if (parsed.target?.type === 'manual' && typeof parsed.target.paceSecondsPerKm === 'number') {
      return {
        type: 'manual',
        paceSecondsPerKm: parsed.target.paceSecondsPerKm,
      } satisfies PaceKeeperTarget;
    }
    if (parsed.target?.type === 'pb') {
      return {
        type: 'pb',
        targetDistanceMeters:
          typeof (parsed.target as { targetDistanceMeters?: unknown }).targetDistanceMeters === 'number'
            ? Math.max(1000, (parsed.target as { targetDistanceMeters: number }).targetDistanceMeters)
            : DEFAULT_PB_TARGET_DISTANCE_METERS,
      } satisfies PaceKeeperTarget;
    }
    return DEFAULT_SETTINGS.target;
  })();

  return { enabled, trigger, target };
}

function normalizeCueState(state?: PaceKeeperCueState | null): PaceKeeperCueState {
  return {
    lastTimeCueIndex: state?.lastTimeCueIndex ?? 0,
    lastDistanceCueIndex: state?.lastDistanceCueIndex ?? 0,
  };
}

function buildWarmupSpeechText(distanceMeters: number, elapsedMs: number): string {
  const distKm = (distanceMeters / 1000).toFixed(1);
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `Time. ${mins}:${secs.toString().padStart(2, '0')}. Distance. ${distKm} kilometres. Gathering pace data.`;
}

function getDueCueState(
  settings: PaceKeeperSettings,
  distanceMeters: number,
  elapsedMs: number,
  state: PaceKeeperCueState,
): PaceKeeperCueState | null {
  if (settings.trigger.type === 'time') {
    const intervalMs = settings.trigger.seconds * 1000;
    const cueIndex = Math.floor(elapsedMs / intervalMs);
    if (cueIndex < 1 || cueIndex <= state.lastTimeCueIndex) {
      return null;
    }
    return {
      ...state,
      lastTimeCueIndex: cueIndex,
    };
  }

  const cueIndex = Math.floor(distanceMeters / settings.trigger.meters);
  if (cueIndex < 1 || cueIndex <= state.lastDistanceCueIndex) {
    return null;
  }
  return {
    ...state,
    lastDistanceCueIndex: cueIndex,
  };
}

export function getElapsedMsForActiveRun(activeRun: ActiveRun, now = Date.now()): number {
  return activeRun.elapsedMs + (activeRun.isPaused ? 0 : now - activeRun.segmentStartedAt);
}

export async function loadPaceKeeperSettings(): Promise<PaceKeeperSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return parseStoredSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePaceKeeperSettings(settings: PaceKeeperSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function configurePaceKeeperAudio(): Promise<void> {
  if (audioConfigured) {
    return;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  audioConfigured = true;
}

export async function maybeSpeakPaceKeeperCue(
  activeRun: ActiveRun,
  runs: RunSession[],
  now = Date.now(),
  settings?: PaceKeeperSettings,
): Promise<ActiveRun> {
  if (activeRun.type !== 'outdoor' || activeRun.isPaused) {
    return activeRun;
  }

  const effectiveSettings = settings ?? (await loadPaceKeeperSettings());
  if (!effectiveSettings.enabled) {
    return activeRun;
  }

  const elapsedMs = getElapsedMsForActiveRun(activeRun, now);
  const distanceMeters = activeRun.distanceMeters;
  const cueState = normalizeCueState(activeRun.paceKeeperCueState);
  const nextCueState = getDueCueState(effectiveSettings, distanceMeters, elapsedMs, cueState);

  if (!nextCueState) {
    return activeRun;
  }

  await configurePaceKeeperAudio();

  const currentPaceSecondsPerKm =
    distanceMeters >= 10 ? (elapsedMs / 1000) / (distanceMeters / 1000) : null;
  const targetPaceSecondsPerKm =
    effectiveSettings.target.type === 'pb'
      ? getPBPaceSecondsPerKm(runs, effectiveSettings.target.targetDistanceMeters)
      : effectiveSettings.target.paceSecondsPerKm;

  const text =
    currentPaceSecondsPerKm === null
      ? buildWarmupSpeechText(distanceMeters, elapsedMs)
      : buildSpeechText(currentPaceSecondsPerKm, targetPaceSecondsPerKm, distanceMeters, elapsedMs);

  await Speech.stop();
  Speech.speak(text, {
    rate: 0.95,
    pitch: 1.0,
    useApplicationAudioSession: true,
  });

  return {
    ...activeRun,
    paceKeeperCueState: nextCueState,
    lastUpdatedAt: now,
  };
}

export function buildSpeechText(
  currentPaceSecondsPerKm: number,
  targetPaceSecondsPerKm: number | null,
  distanceMeters: number,
  elapsedMs: number,
): string {
  const paceMin = Math.floor(currentPaceSecondsPerKm / 60);
  const paceSec = Math.round(currentPaceSecondsPerKm % 60);
  const distKm = (distanceMeters / 1000).toFixed(1);
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  let text = `Distance. ${distKm} kilometres. Pace. ${paceMin} ${paceSec.toString().padStart(2, '0')} per kilometre.`;

  if (targetPaceSecondsPerKm !== null) {
    const diff = targetPaceSecondsPerKm - currentPaceSecondsPerKm;
    const diffAbs = Math.abs(Math.round(diff));
    if (diffAbs > 2) {
      const ahead = diff > 0;
      text += ` Target. ${diffAbs} seconds ${ahead ? 'ahead of' : 'behind'} target.`;
    } else {
      text += ' Target. On target.';
    }
  } else {
    text += ` Time. ${mins}:${secs.toString().padStart(2, '0')}.`;
  }

  return text;
}

export function getPBPaceSecondsPerKm(
  runs: RunSession[],
  referenceDistanceMeters?: number | null,
): number | null {
  const eligibleRuns = runs.filter((run) => run.distanceMeters >= 1000 && run.durationMs > 0);
  if (eligibleRuns.length === 0) {
    return null;
  }

  const reference =
    typeof referenceDistanceMeters === 'number' && Number.isFinite(referenceDistanceMeters)
      ? Math.max(MIN_REFERENCE_DISTANCE_METERS, referenceDistanceMeters)
      : null;

  const bestPaceForRuns = (candidateRuns: RunSession[]) => {
    let bestPace = Infinity;

    for (const run of candidateRuns) {
      const paceSecsPerKm = (run.durationMs / 1000) / (run.distanceMeters / 1000);
      if (paceSecsPerKm < bestPace) {
        bestPace = paceSecsPerKm;
      }
    }

    return bestPace === Infinity ? null : bestPace;
  };

  if (reference === null) {
    return bestPaceForRuns(eligibleRuns);
  }

  const windowMeters = Math.max(
    MIN_SIMILAR_DISTANCE_WINDOW_METERS,
    reference * SIMILAR_DISTANCE_WINDOW_RATIO,
  );
  const similarRuns = eligibleRuns.filter(
    (run) => Math.abs(run.distanceMeters - reference) <= windowMeters,
  );

  return similarRuns.length > 0 ? bestPaceForRuns(similarRuns) : null;
}
