import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

export type RunSplit = {
  km: number;
  timeMs: number;
};

type SplitTimesDisplayProps = {
  splits: RunSplit[];
  isLive?: boolean;
};

function formatSplitPace(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function SplitTimesDisplay({ splits, isLive }: SplitTimesDisplayProps) {
  if (splits.length === 0) return null;

  // Compute per-km pace (delta from previous split)
  const paces = splits.map((split, i) => {
    const prevTime = i > 0 ? splits[i - 1].timeMs : 0;
    return split.timeMs - prevTime;
  });

  const fastest = Math.min(...paces);
  const slowest = Math.max(...paces);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLive ? 'Splits' : 'Split Times'}
      </Text>
      {splits.map((split, i) => {
        const pace = paces[i];
        const isFastest = paces.length > 1 && pace === fastest;
        const isSlowest = paces.length > 1 && pace === slowest;
        return (
          <View key={split.km} style={styles.row}>
            <Text style={styles.km}>Km {split.km}</Text>
            <Text
              style={[
                styles.pace,
                isFastest && styles.fastest,
                isSlowest && styles.slowest,
              ]}
            >
              {formatSplitPace(pace)} /km
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  title: {
    ...typography.label,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  km: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  pace: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  fastest: {
    color: colors.success,
  },
  slowest: {
    color: colors.accent,
  },
});
