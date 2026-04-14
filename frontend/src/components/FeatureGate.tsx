import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FEATURE_REGISTRY } from '../services/featureRegistry';
import { useRequireSubscription } from '../store/subscriptionStore';
import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';
import { Card } from './Card';

type FeatureGateProps = {
  featureId: string;
  children: React.ReactNode;
};

export function FeatureGate({ featureId, children }: FeatureGateProps) {
  const { isLocked, showPaywall } = useRequireSubscription(featureId);

  if (!isLocked) return <>{children}</>;

  return <LockedPlaceholder featureId={featureId} onUpgrade={showPaywall} />;
}

function LockedPlaceholder({ featureId, onUpgrade }: { featureId: string; onUpgrade: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const feature = FEATURE_REGISTRY.find((f) => f.id === featureId);

  return (
    <Card>
      <View style={styles.container}>
        <Feather name="lock" size={24} color={colors.muted} />
        <Text style={styles.title}>{feature?.name ?? 'Pro Feature'}</Text>
        <Text style={styles.description}>{feature?.description ?? 'This feature requires Full Sail.'}</Text>
        <Pressable style={styles.button} onPress={onUpgrade}>
          <Text style={styles.buttonText}>Unlock with Full Sail</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  buttonText: {
    ...typography.body,
    color: '#fff',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
  },
});
