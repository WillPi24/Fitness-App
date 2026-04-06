import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import {
  type PaceKeeperSettings,
  type PaceKeeperTrigger,
  DEFAULT_SETTINGS,
  DEFAULT_PB_TARGET_DISTANCE_METERS,
  getPBPaceSecondsPerKm,
  loadPaceKeeperSettings,
  savePaceKeeperSettings,
} from '../services/paceKeeper';
import type { ActiveRun, RunSession } from '../store/runStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { Card } from './Card';

type PaceKeeperControlsProps = {
  runs: RunSession[];
  activeRun: ActiveRun | null;
  elapsedMs: number;
};

const TRIGGER_OPTIONS: Array<{ label: string; trigger: PaceKeeperTrigger }> = [
  { label: '500m', trigger: { type: 'distance', meters: 500 } },
  { label: '1km', trigger: { type: 'distance', meters: 1000 } },
  { label: '30s', trigger: { type: 'time', seconds: 30 } },
  { label: '1min', trigger: { type: 'time', seconds: 60 } },
  { label: '2min', trigger: { type: 'time', seconds: 120 } },
];

function triggerKey(t: PaceKeeperTrigger): string {
  return t.type === 'distance' ? `d${t.meters}` : `t${t.seconds}`;
}

function formatManualPace(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.max(0, totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function sanitizeManualPaceInput(text: string): string {
  const cleaned = text.replace(/[^\d:]/g, '');
  const [rawMinutes = '', ...rest] = cleaned.split(':');
  const rawSeconds = rest.join('');
  const minutes = rawMinutes.slice(0, 3);
  const seconds = rawSeconds.slice(0, 2);
  const hasColon = cleaned.includes(':');

  if (!minutes) {
    return '';
  }

  if (!hasColon && seconds.length === 0) {
    return minutes;
  }

  return `${minutes}:${seconds}`;
}

function parseManualPace(text: string): number | null {
  const match = text.match(/^(\d{1,3}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);

  if (!Number.isFinite(mins) || !Number.isFinite(secs) || secs >= 60) {
    return null;
  }

  return mins * 60 + secs;
}

function sanitizeDistanceInput(text: string): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  const decimal = rest.join('').slice(0, 2);
  const normalizedWhole = whole.slice(0, 3);

  if (!normalizedWhole && cleaned.startsWith('.')) {
    return decimal.length > 0 ? `0.${decimal}` : '0.';
  }

  if (!cleaned.includes('.')) {
    return normalizedWhole;
  }

  return `${normalizedWhole || '0'}.${decimal}`;
}

function parseTargetDistanceKm(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const parsedKm = Number(trimmed);
  if (!Number.isFinite(parsedKm) || parsedKm < 1) {
    return null;
  }

  return Math.round(parsedKm * 1000);
}

function formatTargetDistanceInput(meters: number): string {
  const km = meters / 1000;
  return Number.isInteger(km) ? String(km) : km.toFixed(1);
}

export function PaceKeeperControls({ runs, activeRun, elapsedMs }: PaceKeeperControlsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [settings, setSettings] = useState<PaceKeeperSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [manualPace, setManualPace] = useState('5:00');
  const [pbTargetDistanceKm, setPbTargetDistanceKm] = useState(
    formatTargetDistanceInput(DEFAULT_PB_TARGET_DISTANCE_METERS)
  );
  const hasHydratedRef = useRef(false);
  const pbBenchmarkPace = useMemo(() => {
    if (settings.target.type !== 'pb') {
      return null;
    }
    return getPBPaceSecondsPerKm(runs, settings.target.targetDistanceMeters);
  }, [runs, settings.target]);
  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const parsed = await loadPaceKeeperSettings();
        setSettings(parsed);
        if (parsed.target.type === 'manual' && parsed.target.paceSecondsPerKm) {
          setManualPace(formatManualPace(parsed.target.paceSecondsPerKm));
        }
        if (parsed.target.type === 'pb') {
          setPbTargetDistanceKm(formatTargetDistanceInput(parsed.target.targetDistanceMeters));
        }
      } catch {}
      hasHydratedRef.current = true;
      setLoaded(true);
    })();
  }, []);

  // Save settings on change
  useEffect(() => {
    if (!loaded || !hasHydratedRef.current) return;
    savePaceKeeperSettings(settings).catch(() => {});
  }, [settings, loaded]);

  const updateTrigger = useCallback((trigger: PaceKeeperTrigger) => {
    setSettings((prev) => ({ ...prev, trigger }));
  }, []);

  const updatePbTargetDistance = useCallback((targetDistanceMeters: number) => {
    setSettings((prev) => ({
      ...prev,
      target: prev.target.type === 'pb'
        ? { ...prev.target, targetDistanceMeters }
        : { type: 'pb', targetDistanceMeters },
    }));
  }, []);

  const commitPbTargetDistance = useCallback(
    (text: string) => {
      const parsedMeters = parseTargetDistanceKm(text);
      const fallbackMeters =
        settings.target.type === 'pb'
          ? settings.target.targetDistanceMeters
          : DEFAULT_PB_TARGET_DISTANCE_METERS;

      if (parsedMeters === null) {
        setPbTargetDistanceKm(formatTargetDistanceInput(fallbackMeters));
        if (settings.target.type === 'pb') {
          setSettings((prev) => ({
            ...prev,
            target: { type: 'pb', targetDistanceMeters: fallbackMeters },
          }));
        }
        return;
      }

      setPbTargetDistanceKm(formatTargetDistanceInput(parsedMeters));
      updatePbTargetDistance(parsedMeters);
    },
    [settings.target, updatePbTargetDistance]
  );

  const commitManualTarget = useCallback(
    (text: string) => {
      const parsedSeconds = parseManualPace(text);
      const fallbackSeconds =
        settings.target.type === 'manual' ? settings.target.paceSecondsPerKm : DEFAULT_SETTINGS.target.type === 'manual' ? DEFAULT_SETTINGS.target.paceSecondsPerKm : 300;

      if (parsedSeconds === null || parsedSeconds <= 0) {
        setManualPace(formatManualPace(fallbackSeconds));
        if (settings.target.type === 'manual') {
          setSettings((prev) => ({
            ...prev,
            target: { type: 'manual', paceSecondsPerKm: fallbackSeconds },
          }));
        }
        return;
      }

      const formatted = formatManualPace(parsedSeconds);
      setManualPace(formatted);
      setSettings((prev) => ({
        ...prev,
        target: { type: 'manual', paceSecondsPerKm: parsedSeconds },
      }));
    },
    [settings.target]
  );

  const handleManualPaceChange = useCallback((text: string) => {
    setManualPace(sanitizeManualPaceInput(text));
  }, []);

  const handleManualPaceBlur = useCallback(() => {
    commitManualTarget(manualPace);
  }, [commitManualTarget, manualPace]);

  const handlePbTargetDistanceChange = useCallback((text: string) => {
    setPbTargetDistanceKm(sanitizeDistanceInput(text));
  }, []);

  const handlePbTargetDistanceBlur = useCallback(() => {
    commitPbTargetDistance(pbTargetDistanceKm);
  }, [commitPbTargetDistance, pbTargetDistanceKm]);

  // Don't show config when run is active
  if (activeRun) {
    if (!settings.enabled) return null;
    return (
      <View style={styles.liveIndicator}>
        <View style={[styles.liveDot, activeRun.isPaused && styles.liveDotPaused]} />
        <Text style={styles.liveText}>
          Pace keeper {activeRun.isPaused ? 'paused' : 'active'}
        </Text>
      </View>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Pace Keeper</Text>
        <Switch
          value={settings.enabled}
          onValueChange={(enabled) => setSettings((prev) => ({ ...prev, enabled }))}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#fff"
        />
      </View>

      {settings.enabled ? (
        <>
          <Text style={styles.label}>Announce every</Text>
          <View style={styles.optionRow}>
            {TRIGGER_OPTIONS.map((opt) => {
              const active = triggerKey(settings.trigger) === triggerKey(opt.trigger);
              return (
                <Pressable
                  key={opt.label}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => updateTrigger(opt.trigger)}
                >
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Compare against</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionChip, settings.target.type === 'pb' && styles.optionChipActive]}
              onPress={() =>
                setSettings((prev) => ({
                  ...prev,
                  target:
                    prev.target.type === 'pb'
                      ? prev.target
                      : { type: 'pb', targetDistanceMeters: DEFAULT_PB_TARGET_DISTANCE_METERS },
                }))
              }
            >
              <Text style={[styles.optionChipText, settings.target.type === 'pb' && styles.optionChipTextActive]}>
                Target PB
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionChip, settings.target.type === 'manual' && styles.optionChipActive]}
              onPress={() => commitManualTarget(manualPace)}
            >
              <Text style={[styles.optionChipText, settings.target.type === 'manual' && styles.optionChipTextActive]}>
                Manual
              </Text>
            </Pressable>
          </View>

          {settings.target.type === 'pb' ? (
            <>
              {pbBenchmarkPace !== null ? (
                <Text style={styles.helperText}>
                  Helm compares you against your PB pace for the target distance you enter here.
                </Text>
              ) : (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    You have not logged a previous run near this distance yet. This run will set
                    the benchmark, so Helm will call out time, distance, and pace only.
                  </Text>
                </View>
              )}
              <View style={styles.manualRow}>
                <Text style={styles.manualLabel}>Target distance (km)</Text>
                <TextInput
                  style={styles.manualInput}
                  value={pbTargetDistanceKm}
                  onChangeText={handlePbTargetDistanceChange}
                  onBlur={handlePbTargetDistanceBlur}
                  keyboardType="decimal-pad"
                  placeholder="5"
                  placeholderTextColor={colors.muted}
                  maxLength={6}
                />
              </View>
            </>
          ) : null}

          {settings.target.type === 'manual' ? (
            <View style={styles.manualRow}>
              <Text style={styles.manualLabel}>Target pace (min:sec /km)</Text>
              <TextInput
                style={styles.manualInput}
                value={manualPace}
                onChangeText={handleManualPaceChange}
                onBlur={handleManualPaceBlur}
                keyboardType="numbers-and-punctuation"
                placeholder="5:00"
                placeholderTextColor={colors.muted}
                maxLength={6}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  label: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  helperText: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
    fontSize: 13,
  },
  warningBox: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}14`,
  },
  warningText: {
    ...typography.body,
    color: colors.danger,
    fontSize: 13,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  optionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionChipText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  optionChipTextActive: {
    color: colors.accent,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  manualLabel: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  manualInput: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.background,
    width: 70,
    textAlign: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveDotPaused: {
    backgroundColor: colors.muted,
  },
  liveText: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
});
