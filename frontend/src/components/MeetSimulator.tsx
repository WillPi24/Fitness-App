import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getBestE1RMForLifts, wilksScore, dotsScore } from '../services/plCoefficients';
import type { WorkoutSession } from '../store/workoutStore';
import type { UserSex, WeightUnit } from '../store/userStore';
import { toDisplayWeight, fromDisplayWeight } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { useTheme } from '../store/themeStore';
import { CollapsibleSection } from './CollapsibleSection';

type MeetSimulatorProps = {
  workouts: WorkoutSession[];
  bodyweightKg: number;
  sex: UserSex;
  weightUnit: WeightUnit;
  expanded: boolean;
  onToggle: () => void;
};

type Lift = 'squat' | 'bench' | 'deadlift';
type AttemptState = {
  weight: string;
  good: boolean;
};

const LIFT_LABELS: Record<Lift, string> = {
  squat: 'Squat',
  bench: 'Bench Press',
  deadlift: 'Deadlift',
};

const LIFTS: Lift[] = ['squat', 'bench', 'deadlift'];

export function MeetSimulator({
  workouts,
  bodyweightKg,
  sex,
  weightUnit,
  expanded,
  onToggle,
}: MeetSimulatorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const suggested = useMemo(() => getBestE1RMForLifts(workouts), [workouts]);

  const [attempts, setAttempts] = useState<Record<Lift, AttemptState[]>>(() => {
    const initial: Record<string, AttemptState[]> = {};
    for (const lift of LIFTS) {
      const e1rm = suggested[lift];
      initial[lift] = [
        { weight: e1rm > 0 ? String(Math.round(toDisplayWeight(e1rm * 0.88, weightUnit))) : '', good: true },
        { weight: e1rm > 0 ? String(Math.round(toDisplayWeight(e1rm * 0.94, weightUnit))) : '', good: true },
        { weight: e1rm > 0 ? String(Math.round(toDisplayWeight(e1rm, weightUnit))) : '', good: false },
      ];
    }
    return initial as Record<Lift, AttemptState[]>;
  });

  const updateAttempt = (lift: Lift, index: number, field: keyof AttemptState, value: string | boolean) => {
    setAttempts((prev) => {
      const next = { ...prev };
      next[lift] = [...next[lift]];
      next[lift][index] = { ...next[lift][index], [field]: value };
      return next;
    });
  };

  const bestPerLift = useMemo(() => {
    const result: Record<string, number> = {};
    for (const lift of LIFTS) {
      let best = 0;
      for (const attempt of attempts[lift]) {
        if (!attempt.good) continue;
        const w = parseFloat(attempt.weight);
        if (!isNaN(w) && w > best) best = w;
      }
      result[lift] = best;
    }
    return result;
  }, [attempts]);

  const totalDisplay = LIFTS.reduce((sum, lift) => sum + bestPerLift[lift], 0);
  const totalKg = fromDisplayWeight(totalDisplay, weightUnit);

  const wilks = bodyweightKg > 0 && totalKg > 0 ? wilksScore(totalKg, bodyweightKg, sex) : 0;
  const dots = bodyweightKg > 0 && totalKg > 0 ? dotsScore(totalKg, bodyweightKg, sex) : 0;

  return (
    <CollapsibleSection
      title="Meet Simulator"
      summary={totalDisplay > 0 ? `Total: ${totalDisplay} ${weightUnit}` : 'Enter your attempts'}
      expanded={expanded}
      onToggle={onToggle}
    >
      {LIFTS.map((lift) => (
        <View key={lift} style={styles.liftSection}>
          <Text style={styles.liftTitle}>{LIFT_LABELS[lift]}</Text>
          <View style={styles.attemptRow}>
            {attempts[lift].map((attempt, i) => (
              <View key={i} style={styles.attemptCol}>
                <Text style={styles.attemptLabel}>Attempt {i + 1}</Text>
                <TextInput
                  style={styles.attemptInput}
                  value={attempt.weight}
                  onChangeText={(v) => updateAttempt(lift, i, 'weight', v)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                />
                <Pressable
                  style={[styles.goodBadToggle, attempt.good ? styles.goodToggle : styles.badToggle]}
                  onPress={() => updateAttempt(lift, i, 'good', !attempt.good)}
                >
                  <Text style={[styles.goodBadText, attempt.good ? styles.goodText : styles.badText]}>
                    {attempt.good ? 'Good' : 'Miss'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
          <Text style={styles.liftBest}>
            Best: {bestPerLift[lift] > 0 ? `${bestPerLift[lift]} ${weightUnit}` : '-'}
          </Text>
        </View>
      ))}

      {totalDisplay > 0 ? (
        <View style={styles.results}>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{totalDisplay}</Text>
            <Text style={styles.resultLabel}>Total ({weightUnit})</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{Math.round(wilks * 10) / 10}</Text>
            <Text style={styles.resultLabel}>Wilks</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{Math.round(dots * 10) / 10}</Text>
            <Text style={styles.resultLabel}>DOTS</Text>
          </View>
        </View>
      ) : null}
    </CollapsibleSection>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  liftSection: {
    gap: spacing.xs,
  },
  liftTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  attemptRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  attemptCol: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  attemptLabel: {
    ...typography.label,
    color: colors.muted,
    fontSize: 10,
  },
  attemptInput: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    backgroundColor: colors.background,
    width: '100%',
    textAlign: 'center',
  },
  goodBadToggle: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  goodToggle: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}20`,
  },
  badToggle: {
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}20`,
  },
  goodBadText: {
    ...typography.label,
    fontSize: 10,
  },
  goodText: {
    color: colors.success,
  },
  badText: {
    color: colors.danger,
  },
  liftBest: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
  },
  results: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    gap: 2,
  },
  resultValue: {
    ...typography.headline,
    color: colors.accent,
    fontSize: 20,
  },
  resultLabel: {
    ...typography.label,
    color: colors.muted,
  },
});
