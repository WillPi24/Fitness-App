import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { UserSex, WeightUnit, fromDisplayWeight, toDisplayWeight, useUserStore } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type BodyInfoScreenProps = {
  onBack: () => void;
  onComplete: () => void;
};

export function BodyInfoScreen({ onBack, onComplete }: BodyInfoScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { setBodyInfo } = useUserStore();
  const [sex, setSex] = useState<UserSex>('male');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleWeightUnitChange = (nextUnit: WeightUnit) => {
    if (nextUnit === weightUnit) return;

    const value = Number(weight);
    if (Number.isFinite(value) && value > 0) {
      const kg = fromDisplayWeight(value, weightUnit);
      setWeight(String(toDisplayWeight(kg, nextUnit)));
    }

    setWeightUnit(nextUnit);
  };

  const handleComplete = () => {
    const value = Number(weight);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Please enter your bodyweight.');
      return;
    }
    const kg = fromDisplayWeight(value, weightUnit);
    setBodyInfo(sex, kg, weightUnit);
    onComplete();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.backButton} onPress={onBack}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>About you</Text>
          <Text style={styles.subtitle}>This helps us personalise your experience.</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Sex</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, sex === 'male' && styles.segmentActive]}
                  onPress={() => setSex('male')}
                >
                  <Text style={[styles.segmentText, sex === 'male' && styles.segmentTextActive]}>Male</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, sex === 'female' && styles.segmentActive]}
                  onPress={() => setSex('female')}
                >
                  <Text style={[styles.segmentText, sex === 'female' && styles.segmentTextActive]}>Female</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.segmented}>
                <Pressable
                  style={[styles.segment, weightUnit === 'kg' && styles.segmentActive]}
                  onPress={() => handleWeightUnitChange('kg')}
                >
                  <Text style={[styles.segmentText, weightUnit === 'kg' && styles.segmentTextActive]}>kg</Text>
                </Pressable>
                <Pressable
                  style={[styles.segment, weightUnit === 'lbs' && styles.segmentActive]}
                  onPress={() => handleWeightUnitChange('lbs')}
                >
                  <Text style={[styles.segmentText, weightUnit === 'lbs' && styles.segmentTextActive]}>lbs</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bodyweight</Text>
              <View style={styles.weightRow}>
                <TextInput
                  style={[styles.input, styles.weightInput]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.weightUnit}>{weightUnit}</Text>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.primaryButton} onPress={handleComplete}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.muted,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    ...typography.headline,
    color: colors.text,
    fontSize: 16,
  },
  segmentTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weightInput: {
    width: 100,
    textAlign: 'center',
  },
  weightUnit: {
    ...typography.headline,
    color: colors.muted,
    fontSize: 18,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
});
