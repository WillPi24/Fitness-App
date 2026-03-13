import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type WeightUnit, toDisplayWeight } from '../store/userStore';
import { estimateOneRepMax, type WorkoutSession } from '../store/workoutStore';
import { colors, spacing, typography } from '../theme';
import { LineGraph } from './LineGraph';

type ExerciseDetailModalProps = {
  visible: boolean;
  exerciseName: string | null;
  workouts: WorkoutSession[];
  monthLabels: string[];
  startLabel: string;
  endLabel: string;
  weightUnit: WeightUnit;
  onClose: () => void;
};

type SessionEntry = {
  workoutId: string;
  date: string;
  sets: Array<{ weight: number; reps: number }>;
  volumeKg: number;
  bestE1RM: number;
};

function formatMonth(date: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

export function ExerciseDetailModal({
  visible,
  exerciseName,
  workouts,
  weightUnit,
  onClose,
}: ExerciseDetailModalProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const detail = useMemo(() => {
    if (!exerciseName) {
      return null;
    }

    const normalizedName = exerciseName.trim().toLowerCase();

    // Build month timeline
    const earliestAt = workouts.reduce(
      (min, w) => Math.min(min, w.startedAt),
      workouts[0]?.startedAt ?? Date.now(),
    );
    const earliest = startOfMonth(new Date(earliestAt));
    const current = startOfMonth(new Date());

    const monthStarts: Date[] = [];
    const cursor = new Date(earliest);
    while (cursor <= current) {
      monthStarts.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const mLabels = monthStarts.map(formatMonth);
    const monthIndexByKey = new Map(
      monthStarts.map((d, i) => [monthKey(d), i] as const),
    );

    const e1rmTrend: Array<number | null> = Array.from(
      { length: monthStarts.length },
      () => null,
    );

    type BestSet = { weight: number; reps: number; date: string };
    const sessions: SessionEntry[] = [];
    let bestSetEver: BestSet | null = null;
    let bestSetVolume = 0;

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name.trim().toLowerCase() !== normalizedName) {
          return;
        }

        let sessionVolume = 0;
        let sessionBestE1RM = 0;
        const sets: Array<{ weight: number; reps: number }> = [];

        exercise.sets.forEach((set) => {
          sets.push({ weight: set.weight, reps: set.reps });
          sessionVolume += set.weight * set.reps;
          const e1rm = estimateOneRepMax(set.weight, set.reps);
          if (e1rm > sessionBestE1RM) {
            sessionBestE1RM = e1rm;
          }

          const setVolume = set.weight * set.reps;
          if (!bestSetEver || setVolume > bestSetVolume) {
            bestSetEver = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            };
            bestSetVolume = setVolume;
          }
        });

        if (sets.length > 0) {
          sessions.push({
            workoutId: workout.id,
            date: workout.date,
            sets,
            volumeKg: Math.round(sessionVolume),
            bestE1RM: Math.round(sessionBestE1RM),
          });
        }

        const idx = monthIndexByKey.get(monthKey(new Date(workout.startedAt)));
        if (idx !== undefined && sessionBestE1RM > 0) {
          const current = e1rmTrend[idx];
          e1rmTrend[idx] =
            current === null
              ? Math.round(sessionBestE1RM)
              : Math.max(current, Math.round(sessionBestE1RM));
        }
      });
    });

    sessions.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });

    return {
      monthLabels: mLabels,
      startLabel: mLabels[0],
      endLabel: mLabels[mLabels.length - 1],
      e1rmTrend,
      sessions,
      bestSetEver: bestSetEver as BestSet | null,
      volumeTrend: sessions
        .slice()
        .reverse()
        .map((s) => s.volumeKg),
    };
  }, [exerciseName, workouts]);

  const toggleSession = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!detail || !exerciseName) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {exerciseName}
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Estimated 1RM Trend */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Estimated 1RM Trend</Text>
              <LineGraph
                data={detail.e1rmTrend.map(v => v !== null ? toDisplayWeight(v, weightUnit) : null)}
                labels={detail.monthLabels}
                valueSuffix={weightUnit}
                startLabel={detail.startLabel}
                endLabel={detail.endLabel}
                color={colors.accent}
              />
            </View>

            {/* Best Set Ever */}
            {detail.bestSetEver ? (
              <View style={styles.bestSet}>
                <Text style={styles.sectionLabel}>Best set</Text>
                <Text style={styles.bestSetValue}>
                  {toDisplayWeight(detail.bestSetEver.weight, weightUnit)}{weightUnit} × {detail.bestSetEver.reps} reps
                </Text>
                <Text style={styles.bestSetDate}>
                  on {detail.bestSetEver.date}
                </Text>
              </View>
            ) : null}

            {/* Volume per Session */}
            {detail.volumeTrend.length >= 2 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Volume per session</Text>
                <LineGraph
                  data={detail.volumeTrend.map(v => toDisplayWeight(v, weightUnit))}
                  valueSuffix={weightUnit}
                  compact
                  height={50}
                  color={colors.accent}
                />
              </View>
            ) : null}

            {/* Session History */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Session history ({detail.sessions.length})
              </Text>
              {detail.sessions.map((session) => (
                <View key={session.workoutId} style={styles.sessionRow}>
                  <Pressable
                    style={styles.sessionHeader}
                    onPress={() => toggleSession(session.workoutId)}
                  >
                    <View style={styles.sessionMeta}>
                      <Text style={styles.sessionDate}>{session.date}</Text>
                      <Text style={styles.sessionSummary}>
                        {session.sets.length} sets, {toDisplayWeight(session.volumeKg, weightUnit)}{weightUnit} vol, est. 1RM {toDisplayWeight(session.bestE1RM, weightUnit)}{weightUnit}
                      </Text>
                    </View>
                    <Feather
                      name={
                        expandedIds[session.workoutId]
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                  {expandedIds[session.workoutId] ? (
                    <View style={styles.sessionSets}>
                      {session.sets.map((set, i) => (
                        <Text key={`${session.workoutId}-${i}`} style={styles.setText}>
                          Set {i + 1}: {toDisplayWeight(set.weight, weightUnit)}{weightUnit} × {set.reps}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 31, 36, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  closeButton: {
    flexShrink: 0,
    paddingTop: 2,
  },
  closeText: {
    ...typography.label,
    color: colors.muted,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.muted,
  },
  bestSet: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.sm,
    gap: 2,
  },
  bestSetValue: {
    ...typography.headline,
    color: colors.text,
  },
  bestSetDate: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  sessionRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionMeta: {
    flex: 1,
    gap: 2,
  },
  sessionDate: {
    ...typography.body,
    color: colors.text,
  },
  sessionSummary: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  sessionSets: {
    marginTop: spacing.xs,
    paddingLeft: spacing.sm,
    gap: 2,
  },
  setText: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
});
