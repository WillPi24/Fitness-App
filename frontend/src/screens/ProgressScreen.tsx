import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { ErrorBanner } from '../components/ErrorBanner';
import { LineGraph } from '../components/LineGraph';
import { EXERCISE_OPTIONS } from '../data/exercises';
import { estimateOneRepMax, useWorkoutStore } from '../store/workoutStore';
import { colors, spacing, typography } from '../theme';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type SectionKey =
  | 'snapshot'
  | 'volume'
  | 'sets'
  | 'workouts'
  | 'strength'
  | 'muscles';

type CanonicalBodyPart =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Quads'
  | 'Hamstrings/Glutes'
  | 'Calves'
  | 'Triceps'
  | 'Biceps'
  | 'Forearms'
  | 'Abs/Core'
  | 'Other';

type LiftTrend = {
  exercise: string;
  first: number;
  latest: number;
  delta: number;
  deltaPercent: number;
  points: Array<number | null>;
};

type MuscleTrend = {
  bodyPart: CanonicalBodyPart;
  values: number[];
  total: number;
  currentMonth: number;
  previousMonth: number;
  delta: number;
};

const BODY_PARTS: CanonicalBodyPart[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings/Glutes',
  'Calves',
  'Triceps',
  'Biceps',
  'Forearms',
  'Abs/Core',
  'Other',
];

const bodyPartAliases: Record<string, CanonicalBodyPart> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  quads: 'Quads',
  'hams/glutes': 'Hamstrings/Glutes',
  'hams / glutes': 'Hamstrings/Glutes',
  'hamstrings / glutes': 'Hamstrings/Glutes',
  hamstrings: 'Hamstrings/Glutes',
  glutes: 'Hamstrings/Glutes',
  calves: 'Calves',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  forearm: 'Forearms',
  'abs/core': 'Abs/Core',
  'abs / core': 'Abs/Core',
  abs: 'Abs/Core',
  core: 'Abs/Core',
};

function formatMonth(date: Date) {
  return `${months[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

function startOfMonth(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(1);
  return start;
}

function formatCompactNumber(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return `${Math.round(value)}`;
}

function formatSigned(value: number) {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

function normalizeBodyPart(bodyPart: string): CanonicalBodyPart | null {
  const normalized = bodyPart.trim().toLowerCase();
  return bodyPartAliases[normalized] ?? null;
}

function inferBodyPartFromExerciseName(name: string): CanonicalBodyPart {
  const normalized = name.trim().toLowerCase();
  if (
    /(tricep|skullcrusher|pushdown|kickback|close[-\s]?grip bench|overhead extension)/.test(
      normalized,
    )
  ) {
    return 'Triceps';
  }
  if (/(bench|chest|pec|fly|pullover)/.test(normalized)) {
    return 'Chest';
  }
  if (
    /(rdl|romanian|stiff[-\s]?leg|hip thrust|glute|leg curl|hamstring|ghr|pull[-\s]?through)/.test(
      normalized,
    )
  ) {
    return 'Hamstrings/Glutes';
  }
  if (/(row|pull[-\s]?up|chin[-\s]?up|pulldown|lat|trap|deadlift)/.test(normalized)) {
    return 'Back';
  }
  if (
    /(overhead press|shoulder|lateral raise|front raise|rear delt|upright row|arnold press)/.test(
      normalized,
    )
  ) {
    return 'Shoulders';
  }
  if (/(squat|leg press|lunge|leg extension|split squat|quad)/.test(normalized)) {
    return 'Quads';
  }
  if (/(calf)/.test(normalized)) {
    return 'Calves';
  }
  if (/(forearm|wrist\s*curl|reverse\s*curl|wrist\s*roller|grip|farmer'?s\s*carry)/.test(normalized)) {
    return 'Forearms';
  }
  if (/(bicep|curl|preacher|hammer)/.test(normalized)) {
    return 'Biceps';
  }
  if (/(ab\b|core|oblique|crunch|plank|rollout|woodchopper|leg raise)/.test(normalized)) {
    return 'Abs/Core';
  }
  return 'Other';
}

type CollapsibleSectionProps = {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function CollapsibleSection({
  title,
  summary,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Card>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSummary}>{summary}</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.muted}
        />
      </Pressable>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </Card>
  );
}

export function ProgressScreen() {
  const { workouts, isLoading, error, clearError, seedDemoWorkouts, clearDemoWorkouts } =
    useWorkoutStore();
  const insets = useSafeAreaInsets();

  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    snapshot: false,
    volume: false,
    sets: false,
    workouts: false,
    strength: false,
    muscles: false,
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const exerciseBodyPartLookup = useMemo(() => {
    const lookup = new Map<string, CanonicalBodyPart>();
    EXERCISE_OPTIONS.forEach((option) => {
      const bodyPart = normalizeBodyPart(option.bodyPart);
      if (!bodyPart) {
        return;
      }
      lookup.set(option.name.trim().toLowerCase(), bodyPart);
    });
    return lookup;
  }, []);

  const progress = useMemo(() => {
    if (workouts.length === 0) {
      const now = startOfMonth(new Date());
      const label = formatMonth(now);
      return {
        monthLabels: [label],
        startLabel: label,
        endLabel: label,
        lifetime: {
          workouts: 0,
          sets: 0,
          volume: 0,
          avgSetsPerWorkout: 0,
          avgVolumePerWorkout: 0,
        },
        currentMonth: { workouts: 0, sets: 0, volume: 0 },
        previousMonth: { workouts: 0, sets: 0, volume: 0 },
        avgWorkoutsPerMonth: 0,
        volumeTrend: [0],
        setTrend: [0],
        workoutTrend: [0],
        topLiftTrends: [] as LiftTrend[],
        muscleTrends: [] as MuscleTrend[],
      };
    }

    const earliestWorkoutAt = workouts.reduce(
      (min, workout) => Math.min(min, workout.startedAt, workout.endedAt),
      workouts[0].startedAt,
    );
    const earliestMonth = startOfMonth(new Date(earliestWorkoutAt));
    const currentMonth = startOfMonth(new Date());

    const monthStarts: Date[] = [];
    const cursor = new Date(earliestMonth);
    while (cursor <= currentMonth) {
      monthStarts.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthLabels = monthStarts.map(formatMonth);
    const monthIndexByKey = new Map(
      monthStarts.map((date, index) => [monthKey(date), index] as const),
    );

    const monthlyVolume = Array.from({ length: monthStarts.length }, () => 0);
    const monthlySets = Array.from({ length: monthStarts.length }, () => 0);
    const monthlyWorkoutIds = Array.from(
      { length: monthStarts.length },
      () => new Set<string>(),
    );
    const muscleMonthlySets: Record<CanonicalBodyPart, number[]> = Object.fromEntries(
      BODY_PARTS.map((part) => [
        part,
        Array.from({ length: monthStarts.length }, () => 0),
      ]),
    ) as Record<CanonicalBodyPart, number[]>;

    let totalSets = 0;
    let totalVolume = 0;

    const exerciseMonthBest = new Map<string, Array<number | null>>();

    workouts.forEach((workout) => {
      const index = monthIndexByKey.get(monthKey(new Date(workout.startedAt)));
      if (index === undefined) {
        return;
      }

      monthlyWorkoutIds[index].add(workout.id);

      workout.exercises.forEach((exercise) => {
        const exerciseKey = exercise.name.trim().toLowerCase();
        const bodyPart =
          exerciseBodyPartLookup.get(exerciseKey) ??
          inferBodyPartFromExerciseName(exercise.name);

        muscleMonthlySets[bodyPart][index] += exercise.sets.length;

        let bestEstimateForMonth = 0;
        exercise.sets.forEach((set) => {
          const volume = set.weight * set.reps;
          const estimate = estimateOneRepMax(set.weight, set.reps);

          totalSets += 1;
          totalVolume += volume;
          monthlySets[index] += 1;
          monthlyVolume[index] += volume;

          if (estimate > bestEstimateForMonth) {
            bestEstimateForMonth = estimate;
          }
        });

        if (bestEstimateForMonth > 0) {
          const trend = exerciseMonthBest.get(exercise.name) ??
            Array.from({ length: monthStarts.length }, () => null);
          const currentValue = trend[index];
          trend[index] =
            currentValue === null
              ? Math.round(bestEstimateForMonth)
              : Math.max(currentValue, Math.round(bestEstimateForMonth));
          exerciseMonthBest.set(exercise.name, trend);
        }
      });
    });

    const monthlyWorkouts = monthlyWorkoutIds.map((item) => item.size);
    const currentMonthIndex = monthStarts.length - 1;
    const previousMonthIndex = Math.max(0, currentMonthIndex - 1);

    const currentMonthStats = {
      workouts: monthlyWorkouts[currentMonthIndex],
      sets: monthlySets[currentMonthIndex],
      volume: Math.round(monthlyVolume[currentMonthIndex]),
    };

    const previousMonthStats = {
      workouts: monthlyWorkouts[previousMonthIndex],
      sets: monthlySets[previousMonthIndex],
      volume: Math.round(monthlyVolume[previousMonthIndex]),
    };

    const topLiftTrends = Array.from(exerciseMonthBest.entries())
      .map(([exercise, points]): LiftTrend | null => {
        const values = points.filter((value): value is number => value !== null);
        if (values.length < 2) {
          return null;
        }

        const first = values[0];
        const latest = values[values.length - 1];
        const delta = latest - first;
        const deltaPercent = first > 0 ? (delta / first) * 100 : 0;

        return {
          exercise,
          first,
          latest,
          delta,
          deltaPercent,
          points,
        };
      })
      .filter((trend): trend is LiftTrend => trend !== null)
      .sort((a, b) => {
        if (b.delta !== a.delta) {
          return b.delta - a.delta;
        }
        return b.latest - a.latest;
      })
      .slice(0, 8);

    const muscleTrends = (Object.entries(
      muscleMonthlySets,
    ) as [CanonicalBodyPart, number[]][])
      .map(([bodyPart, values]): MuscleTrend => {
        const total = values.reduce((sum, value) => sum + value, 0);
        return {
          bodyPart,
          values,
          total,
          currentMonth: values[currentMonthIndex],
          previousMonth: values[previousMonthIndex],
          delta: values[currentMonthIndex] - values[previousMonthIndex],
        };
      })
      .filter((trend) => trend.total > 0 && trend.bodyPart !== 'Other')
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return {
      monthLabels,
      startLabel: monthLabels[0],
      endLabel: monthLabels[monthLabels.length - 1],
      lifetime: {
        workouts: workouts.length,
        sets: totalSets,
        volume: Math.round(totalVolume),
        avgSetsPerWorkout: workouts.length > 0 ? totalSets / workouts.length : 0,
        avgVolumePerWorkout:
          workouts.length > 0 ? totalVolume / workouts.length : 0,
      },
      currentMonth: currentMonthStats,
      previousMonth: previousMonthStats,
      avgWorkoutsPerMonth:
        monthlyWorkouts.reduce((sum, value) => sum + value, 0) /
        monthlyWorkouts.length,
      volumeTrend: monthlyVolume.map((value) => Math.round(value)),
      setTrend: monthlySets,
      workoutTrend: monthlyWorkouts,
      topLiftTrends,
      muscleTrends,
    };
  }, [workouts, exerciseBodyPartLookup]);

  const strengthSummary = useMemo(() => {
    if (progress.topLiftTrends.length === 0) {
      return 'No repeated lift history yet';
    }
    const best = progress.topLiftTrends[0];
    return `${best.exercise}: ${formatSigned(best.delta)}kg`;
  }, [progress.topLiftTrends]);

  const muscleSummary = useMemo(() => {
    if (progress.muscleTrends.length === 0) {
      return 'No mapped muscle-set data yet';
    }
    const top = progress.muscleTrends[0];
    return `${top.bodyPart}: ${top.total} sets`;
  }, [progress.muscleTrends]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
      >
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Lifetime trends for strength, volume, and training balance.</Text>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
        {!isLoading && __DEV__ ? (
          <Card>
            <Pressable style={styles.devSeedButton} onPress={seedDemoWorkouts}>
              <Text style={styles.devSeedButtonText}>Load Sample Progress Data</Text>
            </Pressable>
            <Pressable style={styles.devClearButton} onPress={clearDemoWorkouts}>
              <Text style={styles.devClearButtonText}>Clear Sample Data</Text>
            </Pressable>
            <Text style={styles.devSeedHint}>
              Dev-only tools. Sample entries can be added and removed without deleting your own logs.
            </Text>
          </Card>
        ) : null}

        {isLoading ? (
          <Card>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : workouts.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Log workouts to unlock progress analytics.</Text>
          </Card>
        ) : (
          <>
            <CollapsibleSection
              title="Snapshot"
              summary={`This month: ${progress.currentMonth.workouts} workouts, ${progress.currentMonth.sets} sets`}
              expanded={expandedSections.snapshot}
              onToggle={() => toggleSection('snapshot')}
            >
              <View style={styles.snapshotGrid}>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{progress.lifetime.workouts}</Text>
                  <Text style={styles.snapshotLabel}>Lifetime workouts</Text>
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{formatCompactNumber(progress.lifetime.sets)}</Text>
                  <Text style={styles.snapshotLabel}>Lifetime sets</Text>
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{formatCompactNumber(progress.lifetime.volume)}</Text>
                  <Text style={styles.snapshotLabel}>Lifetime volume (kg)</Text>
                </View>
              </View>
              <View style={styles.snapshotGrid}>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{progress.currentMonth.workouts}</Text>
                  <Text style={styles.snapshotLabel}>Workouts this month</Text>
                  <Text style={styles.snapshotDelta}>
                    {formatSigned(
                      progress.currentMonth.workouts - progress.previousMonth.workouts,
                    )}{' '}
                    vs last month
                  </Text>
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{progress.currentMonth.sets}</Text>
                  <Text style={styles.snapshotLabel}>Sets this month</Text>
                  <Text style={styles.snapshotDelta}>
                    {formatSigned(progress.currentMonth.sets - progress.previousMonth.sets)} vs last month
                  </Text>
                </View>
                <View style={styles.snapshotItem}>
                  <Text style={styles.snapshotValue}>{formatCompactNumber(progress.currentMonth.volume)}</Text>
                  <Text style={styles.snapshotLabel}>Volume this month (kg)</Text>
                  <Text style={styles.snapshotDelta}>
                    {formatSigned(progress.currentMonth.volume - progress.previousMonth.volume)} vs last month
                  </Text>
                </View>
              </View>
              <Text style={styles.helperText}>
                Avg workouts/month: {progress.avgWorkoutsPerMonth.toFixed(1)}. Avg volume/workout:{' '}
                {formatCompactNumber(progress.lifetime.avgVolumePerWorkout)}kg.
              </Text>
            </CollapsibleSection>

            <CollapsibleSection
              title="Volume Over Lifetime"
              summary={`${formatCompactNumber(progress.lifetime.volume)}kg total`}
              expanded={expandedSections.volume}
              onToggle={() => toggleSection('volume')}
            >
              <LineGraph
                data={progress.volumeTrend}
                valueSuffix="kg"
                startLabel={progress.startLabel}
                endLabel={progress.endLabel}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Sets Over Lifetime"
              summary={`${formatCompactNumber(progress.lifetime.sets)} sets total`}
              expanded={expandedSections.sets}
              onToggle={() => toggleSection('sets')}
            >
              <LineGraph
                data={progress.setTrend}
                startLabel={progress.startLabel}
                endLabel={progress.endLabel}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Workout Frequency Over Lifetime"
              summary={`${progress.avgWorkoutsPerMonth.toFixed(1)} workouts/month avg`}
              expanded={expandedSections.workouts}
              onToggle={() => toggleSection('workouts')}
            >
              <LineGraph
                data={progress.workoutTrend}
                startLabel={progress.startLabel}
                endLabel={progress.endLabel}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Strength Over Lifetime"
              summary={strengthSummary}
              expanded={expandedSections.strength}
              onToggle={() => toggleSection('strength')}
            >
              {progress.topLiftTrends.length === 0 ? (
                <Text style={styles.emptyText}>Add repeated sessions on the same lift to show trends.</Text>
              ) : (
                progress.topLiftTrends.map((trend) => (
                  <View key={trend.exercise} style={styles.trendItem}>
                    <View style={styles.trendHeader}>
                      <Text style={styles.liftName}>{trend.exercise}</Text>
                      <Text style={styles.liftValue}>{trend.latest}kg</Text>
                    </View>
                    <Text style={styles.liftSub}>
                      Start {trend.first}kg to now {trend.latest}kg ({formatSigned(trend.delta)}kg,{' '}
                      {formatSigned(Math.round(trend.deltaPercent))}%)
                    </Text>
                    <LineGraph data={trend.points} compact height={36} color={colors.accent} />
                  </View>
                ))
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Muscle-Group Sets Over Lifetime"
              summary={muscleSummary}
              expanded={expandedSections.muscles}
              onToggle={() => toggleSection('muscles')}
            >
              {progress.muscleTrends.length === 0 ? (
                <Text style={styles.emptyText}>No mapped muscle-group data yet.</Text>
              ) : (
                progress.muscleTrends.map((trend) => (
                  <View key={trend.bodyPart} style={styles.trendItem}>
                    <View style={styles.trendHeader}>
                      <Text style={styles.liftName}>{trend.bodyPart}</Text>
                      <Text style={styles.liftValue}>{trend.currentMonth} sets</Text>
                    </View>
                    <Text style={styles.liftSub}>
                      {formatSigned(trend.delta)} vs last month, {trend.total} total sets
                    </Text>
                    <LineGraph data={trend.values} compact height={36} color={colors.accent} />
                  </View>
                ))
              )}
            </CollapsibleSection>
          </>
        )}
      </ScrollView>
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
    paddingBottom: spacing.xl,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
  },
  sectionSummary: {
    ...typography.body,
    color: colors.muted,
  },
  sectionBody: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  snapshotGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snapshotItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.sm,
    gap: 2,
  },
  snapshotValue: {
    ...typography.headline,
    color: colors.text,
  },
  snapshotLabel: {
    ...typography.label,
    color: colors.muted,
  },
  snapshotDelta: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    ...typography.body,
    color: colors.muted,
  },
  trendItem: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liftName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  liftSub: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  liftValue: {
    ...typography.body,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  devSeedButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  devSeedButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  devSeedHint: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  devClearButton: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  devClearButtonText: {
    ...typography.label,
    color: colors.danger,
  },
});
