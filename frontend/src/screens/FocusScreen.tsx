import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefaultFeatures } from '../services/featureRegistry';
import { useTheme } from '../store/themeStore';
import { TrainingFocus, useUserStore } from '../store/userStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type FocusScreenProps = {
  onBack: () => void;
  onComplete: () => void;
};

type FocusOption = {
  key: TrainingFocus;
  title: string;
  description: string;
  renderIcon: (color: string) => React.ReactNode;
};

const focusOptions: FocusOption[] = [
  {
    key: 'general',
    title: 'General Fitness',
    description: 'A bit of everything - no specific specialisation',
    renderIcon: (color) => <MaterialCommunityIcons name="heart-pulse" size={32} color={color} />,
  },
  {
    key: 'strength',
    title: 'Strength',
    description: 'Powerlifting, strength training, and improving PRs',
    renderIcon: (color) => <MaterialCommunityIcons name="dumbbell" size={32} color={color} />,
  },
  {
    key: 'bodybuilding',
    title: 'Bodybuilding',
    description: 'Hypertrophy, physique development, and muscle balance',
    renderIcon: (color) => <MaterialCommunityIcons name="arm-flex" size={32} color={color} />,
  },
  {
    key: 'cardio',
    title: 'Cardio',
    description: 'Running, endurance, and improving your pace',
    renderIcon: (color) => <MaterialCommunityIcons name="shoe-sneaker" size={32} color={color} />,
  },
];

export function FocusScreen({ onBack, onComplete }: FocusScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { setFocus, setEnabledFeatures } = useUserStore();
  const [selected, setSelected] = useState<TrainingFocus | null>(null);

  const handleComplete = () => {
    if (!selected) return;
    setFocus(selected);
    setEnabledFeatures(getDefaultFeatures(selected));
    onComplete();
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl + spacing.lg },
      ]}
    >
      <Pressable style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </Pressable>

      <Text style={styles.title}>What's your focus?</Text>
      <Text style={styles.subtitle}>
        This personalises your experience. All features remain available regardless of what you choose, and you can change this anytime.
      </Text>

      <View style={styles.options}>
        {focusOptions.map((option) => {
          const isSelected = selected === option.key;
          return (
            <Pressable
              key={option.key}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(option.key)}
            >
              <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                {option.renderIcon(isSelected ? '#fff' : colors.muted)}
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.primaryButton, !selected && styles.primaryButtonDisabled]}
        onPress={handleComplete}
        disabled={!selected}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  scrollView: {
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
  options: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...typography.headline,
    color: colors.text,
    fontSize: 17,
  },
  optionTitleSelected: {
    color: colors.accent,
  },
  optionDescription: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 19,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    ...typography.headline,
    color: '#fff',
    fontSize: 18,
  },
});
