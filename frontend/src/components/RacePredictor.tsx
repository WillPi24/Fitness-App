import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RunSession } from '../store/runStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { CollapsibleSection } from './CollapsibleSection';

type RacePredictorProps = {
  runs: RunSession[];
  expanded: boolean;
  onToggle: () => void;
};

// Riegel formula: T2 = T1 * (D2 / D1) ^ 1.06
function predictTime(knownTimeMs: number, knownDistanceM: number, targetDistanceM: number): number {
  return knownTimeMs * Math.pow(targetDistanceM / knownDistanceM, 1.06);
}

function formatTimeHMS(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const RACE_DISTANCES = [
  { name: '5K', meters: 5000 },
  { name: '10K', meters: 10000 },
  { name: 'Half Marathon', meters: 21097 },
  { name: 'Marathon', meters: 42195 },
];

export function RacePredictor({ runs, expanded, onToggle }: RacePredictorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const bestRun = useMemo(() => {
    const cutoff = Date.now() - 90 * 86400000;
    let fastest: RunSession | null = null;
    let bestPace = Infinity;

    for (const run of runs) {
      if (run.endedAt < cutoff) continue;
      if (run.distanceMeters < 1000 || run.durationMs <= 0) continue;

      const pace = run.durationMs / run.distanceMeters;
      if (pace < bestPace) {
        bestPace = pace;
        fastest = run;
      }
    }
    return fastest;
  }, [runs]);

  const predictions = useMemo(() => {
    if (!bestRun) return [];
    return RACE_DISTANCES.map((race) => ({
      name: race.name,
      time: formatTimeHMS(predictTime(bestRun.durationMs, bestRun.distanceMeters, race.meters)),
    }));
  }, [bestRun]);

  const sourceLabel = bestRun
    ? `Based on your ${(bestRun.distanceMeters / 1000).toFixed(1)}km in ${formatTimeHMS(bestRun.durationMs)}`
    : 'No qualifying runs';

  return (
    <CollapsibleSection
      title="Race Predictor"
      summary={sourceLabel}
      expanded={expanded}
      onToggle={onToggle}
    >
      {!bestRun ? (
        <Text style={styles.empty}>
          Complete a run of at least 1km in the last 90 days to see race predictions.
        </Text>
      ) : (
        <>
          <View style={styles.grid}>
            {predictions.map((pred) => (
              <View key={pred.name} style={styles.predItem}>
                <Text style={styles.predTime}>{pred.time}</Text>
                <Text style={styles.predName}>{pred.name}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>{sourceLabel}. Uses the Riegel formula.</Text>
        </>
      )}
    </CollapsibleSection>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  predItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    gap: 2,
  },
  predTime: {
    ...typography.headline,
    color: colors.accent,
    fontSize: 20,
  },
  predName: {
    ...typography.label,
    color: colors.muted,
  },
  note: {
    ...typography.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
