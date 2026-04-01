import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { WeightUnit } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { useTheme } from '../store/themeStore';
import { Card } from './Card';

type OneRepMaxCalcProps = {
  weightUnit: WeightUnit;
};

function brzycki(weight: number, reps: number): number {
  if (reps >= 37) return 0;
  return weight * 36 / (37 - reps);
}

export function OneRepMaxCalc({ weightUnit }: OneRepMaxCalcProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  const weight = parseFloat(weightInput);
  const reps = parseInt(repsInput, 10);
  const valid = weight > 0 && reps >= 1 && !isNaN(weight) && !isNaN(reps);
  const isSingle = reps === 1;
  const tooManyReps = reps > 12;

  const estimated = valid && !tooManyReps ? brzycki(weight, reps) : 0;

  return (
    <Card>
      <Text style={styles.title}>1 Rep Max Calculator</Text>
      <Text style={styles.disclaimer}>Approximation only - actual results may vary.</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight ({weightUnit})</Text>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      {valid && isSingle ? (
        <Text style={styles.note}>That's already a 1RM: {weight} {weightUnit}</Text>
      ) : valid && tooManyReps ? (
        <Text style={styles.warning}>Use 12 reps or fewer for a reliable estimate</Text>
      ) : valid ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultValue}>{Math.round(estimated * 10) / 10}</Text>
          <Text style={styles.resultLabel}>Estimated 1RM ({weightUnit})</Text>
        </View>
      ) : null}
    </Card>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  title: {
    ...typography.headline,
    color: colors.text,
  },
  disclaimer: {
    ...typography.body,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  label: {
    ...typography.label,
    color: colors.muted,
  },
  input: {
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: 2,
  },
  resultValue: {
    ...typography.headline,
    color: colors.accent,
    fontSize: 28,
    lineHeight: 36,
  },
  resultLabel: {
    ...typography.label,
    color: colors.muted,
  },
  note: {
    ...typography.body,
    color: colors.success,
    marginTop: spacing.sm,
  },
  warning: {
    ...typography.body,
    color: '#E67E22',
    fontSize: 13,
    marginTop: spacing.sm,
  },
});
