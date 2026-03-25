import type { RunSession } from '../store/runStore';

// ─── Types ───

export type PaceKeeperTrigger =
  | { type: 'distance'; meters: number }
  | { type: 'time'; seconds: number };

export type PaceKeeperTarget =
  | { type: 'pb' }
  | { type: 'manual'; paceSecondsPerKm: number };

export type PaceKeeperSettings = {
  enabled: boolean;
  trigger: PaceKeeperTrigger;
  target: PaceKeeperTarget;
};

export const DEFAULT_SETTINGS: PaceKeeperSettings = {
  enabled: false,
  trigger: { type: 'distance', meters: 1000 },
  target: { type: 'pb' },
};

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

export function buildSpeechText(
  currentPaceSecondsPerKm: number,
  targetPaceSecondsPerKm: number | null,
  distanceMeters: number,
): string {
  const paceMin = Math.floor(currentPaceSecondsPerKm / 60);
  const paceSec = Math.round(currentPaceSecondsPerKm % 60);
  const distKm = (distanceMeters / 1000).toFixed(1);

  let text = `${distKm} kilometres. ${paceMin} ${paceSec.toString().padStart(2, '0')} per kilometre.`;

  if (targetPaceSecondsPerKm !== null) {
    const diff = targetPaceSecondsPerKm - currentPaceSecondsPerKm;
    const diffAbs = Math.abs(Math.round(diff));
    if (diffAbs > 2) {
      const ahead = diff > 0;
      text += ` ${diffAbs} seconds ${ahead ? 'ahead of' : 'behind'} target.`;
    } else {
      text += ' On target.';
    }
  }

  return text;
}

export function getPBPaceSecondsPerKm(runs: RunSession[]): number | null {
  let bestPace = Infinity;

  for (const run of runs) {
    if (run.distanceMeters < 1000 || run.durationMs <= 0) continue;
    const paceSecsPerKm = (run.durationMs / 1000) / (run.distanceMeters / 1000);
    if (paceSecsPerKm < bestPace) {
      bestPace = paceSecsPerKm;
    }
  }

  return bestPace === Infinity ? null : bestPace;
}
