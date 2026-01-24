import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

type ErrorBannerProps = {
  message: string;
  onDismiss: () => void;
};

// Inline error banner for recoverable issues (e.g. storage failures).
export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <Pressable onPress={onDismiss} accessibilityLabel="Dismiss error">
        <Text style={styles.dismiss}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDECEC',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dismiss: {
    ...typography.label,
    color: colors.danger,
  },
});
