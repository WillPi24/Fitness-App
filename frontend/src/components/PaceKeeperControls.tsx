import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import {
  type PaceKeeperSettings,
  type PaceKeeperTrigger,
  DEFAULT_SETTINGS,
  buildSpeechText,
  getPBPaceSecondsPerKm,
  shouldSpeak,
} from '../services/paceKeeper';
import type { ActiveRun, RunSession } from '../store/runStore';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';

let Speech: typeof import('expo-speech') | null = null;
try {
  Speech = require('expo-speech');
} catch {}

const SETTINGS_KEY = 'fitnessapp.paceKeeperSettings.v1';

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

export function PaceKeeperControls({ runs, activeRun, elapsedMs }: PaceKeeperControlsProps) {
  const [settings, setSettings] = useState<PaceKeeperSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [manualPace, setManualPace] = useState('5:00');
  const lastSpokeDistRef = useRef(0);
  const lastSpokeTimeRef = useRef(0);

  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.enabled === 'boolean') {
            setSettings(parsed);
            if (parsed.target?.type === 'manual' && parsed.target.paceSecondsPerKm) {
              const mins = Math.floor(parsed.target.paceSecondsPerKm / 60);
              const secs = Math.round(parsed.target.paceSecondsPerKm % 60);
              setManualPace(`${mins}:${String(secs).padStart(2, '0')}`);
            }
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Save settings on change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  // Reset speech refs when run starts
  useEffect(() => {
    if (activeRun) {
      lastSpokeDistRef.current = 0;
      lastSpokeTimeRef.current = 0;
    }
  }, [activeRun?.id]);

  // Speech effect during active run
  useEffect(() => {
    if (!activeRun || !settings.enabled || !Speech || activeRun.type !== 'outdoor') return;
    if (activeRun.isPaused) return;

    const distance = activeRun.distanceMeters;

    if (
      !shouldSpeak(
        settings,
        distance,
        elapsedMs,
        lastSpokeDistRef.current,
        lastSpokeTimeRef.current,
        activeRun.isPaused,
      )
    ) {
      return;
    }

    // Compute current pace
    if (distance < 100 || elapsedMs < 1000) return;
    const currentPaceSecsPerKm = (elapsedMs / 1000) / (distance / 1000);

    // Compute target pace
    let targetPace: number | null = null;
    if (settings.target.type === 'pb') {
      targetPace = getPBPaceSecondsPerKm(runs);
    } else {
      targetPace = settings.target.paceSecondsPerKm;
    }

    const text = buildSpeechText(currentPaceSecsPerKm, targetPace, distance);
    Speech.speak(text, { rate: 0.95, pitch: 1.0 });

    lastSpokeDistRef.current = distance;
    lastSpokeTimeRef.current = elapsedMs;
  }, [activeRun?.distanceMeters, elapsedMs, activeRun?.isPaused, settings, runs]);

  // Stop speech on pause
  useEffect(() => {
    if (activeRun?.isPaused && Speech) {
      Speech.stop();
    }
  }, [activeRun?.isPaused]);

  const updateTrigger = useCallback((trigger: PaceKeeperTrigger) => {
    setSettings((prev) => ({ ...prev, trigger }));
  }, []);

  const parseManualPace = useCallback((text: string): number => {
    const [minStr, secStr] = text.split(':');
    const mins = parseInt(minStr, 10) || 0;
    const secs = parseInt(secStr, 10) || 0;
    return mins * 60 + secs;
  }, []);

  const handleManualPaceBlur = useCallback(() => {
    const secs = parseManualPace(manualPace);
    if (secs > 0) {
      setSettings((prev) => ({ ...prev, target: { type: 'manual', paceSecondsPerKm: secs } }));
    }
  }, [manualPace, parseManualPace]);

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
              onPress={() => setSettings((prev) => ({ ...prev, target: { type: 'pb' } }))}
            >
              <Text style={[styles.optionChipText, settings.target.type === 'pb' && styles.optionChipTextActive]}>
                PB Pace
              </Text>
            </Pressable>
            <Pressable
              style={[styles.optionChip, settings.target.type === 'manual' && styles.optionChipActive]}
              onPress={() =>
                setSettings((prev) => ({
                  ...prev,
                  target: { type: 'manual', paceSecondsPerKm: parseManualPace(manualPace) },
                }))
              }
            >
              <Text style={[styles.optionChipText, settings.target.type === 'manual' && styles.optionChipTextActive]}>
                Manual
              </Text>
            </Pressable>
          </View>

          {settings.target.type === 'manual' ? (
            <View style={styles.manualRow}>
              <Text style={styles.manualLabel}>Target pace (min:sec /km)</Text>
              <TextInput
                style={styles.manualInput}
                value={manualPace}
                onChangeText={setManualPace}
                onBlur={handleManualPaceBlur}
                keyboardType="numbers-and-punctuation"
                placeholder="5:00"
                placeholderTextColor={colors.muted}
              />
            </View>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
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
