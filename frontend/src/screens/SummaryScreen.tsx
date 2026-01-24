import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { estimateOneRepMax, useWorkoutStore } from '../store/workoutStore';
import { colors, spacing, typography } from '../theme';

const weekInMs = 7 * 24 * 60 * 60 * 1000;

export function SummaryScreen() {
  const { workouts, isLoading, error, clearError } = useWorkoutStore();

  const summary = useMemo(() => {
    const now = Date.now();
    const weekWorkouts = workouts.filter((workout) => now - workout.endedAt <= weekInMs);
    const sets = weekWorkouts.flatMap((workout) =>
      workout.exercises.flatMap((exercise) =>
        exercise.sets.map((set) => ({
          exercise: exercise.name,
          weight: set.weight,
          reps: set.reps,
          date: workout.date,
        }))
      )
    );

    const totalSets = sets.length;
    const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
    const uniqueExercises = new Set(sets.map((set) => set.exercise)).size;
    const daysTrained = new Set(weekWorkouts.map((workout) => workout.date)).size;

    const bestLifts = Object.values(
      sets.reduce<Record<string, { exercise: string; weight: number; reps: number; estimate: number }>>(
        (acc, set) => {
          const estimate = estimateOneRepMax(set.weight, set.reps);
          const current = acc[set.exercise];
          if (!current || estimate > current.estimate) {
            acc[set.exercise] = {
              exercise: set.exercise,
              weight: set.weight,
              reps: set.reps,
              estimate,
            };
          }
          return acc;
        },
        {}
      )
    ).sort((a, b) => b.estimate - a.estimate);

    return {
      totalSets,
      totalVolume: Math.round(totalVolume),
      uniqueExercises,
      daysTrained,
      bestLifts: bestLifts.slice(0, 3),
    };
  }, [workouts]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Weekly summary</Text>
        <Text style={styles.subtitle}>Keep tabs on volume and consistency.</Text>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{summary.totalSets}</Text>
                <Text style={styles.metricLabel}>Sets logged</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{summary.totalVolume}</Text>
                <Text style={styles.metricLabel}>Total volume (kg)</Text>
              </Card>
            </View>
            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{summary.uniqueExercises}</Text>
                <Text style={styles.metricLabel}>Exercises</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{summary.daysTrained}</Text>
                <Text style={styles.metricLabel}>Days trained</Text>
              </Card>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Best lifts this week</Text>
              {summary.bestLifts.length === 0 ? (
                <Text style={styles.emptyText}>
                  Log a workout to see your weekly highlights.
                </Text>
              ) : (
                summary.bestLifts.map((lift) => (
                  <View key={lift.exercise} style={styles.liftRow}>
                    <Text style={styles.liftName}>{lift.exercise}</Text>
                    <Text style={styles.liftValue}>
                      {lift.weight} kg x {lift.reps}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricValue: {
    ...typography.headline,
    color: colors.text,
  },
  metricLabel: {
    ...typography.label,
    color: colors.muted,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  liftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  liftName: {
    ...typography.body,
    color: colors.text,
  },
  liftValue: {
    ...typography.body,
    color: colors.muted,
  },
});
