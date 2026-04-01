import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { spacing } from '../theme';
import type { ThemeColors } from '../theme';
import { useTheme } from '../store/themeStore';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Simple elevation + border container for consistent surfaces.
export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0E1116',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
