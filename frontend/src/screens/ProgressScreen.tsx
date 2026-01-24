import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { estimateOneRepMax, useWorkoutStore } from '../store/workoutStore';
import { colors, spacing, typography } from '../theme';

const weekInMs = 7 * 24 * 60 * 60 * 1000;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function formatShortDate(date: Date) {
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function ProgressScreen() {
  const { workouts, isLoading, error, clearError } = useWorkoutStore();

  const progress = useMemo(() => {
    const sets = workouts.flatMap((workout) =>
      workout.exercises.flatMap((exercise) =>
        exercise.sets.map((set) => ({
          exercise: exercise.name,
          weight: set.weight,
          reps: set.reps,
          createdAt: workout.endedAt,
        }))
      )
    );

    const totals = sets.reduce(
      (acc, set) => {
        acc.volume += set.weight * set.reps;
        acc.sets += 1;
        return acc;
      },
      { volume: 0, sets: 0 }
    );

    const exerciseMap = sets.reduce<Record<string, {
      exercise: string;
      maxEstimate: number;
      lastWeight: number;
      lastReps: number;
      lastDate: number;
    }>>((acc, set) => {
      const estimate = estimateOneRepMax(set.weight, set.reps);
      const current = acc[set.exercise];
      if (!current) {
        acc[set.exercise] = {
          exercise: set.exercise,
          maxEstimate: estimate,
          lastWeight: set.weight,
          lastReps: set.reps,
          lastDate: set.createdAt,
        };
      } else {
        current.maxEstimate = Math.max(current.maxEstimate, estimate);
        if (set.createdAt > current.lastDate) {
          current.lastDate = set.createdAt;
          current.lastWeight = set.weight;
          current.lastReps = set.reps;
        }
      }
      return acc;
    }, {});

    const lifts = Object.values(exerciseMap).sort((a, b) => b.maxEstimate - a.maxEstimate);

    const now = new Date();
    const currentWeekStart = startOfWeek(now);
    const buckets = Array.from({ length: 6 }, () => 0);
    const labels = Array.from({ length: 6 }, (_, index) => {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (5 - index) * 7);
      return formatShortDate(weekStart);
    });

    sets.forEach((set) => {
      const entryWeekStart = startOfWeek(new Date(set.createdAt));
      const diffWeeks = Math.floor(
        (currentWeekStart.getTime() - entryWeekStart.getTime()) / weekInMs
      );
      if (diffWeeks >= 0 && diffWeeks < buckets.length) {
        const bucketIndex = buckets.length - diffWeeks - 1;
        buckets[bucketIndex] += set.weight * set.reps;
      }
    });

    const volumeTrend = buckets.map((value, index) => ({
      label: labels[index],
      value: Math.round(value),
    }));

    return {
      totals: {
        volume: Math.round(totals.volume),
        sets: totals.sets,
      },
      lifts: lifts.slice(0, 5),
      volumeTrend,
    };
  }, [workouts]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lifetime progress</Text>
        <Text style={styles.subtitle}>Trends across every logged session.</Text>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{progress.totals.sets}</Text>
                <Text style={styles.metricLabel}>Total sets</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricValue}>{progress.totals.volume}</Text>
                <Text style={styles.metricLabel}>Lifetime volume (kg)</Text>
              </Card>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Volume trend</Text>
              <BarChart data={progress.volumeTrend} unit="kg" />
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Top lifts</Text>
              {progress.lifts.length === 0 ? (
                <Text style={styles.emptyText}>Log workouts to see lift trends.</Text>
              ) : (
                progress.lifts.map((lift) => (
                  <View key={lift.exercise} style={styles.liftRow}>
                    <View>
                      <Text style={styles.liftName}>{lift.exercise}</Text>
                      <Text style={styles.liftSub}>
                        Last: {lift.lastWeight} kg x {lift.lastReps}
                      </Text>
                    </View>
                    <Text style={styles.liftValue}>{Math.round(lift.maxEstimate)} kg</Text>
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
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  liftName: {
    ...typography.body,
    color: colors.text,
  },
  liftSub: {
    ...typography.body,
    color: colors.muted,
  },
  liftValue: {
    ...typography.headline,
    color: colors.text,
  },
});
