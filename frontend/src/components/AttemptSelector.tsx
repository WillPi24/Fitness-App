import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getBestE1RMForLifts } from '../services/plCoefficients';
import type { WorkoutSession } from '../store/workoutStore';
import { toDisplayWeight, type WeightUnit } from '../store/userStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { CollapsibleSection } from './CollapsibleSection';

type AttemptSelectorProps = {
  workouts: WorkoutSession[];
  weightUnit: WeightUnit;
  expanded: boolean;
  onToggle: () => void;
};

const LIFTS = [
  { key: 'squat', label: 'Squat' },
  { key: 'bench', label: 'Bench Press' },
  { key: 'deadlift', label: 'Deadlift' },
];

const ATTEMPT_PERCENTS = [
  { label: 'Opener', pct: 0.88 },
  { label: 'Second', pct: 0.94 },
  { label: 'Third', pct: 1.0 },
];

export function AttemptSelector({ workouts, weightUnit, expanded, onToggle }: AttemptSelectorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bests = useMemo(() => getBestE1RMForLifts(workouts), [workouts]);

  const hasData = bests.squat > 0 || bests.bench > 0 || bests.deadlift > 0;

  return (
    <CollapsibleSection
      title="Attempt Selector"
      summary={hasData ? 'Based on last 4 weeks of training' : 'No recent squat/bench/deadlift data'}
      expanded={expanded}
      onToggle={onToggle}
    >
      {!hasData ? (
        <Text style={styles.empty}>Log squat, bench press, or deadlift sessions to get attempt suggestions.</Text>
      ) : (
        <>
          <View style={styles.headerRow}>
            <View style={styles.liftCol} />
            {ATTEMPT_PERCENTS.map((a) => (
              <Text key={a.label} style={styles.headerLabel}>{a.label}</Text>
            ))}
          </View>
          {LIFTS.map(({ key, label }) => {
            const e1rm = bests[key];
            if (e1rm === 0) return null;
            return (
              <View key={key} style={styles.row}>
                <Text style={styles.liftName}>{label}</Text>
                {ATTEMPT_PERCENTS.map((a) => (
                  <Text key={a.label} style={styles.attemptValue}>
                    {Math.round(toDisplayWeight(e1rm * a.pct, weightUnit))}
                  </Text>
                ))}
              </View>
            );
          })}
          <Text style={styles.unitNote}>All values in {weightUnit}. Percentages: 88% / 94% / 100% of estimated 1RM.</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liftCol: {
    flex: 2,
  },
  headerLabel: {
    ...typography.label,
    color: colors.muted,
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liftName: {
    ...typography.body,
    color: colors.text,
    flex: 2,
  },
  attemptValue: {
    ...typography.headline,
    color: colors.accent,
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
  },
  unitNote: {
    ...typography.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
