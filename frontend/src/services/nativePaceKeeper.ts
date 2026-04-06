import { NativeModules, Platform } from 'react-native';

import type { PaceKeeperSettings } from './paceKeeper';
import { getPBPaceSecondsPerKm } from './paceKeeper';
import type { ActiveRun, RunSession } from '../store/runStore';

type NativePaceKeeperModuleShape = {
  sync(payload: Record<string, unknown>): void;
  stop(): void;
};

const NativePaceKeeperModule: NativePaceKeeperModuleShape | null =
  Platform.OS === 'ios' ? (NativeModules.NativePaceKeeperModule as NativePaceKeeperModuleShape | undefined) ?? null : null;

export function isNativePaceKeeperAvailable() {
  return NativePaceKeeperModule !== null;
}

export function syncNativePaceKeeper(
  activeRun: ActiveRun | null,
  runs: RunSession[],
  settings: PaceKeeperSettings,
  isAppActive: boolean,
) {
  if (!NativePaceKeeperModule || !activeRun || activeRun.type !== 'outdoor' || !settings.enabled) {
    NativePaceKeeperModule?.stop();
    return;
  }

  const targetPaceSecondsPerKm =
    settings.target.type === 'pb'
      ? getPBPaceSecondsPerKm(runs, settings.target.targetDistanceMeters)
      : settings.target.paceSecondsPerKm;

  NativePaceKeeperModule.sync({
    runId: activeRun.id,
    enabled: settings.enabled,
    triggerType: settings.trigger.type,
    triggerSeconds: settings.trigger.type === 'time' ? settings.trigger.seconds : 0,
    triggerMeters: settings.trigger.type === 'distance' ? settings.trigger.meters : 0,
    targetPaceSecondsPerKm: targetPaceSecondsPerKm ?? null,
    distanceMeters: activeRun.distanceMeters,
    elapsedMs: activeRun.elapsedMs,
    segmentStartedAt: activeRun.segmentStartedAt,
    isPaused: activeRun.isPaused,
    isAppActive,
  });
}

export function stopNativePaceKeeper() {
  NativePaceKeeperModule?.stop();
}
