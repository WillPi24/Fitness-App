import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

export type BarChartDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  unit?: string;
};

// Lightweight horizontal bar chart for simple trend visualizations.
export function BarChart({ data, unit }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const width =
          maxValue === 0 ? 0 : Math.round((item.value / maxValue) * 100);
        return (
          <View key={item.label} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${width}%` }]} />
            </View>
            <Text style={styles.value}>
              {item.value}
              {unit ? ` ${unit}` : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.muted,
  },
  barTrack: {
    height: 10,
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
});
