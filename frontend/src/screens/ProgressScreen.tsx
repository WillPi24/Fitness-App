import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttemptSelector } from '../components/AttemptSelector';
import { Card } from '../components/Card';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ErrorBanner } from '../components/ErrorBanner';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { LineGraph } from '../components/LineGraph';
import { MeetSimulator } from '../components/MeetSimulator';
import { RacePredictor } from '../components/RacePredictor';
import { EXERCISE_OPTIONS } from '../data/exercises';
import { useRunStore } from '../store/runStore';
import { FeatureGate } from '../components/FeatureGate';
import { useUserStore, useFeatureEnabled, toDisplayWeight } from '../store/userStore';
import { estimateOneRepMax, isWarmupSet, useWorkoutStore } from '../store/workoutStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

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

type ProgressTab = 'workouts' | 'cardio';

type WorkoutSectionKey =
  | 'snapshot'
  | 'volume'
  | 'sets'
  | 'workouts'
  | 'strength'
  | 'muscles'
  | 'meetSim'
  | 'attemptSelector';

type CardioSectionKey = 'cardioSnapshot' | 'cardioDistance' | 'cardioPace' | 'cardioFrequency' | 'racePredictor';

type SectionKey = WorkoutSectionKey | CardioSectionKey;

type CanonicalBodyPart =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
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

type ExpandedGraph = {
  title: string;
  data: Array<number | null>;
  labels?: string[];
  valueSuffix?: string;
  startLabel: string;
  endLabel: string;
};

const BODY_PARTS: CanonicalBodyPart[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings',
  'Glutes',
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
  hamstrings: 'Hamstrings',
  'hams/glutes': 'Hamstrings',
  'hams / glutes': 'Hamstrings',
  'hamstrings / glutes': 'Hamstrings',
  glutes: 'Glutes',
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
  if (/(hip thrust|glute|pull[-\s]?through)/.test(normalized)) {
    return 'Glutes';
  }
  if (/(rdl|romanian|stiff[-\s]?leg|leg curl|hamstring|ghr|nordic)/.test(normalized)) {
    return 'Hamstrings';
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

/* CollapsibleSection imported from ../components/CollapsibleSection */

/* ─── Pressable graph wrapper ─── */

type PressableGraphProps = {
  title: string;
  data: Array<number | null>;
  labels?: string[];
  valueSuffix?: string;
  startLabel: string;
  endLabel: string;
  compact?: boolean;
  height?: number;
  color?: string;
  onExpand: (graph: ExpandedGraph) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

function PressableGraph({
  title,
  data,
  labels,
  valueSuffix,
  startLabel,
  endLabel,
  compact,
  height,
  color,
  onExpand,
  onInteractionStart,
  onInteractionEnd,
}: PressableGraphProps) {
  return (
    <Pressable
      onPress={() => onExpand({ title, data, labels, valueSuffix, startLabel, endLabel })}
    >
      <LineGraph
        data={data}
        labels={compact ? undefined : labels}
        valueSuffix={valueSuffix}
        startLabel={compact ? undefined : startLabel}
        endLabel={compact ? undefined : endLabel}
        compact={compact}
        height={height}
        color={color}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
    </Pressable>
  );
}

/* ─── Full-screen graph modal ─── */

type GraphModalProps = {
  graph: ExpandedGraph | null;
  onClose: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
};

function GraphModal({ graph, onClose, colors, styles }: GraphModalProps) {
  return (
    <Modal
      visible={graph !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.graphModalBackdrop}>
        <View style={styles.graphModalContent}>
          <View style={styles.graphModalHeader}>
            <Text style={styles.graphModalTitle}>{graph?.title}</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.muted} />
            </Pressable>
          </View>
          {graph ? (
            <LineGraph
              data={graph.data}
              labels={graph.labels}
              valueSuffix={graph.valueSuffix}
              startLabel={graph.startLabel}
              endLabel={graph.endLabel}
              height={300}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/* ─── Main screen ─── */

export function ProgressScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { workouts, isLoading, error, clearError, seedDemoWorkouts, clearDemoWorkouts } =
    useWorkoutStore();
  const { runs, seedDemoRuns, clearDemoRuns } = useRunStore();
  const { user } = useUserStore();
  const weightUnit = user?.weightUnit ?? 'kg';
  const bodyweightKg = user?.bodyweightKg ?? 0;
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<ProgressTab>(
    user?.focus === 'cardio' ? 'cardio' : 'workouts',
  );

  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    snapshot: true,
    volume: false,
    sets: false,
    workouts: false,
    strength: false,
    muscles: false,
    meetSim: false,
    attemptSelector: false,
    cardioSnapshot: true,
    cardioDistance: false,
    cardioPace: false,
    cardioFrequency: false,
    racePredictor: false,
  });

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [expandedGraph, setExpandedGraph] = useState<ExpandedGraph | null>(null);

  const navigation = useNavigation();

  const disableSwipe = useCallback(() => {
    navigation.getParent()?.setOptions({ swipeEnabled: false });
    navigation.setOptions({ swipeEnabled: false } as any);
  }, [navigation]);

  const enableSwipe = useCallback(() => {
    navigation.getParent()?.setOptions({ swipeEnabled: true });
    navigation.setOptions({ swipeEnabled: true } as any);
  }, [navigation]);

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

  /* ─── Workout progress memo ─── */

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
        avgWorkoutDurationMin: 0,
        prsThisMonth: 0,
        prsPreviousMonth: 0,
        avgDurationThisMonth: 0,
        avgDurationPreviousMonth: 0,
        avgStrengthChange: 0,
        volumeTrend: [0],
        setTrend: [0],
        workoutTrend: [0],
        topLiftTrends: [] as LiftTrend[],
        allLiftTrends: [] as LiftTrend[],
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
    let totalDurationMs = 0;

    const exerciseMonthBest = new Map<string, Array<number | null>>();

    workouts.forEach((workout) => {
      const index = monthIndexByKey.get(monthKey(new Date(workout.startedAt)));
      if (index === undefined) {
        return;
      }

      monthlyWorkoutIds[index].add(workout.id);

      const workoutDurationMs = workout.endedAt - workout.startedAt;
      if (workoutDurationMs > 0) {
        totalDurationMs += workoutDurationMs;
      }

      workout.exercises.forEach((exercise) => {
        const exerciseKey = exercise.name.trim().toLowerCase();
        const bodyPart =
          exerciseBodyPartLookup.get(exerciseKey) ??
          inferBodyPartFromExerciseName(exercise.name);

        const workingSets = exercise.sets.filter((set) => !isWarmupSet(set, exercise));
        if (workingSets.length === 0) return;
        muscleMonthlySets[bodyPart][index] += workingSets.length;

        let bestEstimateForMonth = 0;
        workingSets.forEach((set) => {
          let volume = set.weight * set.reps;
          if (exercise.isUnilateral && set.weightR && set.repsR) {
            volume += set.weightR * set.repsR;
          }
          const estimate = estimateOneRepMax(set.weight, set.reps);

          totalSets += 1;
          totalVolume += volume;
          monthlySets[index] += 1;
          monthlyVolume[index] += volume;

          if (estimate > bestEstimateForMonth) {
            bestEstimateForMonth = estimate;
          }
          if (exercise.isUnilateral && set.weightR && set.repsR) {
            const estimateR = estimateOneRepMax(set.weightR, set.repsR);
            if (estimateR > bestEstimateForMonth) {
              bestEstimateForMonth = estimateR;
            }
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

    // PRs this month
    const currentMonthKey = monthKey(monthStarts[currentMonthIndex]);
    const previousMonthKey = currentMonthIndex !== previousMonthIndex
      ? monthKey(monthStarts[previousMonthIndex])
      : null;
    let prsThisMonth = 0;
    let prsPreviousMonth = 0;
    workouts.forEach((workout) => {
      const mk = monthKey(new Date(workout.startedAt));
      if (mk === currentMonthKey) {
        prsThisMonth += workout.personalRecords.length;
      } else if (previousMonthKey && mk === previousMonthKey) {
        prsPreviousMonth += workout.personalRecords.length;
      }
    });

    // Avg workout duration this month
    let currentMonthDurationMs = 0;
    let currentMonthWorkoutCount = 0;
    let previousMonthDurationMs = 0;
    let previousMonthWorkoutCount = 0;
    workouts.forEach((workout) => {
      const mk = monthKey(new Date(workout.startedAt));
      const dur = workout.endedAt - workout.startedAt;
      if (dur <= 0) return;
      if (mk === currentMonthKey) {
        currentMonthDurationMs += dur;
        currentMonthWorkoutCount += 1;
      } else if (previousMonthKey && mk === previousMonthKey) {
        previousMonthDurationMs += dur;
        previousMonthWorkoutCount += 1;
      }
    });
    const avgDurationThisMonth = currentMonthWorkoutCount > 0
      ? Math.round(currentMonthDurationMs / currentMonthWorkoutCount / 60000)
      : 0;
    const avgDurationPreviousMonth = previousMonthWorkoutCount > 0
      ? Math.round(previousMonthDurationMs / previousMonthWorkoutCount / 60000)
      : 0;

    // Strength change: avg e1RM % change across exercises present in both months
    let strengthChangePercent = 0;
    let strengthExerciseCount = 0;
    for (const [, points] of exerciseMonthBest) {
      const currE1RM = points[currentMonthIndex];
      const prevE1RM = points[previousMonthIndex];
      if (currE1RM !== null && prevE1RM !== null && prevE1RM > 0 && currentMonthIndex !== previousMonthIndex) {
        strengthChangePercent += ((currE1RM - prevE1RM) / prevE1RM) * 100;
        strengthExerciseCount += 1;
      }
    }
    const avgStrengthChange = strengthExerciseCount > 0
      ? Math.round((strengthChangePercent / strengthExerciseCount) * 10) / 10
      : 0;

    const allLiftTrends = Array.from(exerciseMonthBest.entries())
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
      });
    const topLiftTrends = allLiftTrends.slice(0, 8);

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
      avgWorkoutDurationMin:
        workouts.length > 0
          ? Math.round(totalDurationMs / workouts.length / 60000)
          : 0,
      prsThisMonth,
      prsPreviousMonth,
      avgDurationThisMonth,
      avgDurationPreviousMonth,
      avgStrengthChange,
      volumeTrend: monthlyVolume.map((value) => Math.round(value)),
      setTrend: monthlySets,
      workoutTrend: monthlyWorkouts,
      topLiftTrends,
      allLiftTrends,
      muscleTrends,
    };
  }, [workouts, exerciseBodyPartLookup]);

  const strengthSummary = useMemo(() => {
    if (progress.topLiftTrends.length === 0) {
      return 'No repeated lift history yet';
    }
    const best = progress.topLiftTrends[0];
    return `${best.exercise}: ${formatSigned(toDisplayWeight(best.delta, weightUnit))}${weightUnit}`;
  }, [progress.topLiftTrends, weightUnit]);

  const muscleSummary = useMemo(() => {
    if (progress.muscleTrends.length === 0) {
      return 'No mapped muscle-set data yet';
    }
    const top = progress.muscleTrends[0];
    return `${top.bodyPart}: ${top.total} sets`;
  }, [progress.muscleTrends]);

  /* ─── Cardio progress memo ─── */

  const cardioProgress = useMemo(() => {
    if (runs.length === 0) {
      return null;
    }

    const earliestRunAt = runs.reduce(
      (min, run) => Math.min(min, run.startedAt),
      runs[0].startedAt,
    );
    const earliestMonth = startOfMonth(new Date(earliestRunAt));
    const currentMonthStart = startOfMonth(new Date());

    const cardioMonthStarts: Date[] = [];
    const cursor = new Date(earliestMonth);
    while (cursor <= currentMonthStart) {
      cardioMonthStarts.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const cardioMonthLabels = cardioMonthStarts.map(formatMonth);
    const cardioMonthIndexByKey = new Map(
      cardioMonthStarts.map((date, i) => [monthKey(date), i] as const),
    );

    const monthlyDistanceM = new Array(cardioMonthStarts.length).fill(0);
    const monthlyDurationMs = new Array(cardioMonthStarts.length).fill(0);
    const monthlyRunCount: number[] = new Array(cardioMonthStarts.length).fill(0);

    let totalDistanceM = 0;
    let totalDurationMs = 0;

    // Best (lowest) pace per month - one value per session, not aggregated
    const monthlyBestPace: Array<number | null> = new Array(cardioMonthStarts.length).fill(null);

    runs.forEach((run) => {
      const idx = cardioMonthIndexByKey.get(monthKey(new Date(run.startedAt)));
      if (idx === undefined) {
        return;
      }
      monthlyDistanceM[idx] += run.distanceMeters;
      monthlyDurationMs[idx] += run.durationMs;
      monthlyRunCount[idx] += 1;
      totalDistanceM += run.distanceMeters;
      totalDurationMs += run.durationMs;

      if (run.distanceMeters > 0 && run.durationMs > 0) {
        const paceMinPerKm = (run.durationMs / 60000) / (run.distanceMeters / 1000);
        const current = monthlyBestPace[idx];
        if (current === null || paceMinPerKm < current) {
          monthlyBestPace[idx] = parseFloat(paceMinPerKm.toFixed(2));
        }
      }
    });

    const ci = cardioMonthStarts.length - 1;
    const pi = Math.max(0, ci - 1);

    const monthlyPace: Array<number | null> = cardioMonthStarts.map((_, i) => {
      if (monthlyDistanceM[i] <= 0) {
        return null;
      }
      const minutes = monthlyDurationMs[i] / 60000;
      const km = monthlyDistanceM[i] / 1000;
      return parseFloat((minutes / km).toFixed(2));
    });

    const totalHours = Math.floor(totalDurationMs / 3600000);
    const totalRemainingMin = Math.round((totalDurationMs % 3600000) / 60000);

    const avgRunsPerMonth =
      monthlyRunCount.reduce((sum, v) => sum + v, 0) / monthlyRunCount.length;

    return {
      monthLabels: cardioMonthLabels,
      startLabel: cardioMonthLabels[0],
      endLabel: cardioMonthLabels[cardioMonthLabels.length - 1],
      totalRuns: runs.length,
      totalDistanceKm: parseFloat((totalDistanceM / 1000).toFixed(1)),
      totalDurationLabel:
        totalHours > 0
          ? `${totalHours}h ${totalRemainingMin}m`
          : `${totalRemainingMin}m`,
      currentMonth: {
        runs: monthlyRunCount[ci],
        distanceKm: parseFloat((monthlyDistanceM[ci] / 1000).toFixed(1)),
        bestPace: monthlyBestPace[ci],
      },
      previousMonth: {
        runs: monthlyRunCount[pi],
        distanceKm: parseFloat((monthlyDistanceM[pi] / 1000).toFixed(1)),
        bestPace: monthlyBestPace[pi],
      },
      paceTrend: monthlyPace,
      distanceTrend: monthlyDistanceM.map((m: number) => parseFloat((m / 1000).toFixed(1))),
      runCountTrend: monthlyRunCount,
      avgRunsPerMonth,
    };
  }, [runs]);

  /* ─── Render ─── */

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
      >
        <Text style={styles.title}>Progress</Text>

        {/* Segmented control */}
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'workouts' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('workouts')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                activeTab === 'workouts' && styles.segmentButtonTextActive,
              ]}
            >
              Workouts
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'cardio' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('cardio')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                activeTab === 'cardio' && styles.segmentButtonTextActive,
              ]}
            >
              Cardio
            </Text>
          </Pressable>
        </View>

        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
        {!isLoading && __DEV__ ? (
          <Card>
            <Pressable
              style={styles.devSeedButton}
              onPress={() => {
                seedDemoWorkouts();
                seedDemoRuns();
              }}
            >
              <Text style={styles.devSeedButtonText}>Load Sample Progress Data</Text>
            </Pressable>
            <Pressable
              style={styles.devClearButton}
              onPress={() => {
                clearDemoWorkouts();
                clearDemoRuns();
              }}
            >
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
        ) : activeTab === 'workouts' ? (
          /* ═══ WORKOUT MODE ═══ */
          workouts.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Log workouts to unlock progress analytics.</Text>
            </Card>
          ) : (
            <>
              {/* Snapshot (auto-open) */}
              <CollapsibleSection
                title="Snapshot"
                summary={`${progress.prsThisMonth} PRs this month, ${progress.avgStrengthChange !== 0 ? `${formatSigned(progress.avgStrengthChange)}% strength` : 'no strength data yet'}`}
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
                    <Text style={styles.snapshotValue}>{formatCompactNumber(toDisplayWeight(progress.lifetime.volume, weightUnit))}</Text>
                    <Text style={styles.snapshotLabel}>Lifetime volume ({weightUnit})</Text>
                  </View>
                </View>
                <View style={styles.snapshotGrid}>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{progress.avgDurationThisMonth ? `${progress.avgDurationThisMonth}m` : '-'}</Text>
                    <Text style={styles.snapshotLabel}>Avg duration this month</Text>
                    {progress.avgDurationPreviousMonth > 0 ? (
                      <Text style={styles.snapshotDelta}>
                        {formatSigned(progress.avgDurationThisMonth - progress.avgDurationPreviousMonth)}m vs last month
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{progress.prsThisMonth}</Text>
                    <Text style={styles.snapshotLabel}>PRs this month</Text>
                    <Text style={styles.snapshotDelta}>
                      {formatSigned(progress.prsThisMonth - progress.prsPreviousMonth)} vs last month
                    </Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{progress.avgStrengthChange !== 0 ? `${formatSigned(progress.avgStrengthChange)}%` : '-'}</Text>
                    <Text style={styles.snapshotLabel}>Strength this month</Text>
                    {progress.avgStrengthChange !== 0 ? (
                      <Text style={styles.snapshotDelta}>
                        Avg e1RM change vs last month
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.helperText}>
                  Avg workouts/month: {progress.avgWorkoutsPerMonth.toFixed(1)}. Avg volume/workout:{' '}
                  {formatCompactNumber(toDisplayWeight(progress.lifetime.avgVolumePerWorkout, weightUnit))}{weightUnit}. Avg duration:{' '}
                  {progress.avgWorkoutDurationMin}min.
                </Text>
              </CollapsibleSection>

              {/* Strength */}
              <CollapsibleSection
                title="Strength Over Lifetime"
                summary={strengthSummary}
                expanded={expandedSections.strength}
                onToggle={() => toggleSection('strength')}
              >
                {progress.allLiftTrends.length === 0 ? (
                  <Text style={styles.emptyText}>Add repeated sessions on the same lift to show trends.</Text>
                ) : (
                  <>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search exercises..."
                      placeholderTextColor={colors.muted}
                      value={exerciseSearch}
                      onChangeText={setExerciseSearch}
                    />
                    {(() => {
                      const query = exerciseSearch.trim().toLowerCase();
                      const filtered = query
                        ? progress.allLiftTrends.filter((t) =>
                            t.exercise.toLowerCase().includes(query),
                          )
                        : showAllExercises
                          ? progress.allLiftTrends
                          : progress.topLiftTrends;

                      if (filtered.length === 0) {
                        return (
                          <Text style={styles.emptyText}>
                            No exercises matching "{exerciseSearch.trim()}"
                          </Text>
                        );
                      }

                      return filtered.map((trend) => (
                        <View key={trend.exercise} style={styles.trendItem}>
                          <View style={styles.trendHeader}>
                            <Pressable
                              style={styles.exerciseButton}
                              onPress={() => setSelectedExercise(trend.exercise)}
                            >
                              <Text style={styles.exerciseButtonText}>{trend.exercise}</Text>
                              <Feather name="chevron-right" size={14} color={colors.muted} />
                            </Pressable>
                            <Text style={styles.liftValue}>{toDisplayWeight(trend.latest, weightUnit)}{weightUnit}</Text>
                          </View>
                            <Text style={styles.liftSub}>
                              Start {toDisplayWeight(trend.first, weightUnit)}{weightUnit} to now {toDisplayWeight(trend.latest, weightUnit)}{weightUnit} ({formatSigned(toDisplayWeight(trend.delta, weightUnit))}{weightUnit},{' '}
                              {formatSigned(Math.round(trend.deltaPercent))}%)
                            </Text>
                            <PressableGraph
                              title={`${trend.exercise} - Estimated 1RM`}
                              data={trend.points.map(v => v !== null ? toDisplayWeight(v, weightUnit) : null)}
                              labels={progress.monthLabels}
                              valueSuffix={weightUnit}
                              startLabel={progress.startLabel}
                              endLabel={progress.endLabel}
                              compact
                              height={36}
                              color={colors.accent}
                              onExpand={setExpandedGraph}
                              onInteractionStart={disableSwipe}
                              onInteractionEnd={enableSwipe}
                            />
                          </View>
                      ));
                    })()}
                    {!exerciseSearch.trim() && progress.allLiftTrends.length > 8 && !showAllExercises ? (
                      <Pressable onPress={() => setShowAllExercises(true)}>
                        <Text style={styles.viewAllText}>
                          View all {progress.allLiftTrends.length} exercises
                        </Text>
                      </Pressable>
                    ) : null}
                  </>
                )}
              </CollapsibleSection>

              {/* Volume */}
              <CollapsibleSection
                title="Volume Over Lifetime"
                summary={`${formatCompactNumber(toDisplayWeight(progress.lifetime.volume, weightUnit))}${weightUnit} total`}
                expanded={expandedSections.volume}
                onToggle={() => toggleSection('volume')}
              >
                <PressableGraph
                  title="Volume Over Lifetime"
                  data={progress.volumeTrend.map(v => v !== null ? toDisplayWeight(v, weightUnit) : null)}
                  labels={progress.monthLabels}
                  valueSuffix={weightUnit}
                  startLabel={progress.startLabel}
                  endLabel={progress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {/* Sets */}
              <CollapsibleSection
                title="Sets Over Lifetime"
                summary={`${formatCompactNumber(progress.lifetime.sets)} sets total`}
                expanded={expandedSections.sets}
                onToggle={() => toggleSection('sets')}
              >
                <PressableGraph
                  title="Sets Over Lifetime"
                  data={progress.setTrend}
                  labels={progress.monthLabels}
                  startLabel={progress.startLabel}
                  endLabel={progress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {/* Muscle groups */}
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
                      <PressableGraph
                        title={`${trend.bodyPart} - Sets`}
                        data={trend.values}
                        labels={progress.monthLabels}
                        startLabel={progress.startLabel}
                        endLabel={progress.endLabel}
                        compact
                        height={36}
                        color={colors.accent}
                        onExpand={setExpandedGraph}
                        onInteractionStart={disableSwipe}
                        onInteractionEnd={enableSwipe}
                      />
                    </View>
                  ))
                )}
              </CollapsibleSection>

              {/* Frequency */}
              <CollapsibleSection
                title="Workout Frequency Over Lifetime"
                summary={`${progress.avgWorkoutsPerMonth.toFixed(1)} workouts/month avg`}
                expanded={expandedSections.workouts}
                onToggle={() => toggleSection('workouts')}
              >
                <PressableGraph
                  title="Workout Frequency Over Lifetime"
                  data={progress.workoutTrend}
                  labels={progress.monthLabels}
                  startLabel={progress.startLabel}
                  endLabel={progress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {useFeatureEnabled('meetSim') ? (
                <FeatureGate featureId="meetSim">
                  <MeetSimulator
                    workouts={workouts}
                    bodyweightKg={bodyweightKg}
                    sex={user?.sex ?? 'male'}
                    weightUnit={weightUnit}
                    expanded={expandedSections.meetSim}
                    onToggle={() => toggleSection('meetSim')}
                  />
                </FeatureGate>
              ) : null}

              {useFeatureEnabled('attemptSelector') ? (
                <FeatureGate featureId="attemptSelector">
                  <AttemptSelector
                    workouts={workouts}
                    weightUnit={weightUnit}
                    expanded={expandedSections.attemptSelector}
                    onToggle={() => toggleSection('attemptSelector')}
                  />
                </FeatureGate>
              ) : null}
            </>
          )
        ) : (
          /* ═══ CARDIO MODE ═══ */
          !cardioProgress ? (
            <Card>
              <Text style={styles.emptyText}>Log cardio sessions to see your progress here.</Text>
            </Card>
          ) : (
            <>
              {/* Cardio Snapshot (auto-open) */}
              <CollapsibleSection
                title="Snapshot"
                summary={`This month: ${cardioProgress.currentMonth.runs} sessions, ${cardioProgress.currentMonth.distanceKm}km`}
                expanded={expandedSections.cardioSnapshot}
                onToggle={() => toggleSection('cardioSnapshot')}
              >
                <View style={styles.snapshotGrid}>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{cardioProgress.totalRuns}</Text>
                    <Text style={styles.snapshotLabel}>Total sessions</Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{cardioProgress.totalDistanceKm}</Text>
                    <Text style={styles.snapshotLabel}>Total km</Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{cardioProgress.totalDurationLabel}</Text>
                    <Text style={styles.snapshotLabel}>Total time</Text>
                  </View>
                </View>
                <View style={styles.snapshotGrid}>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{cardioProgress.currentMonth.runs}</Text>
                    <Text style={styles.snapshotLabel}>Sessions this month</Text>
                    <Text style={styles.snapshotDelta}>
                      {formatSigned(
                        cardioProgress.currentMonth.runs - cardioProgress.previousMonth.runs,
                      )}{' '}
                      vs last month
                    </Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>{cardioProgress.currentMonth.distanceKm}</Text>
                    <Text style={styles.snapshotLabel}>km this month</Text>
                    <Text style={styles.snapshotDelta}>
                      {formatSigned(
                        parseFloat(
                          (cardioProgress.currentMonth.distanceKm - cardioProgress.previousMonth.distanceKm).toFixed(1),
                        ),
                      )}{' '}
                      vs last month
                    </Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <Text style={styles.snapshotValue}>
                      {cardioProgress.currentMonth.bestPace !== null
                        ? `${cardioProgress.currentMonth.bestPace}`
                        : '-'}
                    </Text>
                    <Text style={styles.snapshotLabel}>Best pace (min/km)</Text>
                    {cardioProgress.currentMonth.bestPace !== null && cardioProgress.previousMonth.bestPace !== null ? (
                      <Text style={styles.snapshotDelta}>
                        {formatSigned(
                          parseFloat(
                            (cardioProgress.currentMonth.bestPace - cardioProgress.previousMonth.bestPace).toFixed(2),
                          ),
                        )}{' '}
                        vs last month
                      </Text>
                    ) : null}
                  </View>
                </View>
              </CollapsibleSection>

              {/* Distance Over Time */}
              <CollapsibleSection
                title="Distance Over Time"
                summary={`${cardioProgress.totalDistanceKm}km total`}
                expanded={expandedSections.cardioDistance}
                onToggle={() => toggleSection('cardioDistance')}
              >
                <PressableGraph
                  title="Distance Over Time"
                  data={cardioProgress.distanceTrend}
                  labels={cardioProgress.monthLabels}
                  valueSuffix="km"
                  startLabel={cardioProgress.startLabel}
                  endLabel={cardioProgress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {/* Pace Over Time */}
              <CollapsibleSection
                title="Pace Over Time"
                summary="Avg pace per month (min/km)"
                expanded={expandedSections.cardioPace}
                onToggle={() => toggleSection('cardioPace')}
              >
                <PressableGraph
                  title="Pace Over Time"
                  data={cardioProgress.paceTrend}
                  labels={cardioProgress.monthLabels}
                  valueSuffix="min/km"
                  startLabel={cardioProgress.startLabel}
                  endLabel={cardioProgress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {/* Run Frequency */}
              <CollapsibleSection
                title="Run Frequency"
                summary={`${cardioProgress.avgRunsPerMonth.toFixed(1)} runs/month avg`}
                expanded={expandedSections.cardioFrequency}
                onToggle={() => toggleSection('cardioFrequency')}
              >
                <PressableGraph
                  title="Run Frequency"
                  data={cardioProgress.runCountTrend}
                  labels={cardioProgress.monthLabels}
                  startLabel={cardioProgress.startLabel}
                  endLabel={cardioProgress.endLabel}
                  onExpand={setExpandedGraph}
                  onInteractionStart={disableSwipe}
                  onInteractionEnd={enableSwipe}
                />
              </CollapsibleSection>

              {useFeatureEnabled('racePredictor') ? (
                <FeatureGate featureId="racePredictor">
                  <RacePredictor
                    runs={runs}
                    expanded={expandedSections.racePredictor}
                    onToggle={() => toggleSection('racePredictor')}
                  />
                </FeatureGate>
              ) : null}
            </>
          )
        )}
      </ScrollView>

      {/* Full-screen graph modal */}
      <GraphModal graph={expandedGraph} onClose={() => setExpandedGraph(null)} colors={colors} styles={styles} />

      {/* Exercise drill-down modal */}
      <ExerciseDetailModal
        visible={selectedExercise !== null}
        exerciseName={selectedExercise}
        workouts={workouts}
        monthLabels={progress.monthLabels}
        startLabel={progress.startLabel}
        endLabel={progress.endLabel}
        weightUnit={weightUnit}
        onClose={() => setSelectedExercise(null)}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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

  /* Segmented control */
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: colors.accent,
  },
  segmentButtonText: {
    ...typography.label,
    color: colors.muted,
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
  },

  /* Snapshot */
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

  /* Trends */
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
  exerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flex: 0,
    flexShrink: 1,
  },
  exerciseButtonText: {
    ...typography.body,
    color: colors.muted,
    flexShrink: 1,
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
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  viewAllText: {
    ...typography.label,
    color: colors.accent,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },

  /* Graph modal */
  graphModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  graphModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  graphModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  graphModalTitle: {
    ...typography.headline,
    color: colors.text,
    flex: 1,
  },

  /* Dev tools */
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
