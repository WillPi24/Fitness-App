import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { FEATURE_REGISTRY, type FeatureDefinition } from '../services/featureRegistry';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type MoreToolsScreenProps = {
  onBack: () => void;
};

const screenLabels: Record<FeatureDefinition['screen'], string> = {
  Progress: 'Progress',
  Log: 'Workout Log',
  Cardio: 'Cardio Tracker',
  Calories: 'Nutrition',
  Account: 'Account',
};

const groupOrder: FeatureDefinition['screen'][] = ['Log', 'Cardio', 'Progress', 'Account'];

export function MoreToolsScreen({ onBack }: MoreToolsScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { user, toggleFeature } = useUserStore();
  const enabledFeatures = user?.enabledFeatures ?? [];
  const switchTrackOff = isDark ? '#4B5563' : '#B8ADA0';

  const grouped = groupOrder
    .map((screen) => ({
      screen,
      label: screenLabels[screen],
      features: FEATURE_REGISTRY.filter((f) => f.screen === screen),
    }))
    .filter((g) => g.features.length > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>More Tools</Text>
        <Text style={styles.subtitle}>
          Toggle features on or off. Enabled features appear on their respective screens.
        </Text>

        {grouped.map((group) => (
          <Card key={group.screen}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            {group.features.map((feature, index) => {
              const isEnabled = enabledFeatures.includes(feature.id);
              const isLast = index === group.features.length - 1;
              return (
                <View
                  key={feature.id}
                  style={[styles.featureRow, !isLast && styles.featureRowBorder]}
                >
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleFeature(feature.id)}
                    trackColor={{ false: switchTrackOff, true: colors.accent }}
                    thumbColor="#fff"
                    ios_backgroundColor={switchTrackOff}
                  />
                </View>
              );
            })}
          </Card>
        ))}
      </ScrollView>
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
  groupTitle: {
    ...typography.label,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureInfo: {
    flex: 1,
    gap: 2,
  },
  featureName: {
    ...typography.body,
    color: colors.text,
  },
  featureDescription: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
